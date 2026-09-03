import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, JSON
from app.db.base import Base

class WorkflowTemplate(Base):
    __tablename__ = "workflow_templates"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False, index=True)
    description = Column(String, nullable=False)
    category = Column(String, nullable=False)
    goal = Column(String, nullable=False)
    agent_chain = Column(JSON, default=list)  # list of agent names e.g., ['Planner', 'Research', 'Analyzer', 'Validator', 'Writer']
    icon = Column(String, default="Cpu")
    is_preset = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
