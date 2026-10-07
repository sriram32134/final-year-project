import React, { useState, useEffect } from 'react';
import { memoryService } from '../services/index.js';
import { Brain, Sparkles, CheckCircle, Sliders, Globe, Compass, ShieldCheck, Heart, Award } from 'lucide-react';

export function MemoryPage() {
  const [memory, setMemory] = useState(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    memoryService.getMemory().then(setMemory);
  }, []);

  if (!memory) return null;

  const { profile, preferences, aiLearnedInsights, stats } = memory;

  const handleUpdatePace = async (newPace) => {
    const updated = await memoryService.updatePreferences({ travelPace: newPace });
    setMemory(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="min-h-screen bg-space-950 font-sans py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-bold tracking-[0.25em] uppercase font-mono mb-4">
            <Brain className="w-3.5 h-3.5 text-cyan-400" />
            <span>CONTINUOUS LEARNING & TRAVELER DNA</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight font-sans mb-3">
            AI TRAVEL MEMORY
          </h1>

          <p className="text-slate-300 text-sm max-w-xl mx-auto">
            AITrip builds an evolving taste profile of your travel rhythm, pacing, architectural affinities, and dining restrictions across every journey.
          </p>
        </div>

        {/* Traveler Profile Header Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-space-900/80 border border-white/10 backdrop-blur-md mb-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-4">
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-cyan-400 shadow-glow-cyan"
            />
            <div>
              <div className="text-xl font-black text-white uppercase font-sans">
                {profile.name}
              </div>
              <div className="text-xs font-mono text-cyan-400 flex items-center gap-2">
                <Award className="w-3.5 h-3.5" />
                <span>{profile.tier} • {profile.points.toLocaleString()} XP</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                Home Base: {profile.homeAirport} • Member Since {profile.memberSince}
              </div>
            </div>
          </div>

          {/* Lifetime Travel Stats Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full sm:w-auto text-center font-mono">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
              <div className="text-lg font-black text-white">{stats.countriesVisited}</div>
              <div className="text-[10px] text-slate-400 uppercase">COUNTRIES</div>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
              <div className="text-lg font-black text-white">{stats.citiesExplored}</div>
              <div className="text-[10px] text-slate-400 uppercase">CITIES</div>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
              <div className="text-lg font-black text-cyan-400">
                {(stats.totalKilometersTraveled / 1000).toFixed(1)}k
              </div>
              <div className="text-[10px] text-slate-400 uppercase">KM EXPLORED</div>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
              <div className="text-lg font-black text-emerald-400">{stats.tripsGeneratedWithAI}</div>
              <div className="text-[10px] text-slate-400 uppercase">AI TRIPS</div>
            </div>
          </div>
        </div>

        {/* AI Learned Insights Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-xs font-bold tracking-widest text-cyan-400 uppercase font-mono">
                AUTONOMOUS SYNTHESIS
              </div>
              <h3 className="text-xl font-black text-white uppercase font-sans">
                Learned Behavioral Insights
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">CONFIDENCE THRESHOLD &gt; 85%</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {aiLearnedInsights.map((insight) => (
              <div
                key={insight.id}
                className="p-6 rounded-3xl bg-space-900/60 border border-white/10 hover:border-cyan-500/30 transition-colors space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    {insight.category}
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {insight.confidence} Confidence
                  </span>
                </div>

                <h4 className="text-base font-bold text-white font-sans">
                  {insight.title}
                </h4>

                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {insight.detail}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Preferences Calibration Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-space-900/60 border border-white/10 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-white uppercase font-sans">
              CORE PREFERENCES & DIETARY RULES
            </h3>
            {savedSuccess && (
              <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> SAVED
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
              <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">
                PREFERRED LODGING ARCHITECTURE
              </div>
              <div className="text-slate-200 font-semibold">
                {preferences.lodgingPreferences.join(' • ')}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
              <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">
                DINING & REGIONAL FOOD
              </div>
              <div className="text-slate-200 font-semibold">
                {preferences.diningStyle.join(' • ')}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
              <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">
                TRANSIT PROFILE
              </div>
              <div className="text-slate-200 font-semibold">
                {preferences.transitPreferences.join(' • ')}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
              <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">
                WAKE-UP & MORNING PACING
              </div>
              <div className="text-slate-200 font-semibold">
                {preferences.wakeUpPreference}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
