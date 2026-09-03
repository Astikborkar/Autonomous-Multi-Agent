from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.models.template import WorkflowTemplate

router = APIRouter(prefix="/templates", tags=["Workflow Templates"])


@router.get("")
async def list_templates(db: AsyncSession = Depends(get_db)):
    stmt = select(WorkflowTemplate).order_by(WorkflowTemplate.created_at)
    res = await db.execute(stmt)
    templates = res.scalars().all()
    return templates


@router.get("/{template_id}")
async def get_template(template_id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(WorkflowTemplate).where(WorkflowTemplate.id == template_id)
    res = await db.execute(stmt)
    template = res.scalar_one_or_none()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return template
