import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { tripService, executionService, pdfService } from '../services/index.js';
import { DayTimeline } from '../components/itinerary/DayTimeline.jsx';
import { RouteMap } from '../components/itinerary/RouteMap.jsx';
import { BudgetView } from '../components/budget/BudgetView.jsx';
import { TransportView } from '../components/transport/TransportView.jsx';
import { resolveExactPlaceImage } from '../components/globe/destinationImages.js';
import {
  Map,
  DollarSign,
  Plane,
  Hotel,
  Sun,
  ShieldAlert,
  Calendar,
  Share2,
  Download,
  FileText,
  AlertTriangle,
  Sparkles,
  CheckCircle,
  Clock,
  Car,
  Compass,
  RefreshCw,
  Zap,
  X,
  Send,
  CloudRain,
  Building,
  ArrowRight,
} from 'lucide-react';

export function TripDetailsPage({ onTriggerDelaySim }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingSuccess = searchParams.get('booking');
  const pnrParam = searchParams.get('pnr');
  const flightParam = searchParams.get('flight');
  const hotelRefParam = searchParams.get('hotelRef');
  const hotelNameParam = searchParams.get('hotelName');
  const [bookingNoticeDismissed, setBookingNoticeDismissed] = useState(false);
  const [pdfDownloadNotice, setPdfDownloadNotice] = useState(false);

  const [trip, setTrip] = useState(null);
  const [activeTab, setActiveTab] = useState(
    bookingSuccess === 'flight_success'
      ? 'transport'
      : bookingSuccess === 'hotel_success'
      ? 'hotel'
      : 'itinerary'
  );
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [packingList, setPackingList] = useState([]);

  // Dynamic Replanning State
  const [isReplanModalOpen, setIsReplanModalOpen] = useState(false);
  const [isReplanning, setIsReplanning] = useState(false);
  const [replanSuccessMessage, setReplanSuccessMessage] = useState(null);
  const [customDisruption, setCustomDisruption] = useState('');

  useEffect(() => {
    if (!id) return;
    tripService.getTripById(id).then((data) => {
      let finalTrip = data;
      if (finalTrip) {
        if (bookingSuccess === 'full_success' || (pnrParam && hotelRefParam)) {
          finalTrip = {
            ...finalTrip,
            transport: {
              ...finalTrip.transport,
              flight: {
                ...finalTrip.transport?.flight,
                pnr: pnrParam || finalTrip.transport?.flight?.pnr || 'DEMO-QP1591',
                status: 'Confirmed (AI Agent)',
                flightNumber: flightParam || finalTrip.transport?.flight?.flightNumber || 'DEMO-AIR',
              },
            },
            hotel: {
              ...finalTrip.hotel,
              bookingReference: hotelRefParam || finalTrip.hotel?.bookingReference || 'HT-DEMO-CONFIRMED',
              bookingStatus: 'Confirmed (AI Agent)',
              name: hotelNameParam || finalTrip.hotel?.name,
            },
          };
        } else if (bookingSuccess === 'flight_success' && pnrParam) {
          finalTrip = {
            ...finalTrip,
            transport: {
              ...finalTrip.transport,
              flight: {
                ...finalTrip.transport?.flight,
                pnr: pnrParam,
                status: 'Confirmed (Demo)',
                flightNumber: flightParam || finalTrip.transport?.flight?.flightNumber || 'DEMO-AIR',
              },
            },
          };
        } else if (bookingSuccess === 'hotel_success' && hotelRefParam) {
          finalTrip = {
            ...finalTrip,
            hotel: {
              ...finalTrip.hotel,
              bookingReference: hotelRefParam,
              bookingStatus: 'Confirmed (Demo)',
              name: hotelNameParam || finalTrip.hotel?.name,
            },
          };
        }
      }
      setTrip(finalTrip);
      if (finalTrip?.packingList) {
        setPackingList(finalTrip.packingList);
      }
      if (finalTrip?.days?.[0]?.activities?.[0]) {
        setSelectedActivity(finalTrip.days[0].activities[0]);
      }
    });
  }, [id, bookingSuccess, pnrParam, flightParam, hotelRefParam, hotelNameParam]);

  if (!trip) {
    return (
      <div className="min-h-screen bg-space-950 flex items-center justify-center text-slate-400 font-mono text-sm">
        Loading itinerary and satellite coordinates...
      </div>
    );
  }

  const currentDay = trip.days?.[activeDayIndex] || trip.days?.[0] || { activities: [] };
  const activeActivities = currentDay?.activities || [];

  const handleTogglePackItem = (packId) => {
    setPackingList((prev) =>
      prev.map((item) =>
        item.id === packId ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleExecuteReplan = async (conditionText, disruptionType = 'custom') => {
    setIsReplanning(true);
    try {
      const updated = await tripService.applyReplan(trip.id, conditionText, disruptionType);
      if (updated) {
        setTrip(updated);
        setReplanSuccessMessage({
          condition: conditionText,
          summary: updated.replanHistory?.[updated.replanHistory.length - 1]?.summary ||
            `Successfully re-synchronized itinerary for: '${conditionText}'.`,
          adaptations: updated.replanHistory?.[updated.replanHistory.length - 1]?.adaptations || [
            'Adjusted Day 1 arrival buffer to accommodate transit timing.',
            'Preserved evening reservations and balanced daily pacing.',
          ],
        });
        if (updated.days?.[0]?.activities?.[0]) {
          setSelectedActivity(updated.days[0].activities[0]);
        }
      }
    } catch (err) {
      console.error('Dynamic replan failed:', err);
    } finally {
      setIsReplanning(false);
      setIsReplanModalOpen(false);
      setCustomDisruption('');
    }
  };

  const handleDownloadPDF = () => {
    if (!trip) return;
    try {
      pdfService.downloadTripPDF(trip, 'plan.pdf');
      setPdfDownloadNotice(true);
      setTimeout(() => setPdfDownloadNotice(false), 5000);
    } catch (err) {
      console.error('PDF generation error:', err);
    }
  };

  const tabs = [
    { id: 'itinerary', label: 'ITINERARY & MAP', icon: Map },
    { id: 'budget', label: 'BUDGET & EXPENSES', icon: DollarSign },
    { id: 'transport', label: 'FLIGHTS & TRANSIT', icon: Plane },
    { id: 'hotel', label: 'BOUTIQUE STAY', icon: Hotel },
    { id: 'packing', label: 'WEATHER & PACKING', icon: Sun },
    { id: 'emergency', label: 'SAFETY & EMERGENCY', icon: ShieldAlert },
  ];

  const hasConfirmedBookings = bookingSuccess === 'full_success' || Boolean(trip?.transport?.flight?.pnr && trip?.hotel?.bookingReference) || Boolean(pnrParam && hotelRefParam);

  return (
    <div className="min-h-screen bg-space-950 font-sans pb-20">
      {/* Editorial Trip Hero Banner */}
      <div className="relative h-80 sm:h-96 w-full overflow-hidden border-b border-white/10">
        <img
          src={
            trip.coverImage && !trip.coverImage.includes('photo-1512343879784')
              ? trip.coverImage
              : (resolveExactPlaceImage(trip.destinationName) || trip.coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1600&q=80')
          }
          alt={trip.title}
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-space-950 via-space-950/60 to-black/30" />

        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="max-w-3xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-cyan-400 uppercase font-mono">
                <Compass className="w-4 h-4 text-cyan-400" />
                <span>{trip.destinationName}</span>
                <span className="text-white/30">•</span>
                <span>{trip.tripStyle}</span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight font-sans leading-tight">
                {trip.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-300 pt-1">
                <span>{trip.durationDays || trip.days?.length || 4} Days</span>
                <span>•</span>
                <span>{trip.travelers || 2} Travelers</span>
                <span>•</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>LangGraph Autonomous Plan</span>
                </span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Prominent PDF Download Button */}
              <button
                onClick={handleDownloadPDF}
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-black border border-emerald-300 text-xs font-black tracking-widest uppercase transition-all duration-300 shadow-xl flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
                title="Download complete trip itinerary as plan.pdf"
              >
                <FileText className="w-4 h-4 text-black" />
                <span>DOWNLOAD PLAN (.PDF)</span>
              </button>

              {/* Dynamic Replanning Trigger */}
              <button
                onClick={() => setIsReplanModalOpen(true)}
                className="px-4 py-2.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/50 text-amber-300 hover:text-white hover:bg-amber-500 text-xs font-bold font-mono uppercase transition-all duration-300 flex items-center gap-2 shadow-lg cursor-pointer"
                title="Launch Dynamic Replanning Engine"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>DYNAMIC REPLANNING</span>
              </button>

              <button
                onClick={() => executionService.downloadICS(trip)}
                className="px-5 py-2.5 rounded-full bg-cyan-500 text-white border border-cyan-400 text-xs font-black tracking-widest uppercase transition-all duration-300 hover:bg-white hover:text-black hover:border-white shadow-xl flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>ADD TO CALENDAR (.ICS)</span>
              </button>

              <button
                onClick={() => navigate('/execution')}
                className="px-5 py-2.5 rounded-full bg-black/60 border border-white/20 text-white text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:bg-white hover:text-black hover:border-white cursor-pointer"
              >
                <span>EXECUTION CENTER</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Booking Confirmation Banners */}
      {!bookingNoticeDismissed && hasConfirmedBookings && (
        <div className="bg-gradient-to-r from-cyan-950/95 via-space-900 to-emerald-950/95 border-b border-cyan-400/50 py-4 px-4 sm:px-8 shadow-2xl animate-fade-in">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shrink-0">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                  <span>🤖 100% Autonomous AI Agent Execution Complete</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] border border-emerald-500/30">Zero Human Intervention</span>
                </div>
                <div className="text-sm font-bold text-white font-sans mt-0.5">
                  Flight Reserved (PNR: {pnrParam || trip.transport?.flight?.pnr || 'CONFIRMED'}) • Cheapest Stay Reserved ({hotelNameParam || trip.hotel?.name || 'Hotel'} • Ref: {hotelRefParam || trip.hotel?.bookingReference || 'CONFIRMED'})
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDownloadPDF}
                className="px-4 py-2 rounded-full bg-emerald-400 hover:bg-emerald-300 text-black font-black text-xs uppercase tracking-wider font-mono transition-all shadow cursor-pointer flex items-center gap-1.5 hover:scale-105"
                title="Download plan.pdf"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download plan.pdf</span>
              </button>
              <button
                onClick={() => setBookingNoticeDismissed(true)}
                className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider font-mono transition-all cursor-pointer"
              >
                Explore Final Itinerary
              </button>
              <button
                onClick={() => setBookingNoticeDismissed(true)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {!bookingNoticeDismissed && bookingSuccess === 'flight_success' && (
        <div className="bg-gradient-to-r from-emerald-950/90 via-space-900 to-emerald-950/90 border-b border-emerald-500/40 py-4 px-4 sm:px-8 shadow-2xl animate-fade-in">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                  ✓ Flight Booking Completed (Demo)
                </div>
                <div className="text-sm font-bold text-white font-sans">
                  {trip.origin || trip.transport?.flight?.origin || 'Departure'} → {trip.destinationName || trip.transport?.flight?.destination || 'Destination'}
                  {pnrParam ? ` • Booking Reference: ${pnrParam}` : ''}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setBookingNoticeDismissed(true);
                  setActiveTab('itinerary');
                }}
                className="px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider font-mono transition-all shadow cursor-pointer"
              >
                Continue Trip Planning
              </button>
              <button
                onClick={() => setBookingNoticeDismissed(true)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {!bookingNoticeDismissed && bookingSuccess === 'hotel_success' && (
        <div className="bg-gradient-to-r from-purple-950/90 via-space-900 to-purple-950/90 border-b border-purple-500/40 py-4 px-4 sm:px-8 shadow-2xl animate-fade-in">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-400 shrink-0">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider">
                  ✓ Demo Hotel Booking Confirmed
                </div>
                <div className="text-sm font-bold text-white font-sans">
                  {hotelNameParam || trip.hotel?.name || 'Curated Boutique Stay'} in {trip.destinationName}
                  {hotelRefParam ? ` • Booking Reference: ${hotelRefParam}` : ''}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setBookingNoticeDismissed(true);
                  setActiveTab('itinerary');
                }}
                className="px-4 py-2 rounded-full bg-purple-500 hover:bg-purple-400 text-white font-black text-xs uppercase tracking-wider font-mono transition-all shadow cursor-pointer"
              >
                Continue Trip Planning
              </button>
              <button
                onClick={() => setBookingNoticeDismissed(true)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Replanning Alert Banner (If replanned) */}
      {replanSuccessMessage && (
        <div className="bg-gradient-to-r from-amber-950/80 via-space-900 to-amber-950/80 border-b border-amber-500/30 py-3.5 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto flex items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider">
                  LANGGRAPH DYNAMIC REPLAN ADAPTATION APPLIED
                </div>
                <div className="text-xs text-slate-200 font-sans">
                  {replanSuccessMessage.summary}
                </div>
              </div>
            </div>
            <button
              onClick={() => setReplanSuccessMessage(null)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="sticky top-20 z-40 bg-black/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto py-3 no-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase transition-all duration-300 shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-white text-black shadow-lg border border-white'
                      : 'bg-black/60 text-slate-300 border border-white/15 hover:bg-white hover:text-black hover:border-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Tab Content View */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* TAB 1: ITINERARY & SYNCHRONIZED MAP */}
        {activeTab === 'itinerary' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Timeline (7 cols) */}
            <div className="lg:col-span-7">
              <DayTimeline
                days={trip.days || []}
                activeDayIndex={activeDayIndex}
                onSelectDay={(idx) => {
                  setActiveDayIndex(idx);
                  if (trip.days?.[idx]?.activities?.[0]) {
                    setSelectedActivity(trip.days[idx].activities[0]);
                  }
                }}
                onSelectActivity={(act) => setSelectedActivity(act)}
                selectedActivityId={selectedActivity?.id}
              />
            </div>

            {/* Right Column: Sticky Leaflet Map (5 cols) */}
            <div className="lg:col-span-5 lg:sticky lg:top-36 space-y-4">
              <RouteMap
                activities={activeActivities}
                selectedActivity={selectedActivity}
                onSelectActivity={(act) => setSelectedActivity(act)}
                className="h-[520px]"
              />

              {/* Selected Activity Pin Detail Card */}
              {selectedActivity && (
                <div className="p-4 rounded-2xl bg-space-900/80 border border-white/10 backdrop-blur-md text-xs">
                  <div className="flex items-center justify-between text-[10px] font-mono text-cyan-400 font-bold uppercase mb-1">
                    <span>ACTIVE WAYPOINT</span>
                    <span>{selectedActivity.time}</span>
                  </div>
                  <div className="font-bold text-white text-sm mb-1">
                    {selectedActivity.title}
                  </div>
                  <div className="text-slate-300 line-clamp-2">
                    {selectedActivity.description}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: BUDGET VIEW */}
        {activeTab === 'budget' && (
          <BudgetView budget={trip.budget} />
        )}

        {/* TAB 3: TRANSPORT VIEW */}
        {activeTab === 'transport' && (
          <TransportView
            transport={trip.transport}
            onTriggerDelaySim={() => handleExecuteReplan('Flight arrival delayed by 3.5 hours', 'flight_delay')}
          />
        )}

        {/* TAB 4: HOTEL & STAY VIEW */}
        {activeTab === 'hotel' && trip.hotel && (
          <div className="space-y-8">
            <div className="relative rounded-3xl overflow-hidden border border-white/15 bg-space-900 shadow-2xl">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                <div className="lg:col-span-5 relative min-h-[300px]">
                  <img
                    src={trip.hotel.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'}
                    alt={trip.hotel.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-space-950 via-transparent to-transparent lg:hidden" />
                </div>

                <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold tracking-widest text-cyan-400 uppercase font-mono mb-2">
                        CURATED BOUTIQUE STAY
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight font-sans mb-2">
                        {trip.hotel.name}
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-300 font-sans">
                        {trip.hotel.address}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 self-start">
                      <a
                        href={
                          trip.hotel.portalUrl ||
                          `http://localhost:5175/?destination=${encodeURIComponent(trip.destinationName || 'Paris')}&checkinDate=${encodeURIComponent(trip.startDate || '2026-10-10')}&checkoutDate=${encodeURIComponent(trip.endDate || '2026-10-14')}&guests=${trip.travelers || 2}&tripId=${trip.id}&returnUrl=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : 'http://localhost:5173')}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold tracking-wider uppercase transition-all shadow-md hover:scale-105"
                      >
                        <Hotel className="w-3.5 h-3.5" />
                        <span>BOOK HOTEL (DEMO) ↗</span>
                      </a>
                      <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        {trip.hotel.bookingStatus || 'CONFIRMED (AI AGENT)'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/10 text-xs font-mono">
                    <div>
                      <div className="text-slate-500 uppercase text-[10px]">CHECK-IN</div>
                      <div className="font-bold text-white">{trip.hotel.checkIn || '14:00'}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 uppercase text-[10px]">CHECK-OUT</div>
                      <div className="font-bold text-white">{trip.hotel.checkOut || '11:00'}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 uppercase text-[10px]">ROOM TYPE</div>
                      <div className="font-bold text-cyan-300 truncate">{trip.hotel.roomType || 'Deluxe Suite'}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 uppercase text-[10px]">BOOKING REF</div>
                      <div className="font-bold text-cyan-400 truncate">
                        {trip.hotel.bookingReference || hotelRefParam || 'HT-DEMO-CONFIRMED'}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-mono uppercase text-slate-400 font-bold">
                      PROPERTY AMENITIES
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(trip.hotel.amenities || ['Scenic View', 'Wi-Fi', 'Breakfast']).map((amenity) => (
                        <span
                          key={amenity}
                          className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-200 text-xs font-medium"
                        >
                          ✦ {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: WEATHER & PACKING CHECKLIST */}
        {activeTab === 'packing' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Weather Forecast */}
            <div className="p-6 sm:p-8 rounded-3xl bg-space-900/60 border border-white/10 space-y-6">
              <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-cyan-400 uppercase font-mono">
                <Sun className="w-4 h-4 text-cyan-400" />
                <span>METEOROLOGICAL TELEMETRY</span>
              </div>
              <h3 className="text-xl font-black text-white uppercase font-sans">
                {trip.weather?.condition || 'Optimal Exploration Conditions'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {trip.weather?.advisory || `Typical daytime temperatures average ${trip.weather?.typicalRange || '24°C'} with favorable touring atmosphere.`}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                {['Day 1', 'Day 2', 'Day 3', 'Day 4'].map((d, i) => (
                  <div key={d} className="p-3 rounded-2xl bg-white/5 border border-white/5">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">{d}</div>
                    <div className="text-lg font-bold text-amber-400 my-1">
                      {trip.weather?.tempC ? trip.weather.tempC + (i % 2) : 24 + i}°C
                    </div>
                    <div className="text-[10px] text-slate-300">
                      {trip.weather?.condition ? trip.weather.condition.split('&')[0] : 'Clear'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Packing Checklist */}
            <div className="p-6 sm:p-8 rounded-3xl bg-space-900/60 border border-white/10 space-y-6">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold tracking-widest text-cyan-400 uppercase font-mono">
                  PACKING CHECKLIST
                </div>
                <div className="text-xs font-mono text-slate-400">
                  {packingList.filter((p) => p.checked).length} of {packingList.length} packed
                </div>
              </div>

              <div className="space-y-3">
                {packingList.map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center gap-3 p-3.5 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => handleTogglePackItem(item.id)}
                      className="w-4 h-4 rounded text-cyan-500 bg-space-950 border-white/20 focus:ring-0 cursor-pointer"
                    />
                    <span
                      className={`text-xs font-sans flex-1 ${
                        item.checked ? 'line-through text-slate-500' : 'text-slate-200'
                      }`}
                    >
                      {item.item}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 uppercase">
                      {item.category}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: SAFETY & EMERGENCY DIRECTORY */}
        {activeTab === 'emergency' && trip.emergencyContacts && (
          <div className="max-w-3xl space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-space-900/60 border border-white/10 space-y-6">
              <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-rose-400 uppercase font-mono">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>SAFETY PROTOCOLS & EMERGENCY DIRECTORY</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {trip.emergencyContacts.map((contact) => (
                  <div
                    key={contact.role}
                    className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1"
                  >
                    <div className="text-xs text-slate-400 font-sans">{contact.role}</div>
                    <div className="text-base font-bold text-white font-mono">{contact.number}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dynamic Replanning Interactive Modal */}
      {isReplanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-xl bg-space-900 border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-scale-up">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-black text-white uppercase tracking-wider font-sans">
                  DYNAMIC REPLANNING SIMULATOR
                </h3>
              </div>
              <button
                onClick={() => setIsReplanModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              Trigger real-world condition changes. Our LangGraph Replanning Agent will dynamically re-evaluate constraints, mitigate conflicts, shift activity times, and preserve reservations.
            </p>

            <div className="space-y-2.5">
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                SELECT CONDITION CHANGE SCENARIO:
              </div>

              <button
                onClick={() => handleExecuteReplan('Flight delayed by 3 hours on arrival', 'flight_delay')}
                disabled={isReplanning}
                className="w-full p-3.5 rounded-2xl bg-white/5 hover:bg-amber-500/20 border border-white/10 hover:border-amber-400/40 text-left transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Plane className="w-4 h-4 text-amber-400" />
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-amber-300">
                      Flight / Transit Delay (+3 Hours)
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Shifts arrival check-in and re-clusters Day 1 activities.
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-400" />
              </button>

              <button
                onClick={() => handleExecuteReplan('Severe rainstorm forecasted; outdoor trail risk', 'weather_alert')}
                disabled={isReplanning}
                className="w-full p-3.5 rounded-2xl bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-400/40 text-left transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <CloudRain className="w-4 h-4 text-cyan-400" />
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-cyan-300">
                      Severe Weather / Storm Alert
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Swaps outdoor trails for indoor galleries and covered cultural spaces.
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-400" />
              </button>

              <button
                onClick={() => handleExecuteReplan('Key attraction closed for unexpected maintenance', 'attraction_closure')}
                disabled={isReplanning}
                className="w-full p-3.5 rounded-2xl bg-white/5 hover:bg-purple-500/20 border border-white/10 hover:border-purple-400/40 text-left transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Building className="w-4 h-4 text-purple-400" />
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-purple-300">
                      Attraction Closure
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Substitutes landmark with nearby verified cultural spot.
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-400" />
              </button>

              <button
                onClick={() => handleExecuteReplan('Budget reduction requested by 20%', 'budget_cut')}
                disabled={isReplanning}
                className="w-full p-3.5 rounded-2xl bg-white/5 hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-400/40 text-left transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-emerald-300">
                      Budget Optimization (-20% Spend)
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Re-allocates dining and transit to value-tier options.
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-400" />
              </button>
            </div>

            {/* Custom Disruption Input */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                OR SPECIFY CUSTOM DISRUPTION:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customDisruption}
                  onChange={(e) => setCustomDisruption(e.target.value)}
                  placeholder="e.g. Early morning mountain fog or train reschedule..."
                  className="flex-1 bg-space-950 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-sans"
                />
                <button
                  type="button"
                  onClick={() => customDisruption.trim() && handleExecuteReplan(customDisruption.trim(), 'custom')}
                  disabled={!customDisruption.trim() || isReplanning}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold text-xs font-mono uppercase flex items-center gap-1.5 cursor-pointer"
                >
                  {isReplanning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>REPLAN</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PDF Download Success Notification Toast */}
      {pdfDownloadNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-space-900 border border-emerald-400/80 rounded-2xl p-4 shadow-2xl flex items-center gap-3 animate-fade-in text-xs font-mono backdrop-blur-md">
          <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-white text-sm">plan.pdf Downloaded</div>
            <div className="text-slate-400 text-[11px]">Saved to your browser's download bar for this trip</div>
          </div>
          <button
            onClick={() => setPdfDownloadNotice(false)}
            className="text-slate-400 hover:text-white ml-2 p-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
