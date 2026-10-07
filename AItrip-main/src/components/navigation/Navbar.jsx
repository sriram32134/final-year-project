import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Globe, Bell, Sparkles, Menu, X, ArrowRight } from 'lucide-react';

export function Navbar({ notifications = [], onOpenNotifications }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const navLinks = [
    { name: 'PLACES TO GO', path: '/explore' },
    { name: 'MY PLANS', path: '/trips' },
    { name: 'AI PLANNER', path: '/planner', highlight: true },
    { name: 'TRAVEL MEMORY', path: '/memory' },
  ];

  const isActive = (path) => {
    if (path.includes('?')) {
      const basePath = path.split('?')[0];
      return location.pathname === basePath;
    }
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-md border-b border-white/10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo - VisitTheUSA Style Typography */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-glow-sm group-hover:scale-105 transition-transform">
              <Globe className="w-5 h-5 text-white animate-spin-slow" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-widest text-white uppercase font-sans">
                AI<span className="text-cyan-400">TRIP</span>
              </span>
              <span className="text-[10px] tracking-[0.25em] text-slate-400 uppercase font-mono font-medium -mt-1">
                DISCOVER • ORCHESTRATE
              </span>
            </div>
          </Link>

          {/* Desktop Nav Items - VisitTheUSA Clean Uppercase Tracking */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-xs font-bold tracking-[0.16em] uppercase transition-all duration-200 relative py-2 ${
                    active
                      ? 'text-cyan-400 font-extrabold'
                      : 'text-slate-200 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {link.highlight && <Sparkles className="w-3.5 h-3.5 text-cyan-400" />}
                    {link.name}
                  </span>
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 shadow-glow-sm rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons & Primary CTA */}
          <div className="flex items-center space-x-4">
            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2.5 text-slate-300 rounded-full border border-transparent transition-all duration-300 hover:bg-white hover:text-black hover:border-white cursor-pointer"
              title="Notifications & Dynamic Replan Alerts"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
                </span>
              )}
            </button>

            {/* VisitTheUSA Style Pill Button CTA - Hovers Crisp White */}
            <Link
              to="/planner"
              className="hidden sm:inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-cyan-500 text-white border border-cyan-400 text-xs font-black tracking-widest uppercase transition-all duration-300 shadow-lg hover:bg-white hover:text-black hover:border-white hover:scale-105"
            >
              <span>PLAN A TRIP</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {/* Mobile menu hamburger toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-space-900 border-b border-white/10 px-4 pt-3 pb-6 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2.5 px-3 rounded-lg text-sm font-bold tracking-widest uppercase text-slate-200 hover:bg-white/5 hover:text-cyan-400"
            >
              <div className="flex items-center justify-between">
                <span>{link.name}</span>
                {link.highlight && <Sparkles className="w-4 h-4 text-cyan-400" />}
              </div>
            </Link>
          ))}
          <div className="pt-2">
            <Link
              to="/planner"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-cyan-500 text-white text-xs font-bold tracking-wider uppercase"
            >
              <span>PLAN A TRIP WITH AI</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

