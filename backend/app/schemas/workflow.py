from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from app.models.workflow import WorkflowStatus
from app.models.workflow_step import StepStatus

class WorkflowCreate(BaseModel):
    name: Optional[str] = None
    goal: str = Field(..., description="High-level objective for the multi-agent system")
    template_id: Optional[str] = None
    meta_data: Optional[Dict[str, Any]] = Field(default_factory=dict)

class WorkflowStepResponse(BaseModel):
    id: str
    workflow_id: str
    step_key: str
    agent_type: str
    dependency_ids: List[str]
    input_data: Dict[str, Any]
    output_data: Dict[str, Any]
    status: StepStatus
    retry_count: int
    error_message: Optional[str]
    execution_time: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class WorkflowResponse(BaseModel):
    id: str
    name: str
    goal: str
    status: WorkflowStatus
    user_id: Optional[str]
    execution_time: float
    meta_data: Dict[str, Any]
    created_at: datetime
    updated_at: datetime
    steps: List[WorkflowStepResponse] = []

    model_config = ConfigDict(from_attributes=True)

class HumanApprovalRequest(BaseModel):
    approved: bool
    feedback: Optional[str] = None

class WorkflowFilterParams(BaseModel):
    status: Optional[WorkflowStatus] = None
    search: Optional[str] = None
    limit: int = 50
    offset: int = 0
