import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Layers, Navigation, ZoomIn, ZoomOut } from 'lucide-react';

export function RouteMap({
  activities = [],
  selectedActivity,
  onSelectActivity,
  className = '',
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const polylineRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Leaflet Map once
    if (!mapInstanceRef.current) {
      const initialCenter = activities[0]?.lat && activities[0]?.lng
        ? [activities[0].lat, activities[0].lng]
        : [20.5937, 78.9629];

      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView(initialCenter, 11);

      const rawCartoKey = import.meta.env.VITE_CARTO_API_KEY || '';
      const cartoKey = String(rawCartoKey).trim().replace(/^["']|["']$/g, '');
      const rawMapTilerKey = import.meta.env.VITE_MAPTILER_API_KEY || '';
      const mapTilerKey = String(rawMapTilerKey).trim().replace(/^["']|["']$/g, '');

      // Seamless tile provider: uses MapTiler dark layer (active in .env) or Esri Dark Gray (no watermark)
      let tileUrl = '';
      let subdomains = 'abc';

      if (mapTilerKey) {
        tileUrl = `https://api.maptiler.com/maps/basic-v2-dark/{z}/{x}/{y}.png?key=${encodeURIComponent(mapTilerKey)}`;
      } else if (cartoKey) {
        tileUrl = `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?key=${encodeURIComponent(cartoKey)}`;
        subdomains = 'abcd';
      } else {
        tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';
      }

      L.tileLayer(tileUrl, {
        maxZoom: 19,
        subdomains: subdomains,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear old markers and polyline
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    if (activities.length === 0) return;

    const latLngs = [];

    // Add numbered circular markers
    activities.forEach((act, idx) => {
      if (act.lat && act.lng) {
        const isSelected = selectedActivity && selectedActivity.id === act.id;
        latLngs.push([act.lat, act.lng]);

        const customIcon = L.divIcon({
          className: 'custom-leaflet-marker',
          html: `
            <div style="
              width: 32px;
              height: 32px;
              border-radius: 50%;
              background: ${isSelected ? '#00f0ff' : '#0f172a'};
              border: 2px solid ${isSelected ? '#ffffff' : '#06b6d4'};
              color: ${isSelected ? '#030712' : '#ffffff'};
              display: flex;
              align-items: center;
              justify-content: center;
              font-family: 'JetBrains Mono', monospace;
              font-size: 11px;
              font-weight: 800;
              box-shadow: 0 0 16px ${isSelected ? 'rgba(0, 240, 255, 0.8)' : 'rgba(6, 182, 212, 0.4)'};
              cursor: pointer;
              transition: all 0.3s ease;
            ">
              ${idx + 1}
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([act.lat, act.lng], { icon: customIcon }).addTo(map);
        marker.bindPopup(`
          <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px;">
            <div style="font-size: 10px; color: #06b6d4; font-family: monospace; font-weight: bold; text-transform: uppercase;">
              ${act.time} • ${act.category}
            </div>
            <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin: 2px 0;">
              ${act.title}
            </div>
            <div style="font-size: 11px; color: #475569;">
              ${act.location}
            </div>
          </div>
        `);

        marker.on('click', () => {
          if (onSelectActivity) onSelectActivity(act);
        });

        markersRef.current.push(marker);
      }
    });

    // Draw route polyline with cyan neon glow
    if (latLngs.length > 1) {
      polylineRef.current = L.polyline(latLngs, {
        color: '#06b6d4',
        weight: 3.5,
        opacity: 0.85,
        dashArray: '8, 8',
      }).addTo(map);
    }

    // Fit bounds to show all markers
    if (latLngs.length > 0) {
      map.fitBounds(latLngs, { padding: [40, 40], maxZoom: 13 });
    }
  }, [activities]);

  // Center on selected activity when clicked in timeline
  useEffect(() => {
    if (mapInstanceRef.current && selectedActivity?.lat && selectedActivity?.lng) {
      mapInstanceRef.current.flyTo(
        [selectedActivity.lat, selectedActivity.lng],
        13.5,
        { duration: 1.2 }
      );
    }
  }, [selectedActivity]);

  const handleZoom = (type) => {
    if (!mapInstanceRef.current) return;
    if (type === 'in') mapInstanceRef.current.zoomIn();
    if (type === 'out') mapInstanceRef.current.zoomOut();
  };

  const handleResetBounds = () => {
    if (!mapInstanceRef.current || activities.length === 0) return;
    const latLngs = activities.map((a) => [a.lat, a.lng]).filter((ll) => ll[0] && ll[1]);
    if (latLngs.length > 0) {
      mapInstanceRef.current.fitBounds(latLngs, { padding: [40, 40] });
    }
  };

  return (
    <div className={`relative rounded-3xl overflow-hidden border border-white/15 shadow-2xl bg-space-950 ${className}`}>
      {/* Leaflet DOM container */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[380px]" />

      {/* Floating Map Controls Top-Right */}
      <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2">
        <button
          onClick={handleResetBounds}
          className="w-9 h-9 rounded-xl bg-space-950/80 backdrop-blur-md border border-white/20 text-slate-200 hover:text-white flex items-center justify-center transition-all hover:scale-105 shadow-lg"
          title="Fit Route Bounds"
        >
          <Navigation className="w-4 h-4 text-cyan-400" />
        </button>

        <div className="flex flex-col rounded-xl bg-space-950/80 backdrop-blur-md border border-white/20 overflow-hidden shadow-lg">
          <button
            onClick={() => handleZoom('in')}
            className="w-9 h-8 text-slate-200 hover:text-white flex items-center justify-center border-b border-white/10 hover:bg-white/10"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleZoom('out')}
            className="w-9 h-8 text-slate-200 hover:text-white flex items-center justify-center hover:bg-white/10"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Map Route Header Pill Top-Left */}
      <div className="absolute top-4 left-4 z-[400] bg-space-950/80 backdrop-blur-md border border-white/15 px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-mono text-slate-300">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
        <span className="font-bold text-white uppercase">SYNCHRONIZED ROUTE</span>
        <span className="text-white/30">•</span>
        <span>{activities.length} PINS</span>
      </div>
    </div>
  );
}
