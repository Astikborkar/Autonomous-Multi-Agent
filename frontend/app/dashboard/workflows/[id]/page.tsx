'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '../../../lib/api-client';
import { useSSE } from '../../../hooks/useSSE';
import { DAGVisualizer } from '../../../components/workflow/DAGVisualizer';
import { TerminalViewer } from '../../../components/logs/TerminalViewer';
import { 
  Play, 
  RefreshCw, 
  Pause, 
  Trash2, 
  Download, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowLeft,
  FileText,
  Terminal as TerminalIcon,
  ShieldAlert
} from 'lucide-react';

export default function WorkflowDetailPage() {
  const params = useParams();
  const router = useRouter();
  const workflowId = params.id as string;

  const [workflow, setWorkflow] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'dag' | 'logs' | 'report'>('dag');
  const [reportMarkdown, setReportMarkdown] = useState<string>('');

  const fetchDetails = async () => {
    try {
      const data = await apiClient.getWorkflow(workflowId);
      setWorkflow(data);
      const logsData = await apiClient.getLogs(workflowId);
      setLogs(logsData);

      // Check if Writer agent produced markdown
      const writerStep = data.steps?.find((s: any) => s.agent_type === 'Writer');
      if (writerStep?.output_data?.report?.markdown) {
        setReportMarkdown(writerStep.output_data.report.markdown);
      }
    } catch (err) {
      console.error("Error fetching workflow:", err);
    }
  };

  const { isConnected } = useSSE(`/events/${workflowId}`, (evt) => {
    fetchDetails();
  });

  useEffect(() => {
    fetchDetails();
    const interval = setInterval(fetchDetails, 3000);
    return () => clearInterval(interval);
  }, [workflowId]);

  const handleExecute = async () => {
    await apiClient.executeWorkflow(workflowId);
    fetchDetails();
  };

  const handleRetry = async () => {
    await apiClient.retryWorkflow(workflowId);
    fetchDetails();
  };

  const handlePause = async () => {
    await apiClient.pauseWorkflow(workflowId);
    fetchDetails();
  };

  const handleResume = async () => {
    await apiClient.resumeWorkflow(workflowId);
    fetchDetails();
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this workflow?")) {
      await apiClient.deleteWorkflow(workflowId);
      router.push('/dashboard/workflows');
    }
  };

  const handleExport = async () => {
    const data = await apiClient.exportReport(workflowId);
    const blob = new Blob([data.markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report_${workflowId.slice(0, 8)}.md`;
    a.click();
  };

  if (!workflow) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-500 font-mono">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" /> Loading workflow graph...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <button
        onClick={() => router.push('/dashboard/workflows')}
        className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Workflows</span>
      </button>

      {/* Header Info Banner */}
      <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800/80 backdrop-blur-xl shadow-glass flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <h1 className="text-xl font-extrabold text-white">{workflow.name}</h1>
            <span
              className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                workflow.status === 'COMPLETED'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : workflow.status === 'RUNNING'
                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 animate-pulse'
                  : workflow.status === 'FAILED'
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              {workflow.status}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono max-w-2xl">{workflow.goal}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {workflow.status === 'RUNNING' ? (
            <button
              onClick={handlePause}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-300 text-xs font-semibold"
            >
              <Pause className="h-3.5 w-3.5" />
              <span>Pause</span>
            </button>
          ) : workflow.status === 'WAITING_APPROVAL' ? (
            <button
              onClick={handleResume}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold"
            >
              <Play className="h-3.5 w-3.5" />
              <span>Approve & Resume</span>
            </button>
          ) : (
            <button
              onClick={handleExecute}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-glow-blue"
            >
              <Play className="h-3.5 w-3.5" />
              <span>Re-Run</span>
            </button>
          )}

          {workflow.status === 'FAILED' && (
            <button
              onClick={handleRetry}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 text-xs font-semibold"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Retry Step</span>
            </button>
          )}

          <button
            onClick={handleExport}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-semibold"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Report</span>
          </button>

          <button
            onClick={handleDelete}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-rose-400 hover:bg-rose-500/20 transition-colors"
            title="Delete Workflow"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-800/80 pb-2">
        <button
          onClick={() => setActiveTab('dag')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeTab === 'dag' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          DAG Topology Graph
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeTab === 'logs' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          Streaming Logs ({logs.length})
        </button>
        <button
          onClick={() => setActiveTab('report')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeTab === 'report' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          Executive Report Deliverable
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'dag' && <DAGVisualizer steps={workflow.steps} currentStatus={workflow.status} />}
      {activeTab === 'logs' && <TerminalViewer logs={logs} workflowId={workflowId} />}
      {activeTab === 'report' && (
        <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800/80 backdrop-blur-xl shadow-glass">
          {reportMarkdown ? (
            <div className="prose prose-invert max-w-none text-xs font-mono whitespace-pre-wrap leading-relaxed text-slate-300">
              {reportMarkdown}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500">
              <FileText className="h-8 w-8 mx-auto mb-2 text-slate-600" />
              <p>Report generation will complete when the Writer Agent finishes execution.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
