import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  MapPin,
  Star,
  Sparkles,
  Compass,
  Sun,
  Navigation,
  Share2,
  Bookmark,
  ArrowRight,
  Calendar,
  DollarSign,
  Camera,
  CheckCircle2,
  Maximize2
} from 'lucide-react';

export function GoogleMapsPlaceDrawer({
  destination,
  isOpen,
  onClose,
  onOpenFullDetail,
}) {
  const navigate = useNavigate();
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !destination) return null;

  const handlePlanTrip = () => {
    navigate(`/planner?destination=${encodeURIComponent(destination.name)}&autoStart=true`);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Build photo array
  const photos = [
    destination.heroImage || destination.image,
    destination.image,
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
  ].filter(Boolean);

  return (
    <div
      className="absolute top-4 left-4 bottom-4 z-40 w-[92%] sm:w-[420px] max-w-md bg-[#10141d]/95 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden animate-slide-right font-sans select-none"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Top Header Bar with Close and Fullscreen */}
      <div className="relative h-60 sm:h-64 w-full shrink-0 overflow-hidden bg-black">
        <img
          src={photos[activePhotoIdx] || destination.image}
          alt={destination.name}
          className="w-full h-full object-cover transition-all duration-500 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#10141d] via-black/30 to-black/60" />

        {/* Floating Top Controls */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 border border-white/20 text-white text-[11px] font-mono backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span className="font-bold text-red-400">GOOGLE MAPS PIN</span>
          </div>

          <div className="flex items-center gap-1.5">
            {onOpenFullDetail && (
              <button
                onClick={() => onOpenFullDetail(destination)}
                className="w-8 h-8 rounded-full bg-black/70 hover:bg-white hover:text-black text-white border border-white/20 flex items-center justify-center transition-all"
                title="Expand Full Details"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/70 hover:bg-white hover:text-black text-white border border-white/20 flex items-center justify-center transition-all"
              title="Close Drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Thumbnail Carousel Bar */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1.5 overflow-x-auto no-scrollbar z-10">
          {photos.slice(0, 4).map((p, idx) => (
            <button
              key={idx}
              onClick={() => setActivePhotoIdx(idx)}
              className={`w-12 h-10 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                activePhotoIdx === idx ? 'border-cyan-400 scale-105' : 'border-white/30 opacity-70 hover:opacity-100'
              }`}
            >
              <img src={p} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
        {/* Title, Category & Travel Metadata */}
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest mb-1">
            <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
            <span>{destination.country}</span>
            <span className="text-white/30">•</span>
            <span className="text-slate-300 truncate">
              {destination.travelStyle || 'Scenic Discovery'}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight font-sans">
            {destination.name}
          </h2>

          <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-300">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 font-mono text-[10px] font-semibold uppercase">
              {destination.category || 'Featured'}
            </span>
            <span className="text-white/30">•</span>
            <span className="text-slate-300 text-xs font-medium">
              {destination.travelStyle || 'Scenic & Cultural Discovery'}
            </span>
          </div>
        </div>

        {/* Google Maps Action Bar Buttons */}
        <div className="grid grid-cols-4 gap-2 py-3 border-y border-white/10">
          <button
            onClick={handlePlanTrip}
            className="flex flex-col items-center gap-1 py-2 px-1 rounded-xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 hover:bg-cyan-400 hover:text-black transition-all group"
          >
            <Sparkles className="w-4 h-4 text-cyan-400 group-hover:text-black" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Plan Trip</span>
          </button>

          <button
            onClick={() => navigate('/trips/trip-goa-4d')}
            className="flex flex-col items-center gap-1 py-2 px-1 rounded-xl bg-white/5 border border-white/10 text-slate-200 hover:bg-white hover:text-black transition-all group"
          >
            <Navigation className="w-4 h-4 group-hover:text-black" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Route</span>
          </button>

          <button
            onClick={() => setIsSaved(!isSaved)}
            className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl border transition-all ${
              isSaved
                ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                : 'bg-white/5 border-white/10 text-slate-200 hover:bg-white hover:text-black'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {isSaved ? 'Saved' : 'Save'}
            </span>
          </button>

          <button
            onClick={handleShare}
            className="flex flex-col items-center gap-1 py-2 px-1 rounded-xl bg-white/5 border border-white/10 text-slate-200 hover:bg-white hover:text-black transition-all group"
          >
            <Share2 className="w-4 h-4 group-hover:text-black" />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {copied ? 'Copied!' : 'Share'}
            </span>
          </button>
        </div>

        {/* Place Description */}
        <div>
          <h4 className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1.5">
            ABOUT THIS PLACE
          </h4>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
            {destination.shortDescription || destination.description}
          </p>
        </div>

        {/* Quick Intel Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2.5">
            <Sun className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <div className="text-[9px] font-mono text-slate-400 uppercase">TYPICAL WEATHER</div>
              <div className="text-xs font-bold text-white">
                {destination.weatherOverview?.tempC || 28}°C · Sunny
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2.5">
            <DollarSign className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="text-[9px] font-mono text-slate-400 uppercase">EST. STARTING BUDGET</div>
              <div className="text-xs font-bold text-cyan-300 font-mono">
                ₹{destination.startingBudget?.toLocaleString() || '18,000'}
              </div>
            </div>
          </div>
        </div>

        {/* Key Highlights / Attractions */}
        {destination.highlightSpots && (
          <div>
            <h4 className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-2">
              KEY ATTRACTIONS & HIGHLIGHTS
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {destination.highlightSpots.map((spot) => (
                <span
                  key={spot}
                  className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 text-[11px] font-medium"
                >
                  ✦ {spot}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Dedicated Plan a Trip Message Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/60 via-blue-950/50 to-indigo-950/40 border border-cyan-400/40 shadow-xl space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
            <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider">
              PLAN A TRIP TO {destination.name.toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed font-sans">
            Ready to explore {destination.name}, {destination.country}? Our Autonomous Agentic AI trip planner is preparing to orchestrate personalized itineraries — synthesizing seasonal schedules, route connections, and curated local highlights.
          </p>
          <button
            onClick={handlePlanTrip}
            className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>START PLANNING TRIP NOW</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* AI Agent Guarantee Callout */}
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
          <Compass className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <div className="font-bold text-white uppercase tracking-wider mb-0.5">
              Multi-Agent Optimization Active
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              10 specialized LangGraph agents will balance weather, flight timings, boutique stays, and road conditions for {destination.name}.
            </p>
          </div>
        </div>
      </div>

      {/* Persistent Bottom Action Drawer Button */}
      <div className="p-4 bg-black/90 border-t border-white/15 flex items-center gap-2">
        <button
          onClick={handlePlanTrip}
          className="flex-1 py-3 px-4 rounded-full bg-cyan-500 hover:bg-white text-white hover:text-black text-xs font-black uppercase tracking-widest transition-all duration-300 shadow-xl flex items-center justify-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>PLAN TRIP TO {destination.name}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
