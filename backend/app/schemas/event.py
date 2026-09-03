from typing import Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class EventResponse(BaseModel):
    id: str
    workflow_id: str
    event_type: str
    payload: Dict[str, Any]
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)
