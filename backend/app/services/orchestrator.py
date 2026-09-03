import time
import logging
import asyncio
from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.workflow import Workflow, WorkflowStatus
from app.models.workflow_step import WorkflowStep, StepStatus
from app.models.agent_log import AgentLog
from app.models.event import Event
from app.core.redis import redis_manager
from app.agents.planner import PlannerAgent
from app.agents.researcher import ResearchAgent
from app.agents.analyzer import AnalyzerAgent
from app.agents.validator import ValidatorAgent
from app.agents.writer import WriterAgent
from app.services.retry_engine import RetryEngine

logger = logging.getLogger(__name__)

class WorkflowOrchestrator:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.agents = {
            "Planner": PlannerAgent(),
            "Research": ResearchAgent(),
            "Analyzer": AnalyzerAgent(),
            "Validator": ValidatorAgent(),
            "Writer": WriterAgent()
        }

    async def log_event(self, workflow_id: str, event_type: str, payload: Dict[str, Any]):
        """Persists event to PostgreSQL and publishes to Redis PubSub for real-time SSE streaming."""
        event_obj = Event(
            workflow_id=workflow_id,
            event_type=event_type,
            payload=payload
        )
        self.db.add(event_obj)
        await self.db.flush()

        # Stream event via Redis Pub/Sub
        channel = f"workflow_{workflow_id}"
        event_payload = {
            "id": event_obj.id,
            "workflow_id": workflow_id,
            "event_type": event_type,
            "payload": payload,
            "timestamp": event_obj.timestamp.isoformat()
        }
        await redis_manager.publish_event(channel, event_payload)

    async def add_agent_log(
        self,
        workflow_id: str,
        agent_type: str,
        level: str,
        message: str,
        step_id: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        log_obj = AgentLog(
            workflow_id=workflow_id,
            step_id=step_id,
            agent_type=agent_type,
            level=level,
            message=message,
            details=details or {}
        )
        self.db.add(log_obj)
        await self.db.flush()

        await self.log_event(
            workflow_id=workflow_id,
            event_type="agent.log",
            payload={
                "agent_type": agent_type,
                "level": level,
                "message": message,
                "step_id": step_id,
                "details": details or {}
            }
        )

    async def execute_workflow(self, workflow_id: str):
        """Main Orchestrator execution loop."""
        start_time = time.time()
        
        # Load Workflow
        stmt = select(Workflow).where(Workflow.id == workflow_id)
        res = await self.db.execute(stmt)
        workflow = res.scalar_one_or_none()

        if not workflow:
            logger.error(f"Workflow {workflow_id} not found.")
            return

        workflow.status = WorkflowStatus.RUNNING.value
        await self.db.commit()

        await self.log_event(workflow_id, "workflow.started", {
            "status": "RUNNING",
            "goal": workflow.goal
        })
        await self.add_agent_log(
            workflow_id, "System", "INFO",
            f"Workflow engine initialized execution for objective: '{workflow.goal}'"
        )

        # Step 1: Planner Agent builds DAG
        planner_step = await self._get_or_create_step(workflow_id, "planner", "Planner", [])
        planner_output = await self._execute_step_with_retry(workflow, planner_step, {"goal": workflow.goal})

        if planner_step.status == StepStatus.FAILED.value:
            await self._mark_workflow_failed(workflow, start_time, "Planner agent failed to formulate DAG plan.")
            return

        dag_plan = planner_output.get("dag_plan", {})
        tasks = dag_plan.get("tasks", [])

        # Store graph state
        graph_state = {
            "goal": workflow.goal,
            "planner_output": planner_output
        }

        # Step 2: Execute remaining DAG tasks according to dependencies
        for task_info in tasks:
            step_key = task_info["step_key"]
            agent_type = task_info["agent_type"]
            deps = task_info.get("dependencies", [])

            if step_key == "planner":
                continue  # already executed

            step = await self._get_or_create_step(workflow_id, step_key, agent_type, deps)
            
            # Execute agent step
            step_output = await self._execute_step_with_retry(workflow, step, graph_state)
            
            if step.status == StepStatus.FAILED.value:
                await self._mark_workflow_failed(workflow, start_time, f"Task '{step_key}' ({agent_type}) failed.")
                return
            
            # Merge step output into overall state graph
            graph_state.update(step_output)

        # Finalize Workflow Success
        total_time = round(time.time() - start_time, 2)
        workflow.status = WorkflowStatus.COMPLETED.value
        workflow.execution_time = total_time
        await self.db.commit()

        await self.log_event(workflow_id, "workflow.completed", {
            "status": "COMPLETED",
            "total_execution_time": total_time,
            "final_report": graph_state.get("report")
        })
        await self.add_agent_log(
            workflow_id, "System", "INFO",
            f"Workflow completed successfully in {total_time}s across all 5 agent nodes."
        )

    async def _execute_step_with_retry(
        self,
        workflow: Workflow,
        step: WorkflowStep,
        input_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        agent = self.agents.get(step.agent_type)
        if not agent:
            step.status = StepStatus.FAILED.value
            step.error_message = f"Agent type {step.agent_type} not registered."
            await self.db.commit()
            return {}

        step.status = StepStatus.RUNNING.value
        step.input_data = input_data
        await self.db.commit()

        await self.log_event(workflow.id, "task.started", {
            "step_key": step.step_key,
            "agent_type": step.agent_type,
            "retry_count": step.retry_count
        })
        await self.add_agent_log(
            workflow.id, step.agent_type, "INFO",
            f"Agent '{agent.name}' started processing task '{step.step_key}'",
            step_id=step.id
        )

        step_start_time = time.time()
        success = False
        output = {}

        while not success and step.retry_count <= 4:
            try:
                output = await agent.execute(input_data, {})
                success = True
                step.status = StepStatus.COMPLETED.value
                step.output_data = output
                step.execution_time = round(time.time() - step_start_time, 2)
                await self.db.commit()

                await self.log_event(workflow.id, "task.completed", {
                    "step_key": step.step_key,
                    "agent_type": step.agent_type,
                    "execution_time": step.execution_time,
                    "summary": output.get("summary", "")
                })
                await self.add_agent_log(
                    workflow.id, step.agent_type, "INFO",
                    f"Agent '{agent.name}' completed task in {step.execution_time}s: {output.get('summary', '')}",
                    step_id=step.id
                )
                return output

            except Exception as e:
                step.retry_count += 1
                error_msg = str(e)
                logger.warning(f"Step {step.step_key} failed (Attempt {step.retry_count}): {error_msg}")

                await self.add_agent_log(
                    workflow.id, step.agent_type, "ERROR",
                    f"Task execution failed on attempt {step.retry_count}: {error_msg}",
                    step_id=step.id
                )

                if step.retry_count <= 4:
                    workflow.status = WorkflowStatus.RETRYING.value
                    await self.db.commit()
                    await self.log_event(workflow.id, "task.retrying", {
                        "step_key": step.step_key,
                        "retry_count": step.retry_count
                    })
                    await RetryEngine.wait_before_retry(step.retry_count)
                else:
                    step.status = StepStatus.FAILED.value
                    step.error_message = error_msg
                    await self.db.commit()

                    await self.log_event(workflow.id, "task.failed", {
                        "step_key": step.step_key,
                        "error": error_msg
                    })
                    return {}

        return {}

    async def _get_or_create_step(
        self,
        workflow_id: str,
        step_key: str,
        agent_type: str,
        deps: list
    ) -> WorkflowStep:
        stmt = select(WorkflowStep).where(
            WorkflowStep.workflow_id == workflow_id,
            WorkflowStep.step_key == step_key
        )
        res = await self.db.execute(stmt)
        step = res.scalar_one_or_none()

        if not step:
            step = WorkflowStep(
                workflow_id=workflow_id,
                step_key=step_key,
                agent_type=agent_type,
                dependency_ids=deps,
                status=StepStatus.PENDING.value
            )
            self.db.add(step)
            await self.db.commit()
            await self.db.refresh(step)

        return step

    async def _mark_workflow_failed(self, workflow: Workflow, start_time: float, reason: str):
        total_time = round(time.time() - start_time, 2)
        workflow.status = WorkflowStatus.FAILED.value
        workflow.execution_time = total_time
        await self.db.commit()

        await self.log_event(workflow.id, "workflow.failed", {
            "status": "FAILED",
            "reason": reason,
            "execution_time": total_time
        })
        await self.add_agent_log(
            workflow.id, "System", "ERROR",
            f"Workflow execution halted: {reason}"
        )
