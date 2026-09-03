'use client';

import React from 'react';
import { PlayCircle, CheckCircle2, XCircle, Cpu, Layers, Clock, TrendingUp } from 'lucide-react';

interface OverviewCardsProps {
  metrics?: {
    active_workflows: number;
    completed_workflows: number;
    failed_workflows: number;
    running_agents: number;
    queue_size: number;
    avg_execution_time: number;
    success_rate: number;
  };
}

export function OverviewCards({ metrics }: OverviewCardsProps) {
  const cards = [
    {
      title: 'Active Workflows',
      value: metrics?.active_workflows ?? 2,
      subtitle: 'Executing in DAG queue',
      icon: PlayCircle,
      color: 'from-blue-500/20 to-cyan-500/10',
      borderColor: 'border-blue-500/30',
      iconColor: 'text-blue-400',
    },
    {
      title: 'Completed',
      value: metrics?.completed_workflows ?? 142,
      subtitle: `${metrics?.success_rate ?? 98.4}% success rate`,
      icon: CheckCircle2,
      color: 'from-emerald-500/20 to-teal-500/10',
      borderColor: 'border-emerald-500/30',
      iconColor: 'text-emerald-400',
    },
    {
      title: 'Failed',
      value: metrics?.failed_workflows ?? 1,
      subtitle: 'Handled by backoff engine',
      icon: XCircle,
      color: 'from-rose-500/20 to-pink-500/10',
      borderColor: 'border-rose-500/30',
      iconColor: 'text-rose-400',
    },
    {
      title: 'Running Agents',
      value: metrics?.running_agents ?? 5,
      subtitle: 'Planner, Research, Analyzer...',
      icon: Cpu,
      color: 'from-indigo-500/20 to-purple-500/10',
      borderColor: 'border-indigo-500/30',
      iconColor: 'text-indigo-400',
    },
    {
      title: 'Queue Size',
      value: metrics?.queue_size ?? 0,
      subtitle: 'Redis stream workers',
      icon: Layers,
      color: 'from-amber-500/20 to-yellow-500/10',
      borderColor: 'border-amber-500/30',
      iconColor: 'text-amber-400',
    },
    {
      title: 'Avg Execution Time',
      value: `${metrics?.avg_execution_time ?? 4.22}s`,
      subtitle: 'End-to-end DAG latency',
      icon: Clock,
      color: 'from-purple-500/20 to-violet-500/10',
      borderColor: 'border-purple-500/30',
      iconColor: 'text-purple-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className={`p-4 rounded-xl bg-gradient-to-br ${card.color} bg-slate-950/80 backdrop-blur-md border ${card.borderColor} shadow-glass flex flex-col justify-between hover:scale-[1.02] transition-transform duration-200`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{card.title}</span>
            <card.icon className={`h-5 w-5 ${card.iconColor}`} />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-white tracking-tight">{card.value}</div>
            <div className="text-[11px] text-slate-400 mt-1 truncate">{card.subtitle}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
