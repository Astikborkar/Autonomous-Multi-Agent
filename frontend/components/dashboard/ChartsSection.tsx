'use client';

import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, CartesianGrid
} from 'recharts';

interface ChartsSectionProps {
  metrics?: {
    success_rate_trend: any[];
    agent_utilization: any[];
    task_latency_distribution: any[];
    daily_executions: any[];
  };
}

export function ChartsSection({ metrics }: ChartsSectionProps) {
  const successData = metrics?.success_rate_trend || [
    { label: 'Mon', value: 94.5 },
    { label: 'Tue', value: 96.2 },
    { label: 'Wed', value: 98.4 },
    { label: 'Thu', value: 97.1 },
    { label: 'Fri', value: 99.2 },
    { label: 'Sat', value: 98.8 },
    { label: 'Sun', value: 99.5 }
  ];

  const agentData = metrics?.agent_utilization || [
    { agent: 'Planner', utilization: 88.5 },
    { agent: 'Research', utilization: 94.2 },
    { agent: 'Analyzer', utilization: 91.0 },
    { agent: 'Validator', utilization: 86.4 },
    { agent: 'Writer', utilization: 95.8 }
  ];

  const latencyData = metrics?.task_latency_distribution || [
    { label: '<1s', value: 45 },
    { label: '1s-3s', value: 120 },
    { label: '3s-5s', value: 65 },
    { label: '5s-10s', value: 15 },
    { label: '>10s', value: 3 }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Chart 1: Success Rate Trend */}
      <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 backdrop-blur-xl shadow-glass">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white">Workflow Success Rate Trend</h3>
            <p className="text-xs text-slate-400">Weekly autonomous execution accuracy (%)</p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            99.2% Avg
          </span>
        </div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={successData}>
              <defs>
                <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="label" stroke="#64748b" fontSize={11} />
              <YAxis domain={[90, 100]} stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
              />
              <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorSuccess)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Agent Utilization */}
      <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 backdrop-blur-xl shadow-glass">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white">Agent Utilization & Load</h3>
            <p className="text-xs text-slate-400">Worker capacity across specialized agents (%)</p>
          </div>
          <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
            5 Active Nodes
          </span>
        </div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={agentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="agent" stroke="#64748b" fontSize={11} />
              <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
              />
              <Bar dataKey="utilization" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
