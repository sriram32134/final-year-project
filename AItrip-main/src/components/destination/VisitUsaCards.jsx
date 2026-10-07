import React, { useState } from 'react';
import { Bookmark, ArrowUpRight, Compass, Sparkles, Clock, MapPin, Heart } from 'lucide-react';

// VisitTheUSA Signature 4:5 Editorial Story Card
export function StoryCard({ destination, onSelect, onBookmark }) {
  const [saved, setSaved] = useState(false);

  const handleBookmarkClick = (e) => {
    e.stopPropagation();
    setSaved(!saved);
    if (onBookmark) onBookmark(destination);
  };

  return (
    <div
      onClick={() => onSelect && onSelect(destination)}
      className="usa-card group cursor-pointer rounded-2xl bg-space-900/60 border border-white/10 overflow-hidden flex flex-col h-full select-none"
    >
      {/* 4:5 Aspect Ratio Image Container */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-space-850">
        <img
          src={destination.image}
          alt={destination.name}
          className="usa-card-img w-full h-full object-cover object-center"
          loading="lazy"
        />

        {/* Cinematic gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-space-950 via-space-950/30 to-black/20" />

        {/* Top Badges & Bookmark */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <span className="px-3 py-1 rounded-full text-[10px] font-extrabold tracking-widest uppercase bg-space-950/80 backdrop-blur-md text-cyan-300 border border-cyan-500/30 shadow-sm">
            {destination.travelStyle ? destination.travelStyle.split(' ')[0] : 'EXPLORE'}
          </span>

          <button
            onClick={handleBookmarkClick}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              saved
                ? 'bg-rose-500 text-white shadow-glow-sm'
                : 'bg-space-950/70 backdrop-blur-md text-slate-300 hover:text-white hover:bg-space-950'
            }`}
            title="Save to Wishlist"
          >
            <Heart className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Bottom Card Content over gradient */}
        <div className="absolute bottom-0 left-0 right-0 p-5 z-10 flex flex-col justify-end">
          {/* Category Kicker */}
          <div className="text-[11px] font-bold tracking-[0.2em] text-cyan-400 uppercase font-mono mb-1.5 flex items-center gap-1.5">
            <MapPin className="w-3 h-3 text-cyan-400" />
            <span>{destination.country}</span>
            {(destination.travelStyle || destination.category) && (
              <>
                <span className="text-white/30">•</span>
                <span className="text-slate-300 font-sans tracking-normal font-semibold">
                  {destination.travelStyle ? destination.travelStyle.split('&')[0].trim() : destination.category}
                </span>
              </>
            )}
          </div>

          {/* VisitTheUSA Title with Animated Bottom Underline on Hover */}
          <h3 className="usa-card-title text-xl sm:text-2xl font-black text-white uppercase tracking-tight leading-tight mb-2 font-sans">
            {destination.name}
          </h3>

          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-3">
            {destination.shortDescription}
          </p>

          {/* Quick Meta Footer */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1 font-mono text-cyan-300">
              <span>From ₹{destination.startingBudget?.toLocaleString() || '15,000'}</span>
            </div>
            <div className="flex items-center gap-1 text-slate-300 font-semibold group-hover:text-cyan-400 transition-colors">
              <span>EXPLORE</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// VisitTheUSA Signature Wide Panoramic Feature Story Banner
export function PanoramicFeatureStory({ destination, onSelect }) {
  if (!destination) return null;

  return (
    <div
      onClick={() => onSelect && onSelect(destination)}
      className="usa-card group cursor-pointer relative rounded-3xl overflow-hidden border border-white/15 bg-space-900 shadow-2xl h-[420px] sm:h-[480px]"
    >
      <img
        src={destination.heroImage || destination.image}
        alt={destination.name}
        className="usa-card-img w-full h-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-space-950 via-space-950/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-space-950/90 via-transparent to-black/30" />

      {/* Feature Content */}
      <div className="absolute inset-0 p-8 sm:p-12 flex flex-col justify-end max-w-2xl z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-bold tracking-widest uppercase mb-4 w-fit">
          <Sparkles className="w-3.5 h-3.5" />
          <span>FEATURED ROAD TRIP OF THE WEEK</span>
        </div>

        <h2 className="usa-card-title text-3xl sm:text-5xl font-black text-white uppercase tracking-tight leading-none mb-3 font-sans">
          {destination.name}
        </h2>

        <p className="text-sm sm:text-base text-slate-200 line-clamp-3 leading-relaxed mb-6 font-sans">
          {destination.shortDescription}
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <div className="px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-black tracking-widest uppercase flex items-center gap-2 shadow-glow-cyan group-hover:scale-105 transition-transform">
            <span>EXPLORE FULL ITINERARY</span>
            <ArrowUpRight className="w-4 h-4" />
          </div>

          <div className="hidden sm:flex items-center gap-3 text-xs text-slate-300 font-mono">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-cyan-400" /> 4 Days
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Compass className="w-4 h-4 text-cyan-400" /> Coastal Highway Route
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
