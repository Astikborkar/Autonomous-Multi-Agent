import uuid
import enum
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class WorkflowStatus(str, enum.Enum):
    PENDING = "PENDING"
    QUEUED = "QUEUED"
    RUNNING = "RUNNING"
    WAITING_APPROVAL = "WAITING_APPROVAL"
    RETRYING = "RETRYING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    CANCELLED = "CANCELLED"

class Workflow(Base):
    __tablename__ = "workflows"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False, index=True)
    goal = Column(String, nullable=False)
    status = Column(String, default=WorkflowStatus.PENDING.value, nullable=False, index=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    execution_time = Column(Float, default=0.0)  # seconds
    meta_data = Column(JSON, default=dict)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    steps = relationship("WorkflowStep", back_populates="workflow", cascade="all, delete-orphan", lazy="selectin")
    logs = relationship("AgentLog", back_populates="workflow", cascade="all, delete-orphan", lazy="selectin")
    events = relationship("Event", back_populates="workflow", cascade="all, delete-orphan", lazy="selectin")
