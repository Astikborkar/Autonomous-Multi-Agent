from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class AgentInfo(BaseModel):
    name: str
    type: str
    description: str
    capabilities: list[str]

class AgentLogResponse(BaseModel):
    id: str
    workflow_id: str
    step_id: Optional[str]
    agent_type: str
    level: str
    message: str
    details: Dict[str, Any]
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)

class AgentLogFilter(BaseModel):
    agent_type: Optional[str] = None
    level: Optional[str] = None
    search: Optional[str] = None
    limit: int = 100
