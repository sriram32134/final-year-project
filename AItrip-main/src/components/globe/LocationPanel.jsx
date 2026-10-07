import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  MapPin,
  Sparkles,
  Compass,
  Sun,
  Calendar,
  DollarSign,
  ArrowRight,
  ChevronRight,
  Coins,
  Globe2,
  Navigation,
  Star,
} from 'lucide-react';
import { DestinationImage } from '../common/DestinationImage.jsx';
import { getNearbyPlaces } from '../../services/locationResolverService.js';

export function LocationPanel({
  currentLevel = 'world', // 'world' | 'country' | 'city' | 'destination'
  selectedCountry = null,
  selectedCity = null,
  selectedAttraction = null,
  countryCities = [],
  cityAttractions = [],
  onSelectCity,
  onSelectAttraction,
  onClose,
  onOpenFullDetail,
}) {
  const navigate = useNavigate();
  const [nearbyPlaces, setNearbyPlaces] = useState([]);

  // Determine what to display: Attraction > City > Country
  const isAttraction = Boolean(selectedAttraction);
  const isCity = !isAttraction && Boolean(selectedCity);
  const isCountry = !isAttraction && !isCity && Boolean(selectedCountry);
  const displayItem = selectedAttraction || selectedCity || selectedCountry;

  // Fetch nearby places around target coordinates
  useEffect(() => {
    let isMounted = true;
    const lat = Number(displayItem?.lat ?? displayItem?.latitude);
    const lng = Number(displayItem?.lng ?? displayItem?.longitude);

    if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
      getNearbyPlaces(lat, lng, displayItem?.name, 4)
        .then((places) => {
          if (isMounted) {
            setNearbyPlaces(places || []);
          }
        })
        .catch(() => {});
    }

    return () => {
      isMounted = false;
    };
  }, [displayItem?.name, displayItem?.lat, displayItem?.latitude, displayItem?.lng, displayItem?.longitude]);

  // If at world level or no selection, do not render panel
  if (currentLevel === 'world' || (!selectedCountry && !selectedCity)) return null;

  const handlePlanTrip = (item) => {
    const destName = item.name;
    const country = item.country || item.countryName || (isCountry ? item.name : 'Global');
    const lat = Number(item.lat ?? item.latitude) || 20.0;
    const lng = Number(item.lng ?? item.longitude) || 78.0;

    navigate(`/planner?destination=${encodeURIComponent(destName)}&autoStart=true`, {
      state: {
        destinationItem: {
          name: destName,
          country: country,
          region: item.region || item.state,
          latitude: lat,
          longitude: lng,
          image: item.image || item.cityImage || item.countryImage,
          type: item.type || (isCountry ? 'country' : 'city'),
          travelStyle: item.travelStyle,
          startingBudget: item.startingBudget,
          shortDescription: item.shortDescription || item.description,
        },
      },
    });
  };

  // Resolve 3-level images with individual fallback and focal point
  const heroSrc = isAttraction
    ? (displayItem.attractionImage || displayItem.image)
    : isCity
    ? (displayItem.cityImage || displayItem.image)
    : (displayItem.countryImage || displayItem.image);

  const fallbackSrc = displayItem.fallbackImage || null;
  const objectPosition = displayItem.objectPosition || 'center';

  return (
    <div
      className="absolute top-4 left-4 bottom-4 z-40 w-[calc(100%-2rem)] sm:w-[420px] max-w-md bg-[#0a0f1d]/95 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-[0_24px_70px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden animate-slide-right font-sans select-none pointer-events-auto"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onPointerMove={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
    >
      {/* 1. Header Hero Banner with Guaranteed Aspect Ratio & Robust Fallback */}
      <div className="relative w-full shrink-0 overflow-hidden bg-slate-950">
        <DestinationImage
          src={heroSrc}
          alt={displayItem.name}
          fallbackSrc={fallbackSrc}
          objectPosition={objectPosition}
          aspectRatio="aspect-[16/10]"
          className="w-full"
        />

        {/* Top Controls: Eyebrow badge + Close Button */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-20 pointer-events-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/80 border border-white/20 text-white text-[10px] font-mono tracking-wider backdrop-blur-md shadow-lg">
            <span className={`w-2 h-2 rounded-full ${displayItem?.isGlobalResolved ? 'bg-purple-400' : 'bg-cyan-400'} animate-pulse`} />
            <span className="font-semibold text-cyan-300 uppercase">
              {displayItem?.isGlobalResolved && 'RESOLVED DESTINATION'}
              {!displayItem?.isGlobalResolved && isCountry && 'COUNTRY OVERVIEW'}
              {!displayItem?.isGlobalResolved && isCity && 'CITY EXPLORER'}
              {!displayItem?.isGlobalResolved && isAttraction && 'ATTRACTION INTEL'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/80 hover:bg-white hover:text-black text-white border border-white/20 flex items-center justify-center transition-all cursor-pointer shadow-lg"
            title="Close Panel"
            aria-label="Close Panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom Title Overlay */}
        <div className="absolute bottom-3 left-4 right-4 z-20 pointer-events-none">
          <div className="flex items-center gap-2 text-[11px] font-mono text-cyan-300 font-medium tracking-wide mb-1">
            {selectedCountry?.flag && <span className="text-sm">{selectedCountry.flag}</span>}
            <span>
              {isCountry && `${selectedCountry.code || 'GL'} • ${selectedCountry.region || 'GLOBAL'}`}
              {isCity && `${selectedCity.country?.toUpperCase() || selectedCountry?.name?.toUpperCase()}`}
              {isAttraction && `${selectedAttraction.cityName?.toUpperCase() || selectedCity?.name?.toUpperCase()} • ${selectedAttraction.countryName?.toUpperCase() || selectedCountry?.name?.toUpperCase()}`}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase drop-shadow-md">
            {displayItem.name}
          </h2>
          {displayItem.latitude && displayItem.longitude && (
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-300 drop-shadow">
              <Navigation className="w-3 h-3 text-cyan-400" />
              <span>{Number(displayItem.latitude).toFixed(2)}°N, {Number(displayItem.longitude).toFixed(2)}°E</span>
              {displayItem.googleMapsUri && (
                <a
                  href={displayItem.googleMapsUri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pointer-events-auto ml-1 text-cyan-300 hover:text-white underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  View on Google
                </a>
              )}
            </div>
          )}
          {displayItem.photoAttributions && displayItem.photoAttributions.length > 0 && (
            <div className="text-[9px] font-mono text-slate-300/80 drop-shadow flex items-center gap-1 mt-0.5 pointer-events-auto">
              <span>Photo ©</span>
              {displayItem.photoAttributions[0].uri ? (
                <a
                  href={displayItem.photoAttributions[0].uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-300 underline hover:text-white"
                  onClick={(e) => e.stopPropagation()}
                >
                  {displayItem.photoAttributions[0].displayName || 'Google Contributor'}
                </a>
              ) : (
                <span>{displayItem.photoAttributions[0].displayName || 'Google Contributor'}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2. Structured Scrollable Body with Balanced Spacing */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">

        {/* Tagline / Subtitle if available */}
        {displayItem.tagline && (
          <p className="text-xs sm:text-sm font-medium text-cyan-200/90 italic leading-snug border-l-2 border-cyan-400 pl-3 py-0.5">
            "{displayItem.tagline}"
          </p>
        )}

        {/* Description with readable line-height */}
        <div className="space-y-1">
          <div className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-semibold">
            ABOUT {displayItem.name.toUpperCase()}
          </div>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans font-normal">
            {displayItem.description || displayItem.shortDescription}
          </p>
        </div>

        {/* ============================================================== */}
        {/* LEVEL 1: COUNTRY SPECIFIC STRUCTURED INFORMATION               */}
        {/* ============================================================== */}
        {isCountry && (
          <>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-2.5 min-h-[72px]">
                <Globe2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">CAPITAL</div>
                  <div className="text-xs font-semibold text-white mt-0.5 leading-snug break-words">
                    {displayItem.capital || 'Major City'}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-2.5 min-h-[72px]">
                <Coins className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">CURRENCY</div>
                  <div className="text-xs font-semibold text-white mt-0.5 leading-snug break-words">
                    {displayItem.currency || 'Local Currency'}
                  </div>
                </div>
              </div>
            </div>

            {countryCities.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-semibold flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span>POPULAR REGIONS & CITIES</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{countryCities.length} locations</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {countryCities.map((city) => (
                    <button
                      key={city.id}
                      onClick={() => onSelectCity(city)}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-400/40 text-left transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div className="truncate">
                        <div className="text-xs font-bold text-white group-hover:text-cyan-300 truncate">
                          {city.name}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {city.type || 'City'}
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ============================================================== */}
        {/* LEVEL 2: CITY SPECIFIC STRUCTURED INFORMATION                  */}
        {/* ============================================================== */}
        {isCity && (
          <>
            <div className="grid grid-cols-2 gap-2.5">
              {displayItem.weather && (
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-2.5 min-h-[76px]">
                  <Sun className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">CURRENT CLIMATE</div>
                    <div className="text-xs font-semibold text-white mt-0.5 leading-snug break-words">
                      {displayItem.weather.tempC}°C • {displayItem.weather.condition}
                    </div>
                  </div>
                </div>
              )}

              {displayItem.startingBudget && (
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-2.5 min-h-[76px]">
                  <DollarSign className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">STARTING BUDGET</div>
                    <div className="text-xs font-semibold text-emerald-400 font-mono mt-0.5 leading-snug break-words">
                      ₹{Number(displayItem.startingBudget).toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono leading-tight mt-0.5">
                      Est. / traveler
                    </div>
                  </div>
                </div>
              )}

              {displayItem.bestSeason && (
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-2.5 min-h-[76px]">
                  <Calendar className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">BEST SEASON</div>
                    <div className="text-xs font-semibold text-white mt-0.5 leading-snug break-words">
                      {displayItem.bestSeason}
                    </div>
                  </div>
                </div>
              )}

              {displayItem.travelStyle && (
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-2.5 min-h-[76px]">
                  <Compass className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">TRAVEL STYLE</div>
                    <div className="text-xs font-semibold text-slate-200 mt-0.5 leading-snug break-words">
                      {displayItem.travelStyle}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Attractions inside City */}
            {cityAttractions.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>KEY ATTRACTIONS & EXPERIENCES</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{cityAttractions.length} spots</span>
                </div>

                <div className="flex flex-col gap-2">
                  {cityAttractions.map((attraction) => (
                    <button
                      key={attraction.id}
                      onClick={() => onSelectAttraction(attraction)}
                      className="p-3 rounded-2xl bg-white/5 hover:bg-cyan-500/15 border border-white/10 hover:border-cyan-400/40 text-left transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 group-hover:scale-125 transition-transform" />
                        <div className="truncate">
                          <div className="text-xs font-bold text-white group-hover:text-cyan-300 truncate">
                            {attraction.name}
                          </div>
                          <div className="text-[10px] font-mono text-slate-400 truncate">
                            {attraction.category} • {attraction.duration || '2-3 hrs'}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ============================================================== */}
        {/* EXPLORE NEARBY PLACES (DYNAMIC REAL GEOGRAPHIC POIS)           */}
        {/* ============================================================== */}
        {nearbyPlaces.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-semibold flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-cyan-400" />
                <span>EXPLORE NEARBY PLACES</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">{nearbyPlaces.length} nearby</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {nearbyPlaces.map((poi) => (
                <div
                  key={poi.id}
                  className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-1 hover:border-cyan-400/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate max-w-[130px]">{poi.name}</span>
                    <span className="flex items-center gap-1 text-[10px] font-mono text-amber-400">
                      <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                      {poi.rating || 4.8}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-cyan-300">
                    {poi.category} • {poi.distanceKm} km away
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {displayItem.tags && displayItem.tags.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-white/10">
            <div className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-semibold">
              DESTINATION TAGS
            </div>
            <div className="flex flex-wrap gap-1.5">
              {displayItem.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-xs font-mono"
                >
                  ✦ {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* PRODUCT IDENTITY: AGENTIC AI TRIP PLANNER READY                */}
        {/* ============================================================== */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/80 via-blue-950/60 to-purple-950/40 border border-cyan-400/40 shadow-xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="text-[11px] font-mono font-bold text-cyan-300 uppercase tracking-wider">
              LANGGRAPH AGENTIC PLANNER READY
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
            Our 10 specialized AI agents (Research, Weather, Transport, Hotel, Budget, Experiences, Safety, Conflict Detector, and Optimizer) will synthesize a personalized chronological itinerary for {displayItem.name}.
          </p>
        </div>
      </div>

      {/* 3. Persistent Bottom Action Drawer Button */}
      <div className="p-4 bg-black/90 border-t border-white/15 flex items-center gap-2.5">
        <button
          onClick={() => handlePlanTrip(displayItem)}
          className="flex-1 py-3 px-4 rounded-full bg-cyan-500 hover:bg-white text-white hover:text-black text-xs font-black uppercase tracking-widest transition-all duration-300 shadow-xl flex items-center justify-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>PLAN A TRIP TO {displayItem.name.toUpperCase()}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {onOpenFullDetail && (
          <button
            onClick={() => onOpenFullDetail(displayItem)}
            className="p-3 rounded-full bg-white/10 hover:bg-white hover:text-black text-white border border-white/20 transition-all cursor-pointer"
            title="Explore Full Destination Details"
            aria-label="Explore Full Destination Details"
          >
            <Compass className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
