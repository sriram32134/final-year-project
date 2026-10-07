import React from 'react';
import { NavLink } from 'react-router-dom';
import { Compass, Sparkles, Map, User, Brain } from 'lucide-react';

export function MobileBottomNav() {
  const tabs = [
    { name: 'Discover', path: '/explore', icon: Compass },
    { name: 'My Plans', path: '/trips', icon: Map },
    { name: 'AI Planner', path: '/planner', icon: Sparkles, highlight: true },
    { name: 'Memory', path: '/memory', icon: Brain },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-space-950/95 backdrop-blur-lg border-t border-white/10 px-2 py-1.5 flex justify-around items-center">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <NavLink
            key={tab.name}
            to={tab.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                isActive
                  ? 'text-cyan-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              } ${tab.highlight ? 'relative -top-2' : ''}`
            }
          >
            {tab.highlight ? (
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-glow-cyan text-white mb-0.5">
                <Icon className="w-6 h-6 animate-pulse" />
              </div>
            ) : (
              <Icon className="w-5 h-5 mb-1" />
            )}
            <span className="text-[10px] tracking-wider uppercase font-medium">{tab.name}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
