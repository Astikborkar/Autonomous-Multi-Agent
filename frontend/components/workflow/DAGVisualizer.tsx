'use client';

import React from 'react';
import { Cpu, Search, BarChart3, ShieldCheck, FileText, ArrowRight, CheckCircle2, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import { WorkflowStep } from '@/types/workflow';

interface DAGVisualizerProps {
  steps?: WorkflowStep[];
  currentStatus?: string;
}

const AGENT_NODES = [
  { key: 'planner', type: 'Planner', name: 'Planner Agent', icon: Cpu, desc: 'Decomposes objective into DAG tasks' },
  { key: 'researcher', type: 'Research', name: 'Research Agent', icon: Search, desc: 'Collects & summarizes context' },
  { key: 'analyzer', type: 'Analyzer', name: 'Analyzer Agent', icon: BarChart3, desc: 'Computes metrics & KPIs' },
  { key: 'validator', type: 'Validator', name: 'Validator Agent', icon: ShieldCheck, desc: 'Verifies data & schema compliance' },
  { key: 'writer', type: 'Writer', name: 'Writer Agent', icon: FileText, desc: 'Compiles Markdown & PDF report' },
];

export function DAGVisualizer({ steps = [], currentStatus }: DAGVisualizerProps) {
  const getStepData = (key: string) => {
    return steps.find((s) => s.step_key === key || s.agent_type.toLowerCase() === key);
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800/80 backdrop-blur-xl shadow-glass">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-white tracking-wide">Multi-Agent Execution DAG Graph</h3>
          <p className="text-xs text-slate-400">LangGraph state transition graph and node dependency pipeline</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
            Topological Order: 0 Cyclic
          </span>
        </div>
      </div>

      {/* DAG Flow Nodes Container */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 overflow-x-auto py-4">
        {AGENT_NODES.map((node, index) => {
          const stepData = getStepData(node.key);
          const status = stepData?.status || (index === 0 && currentStatus === 'RUNNING' ? 'RUNNING' : 'PENDING');
          const isCompleted = status === 'COMPLETED';
          const isRunning = status === 'RUNNING';
          const isFailed = status === 'FAILED';
          const isRetrying = status === 'RETRYING';

          return (
            <React.Fragment key={node.key}>
              {/* Node Card */}
              <div
                className={`relative flex-1 min-w-[200px] p-4 rounded-xl transition-all duration-300 border ${
                  isCompleted
                    ? 'bg-slate-900/90 border-emerald-500/40 shadow-glow-emerald'
                    : isRunning
                    ? 'bg-blue-950/40 border-blue-500/80 shadow-glow-blue animate-pulse'
                    : isRetrying
                    ? 'bg-amber-950/40 border-amber-500/80'
                    : isFailed
                    ? 'bg-rose-950/40 border-rose-500/80'
                    : 'bg-slate-900/40 border-slate-800/80 opacity-60'
                }`}
              >
                {/* Node Top Header */}
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                      isCompleted
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : isRunning
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <node.icon className="h-4 w-4" />
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                      isCompleted
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : isRunning
                        ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                        : isRetrying
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                        : isFailed
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    {status}
                  </span>
                </div>

                {/* Node Title & Description */}
                <h4 className="text-xs font-bold text-white mb-0.5">{node.name}</h4>
                <p className="text-[11px] text-slate-400 leading-snug mb-3">{node.desc}</p>

                {/* Node Execution Stats */}
                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-slate-500" />
                    {stepData?.execution_time ? `${stepData.execution_time}s` : '--'}
                  </span>
                  {stepData?.retry_count ? (
                    <span className="text-amber-400 flex items-center gap-1">
                      <RefreshCw className="h-3 w-3" /> Retry #{stepData.retry_count}
                    </span>
                  ) : (
                    <span>Dep: [{index === 0 ? 'None' : AGENT_NODES[index - 1].key}]</span>
                  )}
                </div>
              </div>

              {/* Arrow Connector between nodes */}
              {index < AGENT_NODES.length - 1 && (
                <div className="hidden lg:flex items-center justify-center px-1 text-slate-600">
                  <ArrowRight className={`h-5 w-5 ${isCompleted ? 'text-emerald-400' : 'text-slate-700'}`} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
