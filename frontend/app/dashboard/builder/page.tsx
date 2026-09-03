'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../lib/api-client';
import { Cpu, Sparkles, Rocket, FileText, TrendingUp, ShieldAlert, DollarSign, Check, ArrowRight } from 'lucide-react';

export default function WorkflowBuilderPage() {
  const router = useRouter();
  const [goal, setGoal] = useState('Analyze customer feedback and generate an executive report.');
  const [name, setName] = useState('');
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiClient.getTemplates().then((res) => setTemplates(res)).catch(() => {});
  }, []);

  const handleSelectTemplate = (tpl: any) => {
    setSelectedTemplate(tpl.id);
    setGoal(tpl.goal);
    setName(tpl.title);
  };

  const handleCreateAndExecute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) return;

    setSubmitting(true);
    try {
      const created = await apiClient.createWorkflow({
        name: name || undefined,
        goal,
        template_id: selectedTemplate || undefined
      });
      router.push(`/dashboard/workflows/${created.id}`);
    } catch (err: any) {
      alert(`Failed to create workflow: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-blue-400" />
          Autonomous Workflow Builder
        </h1>
        <p className="text-xs text-slate-400">
          Provide a single high-level objective and let the multi-agent AI team plan, execute, and deliver results autonomously.
        </p>
      </div>

      {/* Preset Templates Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Quick Start Presets
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {templates.map((tpl) => {
            const isSelected = selectedTemplate === tpl.id;
            return (
              <div
                key={tpl.id}
                onClick={() => handleSelectTemplate(tpl)}
                className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
                  isSelected
                    ? 'bg-blue-950/60 border-blue-500 shadow-glow-blue'
                    : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <Cpu className="h-4 w-4" />
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-blue-400" />}
                </div>
                <h4 className="text-xs font-bold text-white mb-1">{tpl.title}</h4>
                <p className="text-[11px] text-slate-400 line-clamp-2">{tpl.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Objective Input Form */}
      <form onSubmit={handleCreateAndExecute} className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800/80 backdrop-blur-xl shadow-glass space-y-6">
        <div className="space-y-2">
          <label className="block text-xs font-bold text-white uppercase tracking-wider">
            Workflow Title (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Q3 Executive Feedback Briefing"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-white uppercase tracking-wider">
            High-Level Objective Goal <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={4}
            required
            placeholder="Describe the objective for the autonomous agents..."
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 leading-relaxed font-mono"
          />
          <p className="text-[11px] text-slate-500">
            The Planner Agent will automatically decompose this goal into Planner → Researcher → Analyzer → Validator → Writer tasks.
          </p>
        </div>

        {/* Live Chain Preview */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/60 space-y-2">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Assigned Agent Pipeline</span>
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-300">
            <span className="px-2.5 py-1 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">1. Planner</span>
            <ArrowRight className="h-3 w-3 text-slate-600" />
            <span className="px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">2. Research</span>
            <ArrowRight className="h-3 w-3 text-slate-600" />
            <span className="px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">3. Analyzer</span>
            <ArrowRight className="h-3 w-3 text-slate-600" />
            <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">4. Validator</span>
            <ArrowRight className="h-3 w-3 text-slate-600" />
            <span className="px-2.5 py-1 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">5. Writer</span>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting || !goal.trim()}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-sm shadow-glow-blue flex items-center justify-center space-x-2 transition-all duration-200 disabled:opacity-50"
        >
          <Rocket className="h-4 w-4 animate-bounce" />
          <span>{submitting ? 'Initializing Agent Swarm...' : 'Launch Autonomous Workflow'}</span>
        </button>
      </form>
    </div>
  );
}
