import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class AgentLog(Base):
    __tablename__ = "agent_logs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    workflow_id = Column(String, ForeignKey("workflows.id", ondelete="CASCADE"), nullable=False, index=True)
    step_id = Column(String, nullable=True)
    agent_type = Column(String, nullable=False, index=True)
    level = Column(String, default="INFO", nullable=False)  # INFO, WARNING, ERROR, DEBUG
    message = Column(String, nullable=False)
    details = Column(JSON, default=dict)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    workflow = relationship("Workflow", back_populates="logs")
