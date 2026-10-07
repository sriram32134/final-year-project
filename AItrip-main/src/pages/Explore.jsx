import React, { useState, useEffect } from 'react';
import { destinationService } from '../services/index.js';
import { StoryCard } from '../components/destination/VisitUsaCards.jsx';
import { DestinationDetailModal } from '../components/destination/DestinationDetailModal.jsx';
import { Search, Compass, Filter, Sparkles, MapPin, ArrowRight } from 'lucide-react';
import { searchNormalizedLocations } from '../services/locationResolverService.js';
import { useNavigate } from 'react-router-dom';

export function ExplorePage() {
  const [destinations, setDestinations] = useState([]);
  const [filteredDestinations, setFilteredDestinations] = useState([]);
  const [dynamicResults, setDynamicResults] = useState([]);
  const [isSearchingGlobal, setIsSearchingGlobal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    destinationService.getAllDestinations().then((data) => {
      setDestinations(data);
      setFilteredDestinations(data);
    });
  }, []);

  const categories = [
    { id: 'ALL', label: 'ALL DESTINATIONS' },
    { id: 'TRENDING', label: 'TRENDING ESCAPES' },
    { id: 'COASTAL', label: 'BEACHES & COASTAL' },
    { id: 'HERITAGE', label: 'HERITAGE & FORTS' },
    { id: 'ADVENTURE', label: 'ALPINE & OUTDOOR' },
    { id: 'ROMANTIC', label: 'ROMANTIC GETAWAYS' },
  ];

  useEffect(() => {
    let list = [...destinations];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (d) =>
          d?.name?.toLowerCase().includes(q) ||
          d?.country?.toLowerCase().includes(q) ||
          (Array.isArray(d?.tags) && d.tags.some((t) => t?.toLowerCase().includes(q))) ||
          d?.shortDescription?.toLowerCase().includes(q)
      );
    }

    if (activeTab === 'TRENDING') {
      list = list.filter((d) => (d?.popularScore ?? 0) >= 95);
    } else if (activeTab === 'COASTAL') {
      list = list.filter((d) => Array.isArray(d?.tags) && d.tags.some((t) => /beach|coast|sea|island/i.test(t)));
    } else if (activeTab === 'HERITAGE') {
      list = list.filter((d) => Array.isArray(d?.tags) && d.tags.some((t) => /fort|heritage|temple|castle|palace/i.test(t)));
    } else if (activeTab === 'ADVENTURE') {
      list = list.filter((d) => d?.category === 'Adventure' || (Array.isArray(d?.tags) && d.tags.some((t) => /hike|pass|trail|mountain/i.test(t))));
    } else if (activeTab === 'ROMANTIC') {
      list = list.filter((d) => d?.category === 'Romantic' || (Array.isArray(d?.tags) && d.tags.some((t) => /sunset|retreat|scenic/i.test(t))));
    }

    setFilteredDestinations(list);

    // If no local match and user typed > 2 characters, search global MapTiler atlas
    if (searchQuery.trim().length > 2 && list.length === 0) {
      let isMounted = true;
      setIsSearchingGlobal(true);
      const controller = new AbortController();

      const timer = setTimeout(async () => {
        try {
          const { global } = await searchNormalizedLocations(searchQuery.trim(), controller.signal);
          if (isMounted) {
            setDynamicResults(global || []);
            setIsSearchingGlobal(false);
          }
        } catch {
          if (isMounted) setIsSearchingGlobal(false);
        }
      }, 250);

      return () => {
        isMounted = false;
        controller.abort();
        clearTimeout(timer);
      };
    } else {
      setDynamicResults([]);
      setIsSearchingGlobal(false);
    }
  }, [searchQuery, activeTab, destinations]);

  const handleSelect = (dest) => {
    setSelectedDestination(dest);
    setModalOpen(true);
  };

  const handleSelectDynamic = (item) => {
    navigate(`/planner?destination=${encodeURIComponent(item.name)}&autoStart=true`, {
      state: {
        destinationItem: {
          name: item.name,
          country: item.country,
          region: item.region,
          latitude: item.latitude || item.lat,
          longitude: item.longitude || item.lng,
          image: item.image,
          type: item.type,
          shortDescription: item.shortDescription || item.description,
        },
      },
    });
  };

  return (
    <div className="min-h-screen bg-space-950 font-sans py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="max-w-3xl mb-12">
          <div className="text-xs font-bold tracking-[0.25em] text-cyan-400 uppercase font-mono mb-2 flex items-center gap-2">
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>GLOBAL DESTINATION DIRECTORY</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight font-sans mb-4">
            PLACES TO GO
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Search any city, coastal getaway, historic fort, or alpine solitude across Earth. Powered by MapTiler and LangGraph multi-agent AI planning.
          </p>
        </div>

        {/* Search & Category Filter Stack */}
        <div className="space-y-6 mb-12">
          {/* Search Bar */}
          <div className="max-w-xl">
            <div className="relative">
              <Search className="w-5 h-5 text-cyan-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ANY place (Munnar, Paris, Tawang, Hallstatt, Goa)..."
                className="w-full bg-space-900/80 border border-white/15 rounded-full pl-12 pr-6 py-3.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 font-sans shadow-lg"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Horizontal Filter Pills */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 no-scrollbar">
            {categories.map((cat) => {
              const isActive = activeTab === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase transition-all shrink-0 font-sans ${
                    isActive
                      ? 'bg-cyan-500 text-white shadow-glow-cyan border border-cyan-400'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Global Results if found via MapTiler */}
        {dynamicResults.length > 0 && (
          <div className="mb-10 space-y-4">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>MapTiler Global Atlas Results for "{searchQuery}"</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {dynamicResults.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-[#0a0f1d] border border-cyan-400/40 shadow-xl space-y-3 hover:border-cyan-400 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-black text-white uppercase">{item.name}</span>
                      <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-400/30">
                        {item.type || 'DESTINATION'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{item.region ? `${item.region}, ${item.country}` : item.country}</span>
                    </div>
                    {item.shortDescription && (
                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{item.shortDescription}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleSelectDynamic(item)}
                    className="w-full py-2.5 px-4 rounded-full bg-cyan-500 hover:bg-white text-white hover:text-black font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>PLAN TRIP WITH AI</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {isSearchingGlobal && (
          <div className="text-center py-12 text-slate-400 font-mono text-sm flex items-center justify-center gap-3">
            <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
            <span>Resolving "{searchQuery}" across MapTiler global atlas...</span>
          </div>
        )}

        {/* Destination Grid */}
        {filteredDestinations.length === 0 && dynamicResults.length === 0 && !isSearchingGlobal ? (
          <div className="text-center py-20 text-slate-400 font-mono text-sm">
            No destinations found matching "{searchQuery}". Try searching for Munnar, Tawang, Paris, Goa, or Hallstatt.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredDestinations.map((dest) => (
              <StoryCard
                key={dest.id}
                destination={dest}
                onSelect={handleSelect}
              />
            ))}
          </div>
        )}
      </div>

      {/* Destination Modal */}
      <DestinationDetailModal
        destination={selectedDestination}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
