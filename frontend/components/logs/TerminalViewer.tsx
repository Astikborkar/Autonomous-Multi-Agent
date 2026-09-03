'use client';

import React, { useState } from 'react';
import { Terminal, Search, Filter, Copy, Check, Download } from 'lucide-react';
import { AgentLog } from '@/types/agent';

interface TerminalViewerProps {
  logs: AgentLog[];
  workflowId?: string;
}

export function TerminalViewer({ logs = [], workflowId }: TerminalViewerProps) {
  const [search, setSearch] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<string>('ALL');
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [copied, setCopied] = useState(false);

  const agents = ['ALL', 'System', 'Planner', 'Research', 'Analyzer', 'Validator', 'Writer'];
  const levels = ['ALL', 'INFO', 'WARNING', 'ERROR'];

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      !search ||
      log.message.toLowerCase().includes(search.toLowerCase()) ||
      log.agent_type.toLowerCase().includes(search.toLowerCase());
    const matchesAgent = selectedAgent === 'ALL' || log.agent_type === selectedAgent;
    const matchesLevel = selectedLevel === 'ALL' || log.level === selectedLevel;
    return matchesSearch && matchesAgent && matchesLevel;
  });

  const copyToClipboard = () => {
    const text = filteredLogs.map((l) => `[${l.timestamp}] [${l.agent_type}] [${l.level}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden flex flex-col h-[600px]">
      {/* Terminal Window Header */}
      <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="flex space-x-1.5">
            <div className="h-3 w-3 rounded-full bg-rose-500/80"></div>
            <div className="h-3 w-3 rounded-full bg-amber-500/80"></div>
            <div className="h-3 w-3 rounded-full bg-emerald-500/80"></div>
          </div>
          <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
            <Terminal className="h-3.5 w-3.5 text-blue-400" />
            agent-orchestrator.log {workflowId ? `(${workflowId.slice(0, 8)})` : ''}
          </span>
        </div>

        {/* Action Controls & Filters */}
        <div className="flex items-center space-x-2">
          <button
            onClick={copyToClipboard}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-3 bg-slate-900/60 border-b border-slate-800 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search logs by keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
          />
        </div>

        {/* Agent Filter */}
        <div className="flex items-center space-x-1 overflow-x-auto">
          {agents.map((ag) => (
            <button
              key={ag}
              onClick={() => setSelectedAgent(ag)}
              className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors ${
                selectedAgent === ag
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
              }`}
            >
              {ag}
            </button>
          ))}
        </div>
      </div>

      {/* Terminal Log Console */}
      <div className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-1.5 bg-[#050811]">
        {filteredLogs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-600">
            No matching log entries found for current filters.
          </div>
        ) : (
          filteredLogs.map((log, idx) => {
            const isError = log.level === 'ERROR';
            const isWarn = log.level === 'WARNING';
            return (
              <div key={log.id || idx} className="flex items-start space-x-3 leading-relaxed hover:bg-slate-900/40 p-1 rounded">
                <span className="text-slate-600 text-[10px] whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded uppercase font-bold whitespace-nowrap ${
                    isError
                      ? 'bg-rose-500/20 text-rose-400'
                      : isWarn
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-blue-500/20 text-blue-400'
                  }`}
                >
                  {log.agent_type}
                </span>
                <span
                  className={`flex-1 ${
                    isError ? 'text-rose-300 font-semibold' : isWarn ? 'text-amber-300' : 'text-slate-300'
                  }`}
                >
                  {log.message}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
