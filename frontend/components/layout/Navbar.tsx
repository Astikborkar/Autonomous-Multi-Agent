'use client';

import React from 'react';
import Link from 'next/link';
import { Search, Plus, Bell, Radio, Shield, RefreshCw } from 'lucide-react';

interface NavbarProps {
  title?: string;
  onRefresh?: () => void;
}

export function Navbar({ title = 'Dashboard Overview', onRefresh }: NavbarProps) {
  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/40 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30 ml-64">
      {/* Title & Live Status */}
      <div className="flex items-center space-x-4">
        <h2 className="text-lg font-bold text-white tracking-tight">{title}</h2>
        <div className="hidden md:flex items-center space-x-2 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono">
          <Radio className="h-3.5 w-3.5 animate-pulse text-blue-400" />
          <span>SSE Event Bus: Live</span>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center space-x-3">
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        )}

        <Link
          href="/dashboard/builder"
          className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-glow-blue transition-all duration-150"
        >
          <Plus className="h-4 w-4" />
          <span>New Autonomous Workflow</span>
        </Link>
      </div>
    </header>
  );
}
