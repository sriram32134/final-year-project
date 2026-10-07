import React, { useState } from 'react';
import {
  RotateCcw,
  Dices,
  Plus,
  Minus,
  Search,
  X,
  Play,
  Pause,
  MapPin,
  ArrowRight,
  Globe2,
  Layers,
} from 'lucide-react';

import { searchNormalizedLocations } from '../../services/locationResolverService.js';

export function GlobeControls({
  countries = [],
  cities = [],
  isAutoRotate = true,
  mapEngine = '3d',
  onToggleAutoRotate,
  onToggleMapEngine,
  onResetWorld,
  onRollDice,
  onZoom,
  onSelectCountry,
  onSelectCity,
  onSelectLocation,
  onClosePanel,
  onClearSearch,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [globalResults, setGlobalResults] = useState([]);
  const [isSearchingGlobal, setIsSearchingGlobal] = useState(false);

  const query = searchQuery.trim().toLowerCase();

  // STAGE 1: Instant synchronous curated search
  const curatedItems = query
    ? [
        ...countries
          .filter((c) => c?.name?.toLowerCase().includes(query))
          .map((c) => ({ ...c, itemType: 'country', curated: true, source: 'curated' })),
        ...cities
          .filter(
            (c) =>
              c?.name?.toLowerCase().includes(query) ||
              c?.country?.toLowerCase().includes(query) ||
              c?.countryName?.toLowerCase().includes(query)
          )
          .map((c) => ({ ...c, itemType: 'city', curated: true, source: 'curated' })),
      ]
    : [];

  // STAGE 2: Asynchronous global location resolution
  React.useEffect(() => {
    if (!query || query.length < 2) {
      setGlobalResults([]);
      setIsSearchingGlobal(false);
      return;
    }

    let isMounted = true;
    const controller = new AbortController();
    setIsSearchingGlobal(true);

    const timer = setTimeout(async () => {
      try {
        const { global } = await searchNormalizedLocations(query, controller.signal);
        if (isMounted) {
          // Exclude any global result matching curated city
          const curatedNames = new Set(curatedItems.map((c) => c.name?.toLowerCase().trim()));
          const filtered = (global || []).filter((g) => !curatedNames.has(g.name?.toLowerCase().trim()));
          setGlobalResults(filtered);
          setIsSearchingGlobal(false);
        }
      } catch (e) {
        if (isMounted) setIsSearchingGlobal(false);
      }
    }, 220);

    return () => {
      isMounted = false;
      controller.abort();
      clearTimeout(timer);
    };
  }, [query]);

  const handleSelectItem = (item) => {
    setSearchQuery(item.name || item.formattedName || '');
    setIsSearchFocused(false);
    if (onSelectLocation) {
      onSelectLocation(item);
    } else if (item.itemType === 'country' || item.type === 'country') {
      if (onSelectCountry) onSelectCountry(item);
    } else {
      if (onSelectCity) onSelectCity(item);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setGlobalResults([]);
    setIsSearchFocused(false);
    if (onClearSearch) {
      onClearSearch();
    } else {
      if (onClosePanel) onClosePanel();
      if (onResetWorld) onResetWorld();
    }
  };

  const hasAnyResults = curatedItems.length > 0 || globalResults.length > 0;

  return (
    <>
      {/* Top Interactive Search & Action Bar */}
      <div className="w-full bg-[#0a0f1d] border-b border-white/10 px-4 py-3 sm:px-6 relative z-30 shadow-xl backdrop-blur-md font-sans select-none">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[260px] max-w-md">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-black/80 border border-white/20 text-white shadow-inner focus-within:border-cyan-400">
              <Search className="w-4 h-4 text-cyan-400 shrink-0" />
              <input
                type="text"
                placeholder="Search ANY place (Bangalore, Munnar, Paris, Hallstatt)..."
                value={searchQuery}
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchQuery(val);
                  if (val === '') {
                    handleClear();
                  }
                }}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 280)}
                className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none"
              />
              {isSearchingGlobal && (
                <span className="w-3.5 h-3.5 border-2 border-cyan-400/40 border-t-cyan-400 rounded-full animate-spin shrink-0" />
              )}
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-slate-400 hover:text-white cursor-pointer"
                  title="Clear Search & Remove Card"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Dropdown Results (Curated + Global Geocoding) */}
            {isSearchFocused && searchQuery.trim() && (
              <div
                className="absolute top-full left-0 right-0 mt-2 bg-[#0d1424]/95 border border-white/20 rounded-2xl p-2.5 shadow-2xl backdrop-blur-2xl max-h-80 overflow-y-auto z-50 space-y-2.5"
                onMouseDown={(e) => e.preventDefault()}
              >
                {/* 1. CURATED RESULTS */}
                {curatedItems.length > 0 && (
                  <div className="space-y-1">
                    <div className="px-2.5 py-1 text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest flex items-center justify-between">
                      <span>Curated Destinations</span>
                      <span className="text-slate-500 font-normal">Fast 3D Explore</span>
                    </div>
                    {curatedItems.slice(0, 5).map((item) => (
                      <button
                        key={`curated-${item.itemType}-${item.id}`}
                        type="button"
                        onClick={() => handleSelectItem(item)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white hover:text-black text-left text-xs font-bold uppercase transition-all group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {item.itemType === 'country' ? (
                            <span className="text-base shrink-0">{item.flag || '🌍'}</span>
                          ) : (
                            <MapPin className="w-3.5 h-3.5 text-cyan-400 group-hover:text-black shrink-0" />
                          )}
                          <div className="truncate">
                            <span className="truncate">{item.name}</span>
                            <span className="text-[10px] font-normal text-slate-400 group-hover:text-slate-700 ml-1.5">
                              {item.itemType === 'country' ? 'Country' : (item.country || item.countryName || 'City')}
                            </span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 group-hover:bg-black/10 border border-cyan-400/20 text-[9px] font-mono font-semibold text-cyan-300 group-hover:text-black shrink-0">
                          CURATED
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* 2. GLOBAL GEOCODED RESULTS */}
                {globalResults.length > 0 && (
                  <div className="space-y-1 pt-1.5 border-t border-white/10">
                    <div className="px-2.5 py-1 text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest flex items-center justify-between">
                      <span>Worldwide Places</span>
                      <span className="text-slate-500 font-normal">AI Planner Ready</span>
                    </div>
                    {globalResults.slice(0, 5).map((item) => (
                      <button
                        key={`global-${item.id}`}
                        type="button"
                        onClick={() => handleSelectItem(item)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white hover:text-black text-left text-xs font-bold uppercase transition-all group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Globe2 className="w-3.5 h-3.5 text-purple-400 group-hover:text-black shrink-0" />
                          <div className="truncate">
                            <span>{item.name}</span>
                            <span className="text-[10px] font-normal text-slate-400 group-hover:text-slate-700 ml-1.5">
                              {item.region ? `${item.region}, ${item.country}` : item.country}
                            </span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-purple-500/10 group-hover:bg-black/10 border border-purple-400/20 text-[9px] font-mono font-semibold text-purple-300 group-hover:text-black shrink-0">
                          GLOBAL
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Loading indicator */}
                {isSearchingGlobal && (
                  <div className="p-2 text-center text-xs text-slate-400 font-mono flex items-center justify-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                    <span>Searching global atlas for "{searchQuery}"...</span>
                  </div>
                )}

                {/* No results */}
                {!hasAnyResults && !isSearchingGlobal && (
                  <div className="p-4 text-xs text-slate-400 text-center font-sans space-y-1">
                    <p className="font-semibold text-slate-300">Location not found. Try another spelling or place name.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Controls: 🎲 ROLL DICE + 🌍 RESET + Orbit Toggle */}
          <div className="flex items-center gap-2.5">
            {/* Unmissable Roll Dice Button */}
            <button
              type="button"
              onClick={onRollDice}
              className="flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-red-500 text-white font-black text-xs tracking-wider uppercase border border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.7)] hover:bg-white hover:text-black hover:border-white hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer shrink-0"
              title="Pick a random travel destination"
            >
              <Dices className="w-4 h-4 text-white" />
              <span>🎲 ROLL DICE</span>
            </button>

            {/* 🌍 RESET GLOBE */}
            <button
              type="button"
              onClick={onResetWorld}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white hover:text-black text-slate-200 border border-white/20 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-lg"
              title="Return to global view, reset camera & resume slow orbit"
            >
              <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>🌍 RESET</span>
            </button>

            {/* Continuous Orbit Toggle */}
            <button
              type="button"
              onClick={onToggleAutoRotate}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                isAutoRotate
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50'
                  : 'bg-black/60 text-slate-300 border-white/20 hover:bg-white hover:text-black'
              }`}
              title="Toggle slow automatic rotation"
            >
              {isAutoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isAutoRotate ? 'ORBITING' : 'RESUME ORBIT'}</span>
            </button>

            {/* Map Engine Toggle: 3D Globe vs 2D Clear Interactive Map */}
            {onToggleMapEngine && (
              <button
                type="button"
                onClick={onToggleMapEngine}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border cursor-pointer shadow-lg hover:scale-105 active:scale-95 ${
                  mapEngine === '2d'
                    ? 'bg-purple-500/30 text-purple-200 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.5)]'
                    : 'bg-cyan-500/30 text-cyan-200 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.5)]'
                }`}
                title="Switch between 3D Globe and 2D Clear Interactive Satellite Map"
              >
                <Layers className="w-3.5 h-3.5 text-cyan-300" />
                <span>{mapEngine === '2d' ? '🗺️ 2D CLEAR MAP' : '🌐 3D GLOBE'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Floating Bottom-Right Camera Navigation Buttons */}
      <div className="absolute bottom-6 right-6 z-30 flex flex-col items-center gap-2 select-none pointer-events-auto font-sans">
        {/* Reset button floating */}
        <button
          type="button"
          onClick={onResetWorld}
          className="w-10 h-10 rounded-full bg-black/85 text-slate-200 border border-white/20 flex items-center justify-center transition-all duration-300 hover:bg-white hover:text-black hover:border-white shadow-xl cursor-pointer"
          title="Reset to World View"
        >
          <RotateCcw className="w-4 h-4 text-cyan-400" />
        </button>

        {/* Zoom In & Zoom Out Buttons */}
        <div className="flex flex-col rounded-full bg-black/85 border border-white/20 overflow-hidden shadow-xl">
          <button
            type="button"
            onClick={() => onZoom('in')}
            className="w-10 h-9 text-slate-200 flex items-center justify-center border-b border-white/15 hover:bg-white hover:text-black cursor-pointer"
            title="Zoom In"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onZoom('out')}
            className="w-10 h-9 text-slate-200 flex items-center justify-center hover:bg-white hover:text-black cursor-pointer"
            title="Zoom Out"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
}
