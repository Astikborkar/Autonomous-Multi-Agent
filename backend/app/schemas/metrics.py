from typing import List, Dict, Any
from pydantic import BaseModel

class ChartDataPoint(BaseModel):
    label: str
    value: float

class SystemMetricsResponse(BaseModel):
    active_workflows: int
    completed_workflows: int
    failed_workflows: int
    running_agents: int
    queue_size: int
    avg_execution_time: float
    success_rate: float
    agent_utilization: List[Dict[str, Any]]
    success_rate_trend: List[ChartDataPoint]
    task_latency_distribution: List[ChartDataPoint]
    daily_executions: List[ChartDataPoint]
