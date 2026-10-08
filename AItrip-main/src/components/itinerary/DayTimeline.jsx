import React, { useState } from 'react';
import {
  Clock,
  MapPin,
  Compass,
  Utensils,
  Camera,
  Hotel,
  Plane,
  Car,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Ticket,
  Calendar,
} from 'lucide-react';

export function DayTimeline({
  days = [],
  activeDayIndex = 0,
  onSelectDay,
  onSelectActivity,
  selectedActivityId,
}) {
  const currentDay = days[activeDayIndex] || days[0];

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'dining':
        return Utensils;
      case 'stay':
        return Hotel;
      case 'transport':
        return Plane;
      case 'sightseeing':
      case 'culture':
        return Camera;
      case 'adventure':
      case 'experience':
        return Compass;
      default:
        return MapPin;
    }
  };

  return (
    <div className="space-y-6">
      {/* Day Selector Pill Tabs */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
        {days.map((day, idx) => {
          const isSelected = activeDayIndex === idx;
          const dayNum = day.day || day.dayNumber || idx + 1;
          return (
            <button
              key={day.id || `day-${dayNum}-${idx}`}
              onClick={() => onSelectDay(idx)}
              className={`px-5 py-3 rounded-2xl transition-all duration-200 text-left shrink-0 border ${
                isSelected
                  ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-glow-sm'
                  : 'bg-space-900/60 hover:bg-space-900 border-white/10 text-slate-300'
              }`}
            >
              <div className="text-[10px] font-mono tracking-widest uppercase text-cyan-400 font-bold">
                DAY 0{dayNum}
              </div>
              <div className="text-xs font-bold font-sans mt-0.5 whitespace-nowrap">
                {day.date || `Day ${dayNum}`}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Day Header Banner */}
      {currentDay && (
        <div className="p-5 rounded-2xl bg-space-900/80 border border-white/10 backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
            <span className="text-xs font-bold tracking-widest text-cyan-400 uppercase font-mono">
              DAY {currentDay.day || currentDay.dayNumber || 1} • {currentDay.theme}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {currentDay.activities?.length || 0} CURATED ACTIVITIES
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight font-sans">
            {currentDay.title}
          </h3>
        </div>
      )}

      {/* Activity Timeline List */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-cyan-500 before:via-blue-500 before:to-white/10">
        {currentDay?.activities.map((activity, actIdx) => {
          const Icon = getCategoryIcon(activity.category);
          const isSelected = selectedActivityId === activity.id;

          return (
            <div
              key={activity.id}
              onClick={() => onSelectActivity && onSelectActivity(activity)}
              className={`group relative p-5 rounded-2xl border transition-all duration-300 cursor-pointer ${
                isSelected
                  ? 'bg-cyan-950/40 border-cyan-400 shadow-glow-cyan'
                  : 'bg-space-900/50 hover:bg-space-900/90 border-white/10 hover:border-white/20'
              }`}
            >
              {/* Timeline Pin Dot */}
              <div
                className={`absolute -left-[31px] sm:-left-[39px] top-6 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-cyan-400 border-white shadow-glow-cyan scale-125'
                    : 'bg-space-950 border-cyan-500 group-hover:scale-110'
                }`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              </div>

              {/* Activity Top Row */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-md border border-cyan-500/20">
                    {activity.time}
                  </span>
                  <span className="text-[10px] font-bold tracking-wider uppercase font-mono px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300">
                    {activity.category}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                  {activity.cost > 0 ? (
                    <span className="text-emerald-400 font-bold">₹{activity.cost}</span>
                  ) : (
                    <span className="text-slate-400">Included</span>
                  )}
                  <span>•</span>
                  <span>{activity.duration}</span>
                </div>
              </div>

              {/* Activity Title */}
              <h4 className="text-base sm:text-lg font-bold text-white group-hover:text-cyan-300 transition-colors font-sans mb-1.5">
                {activity.title}
              </h4>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-3 font-sans">
                {activity.description}
              </p>

              {/* Location & Transit Footer */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-white/5 text-xs">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="font-sans truncate">{activity.location}</span>
                </div>

                {activity.transitTime && (
                  <div className="text-[11px] font-mono text-cyan-400/90 flex items-center gap-1">
                    <Car className="w-3 h-3" />
                    <span>{activity.transitTime}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
