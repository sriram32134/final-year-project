import React from 'react';
import { Utensils, Waves, Landmark, Mountain, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function VisitUsaExperienceSection() {
  const experiences = [
    {
      title: 'CULINARY & TASTINGS',
      subtitle: 'Coastal seafood feasts, vineyard estates & farm-to-table dining',
      count: '42 EXPERIENCES',
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
      icon: Utensils,
    },
    {
      title: 'COASTAL & ISLANDS',
      subtitle: 'Catamaran sunset sails, turquoise reefs & secluded sands',
      count: '38 EXPERIENCES',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      icon: Waves,
    },
    {
      title: 'HERITAGE & FORTS',
      subtitle: 'Portuguese ramparts, Latin quarters & ancient sacred temples',
      count: '29 EXPERIENCES',
      image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80',
      icon: Landmark,
    },
    {
      title: 'ALPINE & OUTDOOR',
      subtitle: 'High mountain passes, pine forest trails & river rafting',
      count: '34 EXPERIENCES',
      image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
      icon: Mountain,
    },
  ];

  return (
    <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <div className="text-xs font-bold tracking-[0.25em] text-cyan-400 uppercase font-mono mb-2">
          WAYS TO EXPLORE
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight font-display mb-4">
          FIND YOUR KIND OF JOURNEY
        </h2>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Whether you crave sunset catamaran cruises, high-altitude Himalayan mountain passes, or heritage Portuguese street walks.
        </p>
      </div>

      {/* 4-Column Grid: VisitTheUSA Signature Card Structure */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {experiences.map((exp) => {
          const Icon = exp.icon;
          return (
            <Link
              key={exp.title}
              to="/explore"
              className="usa-card group block relative rounded-2xl overflow-hidden border border-white/10 bg-space-900 aspect-[3/4] shadow-xl"
            >
              <img
                src={exp.image}
                alt={exp.title}
                className="usa-card-img absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-space-950 via-space-950/60 to-black/30" />

              {/* Icon Badge Top-Left */}
              <div className="absolute top-4 left-4 z-10 w-10 h-10 rounded-full bg-space-950/80 backdrop-blur-md border border-white/15 flex items-center justify-center text-cyan-400">
                <Icon className="w-5 h-5" />
              </div>

              {/* Arrow Badge Top-Right */}
              <div className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-cyan-500 transition-colors">
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>

              {/* Card Bottom Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                <div className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase font-mono mb-1">
                  {exp.count}
                </div>
                <h3 className="usa-card-title text-lg font-black text-white uppercase tracking-tight leading-snug mb-2 font-sans">
                  {exp.title}
                </h3>
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {exp.subtitle}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
