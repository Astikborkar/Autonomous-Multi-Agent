export interface AgentInfo {
  name: string;
  type: string;
  description: string;
  capabilities: string[];
}

export interface AgentLog {
  id: string;
  workflow_id: string;
  step_id?: string;
  agent_type: string;
  level: 'INFO' | 'WARNING' | 'ERROR' | 'DEBUG';
  message: string;
  details: Record<string, any>;
  timestamp: string;
}
