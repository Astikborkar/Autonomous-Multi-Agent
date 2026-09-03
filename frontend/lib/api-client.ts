const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

class ApiClient {
  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP Error ${response.status}`);
    }

    if (response.status === 24) return {} as T;
    return response.json();
  }

  // Auth APIs
  async login(email: string, password: string) {
    return this.request<{ access_token: string; refresh_token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(email: string, password: string, fullName?: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name: fullName }),
    });
  }

  async getMe() {
    return this.request('/auth/me');
  }

  // Workflow APIs
  async getWorkflows(status?: string, search?: string) {
    let url = '/workflows';
    const params = new URLSearchParams();
    if (status) params.append('status_filter', status);
    if (search) params.append('search', search);
    if (params.toString()) url += `?${params.toString()}`;
    return this.request<any[]>(url);
  }

  async getWorkflow(id: string) {
    return this.request<any>(`/workflows/${id}`);
  }

  async createWorkflow(payload: { name?: string; goal: string; template_id?: string }) {
    return this.request<any>('/workflows', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async executeWorkflow(id: string) {
    return this.request<any>(`/workflows/${id}/execute`, { method: 'POST' });
  }

  async retryWorkflow(id: string) {
    return this.request<any>(`/workflows/${id}/retry`, { method: 'POST' });
  }

  async pauseWorkflow(id: string) {
    return this.request<any>(`/workflows/${id}/pause`, { method: 'POST' });
  }

  async resumeWorkflow(id: string) {
    return this.request<any>(`/workflows/${id}/resume`, { method: 'POST' });
  }

  async approveWorkflow(id: string, approved: boolean, feedback?: string) {
    return this.request<any>(`/workflows/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ approved, feedback }),
    });
  }

  async deleteWorkflow(id: string) {
    return this.request(`/workflows/${id}`, { method: 'DELETE' });
  }

  async exportReport(id: string) {
    return this.request<{ workflow_id: string; name: string; markdown: string }>(`/workflows/${id}/export`);
  }

  // Templates
  async getTemplates() {
    return this.request<any[]>('/templates');
  }

  // Agents & Logs
  async getAgents() {
    return this.request<any[]>('/agents');
  }

  async getLogs(workflowId: string, agentType?: string, level?: string) {
    let url = `/agents/logs/${workflowId}`;
    const params = new URLSearchParams();
    if (agentType) params.append('agent_type', agentType);
    if (level) params.append('level', level);
    if (params.toString()) url += `?${params.toString()}`;
    return this.request<any[]>(url);
  }

  // Metrics
  async getMetrics() {
    return this.request<any>('/metrics');
  }
}

export const apiClient = new ApiClient();
