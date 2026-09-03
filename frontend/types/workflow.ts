export type WorkflowStatus =
  | 'PENDING'
  | 'QUEUED'
  | 'RUNNING'
  | 'WAITING_APPROVAL'
  | 'RETRYING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export type StepStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'WAITING_APPROVAL'
  | 'COMPLETED'
  | 'FAILED'
  | 'SKIPPED';

export interface WorkflowStep {
  id: string;
  workflow_id: string;
  step_key: string;
  agent_type: string;
  dependency_ids: string[];
  input_data: Record<string, any>;
  output_data: Record<string, any>;
  status: StepStatus;
  retry_count: number;
  error_message?: string;
  execution_time: number;
  created_at: string;
}

export interface Workflow {
  id: string;
  name: string;
  goal: string;
  status: WorkflowStatus;
  user_id?: string;
  execution_time: number;
  meta_data: Record<string, any>;
  created_at: string;
  updated_at: string;
  steps: WorkflowStep[];
}

export interface WorkflowTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  goal: string;
  agent_chain: string[];
  icon: string;
  is_preset: boolean;
  created_at: string;
}

export interface WorkflowCreatePayload {
  name?: string;
  goal: string;
  template_id?: string;
  meta_data?: Record<string, any>;
}
