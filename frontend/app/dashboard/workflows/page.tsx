'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '../../lib/api-client';
import { GitFork, Search, Plus, Play, CheckCircle2, XCircle, RefreshCw, Filter } from 'lucide-react';

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const fetchWorkflows = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getWorkflows(
        statusFilter === 'ALL' ? undefined : statusFilter,
        search || undefined
      );
      setWorkflows(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, [statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWorkflows();
  };

  const statuses = ['ALL', 'COMPLETED', 'RUNNING', 'FAILED', 'QUEUED', 'WAITING_APPROVAL'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Autonomous Workflows</h1>
          <p className="text-xs text-slate-400">Manage and monitor all multi-agent DAG execution instances</p>
        </div>
        <Link
          href="/dashboard/builder"
          className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-glow-blue"
        >
          <Plus className="h-4 w-4" />
          <span>Create Workflow</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by workflow name or goal..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
          />
        </form>

        <div className="flex items-center space-x-1.5 overflow-x-auto">
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors ${
                statusFilter === st
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Workflows Table */}
      <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800/80 backdrop-blur-xl shadow-glass">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-slate-400 uppercase text-[10px] font-mono border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Workflow Name</th>
                <th className="py-3 px-4">Objective Goal</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Execution Latency</th>
                <th className="py-3 px-4">Created At</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2" />
                    Fetching workflows...
                  </td>
                </tr>
              ) : workflows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No workflows match the search parameters.
                  </td>
                </tr>
              ) : (
                workflows.map((wf) => (
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
                    <td className="py-3 px-4 text-slate-500">{new Date(wf.created_at).toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/dashboard/workflows/${wf.id}`}
                        className="px-3 py-1 rounded bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 text-xs font-semibold transition-colors"
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
