import React, { useState, useEffect } from 'react';
import { memoryService } from '../services/index.js';
import { User, Award, Shield, MapPin, Sparkles, LogOut, CheckCircle } from 'lucide-react';

export function ProfilePage() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    memoryService.getMemory().then((mem) => setProfile(mem.profile));
  }, []);

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-space-950 font-sans py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-3xl bg-space-900/80 border border-white/10 backdrop-blur-xl shadow-2xl space-y-8">
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-white/10 text-center sm:text-left">
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-cyan-400 shadow-glow-cyan"
            />
            <div className="space-y-1">
              <h1 className="text-2xl font-black text-white uppercase font-sans">
                {profile.name}
              </h1>
              <div className="text-xs font-mono text-cyan-400 font-bold">
                {profile.tier} Tier • {profile.points.toLocaleString()} Loyalty Points
              </div>
              <div className="text-xs text-slate-400 font-mono">
                Home: {profile.homeAirport} • Active Member Since {profile.memberSince}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase font-mono">
              ACCOUNT & SECURITY
            </h3>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between text-xs font-mono">
              <div>
                <div className="text-white font-bold">MULTI-AGENT AUTOPILOT</div>
                <div className="text-slate-400">Autonomous flight delay cascade replan enabled</div>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                ACTIVE
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between text-xs font-mono">
              <div>
                <div className="text-white font-bold">CALENDAR SYNC HOOK</div>
                <div className="text-slate-400">Automatic RFC 5545 ICS generation</div>
              </div>
              <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 font-bold">
                CONNECTED
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
