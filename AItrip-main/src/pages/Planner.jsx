import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Compass,
  Calendar,
  DollarSign,
  Users,
  Sliders,
  MessageSquare,
  MapPin,
  Navigation,
  Sun,
  Plane,
  Hotel,
  AlertTriangle,
} from 'lucide-react';
import { resolveLocation } from '../services/locationResolverService.js';

export function PlannerPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const passedDestItem = location.state?.destinationItem;
  const initialDestQuery = searchParams.get('destination') || (passedDestItem ? passedDestItem.name : 'Bengaluru');

  const [origin, setOrigin] = useState(searchParams.get('origin') || 'Hyderabad');
  const [destinationInput, setDestinationInput] = useState(
    passedDestItem
      ? `${passedDestItem.name}${passedDestItem.country ? ', ' + passedDestItem.country : ''}`
      : initialDestQuery
  );
  const [resolvedDest, setResolvedDest] = useState(passedDestItem || null);
  const [isResolving, setIsResolving] = useState(false);

  const [startDate, setStartDate] = useState(searchParams.get('startDate') || '2026-10-10');
  const [endDate, setEndDate] = useState(searchParams.get('endDate') || '2026-10-14');
  const [validationError, setValidationError] = useState('');

  const [days, setDays] = useState(4);
  const [travelers, setTravelers] = useState(2);
  const [budgetTier, setBudgetTier] = useState('Comfort (Curated Boutique)');
  const [travelStyle, setTravelStyle] = useState('Bespoke Cultural & Scenic Discovery');
  const [pace, setPace] = useState('Moderate (Balanced Exploration)');
  const [userPrompt, setUserPrompt] = useState(
    `Plan a memorable journey to ${initialDestQuery} with scenic highlights, cultural landmarks, authentic regional cuisine, and verified boutique stays.`
  );

  // Review 1 Scope Agents
  const review1Agents = [
    {
      id: 'weather',
      name: 'WEATHER AGENT',
      icon: Sun,
      color: 'text-amber-400',
      badgeBg: 'bg-amber-500/10 border-amber-400/30 text-amber-300',
      description: 'Fetches weather information for the destination and travel dates.',
    },
    {
      id: 'transport',
      name: 'TRANSPORT AGENT',
      icon: Plane,
      color: 'text-cyan-400',
      badgeBg: 'bg-cyan-500/10 border-cyan-400/30 text-cyan-300',
      description: 'Handles flight search and transport booking for the trip.',
    },
    {
      id: 'hotel',
      name: 'HOTEL & STAY AGENT',
      icon: Hotel,
      color: 'text-purple-400',
      badgeBg: 'bg-purple-500/10 border-purple-400/30 text-purple-300',
      description: 'Finds accommodation and handles hotel booking for the trip.',
    },
  ];

  // Resolve location coordinates dynamically if not already provided
  useEffect(() => {
    if (passedDestItem) {
      setResolvedDest(passedDestItem);
      return;
    }

    let isMounted = true;
    setIsResolving(true);
    resolveLocation(initialDestQuery)
      .then((res) => {
        if (isMounted) {
          if (res) {
            setResolvedDest(res);
            setUserPrompt(
              `Plan an immersive ${days}-day trip to ${res.name}, ${res.country} focusing on scenic viewpoints, authentic local dining, and boutique accommodation.`
            );
          }
          setIsResolving(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsResolving(false);
      });

    return () => {
      isMounted = false;
    };
  }, [initialDestQuery]);

  const handleDestinationBlur = async () => {
    if (!destinationInput.trim()) return;
    setIsResolving(true);
    try {
      const res = await resolveLocation(destinationInput.trim());
      if (res) {
        setResolvedDest(res);
      }
    } catch (e) {
      console.warn('Location resolution warning:', e);
    } finally {
      setIsResolving(false);
    }
  };

  const isAutoStart = searchParams.get('autoStart') === 'true';

  const handleLaunchOrchestration = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setValidationError('');

    const cleanOrigin = origin.trim();
    if (!cleanOrigin) {
      setValidationError('Please enter a departure origin.');
      return;
    }

    const cleanDest = destinationInput.trim();
    if (!cleanDest) {
      setValidationError('Please enter a destination.');
      return;
    }

    if (cleanOrigin.toLowerCase() === cleanDest.toLowerCase()) {
      setValidationError('Departure origin and destination cannot be the same location.');
      return;
    }

    if (Number(travelers) <= 0) {
      setValidationError('Travelers must be at least 1.');
      return;
    }

    if (startDate && endDate) {
      const s = new Date(startDate);
      const eDate = new Date(endDate);
      if (eDate < s) {
        setValidationError('Return date must be on or after departure date.');
        return;
      }
    }

    // Geocoding validation
    let activeDest = resolvedDest;
    if (!activeDest || (activeDest.name.toLowerCase() !== cleanDest.toLowerCase() && !cleanDest.toLowerCase().includes(activeDest.name.toLowerCase()))) {
      setIsResolving(true);
      try {
        activeDest = await resolveLocation(cleanDest);
        if (activeDest) {
          setResolvedDest(activeDest);
        }
      } catch (err) {
        console.warn('Geocoding error:', err);
      } finally {
        setIsResolving(false);
      }
    }

    if (!activeDest) {
      setValidationError('Unable to identify this destination. Please enter a more specific location.');
      return;
    }

    let computedDays = days;
    if (startDate && endDate) {
      const diffTime = Math.abs(new Date(endDate) - new Date(startDate));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      if (diffDays >= 1) computedDays = diffDays;
    }

    const destName = activeDest.name;
    const destCountry = activeDest.country || 'Global';
    const lat = Number(activeDest.latitude ?? activeDest.lat) || 20.0;
    const lng = Number(activeDest.longitude ?? activeDest.lng) || 78.0;

    navigate('/generate', {
      state: {
        origin: cleanOrigin,
        destination: {
          name: destName,
          country: destCountry,
          region: activeDest.region,
          latitude: lat,
          longitude: lng,
          type: activeDest.type || 'city',
          image: activeDest.image,
          shortDescription: activeDest.shortDescription || activeDest.description,
        },
        days: computedDays,
        startDate,
        endDate,
        travelers: Number(travelers),
        budgetTier,
        travelStyle,
        pace,
        userPrompt,
      },
    });
  };

  // If autoStart is requested from globe or direct link, automatically launch orchestration
  useEffect(() => {
    if (isAutoStart && resolvedDest && !isResolving) {
      const timer = setTimeout(() => {
        handleLaunchOrchestration();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isAutoStart, resolvedDest, isResolving]);

  return (
    <div className="min-h-screen bg-space-950 font-sans py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Planner Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-bold tracking-[0.25em] uppercase font-mono">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI PLANNER</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight font-sans">
            PLAN YOUR NEXT JOURNEY
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            AITrip uses specialized AI agents to analyze weather forecasts, route transport connections, and curate boutique stays for your trip.
          </p>
        </div>

        {/* REVIEW 1 AGENTS SECTION */}
        <div className="space-y-4">
          <div className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400 flex items-center justify-center gap-2">
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>REVIEW 1 AGENTS</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {review1Agents.map((agent) => {
              const IconComp = agent.icon;
              return (
                <div
                  key={agent.id}
                  className="p-5 rounded-3xl bg-space-900/80 border border-white/12 backdrop-blur-xl shadow-xl space-y-3 flex flex-col justify-between hover:border-white/30 transition-all"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className={`w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center ${agent.color}`}>
                        <IconComp className="w-5 h-5" />
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${agent.badgeBg}`}>
                        AVAILABLE
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-black text-white uppercase tracking-wider font-sans">
                        {agent.name}
                      </h3>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans mt-1">
                        {agent.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Planning Form Container */}
        <div className="space-y-4 pt-2">
          <div className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400 text-center">
            PLAN YOUR TRIP
          </div>

          <form
            onSubmit={handleLaunchOrchestration}
            className="p-6 sm:p-10 rounded-3xl bg-space-900/80 border border-white/15 backdrop-blur-xl shadow-2xl space-y-8"
          >
            {/* Main Conversational Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold tracking-widest text-cyan-400 uppercase font-mono flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <span>DESCRIBE YOUR IDEAL TRIP VISION</span>
              </label>
              <textarea
                rows={3}
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="e.g. Plan a 4-day trip with scenic views, authentic food markets, and comfortable stays..."
                className="w-full bg-space-950/80 border border-white/15 rounded-2xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-sans shadow-inner leading-relaxed"
                required
              />
            </div>

            {/* Grid of Key Parameters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Origin */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-cyan-400" />
                  <span>DEPARTURE ORIGIN</span>
                </label>
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="e.g. Hyderabad, Mumbai, Delhi, London..."
                  className="w-full bg-space-950 border border-white/15 rounded-xl px-4 py-3 text-sm text-white font-sans focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              {/* Destination */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span>PRIMARY DESTINATION</span>
                  </span>
                  {isResolving && <span className="text-cyan-400 text-[10px] animate-pulse">Resolving GIS...</span>}
                </label>
                <input
                  type="text"
                  value={destinationInput}
                  onChange={(e) => setDestinationInput(e.target.value)}
                  onBlur={handleDestinationBlur}
                  placeholder="e.g. Bengaluru, Munnar, Paris, Goa..."
                  className="w-full bg-space-950 border border-white/15 rounded-xl px-4 py-3 text-sm text-white font-sans focus:outline-none focus:border-cyan-400"
                  required
                />

                {/* Geographic Verification Badge */}
                {resolvedDest && (
                  <div className="pt-1 flex items-center gap-2 text-[10px] font-mono text-cyan-300">
                    <Navigation className="w-3 h-3 text-cyan-400" />
                    <span>
                      Verified: {resolvedDest.name}, {resolvedDest.country} (
                      {Number(resolvedDest.latitude || resolvedDest.lat || 0).toFixed(2)}°N,{' '}
                      {Number(resolvedDest.longitude || resolvedDest.lng || 0).toFixed(2)}°E)
                    </span>
                  </div>
                )}
              </div>

              {/* Duration Days */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  <span>DURATION (DAYS)</span>
                </label>
                <select
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="w-full bg-space-950 border border-white/15 rounded-xl px-4 py-3 text-sm text-white font-sans focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  <option value={3}>3 Days (Weekend Escape)</option>
                  <option value={4}>4 Days (Standard Trip)</option>
                  <option value={5}>5 Days (Extended Tour)</option>
                  <option value={7}>7 Days (Full Week)</option>
                </select>
              </div>

              {/* Travelers */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-cyan-400" />
                  <span>TRAVELERS</span>
                </label>
                <select
                  value={travelers}
                  onChange={(e) => setTravelers(Number(e.target.value))}
                  className="w-full bg-space-950 border border-white/15 rounded-xl px-4 py-3 text-sm text-white font-sans focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  <option value={1}>1 Solo Explorer</option>
                  <option value={2}>2 Couple / Travel Partners</option>
                  <option value={4}>4 Family / Small Group</option>
                  <option value={6}>6 Friends Expedition</option>
                </select>
              </div>

              {/* Budget Tier */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-cyan-400" />
                  <span>BUDGET TIER</span>
                </label>
                <select
                  value={budgetTier}
                  onChange={(e) => setBudgetTier(e.target.value)}
                  className="w-full bg-space-950 border border-white/15 rounded-xl px-4 py-3 text-sm text-white font-sans focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  <option value="Comfort (Curated Boutique)">Comfort Boutique</option>
                  <option value="Backpacker / Value">Value Explorer</option>
                  <option value="Ultra Luxury Heritage">Ultra Luxury</option>
                </select>
              </div>

              {/* Travel Pace */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                  <span>TRAVEL PACE</span>
                </label>
                <select
                  value={pace}
                  onChange={(e) => setPace(e.target.value)}
                  className="w-full bg-space-950 border border-white/15 rounded-xl px-4 py-3 text-sm text-white font-sans focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  <option value="Moderate (Balanced Exploration)">Moderate (Balanced)</option>
                  <option value="Slow & Relaxed">Slow Pace</option>
                  <option value="Intense / Action-Packed">Action-Packed</option>
                </select>
              </div>

              {/* Departure Date */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  <span>DEPARTURE DATE</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-space-950 border border-white/15 rounded-xl px-4 py-3 text-sm text-white font-sans focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              {/* Return Date */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  <span>RETURN DATE</span>
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-space-950 border border-white/15 rounded-xl px-4 py-3 text-sm text-white font-sans focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>
            </div>

            {/* Validation Error Alert Banner */}
            {validationError && (
              <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs sm:text-sm font-medium flex items-center gap-3 animate-shake">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs sm:text-sm font-black tracking-widest uppercase transition-all shadow-glow-cyan hover:scale-[1.01] flex items-center justify-center gap-3 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>PLAN MY TRIP</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

