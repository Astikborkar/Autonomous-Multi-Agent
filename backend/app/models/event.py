import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class Event(Base):
    __tablename__ = "events"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    workflow_id = Column(String, ForeignKey("workflows.id", ondelete="CASCADE"), nullable=False, index=True)
    event_type = Column(String, nullable=False, index=True)
    payload = Column(JSON, default=dict)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    workflow = relationship("Workflow", back_populates="events")
