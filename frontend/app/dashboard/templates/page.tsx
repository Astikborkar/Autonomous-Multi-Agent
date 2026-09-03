'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { BookOpen, Cpu, Rocket, ArrowRight, Check } from 'lucide-react';

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<any[]>([]);

  useEffect(() => {
    apiClient.getTemplates().then(setTemplates).catch(console.error);
  }, []);

  const handleLaunchTemplate = async (tpl: any) => {
    try {
      const created = await apiClient.createWorkflow({
        name: tpl.title,
        goal: tpl.goal,
        template_id: tpl.id
      });
      router.push(`/dashboard/workflows/${created.id}`);
    } catch (err: any) {
      alert(`Error launching template: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-blue-400" />
          Workflow Template Library
        </h1>
        <p className="text-xs text-slate-400">
          Pre-engineered multi-agent DAG execution blueprints for enterprise automation tasks
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800/80 backdrop-blur-xl shadow-glass flex flex-col justify-between hover:border-slate-700 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  {tpl.category}
                </span>
                <div className="h-8 w-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
                  <Cpu className="h-4 w-4" />
                </div>
              </div>
              <h3 className="text-base font-bold text-white mb-2">{tpl.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">{tpl.description}</p>
              
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 mb-6">
                <span className="text-[10px] font-mono text-slate-500 block mb-1 uppercase font-bold">Goal Objective</span>
                <p className="text-xs font-mono text-slate-300">{tpl.goal}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
              <div className="text-[11px] font-mono text-slate-500">
                Agent Chain: <span className="text-slate-300 font-bold">5 Nodes</span>
              </div>
              <button
                onClick={() => handleLaunchTemplate(tpl)}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-glow-blue transition-all"
              >
                <Rocket className="h-3.5 w-3.5" />
                <span>Launch Template</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
