from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.db.session import get_db
from app.models.agent_log import AgentLog
from app.schemas.agent import AgentInfo, AgentLogResponse

router = APIRouter(prefix="/agents", tags=["Agents & Logs"])

AGENT_REGISTRY = [
    AgentInfo(
        name="Planner Agent",
        type="Planner",
        description="Interprets high-level goals, decomposes tasks into DAG topologies, and estimates execution sequences.",
        capabilities=["DAG Synthesis", "Task Decomposition", "Dependency Order Estimation"]
    ),
    AgentInfo(
        name="Research Agent",
        type="Research",
        description="Gathers contextual information, indexes web data, primary documents, and API parameters.",
        capabilities=["API Scraping", "Context Summarization", "Primary Data Search"]
    ),
    AgentInfo(
        name="Analyzer Agent",
        type="Analyzer",
        description="Cleans unstructured context, runs statistical computations, and extracts key performance indicators (KPIs).",
        capabilities=["KPI Extraction", "Data Cleaning", "Quantitative Metric Calculations"]
    ),
    AgentInfo(
        name="Validator Agent",
        type="Validator",
        description="Validates schema compliance, numeric sanity checks, and triggers exponential retries if validation assertions fail.",
        capabilities=["Schema Verification", "Anomaly Detection", "Quality Assurance"]
    ),
    AgentInfo(
        name="Writer Agent",
        type="Writer",
        description="Synthesizes validated KPIs into executive Markdown reports, JSON data structures, and PDF packages.",
        capabilities=["Markdown Generation", "Executive Report Synthesis", "PDF-ready Formatting"]
    )
]


@router.get("", response_model=List[AgentInfo])
async def list_agents():
    return AGENT_REGISTRY


@router.get("/logs/{workflow_id}", response_model=List[AgentLogResponse])
async def get_workflow_logs(
    workflow_id: str,
    agent_type: Optional[str] = Query(None),
    level: Optional[str] = Query(None),
    limit: int = Query(200, le=500),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(AgentLog).where(AgentLog.workflow_id == workflow_id)
    if agent_type:
        stmt = stmt.where(AgentLog.agent_type == agent_type)
    if level:
        stmt = stmt.where(AgentLog.level == level)

    stmt = stmt.order_by(desc(AgentLog.timestamp)).limit(limit)
    res = await db.execute(stmt)
    logs = res.scalars().all()
    return logs
