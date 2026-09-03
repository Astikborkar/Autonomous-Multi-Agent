import asyncio
import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, desc

from app.db.session import get_db, AsyncSessionLocal
from app.models.workflow import Workflow, WorkflowStatus
from app.models.workflow_step import WorkflowStep, StepStatus
from app.models.template import WorkflowTemplate
from app.models.user import User
from app.schemas.workflow import (
    WorkflowCreate,
    WorkflowResponse,
    HumanApprovalRequest,
    WorkflowFilterParams
)
from app.api.v1.auth import get_current_user
from app.services.orchestrator import WorkflowOrchestrator

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/workflows", tags=["Workflows"])

async def run_orchestrator_background(workflow_id: str):
    async with AsyncSessionLocal() as session:
        orchestrator = WorkflowOrchestrator(session)
        await orchestrator.execute_workflow(workflow_id)


@router.post("", response_model=WorkflowResponse, status_code=status.HTTP_201_CREATED)
async def create_workflow(
    wf_in: WorkflowCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    name = wf_in.name
    goal = wf_in.goal

    # Check if template was selected
    if wf_in.template_id:
        stmt = select(WorkflowTemplate).where(WorkflowTemplate.id == wf_in.template_id)
        res = await db.execute(stmt)
        template = res.scalar_one_or_none()
        if template:
            if not name:
                name = template.title
            if not goal:
                goal = template.goal

    if not name:
        name = f"Workflow: {goal[:30]}..." if len(goal) > 30 else f"Workflow: {goal}"

    new_wf = Workflow(
        name=name,
        goal=goal,
        status=WorkflowStatus.QUEUED.value,
        user_id=current_user.id,
        meta_data=wf_in.meta_data or {}
    )
    db.add(new_wf)
    await db.commit()
    await db.refresh(new_wf)

    # Automatically launch background orchestrator execution
    background_tasks.add_task(run_orchestrator_background, new_wf.id)
    return new_wf


@router.get("", response_model=List[WorkflowResponse])
async def list_workflows(
    status_filter: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_db)
):
    query = select(Workflow).order_by(desc(Workflow.created_at))
    if status_filter:
        query = query.where(Workflow.status == status_filter)
    if search:
        query = query.where(
            (Workflow.name.ilike(f"%{search}%")) | (Workflow.goal.ilike(f"%{search}%"))
        )
    query = query.offset(offset).limit(limit)
    res = await db.execute(query)
    workflows = res.scalars().all()
    return workflows


@router.get("/{workflow_id}", response_model=WorkflowResponse)
async def get_workflow(workflow_id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(Workflow).where(Workflow.id == workflow_id)
    res = await db.execute(stmt)
    workflow = res.scalar_one_or_none()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return workflow


@router.post("/{workflow_id}/execute", response_model=WorkflowResponse)
async def execute_workflow(
    workflow_id: str,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Workflow).where(Workflow.id == workflow_id)
    res = await db.execute(stmt)
    workflow = res.scalar_one_or_none()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")

    workflow.status = WorkflowStatus.QUEUED.value
    await db.commit()

    background_tasks.add_task(run_orchestrator_background, workflow_id)
    return workflow


@router.post("/{workflow_id}/retry", response_model=WorkflowResponse)
async def retry_workflow(
    workflow_id: str,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Workflow).where(Workflow.id == workflow_id)
    res = await db.execute(stmt)
    workflow = res.scalar_one_or_none()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")

    workflow.status = WorkflowStatus.RETRYING.value
    await db.commit()

    background_tasks.add_task(run_orchestrator_background, workflow_id)
    return workflow


@router.post("/{workflow_id}/pause", response_model=WorkflowResponse)
async def pause_workflow(workflow_id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(Workflow).where(Workflow.id == workflow_id)
    res = await db.execute(stmt)
    workflow = res.scalar_one_or_none()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")

    workflow.status = WorkflowStatus.WAITING_APPROVAL.value
    await db.commit()
    return workflow


@router.post("/{workflow_id}/resume", response_model=WorkflowResponse)
async def resume_workflow(
    workflow_id: str,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Workflow).where(Workflow.id == workflow_id)
    res = await db.execute(stmt)
    workflow = res.scalar_one_or_none()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")

    workflow.status = WorkflowStatus.RUNNING.value
    await db.commit()

    background_tasks.add_task(run_orchestrator_background, workflow_id)
    return workflow


@router.post("/{workflow_id}/approve", response_model=WorkflowResponse)
async def approve_step(
    workflow_id: str,
    approval: HumanApprovalRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Workflow).where(Workflow.id == workflow_id)
    res = await db.execute(stmt)
    workflow = res.scalar_one_or_none()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")

    if approval.approved:
        workflow.status = WorkflowStatus.RUNNING.value
        background_tasks.add_task(run_orchestrator_background, workflow_id)
    else:
        workflow.status = WorkflowStatus.CANCELLED.value

    await db.commit()
    return workflow


@router.delete("/{workflow_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_workflow(workflow_id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(Workflow).where(Workflow.id == workflow_id)
    res = await db.execute(stmt)
    workflow = res.scalar_one_or_none()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")

    await db.delete(workflow)
    await db.commit()
    return None


@router.get("/{workflow_id}/export")
async def export_workflow_report(workflow_id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(Workflow).where(Workflow.id == workflow_id)
    res = await db.execute(stmt)
    workflow = res.scalar_one_or_none()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")

    writer_step = next((s for s in workflow.steps if s.agent_type == "Writer"), None)
    markdown_content = ""
    if writer_step and writer_step.output_data:
        report = writer_step.output_data.get("report", {})
        markdown_content = report.get("markdown", f"# Report for {workflow.name}\n\nNo report text available.")
    else:
        markdown_content = f"# Workflow: {workflow.name}\n\n**Status:** {workflow.status}\n**Goal:** {workflow.goal}"

    return {
        "workflow_id": workflow.id,
        "name": workflow.name,
        "status": workflow.status,
        "markdown": markdown_content,
        "steps": [
            {
                "agent_type": s.agent_type,
                "status": s.status,
                "execution_time": s.execution_time,
                "output": s.output_data
            } for s in workflow.steps
        ]
    }
