import React, { useEffect, useRef } from 'react';
import { Sparkles, Layers, Plus, Minus, Compass } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default Leaflet marker icon asset paths to prevent 404 image errors in bundlers
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

/**
 * GoogleMapsView
 * 
 * High-performance Clear Interactive Map powered by Leaflet,
 * Esri World Imagery Satellite Tiles, and CARTO Voyager Labels overlay.
 * Completely free with zero Google Maps API dependency.
 */
export function GoogleMapsView({
  selectedLocation,
  curatedCities = [],
  onSelectCity,
  currentLevel = 'world',
  className = '',
}) {
  const leafletContainerRef = useRef(null);
  const leafletInstanceRef = useRef(null);
  const cityMarkersRef = useRef([]);
  const goalMarkerRef = useRef(null);

  const rawCartoApiKey = import.meta.env.VITE_CARTO_API_KEY || '';
  const cartoApiKey = String(rawCartoApiKey).trim().replace(/^["']|["']$/g, '');

  // Initialize Leaflet Map once
  useEffect(() => {
    if (!leafletContainerRef.current) return;
    if (leafletInstanceRef.current) return;

    const initialLat = selectedLocation ? Number(selectedLocation.latitude ?? selectedLocation.lat) : 20.0;
    const initialLng = selectedLocation ? Number(selectedLocation.longitude ?? selectedLocation.lng) : 78.0;
    const center = [isNaN(initialLat) ? 20.0 : initialLat, isNaN(initialLng) ? 78.0 : initialLng];
    const initialZoom = currentLevel === 'world' ? 3 : currentLevel === 'country' ? 5 : 12;

    const map = L.map(leafletContainerRef.current, {
      zoomControl: true,
      attributionControl: false,
      doubleClickZoom: true,
      scrollWheelZoom: true,
      dragging: true,
      touchZoom: true,
    }).setView(center, initialZoom);

    // 1. Esri World Imagery (Satellite Base Layer)
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 19,
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      }
    ).addTo(map);

    // 2. CARTO Voyager Labels Overlay
    const cartoUrl = cartoApiKey
      ? `https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png?key=${encodeURIComponent(cartoApiKey)}`
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png';

    const cartoLayer = L.tileLayer(cartoUrl, {
      maxZoom: 19,
      subdomains: 'abcd',
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    });

    cartoLayer.on('tileerror', () => {
      // Graceful fallback if key is invalid or network error occurs
    });

    cartoLayer.addTo(map);

    leafletInstanceRef.current = map;

    // Invalidate size on load to ensure accurate viewport math
    const timer = setTimeout(() => {
      if (map) map.invalidateSize();
    }, 120);

    const handleResize = () => {
      if (leafletInstanceRef.current) {
        leafletInstanceRef.current.invalidateSize();
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      if (leafletInstanceRef.current) {
        leafletInstanceRef.current.remove();
        leafletInstanceRef.current = null;
      }
    };
  }, []);

  // Update map viewport and markers when selectedLocation or curatedCities change
  useEffect(() => {
    const map = leafletInstanceRef.current;
    if (!map) return;

    // 1. Render Curated City Markers
    cityMarkersRef.current.forEach((m) => m.remove());
    cityMarkersRef.current = [];

    if (Array.isArray(curatedCities) && curatedCities.length > 0) {
      curatedCities.slice(0, 35).forEach((city) => {
        const cLat = Number(city.lat ?? city.latitude);
        const cLng = Number(city.lng ?? city.longitude);
        if (isNaN(cLat) || isNaN(cLng)) return;

        const cityIcon = L.divIcon({
          className: 'leaflet-city-marker',
          html: `
            <div style="
              width: 14px;
              height: 14px;
              background: #06b6d4;
              border: 2px solid #ffffff;
              border-radius: 50%;
              box-shadow: 0 0 12px rgba(6, 182, 212, 0.9);
              cursor: pointer;
              transition: transform 0.2s;
            " title="${city.name}"></div>
          `,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });

        const marker = L.marker([cLat, cLng], { icon: cityIcon }).addTo(map);
        marker.bindTooltip(
          `<div style="font-family: sans-serif; font-weight: bold; font-size: 11px;">${city.name} (${city.country || ''})</div>`,
          { direction: 'top', offset: [0, -8] }
        );
        marker.on('click', () => {
          if (onSelectCity) onSelectCity(city);
        });

        cityMarkersRef.current.push(marker);
      });
    }

    // 2. Render Goal Destination Marker & Pan Camera
    if (goalMarkerRef.current) {
      goalMarkerRef.current.remove();
      goalMarkerRef.current = null;
    }

    if (selectedLocation) {
      const lat = Number(selectedLocation.latitude ?? selectedLocation.lat);
      const lng = Number(selectedLocation.longitude ?? selectedLocation.lng);

      if (!isNaN(lat) && !isNaN(lng)) {
        let targetZoom = 12;
        if (selectedLocation.type === 'country') targetZoom = 5;
        else if (selectedLocation.type === 'region' || selectedLocation.type === 'ocean') targetZoom = 6;
        else if (selectedLocation.type === 'landmark' || selectedLocation.type === 'mountain') targetZoom = 15;

        map.flyTo([lat, lng], targetZoom, { duration: 1.5 });

        const goalIcon = L.divIcon({
          className: 'leaflet-goal-pin',
          html: `
            <div style="
              width: 38px;
              height: 38px;
              background: #f43f5e;
              border: 3px solid #ffffff;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              box-shadow: 0 0 24px rgba(244, 63, 94, 0.9);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <div style="
                width: 14px;
                height: 14px;
                background: #ffffff;
                border-radius: 50%;
                transform: rotate(45deg);
              "></div>
            </div>
          `,
          iconSize: [38, 38],
          iconAnchor: [19, 38],
        });

        const goalMarker = L.marker([lat, lng], { icon: goalIcon }).addTo(map);
        goalMarker.bindPopup(`
          <div style="font-family: sans-serif; padding: 6px; min-width: 140px;">
            <div style="font-size: 10px; color: #f43f5e; font-weight: bold; text-transform: uppercase;">🎯 TARGET DESTINATION</div>
            <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin: 2px 0;">${selectedLocation.name}</div>
            <div style="font-size: 11px; color: #64748b;">${selectedLocation.country || 'Global'} • ${lat.toFixed(2)}°N, ${lng.toFixed(2)}°E</div>
          </div>
        `).openPopup();

        goalMarkerRef.current = goalMarker;
      }
    }
  }, [selectedLocation, curatedCities, onSelectCity]);

  const handleZoom = (direction) => {
    const map = leafletInstanceRef.current;
    if (!map) return;
    if (direction === 'in') map.zoomIn();
    if (direction === 'out') map.zoomOut();
  };

  return (
    <div
      className={`relative w-full h-full min-h-[450px] bg-black overflow-hidden ${className}`}
      style={{ minHeight: '450px' }}
    >
      <div
        ref={leafletContainerRef}
        className="w-full h-full min-h-[450px]"
        style={{ minHeight: '450px', width: '100%', height: '100%' }}
      />

      {/* Top Banner explaining Map Layer */}
      <div className="absolute top-4 left-4 right-4 z-[500] max-w-lg mx-auto bg-black/85 backdrop-blur-xl border border-white/20 rounded-2xl p-3 shadow-2xl flex items-center justify-between gap-3 text-xs text-slate-300 pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <span>
            <strong className="text-white">Satellite View Active:</strong> Pointing to{' '}
            <span className="text-cyan-300 font-bold">{selectedLocation?.name || 'Global Destinations'}</span>.
          </span>
        </div>
        <span className="text-[10px] font-mono text-slate-400 shrink-0">
          Free Satellite View • Esri Imagery + CARTO Labels
        </span>
      </div>

      {/* Floating Manual Zoom Controls Bottom-Right */}
      <div className="absolute bottom-10 right-6 z-[500] flex flex-col rounded-full bg-black/85 border border-white/20 overflow-hidden shadow-2xl">
        <button
          type="button"
          onClick={() => handleZoom('in')}
          className="w-10 h-10 text-slate-200 hover:text-white flex items-center justify-center border-b border-white/15 hover:bg-white/20 cursor-pointer transition-colors"
          title="Zoom In"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => handleZoom('out')}
          className="w-10 h-10 text-slate-200 hover:text-white flex items-center justify-center hover:bg-white/20 cursor-pointer transition-colors"
          title="Zoom Out"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Left Attribution */}
      <div className="absolute bottom-2 left-2 z-[500] px-2.5 py-1 rounded bg-black/85 text-[10px] text-slate-400 font-mono border border-white/10 pointer-events-none">
        © Esri World Imagery • CARTO Voyager Labels • OpenStreetMap
      </div>
    </div>
  );
}

export default GoogleMapsView;

