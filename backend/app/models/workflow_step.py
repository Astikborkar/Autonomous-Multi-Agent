import uuid
import enum
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class StepStatus(str, enum.Enum):
    PENDING = "PENDING"
    RUNNING = "RUNNING"
    WAITING_APPROVAL = "WAITING_APPROVAL"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    SKIPPED = "SKIPPED"

class WorkflowStep(Base):
    __tablename__ = "workflow_steps"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    workflow_id = Column(String, ForeignKey("workflows.id", ondelete="CASCADE"), nullable=False, index=True)
    step_key = Column(String, nullable=False)  # e.g., 'planner', 'researcher', 'analyzer'
    agent_type = Column(String, nullable=False)  # e.g., 'Planner', 'Research', 'Analyzer', 'Validator', 'Writer'
    dependency_ids = Column(JSON, default=list)  # list of step keys or IDs it depends on
    input_data = Column(JSON, default=dict)
    output_data = Column(JSON, default=dict)
    status = Column(String, default=StepStatus.PENDING.value, nullable=False)
    retry_count = Column(Integer, default=0)
    error_message = Column(String, nullable=True)
    execution_time = Column(Float, default=0.0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    workflow = relationship("Workflow", back_populates="steps")
