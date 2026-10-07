import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { destinationService } from '../services/index.js';
import { GoogleEarthGlobe } from '../components/globe/GoogleEarthGlobe.jsx';
import { VisitUsaStoryFeed } from '../components/destination/VisitUsaStoryFeed.jsx';
import { PanoramicFeatureStory } from '../components/destination/VisitUsaCards.jsx';
import { VisitUsaRoadTripSection } from '../components/destination/VisitUsaRoadTripSection.jsx';
import { VisitUsaExperienceSection } from '../components/destination/VisitUsaExperienceSection.jsx';
import { DestinationDetailModal } from '../components/destination/DestinationDetailModal.jsx';
import { VerticalFloatingTab } from '../components/common/VerticalFloatingTab.jsx';
import { Sparkles, ArrowRight, Compass, ShieldCheck, Cpu, Globe2, Mail, Dices } from 'lucide-react';

import { DESTINATIONS_DATA, WORLD_DESTINATIONS } from '../data/destinations.js';

export function LandingPage() {
  const [destinations, setDestinations] = useState(DESTINATIONS_DATA);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    destinationService.getAllDestinations().then((data) => {
      if (data && data.length > 0) setDestinations(data);
    });
  }, []);

  const handleSelectDestination = (destOrName) => {
    if (!destOrName) return;

    if (typeof destOrName === 'string') {
      const q = destOrName.toLowerCase().trim();
      // 1. Search primary destinations
      let found = destinations.find(
        (d) =>
          d?.name?.toLowerCase() === q ||
          d?.id?.toLowerCase() === q ||
          d?.name?.toLowerCase().includes(q) ||
          (d?.name && q.includes(d.name.toLowerCase()))
      );

      // 2. Search WORLD_DESTINATIONS
      if (!found) {
        const worldMatch = WORLD_DESTINATIONS.find(
          (w) =>
            w?.name?.toLowerCase() === q ||
            w?.id?.toLowerCase() === q ||
            w?.name?.toLowerCase().includes(q) ||
            (w?.name && q.includes(w.name.toLowerCase()))
        );

        if (worldMatch) {
          found = {
            id: worldMatch.id,
            name: worldMatch.name,
            country: worldMatch.country,
            travelStyle: worldMatch.tag || 'Scenic Discovery & Autonomous Planning',
            shortDescription: worldMatch.description,
            startingBudget: 35000,
            popularScore: 97,
            tags: [worldMatch.tag || 'Scenic Discovery', 'AI Route', 'Local Highlights'],
            image: worldMatch.image,
            heroImage: worldMatch.image,
            weatherOverview: { tempC: 28, condition: 'Pleasant & Sunny', icon: 'Sun' },
            highlightSpots: ['Iconic Landmark', 'Cultural Heritage', 'Scenic Panoramic Viewpoint'],
          };
        }
      }

      // 3. Fallback ensures modal ALWAYS opens for any clicked spot or search query
      if (!found) {
        found = {
          id: q,
          name: destOrName,
          country: 'World',
          travelStyle: 'Scenic Odyssey & Local Culture',
          shortDescription: `Curated autonomous AI itinerary and scenic route planning for ${destOrName}. Calibrated for optimal transit, weather routing, and authentic local experiences.`,
          startingBudget: 25000,
          popularScore: 96,
          tags: ['AI Route', 'Scenic Odyssey', 'Local Culture'],
          image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
          heroImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80',
          weatherOverview: { tempC: 25, condition: 'Sunny & Pleasant', icon: 'Sun' },
          highlightSpots: ['Central Boulevard', 'Heritage Architecture', 'Local Food Market'],
        };
      }

      setSelectedDestination(found);
      setModalOpen(true);
    } else {
      setSelectedDestination(destOrName);
      setModalOpen(true);
    }
  };

  const handleHeroRollDice = () => {
    const all = [...destinations, ...WORLD_DESTINATIONS];
    if (all.length > 0) {
      const pick = all[Math.floor(Math.random() * all.length)];
      handleSelectDestination(pick.name || pick);
    }
  };

  const featuredGoa = destinations.find((d) => d.id === 'goa') || destinations[0];

  return (
    <div className="flex flex-col min-h-screen bg-black font-sans relative">
      {/* Floating Vertical Tab (Right Screen Edge as seen in user's image) */}
      <VerticalFloatingTab />

      {/* ========================================================
          CORE HERO UI: 3D EARTH GLOBE STAGE (PART 3)
          The globe is the main interaction surface of AITrip.
          ======================================================== */}
      <section className="relative w-full bg-black overflow-hidden border-b border-white/10">
        <GoogleEarthGlobe onSelectDestination={handleSelectDestination} />

        {/* Floating Callout at the bottom of the globe */}
        <div className="w-full bg-gradient-to-t from-black via-black/80 to-transparent pt-8 pb-10 px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-cyan-300 text-xs font-bold tracking-[0.25em] uppercase font-mono mb-3">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>AITRIP — AGENTIC AI GLOBAL TRAVEL PLANNER</span>
            </div>

            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight font-display mb-4">
              PLAN YOUR TRIP WITH AI
            </h2>

            <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 leading-relaxed font-sans mb-6">
              Search any country, city, island, ocean, or landmark across Earth. 10 specialized LangGraph AI agents dynamically orchestrate routes, flights, boutique stays, and real-time weather.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => navigate('/planner')}
                className="px-6 py-3.5 rounded-full bg-cyan-500 text-white border border-cyan-400 text-xs font-black tracking-widest uppercase transition-all duration-300 shadow-xl hover:bg-white hover:text-black hover:border-white hover:scale-105 inline-flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>START PLANNING WITH AI</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleHeroRollDice}
                className="px-6 py-3.5 rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-white border border-red-500 text-xs font-black tracking-widest uppercase transition-all duration-300 shadow-[0_0_25px_rgba(239,68,68,0.6)] hover:bg-white hover:text-black hover:border-white hover:scale-105 inline-flex items-center gap-2 cursor-pointer"
                title="Pick a random destination and view plan"
              >
                <Dices className="w-4 h-4 animate-spin-slow" />
                <span>🎲 ROLL DICE</span>
              </button>

              <button
                onClick={() => navigate('/trips/trip-goa-4d')}
                className="px-6 py-3.5 rounded-full bg-black/60 border border-white/20 text-white text-xs font-black tracking-widest uppercase transition-all duration-300 shadow-xl hover:bg-white hover:text-black hover:border-white hover:scale-105 inline-flex items-center gap-2"
              >
                <span>EXPLORE GOA ROAD TRIP</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          CURATED STORIES: VisitTheUSA Editorial Feed & Filter Bar
          ======================================================== */}
      <VisitUsaStoryFeed
        destinations={destinations}
        onSelectDestination={handleSelectDestination}
      />

      {/* ========================================================
          FEATURED ROAD TRIP OF THE WEEK: Wide Panoramic Banner
          ======================================================== */}
      {featuredGoa && (
        <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full bg-black">
          <PanoramicFeatureStory
            destination={featuredGoa}
            onSelect={handleSelectDestination}
          />
        </section>
      )}

      {/* ========================================================
          SIGNATURE ROAD TRIPS: VisitTheUSA Asymmetrical Split Grid
          ======================================================== */}
      <VisitUsaRoadTripSection
        onSelectTrip={(tripId) => navigate(`/trips/${tripId}`)}
      />

      {/* ========================================================
          WAYS TO EXPLORE: 4-Column Category Grid
          ======================================================== */}
      <VisitUsaExperienceSection />

      {/* ========================================================
          AGENTIC AI ADVANTAGE CALLOUT BANNER
          ======================================================== */}
      <section className="py-20 bg-black border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="text-xs font-bold tracking-[0.25em] text-cyan-400 uppercase font-mono mb-2">
              WHY AITRIP IS DIFFERENT
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight font-display mb-4">
              THE 10-AGENT MULTI-AGENT ADVANTAGE
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Unlike static travel blogs, AITrip deploys autonomous LangGraph agents that continually monitor flight radars, recalculate transit times, and autonomously resolve schedule conflicts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-[#111111] border border-white/10 relative overflow-hidden group hover:border-white transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 mb-6">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white uppercase tracking-wider font-sans mb-2">
                10 SPECIALIZED AGENTS
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                Dedicated agents for Route Geometry, Budget Calibration, Live Weather, Transport Rescheduling, Boutique Lodging, and Dining curation collaborate seamlessly.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-[#111111] border border-white/10 relative overflow-hidden group hover:border-white transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-400/30 flex items-center justify-center text-blue-400 mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white uppercase tracking-wider font-sans mb-2">
                DYNAMIC CASCADE REPLANNING
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                If your flight is delayed by 3 hours, downstream activities are automatically shifted, reservations preserved, and evening plans re-synchronized.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-[#111111] border border-white/10 relative overflow-hidden group hover:border-white transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-400 mb-6">
                <Globe2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white uppercase tracking-wider font-sans mb-2">
                CONTINUOUS TRAVEL MEMORY
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                AITrip learns your preferred travel rhythm, favorite cuisine types, boutique lodging tastes, and pace tolerances across every journey you take.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          VISITTHEUSA STYLE FOOTER & NEWSLETTER
          ======================================================== */}
      <footer className="bg-black border-t border-white/10 pt-16 pb-24 lg:pb-16 text-slate-400 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 border-b border-white/10">
            {/* Brand Column */}
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-glow-sm">
                  <Compass className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-black tracking-widest text-white uppercase font-sans">
                  AI<span className="text-cyan-400">TRIP</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                The world’s first autonomous Agentic AI travel platform. Reimagining global discovery and itinerary orchestration with NASA satellite earth models and multi-agent intelligence.
              </p>
            </div>

            {/* Quick Links */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="text-xs font-bold tracking-widest uppercase text-white font-mono">
                DESTINATIONS
              </h4>
              <ul className="space-y-2 text-xs">
                <li><button onClick={() => navigate('/explore')} className="hover:text-white transition-colors">Coastal Goa</button></li>
                <li><button onClick={() => navigate('/explore')} className="hover:text-white transition-colors">Alpine Manali</button></li>
                <li><button onClick={() => navigate('/explore')} className="hover:text-white transition-colors">Tropical Bali</button></li>
                <li><button onClick={() => navigate('/explore')} className="hover:text-white transition-colors">Amalfi Coast</button></li>
              </ul>
            </div>

            <div className="lg:col-span-2 space-y-3">
              <h4 className="text-xs font-bold tracking-widest uppercase text-white font-mono">
                PLATFORM
              </h4>
              <ul className="space-y-2 text-xs">
                <li><button onClick={() => navigate('/planner')} className="hover:text-white transition-colors">AI Trip Planner</button></li>
                <li><button onClick={() => navigate('/trips/trip-goa-4d')} className="hover:text-white transition-colors">Itinerary & Map</button></li>
                <li><button onClick={() => navigate('/memory')} className="hover:text-white transition-colors">Traveler Memory DNA</button></li>
                <li><button onClick={() => navigate('/execution')} className="hover:text-white transition-colors">Execution Center (.ics)</button></li>
              </ul>
            </div>

            {/* Newsletter Column */}
            <div className="lg:col-span-4 space-y-4">
              <h4 className="text-xs font-bold tracking-widest uppercase text-white font-mono">
                RECEIVE CURATED TRAVEL INSPIRATION
              </h4>
              <p className="text-xs text-slate-400">
                Weekly handpicked road trips, secret coastal coves, and agentic AI travel dispatches.
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="bg-white/5 border border-white/10 rounded-full px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-white flex-1 font-sans"
                />
                <button
                  onClick={() => alert('Thank you for subscribing to AITrip Travel Dispatches!')}
                  className="px-6 py-2.5 rounded-full bg-white text-black font-black text-xs uppercase tracking-wider transition-all duration-300 hover:bg-cyan-400 hover:text-black shrink-0 shadow-lg"
                >
                  JOIN
                </button>
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-mono gap-4">
            <div>© 2026 AITrip Inc. Built for Final Year Project • VisitTheUSA Design Pattern</div>
            <div className="flex gap-6">
              <span>NASA Satellite Blue Marble</span>
              <span>•</span>
              <span>LangGraph Architecture</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Destination Detail Modal */}
      <DestinationDetailModal
        destination={selectedDestination}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
