import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, MapPin, Sparkles, Sun, Compass, DollarSign, ArrowRight, Heart } from 'lucide-react';
import { DestinationImage } from '../common/DestinationImage.jsx';

export function DestinationDetailModal({ destination, isOpen, onClose }) {
  const navigate = useNavigate();

  if (!isOpen || !destination) return null;

  const handlePlanWithAI = () => {
    onClose();
    navigate(`/planner?destination=${encodeURIComponent(destination.name)}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-space-950/80 backdrop-blur-xl animate-fade-in">
      <div
        className="relative w-full max-w-4xl bg-space-900 border border-white/15 rounded-3xl overflow-hidden shadow-2xl my-8 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-20 w-10 h-10 rounded-full bg-space-950/80 backdrop-blur-md text-white hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Image Section */}
        <div className="relative h-72 sm:h-96 w-full shrink-0">
          <DestinationImage
            src={destination.heroImage || destination.image}
            alt={destination.name}
            aspectRatio="aspect-none h-full"
            className="w-full h-full"
          />

          {/* Destination Header Overlay */}
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-cyan-400 uppercase font-mono mb-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span>{destination.country}</span>
              <span className="text-white/30">•</span>
              <span>{destination.travelStyle}</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight font-sans">
              {destination.name}
            </h2>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8 flex-1">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
            <div>
              <div className="text-[10px] uppercase font-mono text-slate-400">EST. STARTING BUDGET</div>
              <div className="text-base font-bold text-cyan-300 font-mono">
                ₹{destination.startingBudget?.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono text-slate-400">BEST TIME & CLIMATE</div>
              <div className="text-base font-bold text-white flex items-center gap-1.5">
                <Sun className="w-4 h-4 text-amber-400" />
                <span>{destination.weatherOverview?.tempC || 28}°C Sunny</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono text-slate-400">DESTINATION TYPE</div>
              <div className="text-base font-bold text-emerald-400 truncate">
                {destination.category || 'Featured'}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono text-slate-400">TRAVEL STYLE</div>
              <div className="text-base font-bold text-slate-200 truncate">
                {destination.travelStyle || 'Scenic Discovery'}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase font-mono mb-2">
              THE DESTINATION STORY
            </h3>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-sans">
              {destination.shortDescription}
            </p>
          </div>

          {/* Highlight Spots */}
          {destination.highlightSpots && (
            <div>
              <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase font-mono mb-3">
                ICONIC HIGHLIGHTS
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {destination.highlightSpots.map((spot) => (
                  <span
                    key={spot}
                    className="px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-semibold"
                  >
                    ✦ {spot}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {destination.tags && (
            <div>
              <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase font-mono mb-3">
                TAGS & THEMES
              </h3>
              <div className="flex flex-wrap gap-2">
                {destination.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-xs font-mono"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="p-6 bg-space-950/80 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400 font-mono">
            Autonomous multi-agent orchestration available for this route
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-full bg-white/10 border border-white/20 text-slate-300 text-xs font-bold tracking-wider uppercase transition-all duration-300 hover:bg-white hover:text-black hover:border-white"
            >
              CLOSE
            </button>
            <button
              onClick={handlePlanWithAI}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-cyan-500 text-white border border-cyan-400 text-xs font-black tracking-widest uppercase transition-all duration-300 shadow-xl hover:bg-white hover:text-black hover:border-white hover:scale-105"
            >
              <Sparkles className="w-4 h-4" />
              <span>PLAN THIS TRIP WITH AI</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
