import React, { useState } from 'react';
import { DollarSign, PieChart, TrendingDown, Sparkles, Sliders, CheckCircle, ShieldCheck } from 'lucide-react';

export function BudgetView({ budget }) {
  const [targetBudget, setTargetBudget] = useState(budget?.total || 34500);

  if (!budget) return null;

  const categories = budget.categories || [];
  const spent = budget.spent || 24200;
  const remaining = Math.max(0, targetBudget - spent);
  const spentPct = Math.min(100, Math.round((spent / targetBudget) * 100));

  return (
    <div className="space-y-8">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-space-900/60 border border-white/10 backdrop-blur-md">
          <div className="text-[10px] font-mono tracking-widest text-slate-400 uppercase mb-1">
            TOTAL ALLOCATED
          </div>
          <div className="text-2xl font-black text-white font-mono">
            ₹{targetBudget.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 mt-1 font-mono">
            ₹{Math.round(targetBudget / 4).toLocaleString()} / day
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-space-900/60 border border-white/10 backdrop-blur-md">
          <div className="text-[10px] font-mono tracking-widest text-slate-400 uppercase mb-1">
            COMMITTED / SPENT
          </div>
          <div className="text-2xl font-black text-cyan-400 font-mono">
            ₹{spent.toLocaleString()}
          </div>
          <div className="text-xs text-cyan-300 mt-1 font-mono">
            {spentPct}% utilized
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-space-900/60 border border-white/10 backdrop-blur-md">
          <div className="text-[10px] font-mono tracking-widest text-slate-400 uppercase mb-1">
            REMAINING BUFFER
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            ₹{remaining.toLocaleString()}
          </div>
          <div className="text-xs text-emerald-300 mt-1 font-mono">
            Available for dining & leisure
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-space-900/60 border border-white/10 backdrop-blur-md">
          <div className="text-[10px] font-mono tracking-widest text-slate-400 uppercase mb-1">
            AI OPTIMIZATION
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">
            -₹4,200
          </div>
          <div className="text-xs text-amber-300 mt-1 font-mono">
            Saved vs standard rack rates
          </div>
        </div>
      </div>

      {/* Interactive Budget Calibration Slider */}
      <div className="p-6 rounded-3xl bg-space-900/80 border border-white/10 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-cyan-400 uppercase font-mono mb-1">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>DYNAMIC BUDGET CALIBRATION</span>
            </div>
            <p className="text-xs text-slate-300">
              Drag to re-calibrate target spending; agents dynamically adjust dining tiers and activity inclusions.
            </p>
          </div>
          <div className="text-xl font-black font-mono text-cyan-300">
            ₹{targetBudget.toLocaleString()}
          </div>
        </div>

        <input
          type="range"
          min="20000"
          max="60000"
          step="1000"
          value={targetBudget}
          onChange={(e) => setTargetBudget(Number(e.target.value))}
          className="w-full h-2 bg-space-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
        />
        <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-2">
          <span>₹20,000 (Backpacker / Budget)</span>
          <span>₹35,000 (Curated Comfort)</span>
          <span>₹60,000 (Luxury Heritage)</span>
        </div>
      </div>

      {/* Category Breakdown Progress Bars */}
      <div className="p-6 sm:p-8 rounded-3xl bg-space-900/50 border border-white/10">
        <h3 className="text-base font-black text-white uppercase tracking-wider font-sans mb-6">
          CATEGORY EXPENSE ALLOCATION
        </h3>

        <div className="space-y-6">
          {categories.map((cat) => {
            const pct = Math.round((cat.spent / cat.allocated) * 100);
            return (
              <div key={cat.category} className="space-y-2">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="font-bold text-slate-200 font-sans">{cat.category}</span>
                  <div className="font-mono text-slate-300 flex items-center gap-2">
                    <span className="text-cyan-400 font-bold">₹{cat.spent.toLocaleString()}</span>
                    <span className="text-slate-500">/</span>
                    <span className="text-slate-400">₹{cat.allocated.toLocaleString()}</span>
                    <span className="text-[11px] text-slate-400">({pct}%)</span>
                  </div>
                </div>

                <div className="h-3 w-full bg-space-950 rounded-full overflow-hidden p-0.5 border border-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Budget Guardian Advice Banner */}
      <div className="p-5 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 flex items-start gap-4">
        <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <div className="font-bold text-cyan-300 uppercase tracking-wider font-mono">
            BUDGET AGENT RECOMMENDATION
          </div>
          <p className="text-slate-300 leading-relaxed font-sans">
            Your dining allocation is currently well within threshold. If you maintain the planned sunset dinners at Fisherman’s Wharf and Thalassa, you will retain an estimated ₹5,600 buffer for artisanal cashew purchases in Mapusa market on Day 4.
          </p>
        </div>
      </div>
    </div>
  );
}
