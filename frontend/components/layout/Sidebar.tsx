'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  GitFork, 
  PlusCircle, 
  Terminal, 
  BookOpen, 
  Activity, 
  Cpu, 
  ShieldCheck, 
  Zap 
} from 'lucide-react';

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Workflows', href: '/dashboard/workflows', icon: GitFork },
  { name: 'Workflow Builder', href: '/dashboard/builder', icon: PlusCircle },
  { name: 'Agent Logs', href: '/dashboard/logs', icon: Terminal },
  { name: 'Templates', href: '/dashboard/templates', icon: BookOpen },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-slate-800/80 bg-slate-950/60 backdrop-blur-xl flex flex-col h-screen fixed left-0 top-0 z-40">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/60 flex items-center space-x-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-glow-blue">
          <Cpu className="h-6 w-6 text-white animate-pulse" />
        </div>
        <div>
          <h1 className="text-base font-bold text-white tracking-wide">Orchestrator</h1>
          <p className="text-xs text-slate-400 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
            Multi-Agent Autonomous
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          Platform Menu
        </div>
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-inner'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Cluster Health Status Widget */}
      <div className="p-3 m-3 rounded-xl bg-slate-900/80 border border-slate-800/90 text-xs">
        <div className="flex items-center justify-between text-slate-300 mb-2">
          <span className="flex items-center gap-1.5 font-medium">
            <Activity className="h-4 w-4 text-emerald-400" /> Cluster Telemetry
          </span>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-mono">99.9%</span>
        </div>
        <div className="space-y-1 text-slate-400 text-[11px]">
          <div className="flex justify-between">
            <span>Active Agents:</span>
            <span className="text-slate-200 font-mono">5 Workers</span>
          </div>
          <div className="flex justify-between">
            <span>Redis Stream:</span>
            <span className="text-emerald-400 font-mono">Connected</span>
          </div>
        </div>
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-slate-800/60 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-blue-400">
            AI
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-white truncate">Staff AI Engineer</p>
            <p className="text-[10px] text-slate-400 truncate">developer@orchestrator.ai</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
