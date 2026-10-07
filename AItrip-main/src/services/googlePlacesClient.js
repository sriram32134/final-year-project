/**
 * Official Google Places API (New) Client for AITrip
 * 
 * Provides runtime Google Places search, Place Details, Place Photos, and Nearby search
 * with strict English language normalization and author attribution.
 */

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
const BACKEND_BASE_URL = 'http://127.0.0.1:8000';

/**
 * Dynamically computes globe camera distance based on place types and viewport.
 * NO hardcoded city name conditionals.
 */
export function computeCameraDistanceForPlace(types = [], viewport = null) {
  const typeSet = new Set((types || []).map((t) => t.toLowerCase()));

  if (
    typeSet.has('tourist_attraction') ||
    typeSet.has('point_of_interest') ||
    typeSet.has('museum') ||
    typeSet.has('historical_landmark') ||
    typeSet.has('monument')
  ) {
    return { type: 'landmark', distance: 2.8, zoom: 15 };
  }

  if (
    typeSet.has('locality') ||
    typeSet.has('sublocality') ||
    typeSet.has('town') ||
    typeSet.has('postal_town')
  ) {
    return { type: 'city', distance: 3.5, zoom: 12 };
  }

  if (
    typeSet.has('administrative_area_level_1') ||
    typeSet.has('administrative_area_level_2')
  ) {
    return { type: 'region', distance: 4.5, zoom: 8 };
  }

  if (typeSet.has('country')) {
    return { type: 'country', distance: 5.5, zoom: 5 };
  }

  if (
    typeSet.has('natural_feature') ||
    typeSet.has('park') ||
    typeSet.has('mountain')
  ) {
    return { type: 'mountain', distance: 4.8, zoom: 10 };
  }

  if (
    typeSet.has('sea') ||
    typeSet.has('ocean') ||
    typeSet.has('bay') ||
    typeSet.has('beach')
  ) {
    return { type: 'ocean', distance: 5.2, zoom: 6 };
  }

  return { type: 'city', distance: 3.5, zoom: 12 };
}

/**
 * Extract country and region from formatted English address
 */
export function parseAddressComponents(formattedAddress) {
  if (!formattedAddress) return { country: 'Global', region: null };
  const parts = formattedAddress.split(',').map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) return { country: 'Global', region: null };
  
  const rawCountry = parts[parts.length - 1];
  const country = rawCountry.replace(/\d+/g, '').trim() || rawCountry;
  const region = parts.length >= 2 ? parts[parts.length - 2] : null;

  return { country, region };
}

/**
 * Build Google Places API (New) Photo URI
 */
export function buildGooglePlacePhotoUrl(photoName, maxWidth = 1200) {
  if (!photoName) return null;
  if (photoName.startsWith('http')) return photoName;
  if (!GOOGLE_API_KEY) return null;
  return `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=1000&maxWidthPx=${maxWidth}&key=${GOOGLE_API_KEY}`;
}

/**
 * Normalizes a Google Places API (New) Place item into the AITrip runtime location object
 */
export function normalizeGooglePlace(place) {
  if (!place) return null;

  const id = place.id || `loc-${Math.random().toString(36).substr(2, 9)}`;
  const displayName =
    typeof place.displayName === 'object'
      ? place.displayName?.text
      : place.displayName || place.name || 'Location';

  const formattedAddress = place.formattedAddress || '';
  const lat = Number(place.location?.latitude ?? place.latitude ?? place.lat);
  const lng = Number(place.location?.longitude ?? place.longitude ?? place.lng);

  if (isNaN(lat) || isNaN(lng)) return null;

  const { type: placeType, distance: camDist } = computeCameraDistanceForPlace(
    place.types,
    place.viewport
  );

  const { country, region } = parseAddressComponents(formattedAddress);

  // Photos & Attributions
  const photos = place.photos || [];
  const photoRefs = [];
  const photoAttributions = [];
  let photoUrl = place.image || place.photoUrl || null;

  if (photos.length > 0) {
    const first = photos[0];
    const photoName = first.name;
    if (photoName) {
      photoRefs.push(photoName);
      if (!photoUrl && GOOGLE_API_KEY) {
        photoUrl = buildGooglePlacePhotoUrl(photoName, 1200);
      }
    }
    const authorAttributions = first.authorAttributions || [];
    for (const attr of authorAttributions) {
      photoAttributions.push({
        displayName: attr.displayName,
        uri: attr.uri,
        photoUri: attr.photoUri,
      });
    }
  }

  return {
    id: `google-${id}`,
    provider: 'google',
    providerPlaceId: id,
    name: displayName,
    formattedName: formattedAddress || `${displayName}, ${country}`,
    latitude: lat,
    longitude: lng,
    type: placeType,
    country: country || 'Global',
    region: region,
    curated: false,
    image: photoUrl,
    photoUrl: photoUrl,
    photoReferences: photoRefs,
    photoAttributions: photoAttributions,
    googleMapsUri: place.googleMapsUri || null,
    attributions: photoAttributions,
    viewport: place.viewport || null,
    cameraDistance: camDist,
    travelStyle: 'Worldwide Cultural Discovery & Scenic Exploration',
    shortDescription: `${displayName} in ${country} resolved live via Google Places.`,
    description: `Explore ${displayName}, ${country}. Real coordinates, authentic photos, and navigation data provided by Google Places Platform.`,
    tags: ['Google Places', placeType.toUpperCase(), country],
  };
}

/**
 * Perform runtime Google Places search
 * First queries backend /api/locations/search (which calls Google Places API New).
 * If backend is unavailable and VITE_GOOGLE_MAPS_API_KEY is present, queries client Google Places directly.
 */
export async function searchGooglePlaces(query, signal) {
  if (!query || query.trim().length < 2) return [];
  const q = query.trim();

  // 1. Try Backend
  try {
    const res = await fetch(
      `${BACKEND_BASE_URL}/api/locations/search?q=${encodeURIComponent(q)}&lang=en`,
      { signal, headers: { Accept: 'application/json' } }
    );
    if (res.ok) {
      const data = await res.json();
      const results = data.results || [];
      return results.map((r) => ({
        ...r,
        provider: r.provider || (r.curated ? 'curated' : 'google'),
      }));
    }
  } catch (err) {
    if (err.name === 'AbortError') return [];
  }

  // 2. Direct Client-side Google Places Text Search (New) if API Key is configured
  if (GOOGLE_API_KEY) {
    try {
      const url = 'https://places.googleapis.com/v1/places:searchText';
      const headers = {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_API_KEY,
        'X-Goog-FieldMask':
          'places.id,places.displayName,places.formattedAddress,places.location,places.types,places.photos,places.googleMapsUri,places.viewport',
      };
      const payload = {
        textQuery: q,
        languageCode: 'en',
        maxResultCount: 6,
      };

      const resp = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal,
      });

      if (resp.ok) {
        const data = await resp.json();
        const places = data.places || [];
        return places.map(normalizeGooglePlace).filter(Boolean);
      }
    } catch (e) {
      if (e.name === 'AbortError') return [];
    }
  }

  return [];
}
