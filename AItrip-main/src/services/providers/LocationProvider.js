/**
 * MapTilerLocationProvider & BaseLocationProvider Abstraction Layer
 * Pure global geocoding and location resolution without Google Cloud dependencies.
 */

import { COUNTRIES, CITIES } from '../../components/globe/globeData.js';

export class BaseLocationProvider {
  async search(query) {
    throw new Error('search(query) must be implemented by subclass');
  }

  async resolve(query) {
    throw new Error('resolve(query) must be implemented by subclass');
  }
}

/**
 * MapTilerLocationProvider
 * Interfaces with MapTiler Cloud Geocoding API with Nominatim geographic fallback
 */
export class MapTilerLocationProvider extends BaseLocationProvider {
  constructor(apiKey) {
    super();
    this.apiKey = apiKey || import.meta.env.VITE_MAPTILER_API_KEY || '';
  }

  isAvailable() {
    return Boolean(this.apiKey);
  }

  async search(query) {
    if (!query || !query.trim()) return [];
    const q = query.trim();

    // 1. MapTiler Geocoding API
    if (this.isAvailable()) {
      try {
        const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(q)}.json?key=${this.apiKey}&language=en&limit=6`;
        const res = await fetch(url, { headers: { Accept: 'application/json' } });
        if (res.ok) {
          const data = await res.json();
          const features = data.features || [];
          if (features.length > 0) {
            return features
              .filter((f) => {
                const types = f.place_type || [];
                return !types.includes('address') || q.toLowerCase().includes('street') || q.toLowerCase().includes('road');
              })
              .map((f) => {
                const coords = f.geometry?.coordinates || [0, 0];
                const textName = f.text || f.place_name?.split(',')[0].trim() || q;
                const types = f.place_type || [];

                let country = 'Global';
                let region = null;
                for (const ctx of f.context || []) {
                  if (ctx.id?.startsWith('country')) country = ctx.text;
                  if (ctx.id?.startsWith('region')) region = ctx.text;
                }

                let itemType = 'city';
                let camDist = 3.8;
                if (types.includes('country')) {
                  itemType = 'country';
                  camDist = 5.5;
                } else if (types.includes('poi') || types.includes('landmark')) {
                  itemType = 'landmark';
                  camDist = 3.25;
                }

                return {
                  id: `maptiler-${f.id || textName}`.replace(/\./g, '-'),
                  name: textName,
                  country,
                  region,
                  latitude: coords[1],
                  longitude: coords[0],
                  lat: coords[1],
                  lng: coords[0],
                  type: itemType,
                  source: 'maptiler',
                  provider: 'dynamic',
                  formattedName: f.place_name || textName,
                  cameraDistance: camDist,
                  curated: false,
                };
              });
          }
        }
      } catch (err) {
        console.warn('MapTiler client search warning:', err);
      }
    }

    // 2. OpenStreetMap Nominatim Fallback
    try {
      const nomUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&accept-language=en`;
      const nomRes = await fetch(nomUrl, {
        headers: { 'User-Agent': 'AITrip-Agentic-App/2.0 (contact@aitrip.local)' },
      });
      if (nomRes.ok) {
        const items = await nomRes.json();
        return items.map((item) => ({
          id: `osm-${item.place_id}`,
          name: item.name || item.display_name?.split(',')[0].trim() || q,
          country: item.display_name?.split(',').slice(-1)[0]?.trim() || 'Global',
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon),
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          type: item.class === 'natural' ? 'mountain' : item.type === 'monument' ? 'landmark' : 'city',
          source: 'nominatim',
          provider: 'dynamic',
          formattedName: item.display_name,
          cameraDistance: 3.8,
          curated: false,
        }));
      }
    } catch {
      // Offline fallback
    }

    return [];
  }

  async resolve(query) {
    const results = await this.search(query);
    return results.length > 0 ? results[0] : null;
  }
}

export const locationProvider = new MapTilerLocationProvider();
