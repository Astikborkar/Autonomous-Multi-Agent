'use client';

import React, { useEffect, useState } from 'react';
import { TerminalViewer } from '@/components/logs/TerminalViewer';
import { apiClient } from '@/lib/api-client';
import { Terminal as TerminalIcon, RefreshCw } from 'lucide-react';

export default function LogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // Get all workflows to extract recent logs
      const workflows = await apiClient.getWorkflows();
      if (workflows.length > 0) {
        const firstWfLogs = await apiClient.getLogs(workflows[0].id);
        setLogs(firstWfLogs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <TerminalIcon className="h-6 w-6 text-blue-400" />
            Agent Telemetry & Terminal Logs
          </h1>
          <p className="text-xs text-slate-400">
            Real-time streaming agent logs, execution tracebacks, and system events
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 hover:text-white transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Terminal</span>
        </button>
      </div>

      <TerminalViewer logs={logs} />
    </div>
  );
}
