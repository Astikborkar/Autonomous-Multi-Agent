import asyncio
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import AsyncSessionLocal, init_db
from app.models.user import User, UserRole
from app.models.template import WorkflowTemplate
from app.models.workflow import Workflow, WorkflowStatus
from app.models.workflow_step import WorkflowStep, StepStatus
from app.models.agent_log import AgentLog
from app.core.security import get_password_hash

logger = logging.getLogger(__name__)


async def seed_data():
    await init_db()

    async with AsyncSessionLocal() as db:
        logger.info("Seeding initial users...")
        # 1. Users
        stmt = select(User).where(User.email == "admin@orchestrator.ai")
        res = await db.execute(stmt)
        admin_user = res.scalar_one_or_none()

        if not admin_user:
            admin_user = User(
                email="admin@orchestrator.ai",
                hashed_password=get_password_hash("admin123"),
                full_name="System Administrator",
                role=UserRole.ADMIN.value
            )
            db.add(admin_user)

        stmt = select(User).where(User.email == "developer@orchestrator.ai")
        res = await db.execute(stmt)
        dev_user = res.scalar_one_or_none()

        if not dev_user:
            dev_user = User(
                email="developer@orchestrator.ai",
                hashed_password=get_password_hash("dev123"),
                full_name="Lead AI Engineer",
                role=UserRole.DEVELOPER.value
            )
            db.add(dev_user)

        await db.commit()

        # 2. Workflow Templates
        logger.info("Seeding workflow templates...")
        templates_data = [
            {
                "id": "tpl-exec-report",
                "title": "Executive Report Generator",
                "description": "Synthesizes customer feedback, financial telemetry, and support tickets into C-suite executive briefs.",
                "category": "Reporting & Insights",
                "goal": "Analyze customer feedback and generate an executive report.",
                "agent_chain": ["Planner", "Research", "Analyzer", "Validator", "Writer"],
                "icon": "FileText"
            },
            {
                "id": "tpl-market-intel",
                "title": "Market Intelligence & Competitor Audit",
                "description": "Scrapes market trends, news releases, and competitor pricing models to extract key market positioning opportunities.",
                "category": "Market Strategy",
                "goal": "Conduct competitive analysis across top 5 SaaS rivals and extract product feature gaps.",
                "agent_chain": ["Planner", "Research", "Analyzer", "Validator", "Writer"],
                "icon": "TrendingUp"
            },
            {
                "id": "tpl-sec-audit",
                "title": "Software Vulnerability Audit",
                "description": "Scans repository dependency graphs, API endpoints, and auth policies for OWASP Top 10 vulnerabilities.",
                "category": "DevSecOps",
                "goal": "Perform automated security & compliance check across microservices.",
                "agent_chain": ["Planner", "Research", "Analyzer", "Validator", "Writer"],
                "icon": "ShieldAlert"
            },
            {
                "id": "tpl-fin-analyst",
                "title": "Financial Performance & KPI Analyst",
                "description": "Parses quarterly earnings, ARR/MRR trends, churn rates, and unit economics.",
                "category": "Finance",
                "goal": "Evaluate Q3 SaaS metrics and compute customer acquisition payback period.",
                "agent_chain": ["Planner", "Research", "Analyzer", "Validator", "Writer"],
                "icon": "DollarSign"
            }
        ]

        for tpl in templates_data:
            stmt = select(WorkflowTemplate).where(WorkflowTemplate.id == tpl["id"])
            res = await db.execute(stmt)
            if not res.scalar_one_or_none():
                obj = WorkflowTemplate(
                    id=tpl["id"],
                    title=tpl["title"],
                    description=tpl["description"],
                    category=tpl["category"],
                    goal=tpl["goal"],
                    agent_chain=tpl["agent_chain"],
                    icon=tpl["icon"],
                    is_preset=True
                )
                db.add(obj)

        await db.commit()

        # 3. Seed Sample Completed & Running Workflows for Instant Dashboard Vitality
        logger.info("Seeding sample workflows...")
        sample_wf_id = "wf-sample-exec-01"
        stmt = select(Workflow).where(Workflow.id == sample_wf_id)
        res = await db.execute(stmt)
        if not res.scalar_one_or_none():
            sample_wf = Workflow(
                id=sample_wf_id,
                name="Executive Customer Feedback Briefing",
                goal="Analyze customer feedback and generate an executive report.",
                status=WorkflowStatus.COMPLETED.value,
                user_id=dev_user.id,
                execution_time=4.82
            )
            db.add(sample_wf)
            await db.flush()

            # Add steps
            steps = [
                ("planner", "Planner", [], StepStatus.COMPLETED.value, 0.8),
                ("researcher", "Research", ["planner"], StepStatus.COMPLETED.value, 1.2),
                ("analyzer", "Analyzer", ["researcher"], StepStatus.COMPLETED.value, 1.0),
                ("validator", "Validator", ["analyzer"], StepStatus.COMPLETED.value, 0.7),
                ("writer", "Writer", ["validator"], StepStatus.COMPLETED.value, 1.12),
            ]

            for key, agent_type, deps, status_val, exec_time in steps:
                step_obj = WorkflowStep(
                    workflow_id=sample_wf.id,
                    step_key=key,
                    agent_type=agent_type,
                    dependency_ids=deps,
                    status=status_val,
                    execution_time=exec_time,
                    output_data={"summary": f"Completed execution for {agent_type} agent."}
                )
                db.add(step_obj)

            # Add sample logs
            logs = [
                ("System", "INFO", "Workflow initialized with goal: 'Analyze customer feedback and generate an executive report.'"),
                ("Planner", "INFO", "Formulated 4-node DAG graph with 0 cyclic dependencies."),
                ("Research", "INFO", "Indexed 14 primary data sources and 1,420 feedback logs."),
                ("Analyzer", "INFO", "Calculated CSAT (4.6/5.0) and NPS (68) metrics."),
                ("Validator", "INFO", "Schema validation passed with 0.99 trust score."),
                ("Writer", "INFO", "Compiled final executive Markdown briefing package.")
            ]
            for agent, lvl, msg in logs:
                db.add(AgentLog(
                    workflow_id=sample_wf.id,
                    agent_type=agent,
                    level=lvl,
                    message=msg
                ))

            await db.commit()

        logger.info("Database seeding completed successfully!")


if __name__ == "__main__":
    asyncio.run(seed_data())
