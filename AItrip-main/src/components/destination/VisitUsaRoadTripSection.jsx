import React from 'react';
import { Link } from 'react-router-dom';
import { Map, ArrowRight, Clock, Gauge, Compass } from 'lucide-react';

export function VisitUsaRoadTripSection({ onSelectTrip }) {
  const roadTrips = [
    {
      id: 'trip-goa-4d',
      title: 'Sun, Spice & Portuguese Ramparts: 4-Day Coastal Goa Road Trip',
      route: 'Dabolim → Calangute → Fort Aguada → Anjuna → Fontainhas',
      days: '4 Days',
      distance: '185 km',
      image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
      tag: 'FEATURED ROAD TRIP',
      pace: 'Coastal & Leisurely',
    },
    {
      id: 'trip-manali',
      title: 'Himalayan Ridge & Rohtang Pass High Altitude Expedition',
      route: 'Kullu → Solang Valley → Atal Tunnel → Sissu → Rohtang',
      days: '5 Days',
      distance: '240 km',
      image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1000&q=80',
      tag: 'ALPINE MOUNTAIN PASS',
      pace: 'High Altitude Adventure',
    },
    {
      id: 'trip-amalfi',
      title: 'Amalfi Cliffside Route: Positano to Ravello Panoramic Overlook',
      route: 'Naples → Sorrento → Positano → Amalfi → Ravello',
      days: '4 Days',
      distance: '120 km',
      image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1000&q=80',
      tag: 'MEDITERRANEAN COAST',
      pace: 'Scenic Coastal Luxury',
    },
  ];

  const mainTrip = roadTrips[0];
  const sideTrips = roadTrips.slice(1);

  return (
    <section className="py-20 bg-black border-y border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* VisitTheUSA Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold tracking-[0.25em] text-cyan-400 uppercase font-mono mb-2">
              <Map className="w-4 h-4 text-cyan-400" />
              <span>SIGNATURE ROAD TRIPS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight font-display">
              HIT THE OPEN ROAD
            </h2>
          </div>

          <Link
            to="/trips/trip-goa-4d"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/20 text-xs font-bold tracking-widest text-white uppercase transition-all duration-300 hover:bg-white hover:text-black hover:border-white group"
          >
            <span>VIEW ALL ROAD TRIPS</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Asymmetrical Split Grid: VisitTheUSA Signature Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Main Large Feature Card (Left Column, 7 cols) */}
          <div className="lg:col-span-7">
            <Link
              to={`/trips/${mainTrip.id}`}
              className="usa-card group block relative rounded-3xl overflow-hidden border border-white/15 bg-black h-full min-h-[440px] sm:min-h-[540px] shadow-2xl"
            >
              <img
                src={mainTrip.image}
                alt={mainTrip.title}
                className="usa-card-img absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />

              <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-end z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-cyan-300 text-[10px] font-extrabold tracking-widest uppercase mb-3 w-fit">
                  <span>{mainTrip.tag}</span>
                </div>

                <h3 className="usa-card-title text-2xl sm:text-4xl font-black text-white uppercase tracking-tight leading-tight mb-3 font-display">
                  {mainTrip.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 font-mono mb-6 line-clamp-1">
                  ROUTE: {mainTrip.route}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/15">
                  <div className="flex items-center gap-4 text-xs font-mono text-slate-200">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-cyan-400" />
                      {mainTrip.days}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5">
                      <Gauge className="w-4 h-4 text-cyan-400" />
                      {mainTrip.distance}
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-black text-xs font-black tracking-wider uppercase transition-all duration-300 hover:bg-cyan-400 hover:text-black shadow-lg group-hover:scale-105">
                    <span>EXPLORE ROUTE</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Stacked Right Cards (Right Column, 5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            {sideTrips.map((trip) => (
              <Link
                key={trip.id}
                to="/explore"
                className="usa-card group block relative rounded-3xl overflow-hidden border border-white/10 bg-space-950 flex-1 min-h-[240px] shadow-xl"
              >
                <img
                  src={trip.image}
                  alt={trip.title}
                  className="usa-card-img absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-space-950 via-space-950/70 to-transparent" />

                <div className="absolute inset-0 p-6 flex flex-col justify-end z-10">
                  <div className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase font-mono mb-1">
                    {trip.tag}
                  </div>

                  <h4 className="usa-card-title text-lg sm:text-xl font-black text-white uppercase tracking-tight leading-snug mb-2 font-sans">
                    {trip.title}
                  </h4>

                  <div className="flex items-center justify-between text-xs text-slate-300 font-mono mt-2 pt-2 border-t border-white/10">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      {trip.days} • {trip.distance}
                    </span>
                    <span className="text-cyan-400 font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      EXPLORE <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
