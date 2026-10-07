import React from 'react';
import { ChevronRight, Globe2, MapPin, Sparkles, Navigation } from 'lucide-react';

export function GlobeBreadcrumb({
  currentLevel = 'world',
  selectedCountry = null,
  selectedCity = null,
  selectedAttraction = null,
  onNavigateWorld,
  onNavigateCountry,
  onNavigateCity,
}) {
  return (
    <div
      className="absolute top-4 left-4 sm:left-6 z-30 flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-[#0a0f1d]/90 border border-white/20 text-xs shadow-2xl backdrop-blur-xl select-none animate-fade-in font-sans pointer-events-auto"
      onPointerDown={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
    >
      {/* 1. World Root */}
      <button
        type="button"
        onClick={onNavigateWorld}
        className={`flex items-center gap-1.5 font-bold uppercase tracking-wider transition-all cursor-pointer ${
          currentLevel === 'world'
            ? 'text-cyan-300 pointer-events-none'
            : 'text-slate-300 hover:text-white'
        }`}
        title="Return to World View"
      >
        <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
        <span>WORLD</span>
      </button>

      {/* 2. Country Breadcrumb */}
      {selectedCountry && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <button
            type="button"
            onClick={() => onNavigateCountry(selectedCountry)}
            className={`flex items-center gap-1 font-bold uppercase tracking-wider transition-all cursor-pointer ${
              currentLevel === 'country'
                ? 'text-cyan-300 pointer-events-none'
                : 'text-slate-300 hover:text-white'
            }`}
            title={`Return to ${selectedCountry.name} view`}
          >
            <span>{selectedCountry.flag}</span>
            <span>{selectedCountry.name}</span>
          </button>
        </>
      )}

      {/* 3. City Breadcrumb */}
      {selectedCity && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <button
            type="button"
            onClick={() => onNavigateCity(selectedCity)}
            className={`flex items-center gap-1 font-bold uppercase tracking-wider transition-all cursor-pointer ${
              currentLevel === 'city'
                ? 'text-cyan-300 pointer-events-none'
                : 'text-slate-300 hover:text-white'
            }`}
            title={`Focus on ${selectedCity.name}`}
          >
            <MapPin className="w-3.5 h-3.5 text-red-400" />
            <span>{selectedCity.name}</span>
          </button>
        </>
      )}

      {/* 4. Attraction / Specific Destination Breadcrumb */}
      {selectedAttraction && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <div className="flex items-center gap-1 font-bold uppercase tracking-wider text-cyan-300 pointer-events-none">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="truncate max-w-[130px] sm:max-w-none">{selectedAttraction.name}</span>
          </div>
        </>
      )}
    </div>
  );
}
