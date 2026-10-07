import React, { useState } from 'react';
import { Compass, MapPin, ArrowRight, Heart, Sparkles, LayoutGrid, Layers, Star } from 'lucide-react';

export function VisitUsaStoryFeed({ destinations = [], onSelectDestination }) {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [savedIds, setSavedIds] = useState(new Set());
  const [layoutMode, setLayoutMode] = useState('deck'); // 'deck' | 'grid'

  const categories = [
    { id: 'ALL', label: 'ALL STORIES' },
    { id: 'TRENDING', label: 'TRENDING ESCAPES' },
    { id: 'COASTAL', label: 'BEACHES & COASTAL' },
    { id: 'HERITAGE', label: 'HERITAGE & FORTS' },
    { id: 'ADVENTURE', label: 'ALPINE & ROAD TRIPS' },
    { id: 'ROMANTIC', label: 'ROMANTIC GETAWAYS' },
  ];

  const filteredDestinations = destinations.filter((dest) => {
    if (activeCategory === 'ALL') return true;
    if (activeCategory === 'TRENDING') return dest.popularScore >= 95;
    if (activeCategory === 'COASTAL')
      return (
        dest.tags?.some((t) => /beach|coast|sea|island/i.test(t)) ||
        /coastal|beach|island/i.test(dest.travelStyle || '')
      );
    if (activeCategory === 'HERITAGE')
      return (
        dest.tags?.some((t) => /fort|heritage|temple|castle|palace|nizami|pearl/i.test(t)) ||
        /heritage|palace|culture/i.test(dest.travelStyle || '') ||
        dest.category === 'Culture'
      );
    if (activeCategory === 'ADVENTURE')
      return (
        dest.category === 'Adventure' ||
        dest.tags?.some((t) => /hike|pass|trail|mountain|alpine|rohtang|solang/i.test(t)) ||
        /alpine|mountain|expedition/i.test(dest.travelStyle || '')
      );
    if (activeCategory === 'ROMANTIC')
      return (
        dest.category === 'Romantic' ||
        dest.tags?.some((t) => /sunset|retreat|scenic|caldera|terrace/i.test(t)) ||
        /romantic|wellness/i.test(dest.travelStyle || '')
      );
    return true;
  });

  const toggleSave = (e, id) => {
    e.stopPropagation();
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <section id="explore-stories" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-12">
      {/* Section Header with VisitTheUSA Uppercase Tracking */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold tracking-[0.25em] text-cyan-400 uppercase font-mono mb-2">
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>CURATED TRAVEL STORIES</span>
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight font-display mb-3">
            PLACES TO GO & EXPLORE
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl">
            Scroll through iconic destinations and curated stories. Each route is calibrated by autonomous AI agents for scenic beauty, optimal transit, and authentic culture.
          </p>
        </div>

        {/* Layout Mode Toggle: Deck vs Grid */}
        <div className="flex items-center gap-1 p-1 rounded-full bg-white/10 border border-white/15 shrink-0 self-start md:self-end">
          <button
            onClick={() => setLayoutMode('deck')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
              layoutMode === 'deck'
                ? 'bg-white text-black shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
            title="Stacked Story Deck View"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>STACKED DECK</span>
          </button>
          <button
            onClick={() => setLayoutMode('grid')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
              layoutMode === 'grid'
                ? 'bg-white text-black shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
            title="Editorial Grid View"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>EDITORIAL GRID</span>
          </button>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-4 mb-10 no-scrollbar">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase transition-all duration-300 shrink-0 font-sans cursor-pointer ${
                isActive
                  ? 'bg-white text-black shadow-lg border border-white'
                  : 'bg-black/60 text-slate-300 border border-white/15 hover:bg-white hover:text-black hover:border-white'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* ========================================================
          LAYOUT MODE 1: SILKY SMOOTH STACKED DECK (NO LAG, NO BLUR)
          Hardware-accelerated, crisp rendering without heavy filters
          ======================================================== */}
      {layoutMode === 'deck' ? (
        <div className="relative pb-24 space-y-16 sm:space-y-20">
          {filteredDestinations.map((dest, idx) => {
            const isSaved = savedIds.has(dest.id);
            return (
              <div
                key={dest.id}
                className="sticky top-20 sm:top-24 w-full transition-transform duration-300"
                style={{
                  zIndex: idx + 10,
                }}
              >
                <div
                  onClick={() => onSelectDestination && onSelectDestination(dest)}
                  className="usa-card group cursor-pointer grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden border border-white/20 bg-[#151a24] shadow-[0_15px_40px_rgba(0,0,0,0.8)] lg:h-[500px]"
                >
                  {/* Left Column: Editorial Story Content */}
                  <div className="lg:col-span-6 p-6 sm:p-10 lg:p-12 flex flex-col justify-between relative bg-[#151a24] select-none overflow-hidden">
                    <div className="space-y-3 sm:space-y-4">
                      {/* Top Kicker & Actions */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs font-bold tracking-[0.22em] text-cyan-400 uppercase font-mono">
                          <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                          <span>{dest.country}</span>
                          <span className="text-white/30">•</span>
                          <span className="text-slate-300 truncate max-w-[200px]">
                            {dest.travelStyle ? dest.travelStyle.split('&')[0].trim() : dest.category || 'EXPEDITION'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-white/10 text-cyan-300 border border-cyan-500/20 font-mono uppercase">
                            {dest.category || 'FEATURED'}
                          </span>
                          <button
                            onClick={(e) => toggleSave(e, dest.id)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                              isSaved
                                ? 'bg-rose-500 text-white'
                                : 'bg-white/10 text-slate-300 hover:text-white hover:bg-white/20'
                            }`}
                            title="Save Destination"
                          >
                            <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                      </div>

                      {/* Destination Title */}
                      <h3 className="usa-card-title text-4xl sm:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight leading-none font-display pt-2">
                        {dest.name}
                      </h3>

                      {/* Editorial Short Description */}
                      <p className="text-slate-300 text-sm sm:text-base leading-relaxed line-clamp-3 font-sans">
                        {dest.shortDescription}
                      </p>

                      {/* Quick Highlight Pills */}
                      {dest.highlightSpots && (
                        <div className="hidden sm:flex flex-wrap gap-2 pt-2">
                          {dest.highlightSpots.slice(0, 3).map((spot) => (
                            <span
                              key={spot}
                              className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs font-mono"
                            >
                              ✦ {spot}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Bottom Metadata & CTA Action Bar */}
                    <div className="pt-6 border-t border-white/10 flex items-center justify-between gap-4 mt-6">
                      <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                        <div>
                          EST. BUDGET: <span className="text-cyan-400 font-bold">₹{dest.startingBudget?.toLocaleString()}</span>
                        </div>
                        <span className="text-white/20">•</span>
                        <div>
                          CLIMATE: <span className="text-white">{dest.weatherOverview?.tempC || 28}°C</span>
                        </div>
                      </div>

                      <div className="inline-flex items-center gap-2 text-xs font-black tracking-widest uppercase text-white group-hover:text-cyan-400 transition-colors">
                        <span>EXPLORE STORY</span>
                        <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform" />
                      </div>
                    </div>
                  </div>

                  {/* Right Column: High-Res Cover Photo */}
                  <div className="lg:col-span-6 h-64 sm:h-80 lg:h-full relative overflow-hidden bg-black">
                    <img
                      src={dest.heroImage || dest.image}
                      alt={dest.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:hidden" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ========================================================
            LAYOUT MODE 2: EDITORIAL 3-COLUMN GRID VIEW (LIGHTNING FAST)
            Zero scroll overhead, beautiful card layout
            ======================================================== */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 pb-20">
          {filteredDestinations.map((dest) => {
            const isSaved = savedIds.has(dest.id);
            return (
              <div
                key={dest.id}
                onClick={() => onSelectDestination && onSelectDestination(dest)}
                className="group cursor-pointer rounded-3xl overflow-hidden border border-white/15 bg-[#141923] hover:border-white/40 transition-all duration-300 flex flex-col shadow-xl hover:-translate-y-1.5"
              >
                {/* Photo Top Banner */}
                <div className="h-60 relative overflow-hidden bg-black">
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141923] via-transparent to-black/40" />

                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 border border-white/20 text-white text-xs font-mono">
                    <MapPin className="w-3.5 h-3.5 text-red-500" />
                    <span>{dest.country}</span>
                  </div>

                  <button
                    onClick={(e) => toggleSave(e, dest.id)}
                    className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      isSaved ? 'bg-rose-500 text-white' : 'bg-black/60 text-white hover:bg-white hover:text-black'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                  </button>

                  <div className="absolute bottom-3 left-4 right-4">
                    <div className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest mb-0.5">
                      {dest.travelStyle?.split('&')[0]}
                    </div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight font-display">
                      {dest.name}
                    </h3>
                  </div>
                </div>

                {/* Card Content Body */}
                <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-3">
                    {dest.shortDescription}
                  </p>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                    <div className="font-mono text-slate-400">
                      EST. FROM: <span className="text-white font-bold">₹{dest.startingBudget?.toLocaleString()}</span>
                    </div>

                    <span className="flex items-center gap-1 font-bold text-cyan-400 uppercase tracking-wider group-hover:text-white transition-colors">
                      <span>PLAN TRIP</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
