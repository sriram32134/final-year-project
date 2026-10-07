import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export function VerticalFloatingTab() {
  const navigate = useNavigate();

  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50 hidden sm:block">
      <button
        onClick={() => navigate('/planner')}
        className="flex items-center gap-2 px-4 py-2.5 bg-black/90 text-white border-l border-y border-white/20 rounded-l-2xl shadow-2xl backdrop-blur-md transition-all duration-300 hover:bg-white hover:text-black hover:border-white group"
        style={{
          writingMode: 'vertical-rl',
          transform: 'rotate(180deg)',
        }}
        title="Plan Your Trip with AI"
      >
        <Sparkles className="w-3.5 h-3.5 text-cyan-400 group-hover:text-black transition-colors" />
        <span className="text-xs font-black tracking-widest uppercase font-sans">
          Plan Your Trip with AI
        </span>
      </button>
    </div>
  );
}
