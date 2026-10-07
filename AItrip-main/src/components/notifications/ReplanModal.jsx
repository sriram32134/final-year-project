import React, { useState } from 'react';
import {
  AlertTriangle,
  Sparkles,
  ArrowRight,
  CheckCircle,
  X,
  Clock,
  MapPin,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';

export function ReplanModal({ isOpen, notification, onClose, onAcceptReplan }) {
  const [isApplying, setIsApplying] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  if (!isOpen || !notification) return null;

  const conflict = notification.conflictDetails;

  const handleConfirm = async () => {
    setIsApplying(true);
    await new Promise((res) => setTimeout(res, 800));
    await onAcceptReplan();
    setIsApplying(false);
    setAppliedSuccess(true);
    setTimeout(() => {
      setAppliedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-space-950/80 backdrop-blur-xl animate-fade-in">
      <div
        className="relative w-full max-w-2xl bg-space-900 border border-white/15 rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="text-[11px] font-mono tracking-widest uppercase text-rose-400 font-bold">
              AGENTIC DOWNSTREAM CONFLICT DETECTED
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight font-sans">
              Dynamic Schedule Replan
            </h3>
          </div>
        </div>

        {/* Conflict Cause Summary */}
        <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/20 text-xs text-rose-200 mb-6">
          <div className="font-bold text-white mb-1">
            Flight 6E 5234 Delayed by 3h 15m (New ETA: 19:00 IST)
          </div>
          Fort Aguada entry closes strictly at 17:30. Incurred cascade will breach scheduled Day 1 activities.
        </div>

        {/* Proposed Autonomous Replanning Solution */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-cyan-400 font-bold uppercase tracking-wider">
              PROPOSED AGENTIC REPLAN
            </span>
            <span className="text-emerald-400 font-bold">OPTIMAL RATING: 99%</span>
          </div>

          {conflict?.proposedChanges?.map((change, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-space-950/70 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      change.type === 'MOVE'
                        ? 'bg-amber-500/20 text-amber-300'
                        : change.type === 'RESCHEDULE'
                        ? 'bg-blue-500/20 text-blue-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {change.type}
                  </span>
                  <span className="font-bold text-white font-sans">
                    {change.activityTitle}
                  </span>
                </div>
                <div className="text-slate-400 font-mono text-[11px]">
                  {change.from} → <span className="text-cyan-300 font-bold">{change.to}</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-300 font-sans sm:text-right max-w-xs">
                {change.impact}
              </div>
            </div>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
          <div className="text-[11px] font-mono text-slate-400 text-center sm:text-left">
            No cancellation penalties incurred. Hotel and dinner notified.
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-bold tracking-wider uppercase transition-colors"
            >
              DISMISS
            </button>

            <button
              onClick={handleConfirm}
              disabled={isApplying || appliedSuccess}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-black tracking-widest uppercase transition-all shadow-glow-cyan hover:scale-105 disabled:opacity-50"
            >
              {isApplying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>APPLYING AGENTIC REPLAN...</span>
                </>
              ) : appliedSuccess ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-300" />
                  <span>REPLAN APPLIED!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>ACCEPT AUTONOMOUS REPLAN</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
