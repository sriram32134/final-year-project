/**
 * GeoapifyPlacesProvider & BasePlacesProvider Abstraction
 * Handles nearby places, attractions, dining, and accommodations via Geoapify v2 API.
 * No Google Cloud dependencies.
 */

export class BasePlacesProvider {
  async getNearbyPlaces(lat, lng, category = 'all') {
    throw new Error('getNearbyPlaces must be implemented');
  }

  async getPlaceDetails(placeId) {
    throw new Error('getPlaceDetails must be implemented');
  }
}

export class GeoapifyPlacesProvider extends BasePlacesProvider {
  constructor(apiKey) {
    super();
    this.apiKey = apiKey || import.meta.env.VITE_GEOAPIFY_API_KEY || '';
  }

  isAvailable() {
    return Boolean(this.apiKey);
  }

  async getNearbyPlaces(lat, lng, limit = 8) {
    if (!this.isAvailable()) {
      return this.getEstimatedNearbyPlaces(lat, lng);
    }

    try {
      const categories = 'tourism.attraction,tourism.sights,entertainment.culture,catering.restaurant';
      const url = `https://api.geoapify.com/v2/places?categories=${categories}&filter=circle:${lng},${lat},15000&bias=proximity:${lng},${lat}&limit=${limit}&apiKey=${this.apiKey}`;
      const res = await fetch(url, { headers: { Accept: 'application/json' } });

      if (res.ok) {
        const data = await res.json();
        const features = data.features || [];
        return features.map((feat) => {
          const props = feat.properties || {};
          const pLat = props.lat || lat;
          const pLng = props.lon || lng;
          const cats = props.categories || [];

          let category = 'Attraction';
          if (cats.some((c) => c.includes('restaurant') || c.includes('cafe'))) {
            category = 'Dining';
          } else if (cats.some((c) => c.includes('hotel') || c.includes('accommodation'))) {
            category = 'Stay';
          } else if (cats.some((c) => c.includes('historic') || c.includes('museum'))) {
            category = 'Heritage';
          }

          const distKm = props.distance ? Number((props.distance / 1000).toFixed(1)) : 1.2;

          return {
            id: `geoapify-${props.place_id || Math.random().toString(36).substr(2, 9)}`,
            name: props.name || props.address_line1 || 'Local Point of Interest',
            category,
            latitude: pLat,
            longitude: pLng,
            distanceKm: distKm,
            rating: 4.8,
            description: props.formatted || props.address_line2 || 'Verified local cultural landmark.',
            source: 'geoapify',
          };
        });
      }
    } catch (err) {
      console.warn('Geoapify client places error:', err);
    }

    return this.getEstimatedNearbyPlaces(lat, lng);
  }

  getEstimatedNearbyPlaces(lat, lng) {
    return [
      {
        id: 'poi-est-1',
        name: 'Scenic Panoramic Overlook',
        category: 'Scenic Viewpoint',
        latitude: lat + 0.012,
        longitude: lng + 0.008,
        distanceKm: 1.5,
        rating: 4.9,
        description: 'Iconic vantage point offering open horizons across the terrain.',
        source: 'estimated',
      },
      {
        id: 'poi-est-2',
        name: 'Historic Heritage Quarter',
        category: 'Heritage',
        latitude: lat - 0.015,
        longitude: lng - 0.011,
        distanceKm: 2.1,
        rating: 4.8,
        description: 'Charming lanes showcasing regional architecture and artisan craft.',
        source: 'estimated',
      },
      {
        id: 'poi-est-3',
        name: 'Artisan Culinary Market',
        category: 'Dining',
        latitude: lat + 0.005,
        longitude: lng - 0.014,
        distanceKm: 1.8,
        rating: 4.7,
        description: 'Authentic local market celebrated for fresh ingredients and regional delicacies.',
        source: 'estimated',
      },
    ];
  }
}

export const placesProvider = new GeoapifyPlacesProvider();
