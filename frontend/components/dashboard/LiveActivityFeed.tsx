'use client';

import React from 'react';
import { Activity, Radio, Cpu, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

interface LiveActivityFeedProps {
  events: any[];
  isConnected: boolean;
}

export function LiveActivityFeed({ events, isConnected }: LiveActivityFeedProps) {
  return (
    <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 backdrop-blur-xl shadow-glass flex flex-col h-[380px]">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
        <div className="flex items-center space-x-2">
          <Activity className="h-4 w-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white">Live Event Stream</h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`}></span>
          <span className="text-xs font-mono text-slate-400">{isConnected ? 'SSE Active' : 'Connecting...'}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2.5 pr-2 font-mono text-xs">
        {events.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500">
            <Radio className="h-8 w-8 mb-2 text-slate-600 animate-pulse" />
            <p>Listening for Redis Pub/Sub events...</p>
          </div>
        ) : (
          events.map((evt, idx) => (
            <div
              key={evt.id || idx}
              className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/60 flex items-start justify-between hover:bg-slate-900 transition-colors"
            >
              <div className="flex items-start space-x-2.5">
                <div className="mt-0.5">
                  {evt.event_type?.includes('completed') ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : evt.event_type?.includes('failed') ? (
                    <AlertCircle className="h-4 w-4 text-rose-400" />
                  ) : (
                    <Cpu className="h-4 w-4 text-blue-400 animate-pulse" />
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white">{evt.event_type}</span>
                    <span className="text-[10px] text-slate-500">{evt.payload?.agent_type || 'System'}</span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5 leading-snug">
                    {evt.payload?.message || evt.payload?.summary || `Workflow ${evt.workflow_id?.slice(0, 8)} state transition.`}
                  </p>
                </div>
              </div>
              <span className="text-[10px] text-slate-500 whitespace-nowrap">
                {evt.timestamp ? new Date(evt.timestamp).toLocaleTimeString() : 'just now'}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
