'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { OverviewCards } from '../../components/dashboard/OverviewCards';
import { ChartsSection } from '../../components/dashboard/ChartsSection';
import { LiveActivityFeed } from '../../components/dashboard/LiveActivityFeed';
import { useSSE } from '../../hooks/useSSE';
import { apiClient } from '../../lib/api-client';
import { GitFork, ArrowRight, Play, CheckCircle2, Clock, XCircle, RefreshCw } from 'lucide-react';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { isConnected, events } = useSSE('/events/dashboard/feed', (data) => {
    // Refresh metrics on workflow completion
    if (data.event_type === 'workflow.completed' || data.event_type === 'workflow.started') {
      fetchDashboardData();
    }
  });

  const fetchDashboardData = async () => {
    try {
      const [metricsData, workflowsData] = await Promise.all([
        apiClient.getMetrics().catch(() => null),
        apiClient.getWorkflows().catch(() => []),
      ]);
      if (metricsData) setMetrics(metricsData);
      if (workflowsData) setWorkflows(workflowsData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Executive Dashboard</h1>
          <p className="text-xs text-slate-400">Autonomous Multi-Agent Workflow Orchestration & Real-Time Telemetry</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 hover:text-white transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <OverviewCards metrics={metrics} />

      {/* Analytics Charts & Live Activity Feed Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartsSection metrics={metrics} />
        </div>
        <div>
          <LiveActivityFeed events={events} isConnected={isConnected} />
        </div>
      </div>

      {/* Recent Workflows Table */}
      <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800/80 backdrop-blur-xl shadow-glass">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <GitFork className="h-5 w-5 text-blue-400" />
            <h3 className="text-base font-bold text-white">Recent Workflows</h3>
          </div>
          <Link
            href="/dashboard/workflows"
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            View All <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-slate-400 uppercase text-[10px] font-mono border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Workflow Name</th>
                <th className="py-3 px-4">Objective Goal</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Execution Time</th>
                <th className="py-3 px-4">Created At</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono">
              {workflows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No active workflows found. Create one using the Workflow Builder!
                  </td>
                </tr>
              ) : (
                workflows.slice(0, 5).map((wf) => (
                  <tr key={wf.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-white">{wf.name}</td>
                    <td className="py-3 px-4 max-w-xs truncate text-slate-400">{wf.goal}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          wf.status === 'COMPLETED'
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : wf.status === 'RUNNING'
                            ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 animate-pulse'
                            : wf.status === 'FAILED'
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                      >
                        {wf.status === 'COMPLETED' && <CheckCircle2 className="h-3 w-3" />}
                        {wf.status === 'RUNNING' && <Play className="h-3 w-3" />}
                        {wf.status === 'FAILED' && <XCircle className="h-3 w-3" />}
                        {wf.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{wf.execution_time ? `${wf.execution_time}s` : '--'}</td>
                    <td className="py-3 px-4 text-slate-500">{new Date(wf.created_at).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/dashboard/workflows/${wf.id}`}
                        className="px-2.5 py-1 rounded bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 text-[11px] font-semibold transition-colors"
                      >
                        Inspect DAG
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
