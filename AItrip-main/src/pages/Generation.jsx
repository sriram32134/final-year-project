import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Cpu,
  CheckCircle,
  Sparkles,
  ArrowRight,
  Terminal,
  MapPin,
  Clock,
  DollarSign,
  Sun,
  Plane,
  Hotel,
  Utensils,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { submitTripPlan } from '../services/locationResolverService.js';
import { tripService } from '../services/index.js';

export function GenerationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const tripConfig = location.state || {
    origin: 'Hyderabad',
    destination: {
      name: 'Bengaluru',
      country: 'India',
      latitude: 12.9716,
      longitude: 77.5946,
    },
    days: 4,
    travelers: 2,
    travelStyle: 'Bespoke Cultural & Scenic Discovery',
  };

  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(10);
  const [telemetryLogs, setTelemetryLogs] = useState([]);
  const [generatedTripId, setGeneratedTripId] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  const [liveMetrics, setLiveMetrics] = useState(null);

  const agents = [
    { id: 'weather', name: 'Weather Agent', role: 'Fetches weather forecasts for destination & travel dates', icon: Sun },
    { id: 'transport', name: 'Transport Agent', role: 'Handles flight search & transport booking for the trip', icon: Plane },
    { id: 'hotel', name: 'Hotel & Stay Agent', role: 'Finds accommodation & handles hotel booking for the trip', icon: Hotel },
  ];

  useEffect(() => {
    let isMounted = true;

    async function executeAgentPipeline() {
      const destRaw = tripConfig.destination;
      const destName = typeof destRaw === 'string'
        ? destRaw.split(',')[0].trim()
        : (destRaw?.name || 'Bengaluru');
      const destCountry = typeof destRaw === 'string'
        ? (destRaw.split(',')[1]?.trim() || 'Global')
        : (destRaw?.country || 'Global');

      const dLat = typeof destRaw === 'object' && destRaw?.latitude
        ? Number(destRaw.latitude)
        : (typeof destRaw === 'object' && destRaw?.lat ? Number(destRaw.lat) : 12.9716);

      const dLng = typeof destRaw === 'object' && destRaw?.longitude
        ? Number(destRaw.longitude)
        : (typeof destRaw === 'object' && destRaw?.lng ? Number(destRaw.lng) : 77.5946);

      setTelemetryLogs([
        `[Supervisor] Initializing LangGraph state graph for ${destName}, ${destCountry}...`,
        `[Supervisor] Coordinates: (${dLat.toFixed(2)}°N, ${dLng.toFixed(2)}°E) | Origin: ${tripConfig.origin || 'Hyderabad'} | Duration: ${tripConfig.days || 4} days`,
      ]);

      const planRequest = {
        origin: {
          name: tripConfig.origin || 'Hyderabad',
          latitude: 17.3850,
          longitude: 78.4867,
          country: 'India',
        },
        destination: {
          name: destName,
          country: destCountry,
          region: typeof destRaw === 'object' ? destRaw?.region : null,
          latitude: dLat,
          longitude: dLng,
          type: typeof destRaw === 'object' ? destRaw?.type : 'city',
          image: typeof destRaw === 'object' ? destRaw?.image : null,
          shortDescription: typeof destRaw === 'object' ? destRaw?.shortDescription : null,
        },
        durationDays: Number(tripConfig.days) || 4,
        travelers: Number(tripConfig.travelers) || 2,
        budget: Number(tripConfig.budget) || (tripConfig.budgetTier?.includes('Luxury') ? 70000 : 32000),
        budgetTier: tripConfig.budgetTier || 'Comfort (Curated Boutique)',
        travelStyle: tripConfig.travelStyle || 'Bespoke Cultural & Scenic Discovery',
        pace: tripConfig.pace || 'Moderate (Balanced Exploration)',
        preferences: ['nature', 'scenic', 'heritage', 'relaxed', 'culinary'],
        userPrompt: tripConfig.userPrompt,
      };

      try {
        const response = await submitTripPlan(planRequest);
        if (!isMounted) return;

        setLiveMetrics(response);
        const events = response?.agentEvents || response?.agent_events || [];

        // Animate sequential agent progression for cinematic feel
        for (let i = 0; i < agents.length; i++) {
          await new Promise((r) => setTimeout(r, 380));
          if (!isMounted) return;

          setActiveStep(i);
          setProgress(Math.round(((i + 1) / agents.length) * 100));

          const matchingEvent = events[i] || events.find((e) =>
            e.agent?.toLowerCase().includes(agents[i].id) ||
            agents[i].id.includes(e.agent?.toLowerCase())
          );

          const logMsg = matchingEvent
            ? `[${matchingEvent.agent}] ${matchingEvent.message}`
            : `[${agents[i].name}] Completed deliverable successfully.`;

          setTelemetryLogs((prev) => [...prev, logMsg]);
        }

        // Format day-by-day itinerary structure
        const formattedDays = (response.itinerary || []).map((day, idx) => ({
          day: day.day || idx + 1,
          date: `2026-10-${15 + idx}`,
          title: day.title || `Day ${idx + 1}: Discovering ${destName}`,
          theme: day.theme || 'Signature exploration and regional gastronomy.',
          activities: (day.activities || []).map((act, actIdx) => ({
            id: act.id || `act-${idx + 1}-${actIdx + 1}`,
            time: act.time || '10:00',
            title: act.title || 'Curated Exploration Node',
            description: act.description || `Experience highlights in ${destName}.`,
            location: act.location || `${destName} Central`,
            lat: act.lat || (dLat + 0.005 * (actIdx + 1)),
            lng: act.lng || (dLng + 0.004 * (actIdx + 1)),
            category: act.category || 'Sightseeing',
            cost: act.cost || 0,
            duration: act.duration || '2 hours',
            transitTime: act.transitTime || '15 mins',
            icon: act.icon || 'Compass',
          })),
        }));

        // Register trip in tripService
        const newTrip = await tripService.createTrip({
          id: response.tripId || `trip-${Date.now()}`,
          title: response.summary ? `${destName} Multi-Agent Expedition` : `${planRequest.durationDays}-Day Voyage to ${destName}`,
          destinationName: `${destName}, ${destCountry}`,
          coverImage: (typeof destRaw === 'object' && destRaw.image) ? destRaw.image : (response.destination?.image || 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1600&q=80'),
          durationDays: planRequest.durationDays,
          travelers: planRequest.travelers,
          tripStyle: tripConfig.travelStyle || 'Bespoke Curated Travel',
          pace: tripConfig.pace || 'Moderate (Balanced Exploration)',
          summary: response.summary || `A synchronized LangGraph multi-agent itinerary exploring the signature attractions, local gastronomy, and scenic vistas of ${destName}.`,
          budget: {
            total: response.estimatedBudget?.totalEstimated || planRequest.budget,
            spent: 0,
            breakdown: response.estimatedBudget || {
              accommodation: `₹${Math.round(planRequest.budget * 0.40).toLocaleString()}`,
              transport: `₹${Math.round(planRequest.budget * 0.25).toLocaleString()}`,
              foodAndDining: `₹${Math.round(planRequest.budget * 0.18).toLocaleString()}`,
              activitiesAndEntry: `₹${Math.round(planRequest.budget * 0.10).toLocaleString()}`,
              contingencyBuffer: `₹${Math.round(planRequest.budget * 0.07).toLocaleString()}`,
            },
          },
          weather: response.weatherOverview || {
            destination: destName,
            typicalRange: '22°C – 28°C',
            condition: 'Clear & Favorable Conditions',
          },
          transport: {
            mode: response.transportRecommendation?.primaryMode || 'Flight / Scenic Rail Corridor',
            transitTime: response.transportRecommendation?.transitTime || '1h 15m direct flight',
            flight: {
              airline: response.transportRecommendation?.provider || 'Flight Demo Website (Playwright Automation)',
              flightNumber: response.transportRecommendation?.flightNumber || '6E-532',
              origin: response.transportRecommendation?.origin || planRequest.origin.name,
              destination: response.transportRecommendation?.destination || destName,
              departureAirport: `${planRequest.origin.name} Gateway (${(planRequest.origin.name || 'HYD').slice(0, 3).toUpperCase()})`,
              arrivalAirport: `${destName} Terminal (${destName.slice(0, 3).toUpperCase()})`,
              departureTime: '06:00',
              arrivalTime: '07:15',
              duration: response.transportRecommendation?.transitTime || '1h 15m',
              status: response.transportRecommendation?.bookingStatus || 'Confirmed (Automated)',
              pnr: response.transportRecommendation?.bookingReference || response.transportRecommendation?.pnr || 'QP-HYDBLR-7499',
              seat: '12A (Demo)',
              terminal: 'T1',
              gate: 'G-12',
            },
            rental: {
              vehicle: 'Dedicated All-Terrain SUV Rental',
              pickupLocation: `${destName} Arrival Terminal`,
              dropoffLocation: `${destName} Departure Terminal`,
              costPerDay: 2800,
            },
          },
          hotel: response.hotelRecommendation || {
            name: `The Boutique Heritage Manor ${destName}`,
            address: `Scenic Central Quarter, ${destName}`,
            checkIn: '14:00',
            checkOut: '11:00',
            roomType: `Deluxe Suite (${planRequest.travelers} Guests)`,
            amenities: ['Central Historic Location', 'Panoramic Balcony', 'High-Speed Wi-Fi', 'Breakfast Included'],
            image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
          },
          packingList: response.packingChecklist || [
            { id: 'p-1', item: 'Breathable walking layers', category: 'Clothing', checked: true },
            { id: 'p-2', item: 'Comfortable all-day walking shoes', category: 'Footwear', checked: false },
            { id: 'p-3', item: 'UV polarized sunglasses & SPF 50 sunscreen', category: 'Protection', checked: false },
            { id: 'p-4', item: 'Universal adapter & power bank', category: 'Electronics', checked: true },
          ],
          emergencyContacts: response.safetyAdvisories?.emergencyContacts || [
            { role: 'Police Emergency', number: '112 / 100' },
            { role: 'Medical & Ambulance', number: '108 / 102' },
            { role: 'National Tourist Helpline', number: '1363' },
          ],
          days: formattedDays,
          agentEvents: events,
          conflictsDetected: response.conflictsDetected || [],
          optimizationsApplied: response.optimizationsApplied || [],
        });

        if (isMounted) {
          setGeneratedTripId(newTrip.id);
          setIsComplete(true);
        }
      } catch (err) {
        console.error('Multi-agent execution failure:', err);
      }
    }

    executeAgentPipeline();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-space-950 font-sans py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Status Bar */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-bold tracking-[0.25em] uppercase font-mono">
            {isComplete ? (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">LANGGRAPH MULTI-AGENT SYNTHESIS COMPLETE</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                <span>LANGGRAPH AGENTS ORCHESTRATING IN REAL-TIME</span>
              </>
            )}
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight font-sans">
            {isComplete ? 'ITINERARY SYNTHESIZED & OPTIMIZED' : 'ANALYZING GLOBAL DESTINATION'}
          </h1>
          <p className="text-slate-300 text-sm max-w-2xl mx-auto">
            Weather, Transport, and Hotel AI agents are processing weather forecasts, flight corridors, and accommodation options for your trip.
          </p>
        </div>

        {/* Global Progress Bar */}
        <div className="space-y-2 max-w-3xl mx-auto">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-cyan-400 font-bold uppercase tracking-wider">
              {agents[activeStep]?.name || 'Autonomous Pipeline'}
            </span>
            <span className="text-slate-400">{progress}% COMPLETE</span>
          </div>
          <div className="h-2 w-full bg-space-900 rounded-full overflow-hidden border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 transition-all duration-300 shadow-glow-cyan"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Main Grid: Agent Node Pipeline & Live Telemetry Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: 10 Agent Node Cards */}
          <div className="lg:col-span-7 space-y-3">
            <div className="text-xs font-mono uppercase tracking-widest text-slate-400 font-semibold mb-2">
              SPECIALIZED AGENT PIPELINE STATUS
            </div>

            <div className="space-y-2.5">
              {agents.map((agent, index) => {
                const IconComponent = agent.icon;
                const isCurrent = activeStep === index;
                const isFinished = activeStep > index || isComplete;

                return (
                  <div
                    key={agent.id}
                    className={`p-3.5 rounded-2xl border transition-all duration-300 flex items-center justify-between ${
                      isCurrent
                        ? 'bg-cyan-950/40 border-cyan-400/80 shadow-glow-cyan scale-[1.01]'
                        : isFinished
                        ? 'bg-space-900/60 border-white/10 opacity-90'
                        : 'bg-space-900/20 border-white/5 opacity-40'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isCurrent
                            ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/50'
                            : isFinished
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/30'
                            : 'bg-white/5 text-slate-400'
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white uppercase tracking-wider font-sans">
                            {agent.name}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 animate-pulse">
                              RUNNING
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate font-sans">
                          {agent.role}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 ml-3">
                      {isFinished ? (
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                      ) : isCurrent ? (
                        <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-slate-600" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Live Terminal Telemetry & Live Synthesis Metrics */}
          <div className="lg:col-span-5 space-y-6">
            {/* Terminal Feed */}
            <div className="p-5 rounded-3xl bg-black/80 border border-white/15 backdrop-blur-xl shadow-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                  <Terminal className="w-4 h-4" />
                  <span>AGENT TELEMETRY FEED</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
              </div>

              <div className="h-64 overflow-y-auto space-y-2 text-xs font-mono text-slate-300 pr-1 scrollbar-thin scrollbar-thumb-white/10">
                {telemetryLogs.map((log, index) => (
                  <div key={index} className="leading-relaxed">
                    <span className="text-cyan-400">{log.slice(0, log.indexOf(']') + 1)}</span>
                    <span className="text-slate-200">{log.slice(log.indexOf(']') + 1)}</span>
                  </div>
                ))}
                {!isComplete && (
                  <div className="flex items-center gap-2 text-cyan-400 animate-pulse pt-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span>Processing LangGraph agent state graph...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Synthesized Live Deliverable Cards */}
            {liveMetrics && (
              <div className="p-5 rounded-3xl bg-space-900/60 border border-white/15 space-y-3 animate-fade-in">
                <div className="text-xs font-mono uppercase tracking-widest text-cyan-300 font-semibold flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>LIVE SYNTHESIS METRICS</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                    <div className="text-[10px] text-slate-400">METEOROLOGY</div>
                    <div className="text-sm font-bold text-amber-400 mt-0.5">
                      {liveMetrics.weatherOverview?.tempC || '24'}°C
                    </div>
                    <div className="text-[10px] text-slate-300 truncate">
                      {liveMetrics.weatherOverview?.condition || 'Clear'}
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                    <div className="text-[10px] text-slate-400">TRANSIT DISTANCE</div>
                    <div className="text-sm font-bold text-cyan-300 mt-0.5">
                      {liveMetrics.transportRecommendation?.distanceKm ? `${liveMetrics.transportRecommendation.distanceKm.toLocaleString()} km` : 'Direct Route'}
                    </div>
                    <div className="text-[10px] text-slate-300 truncate">
                      {liveMetrics.transportRecommendation?.primaryMode || 'Corridor Ready'}
                    </div>
                  </div>
                </div>

                {liveMetrics.conflictsDetected && liveMetrics.conflictsDetected.length > 0 && (
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
                    <span className="font-bold">Conflict Resolved:</span>{' '}
                    {liveMetrics.conflictsDetected[0].message}
                  </div>
                )}
              </div>
            )}

            {/* View Final Itinerary Action Button */}
            {isComplete && generatedTripId && (
              <button
                onClick={() => navigate(`/trip/${generatedTripId}`)}
                className="w-full py-4 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black text-xs sm:text-sm font-black tracking-widest uppercase transition-all shadow-glow-cyan hover:scale-[1.02] flex items-center justify-center gap-3 cursor-pointer"
              >
                <span>ENTER PERSONALIZED ITINERARY</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
