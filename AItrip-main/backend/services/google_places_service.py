"""
Official Google Places API (New) & Places Service for AITrip.
Implements real-time worldwide search, place details, photo resolution, and nearby discovery
using Google Maps Platform APIs with strict English localization.
"""

import os
import httpx
import logging
from typing import List, Optional, Dict, Any
from backend.models.location import NormalizedLocation, NearbyPlace
from backend.services.geocoding_service import GeocodingService, fetch_place_photo

logger = logging.getLogger(__name__)

# Retrieve server-side Google Maps API key
GOOGLE_MAPS_SERVER_API_KEY = (
    os.getenv("GOOGLE_MAPS_SERVER_API_KEY")
    or os.getenv("GOOGLE_MAPS_API_KEY")
    or os.getenv("VITE_GOOGLE_MAPS_API_KEY")
    or ""
).strip()

def map_google_types_to_normalized(types: List[str]) -> tuple[str, float]:
    """
    Dynamically maps Google Places types to internal type category and camera distance.
    NO hardcoded city names.
    """
    types_set = set(t.lower() for t in types or [])
    if any(t in types_set for t in ["tourist_attraction", "point_of_interest", "museum", "historical_landmark", "monument", "amusement_park"]):
        return "landmark", 2.8
    if any(t in types_set for t in ["locality", "administrative_area_level_3", "town", "postal_town"]):
        return "city", 3.5
    if any(t in types_set for t in ["administrative_area_level_1", "administrative_area_level_2"]):
        return "region", 4.5
    if "country" in types_set:
        return "country", 5.5
    if any(t in types_set for t in ["natural_feature", "park", "mountain"]):
        return "mountain", 4.8
    if any(t in types_set for t in ["sea", "ocean", "bay", "beach"]):
        return "ocean", 5.2
    return "city", 3.5

def extract_country_and_region_from_address(formatted_address: str) -> tuple[str, Optional[str]]:
    """Extracts country and state/region from formatted English address string."""
    if not formatted_address:
        return "Global", None
    parts = [p.strip() for p in formatted_address.split(",") if p.strip()]
    if not parts:
        return "Global", None
    country = parts[-1]
    # Remove any postal codes from country if present
    country = "".join([c for c in country if not c.isdigit()]).strip() or parts[-1]
    region = parts[-2] if len(parts) >= 2 else None
    return country, region

def build_google_photo_url(photo_name: str, max_width_px: int = 1200) -> str:
    """Builds photo URL for Google Places API (New) photo name."""
    if not photo_name or not GOOGLE_MAPS_SERVER_API_KEY:
        return ""
    if photo_name.startswith("http"):
        return photo_name
    return f"https://places.googleapis.com/v1/{photo_name}/media?maxHeightPx=1000&maxWidthPx={max_width_px}&key={GOOGLE_MAPS_SERVER_API_KEY}"

async def search_places_google(query: str, language_code: str = "en") -> List[NormalizedLocation]:
    """
    Searches Google Places (New) Text Search API for runtime resolution.
    Falls back gracefully to universal geocoder if key is absent or request fails.
    """
    if not query or len(query.strip()) < 2:
        return []

    clean_query = query.strip()

    if not GOOGLE_MAPS_SERVER_API_KEY:
        logger.info(f"Google Maps server key not configured; using universal geocoding for '{clean_query}'")
        return await GeocodingService.search(clean_query)

    url = "https://places.googleapis.com/v1/places:searchText"
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_MAPS_SERVER_API_KEY,
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location,places.types,places.photos,places.googleMapsUri,places.viewport",
    }
    payload = {
        "textQuery": clean_query,
        "languageCode": language_code or "en",
        "maxResultCount": 6,
    }

    try:
        async with httpx.AsyncClient(timeout=6.0) as client:
            resp = await client.post(url, json=payload, headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                places = data.get("places", [])
                results: List[NormalizedLocation] = []

                for place in places:
                    place_id = place.get("id")
                    display_name_obj = place.get("displayName", {})
                    display_name = display_name_obj.get("text") or clean_query
                    formatted_address = place.get("formattedAddress", "")
                    location = place.get("location", {})
                    lat = location.get("latitude")
                    lng = location.get("longitude")

                    if lat is None or lng is None:
                        continue

                    types = place.get("types", [])
                    place_type, cam_distance = map_google_types_to_normalized(types)
                    country, region = extract_country_and_region_from_address(formatted_address)

                    # Photos & Attributions
                    photos = place.get("photos", [])
                    photo_refs = []
                    photo_attributions = []
                    primary_photo_url = None

                    if photos and len(photos) > 0:
                        first_photo = photos[0]
                        photo_name = first_photo.get("name")
                        if photo_name:
                            photo_refs.append(photo_name)
                            primary_photo_url = build_google_photo_url(photo_name)
                        
                        author_attributions = first_photo.get("authorAttributions", [])
                        for attr in author_attributions:
                            photo_attributions.append({
                                "displayName": attr.get("displayName"),
                                "uri": attr.get("uri"),
                                "photoUri": attr.get("photoUri"),
                            })

                    # If Google returned no photo, attempt verified English place photo fallback (Wikipedia)
                    if not primary_photo_url:
                        verified_photo = await fetch_place_photo(display_name)
                        primary_photo_url = verified_photo

                    google_maps_uri = place.get("googleMapsUri")
                    viewport = place.get("viewport")

                    norm_loc = NormalizedLocation(
                        id=f"google-{place_id}",
                        name=display_name,
                        country=country,
                        region=region,
                        latitude=lat,
                        longitude=lng,
                        type=place_type, # type: ignore
                        source="google",
                        provider="google",
                        providerPlaceId=place_id,
                        formattedName=formatted_address or f"{display_name}, {country}",
                        curated=False,
                        image=primary_photo_url,
                        photoReferences=photo_refs,
                        photoUrl=primary_photo_url,
                        photoAttributions=photo_attributions,
                        googleMapsUri=google_maps_uri,
                        viewport=viewport,
                        travelStyle="Worldwide Cultural Discovery & Scenic Exploration",
                        shortDescription=f"{display_name} in {country} resolved via Google Places.",
                        description=f"Explore {display_name}, {country}. Real coordinates, authentic photos, and navigation data provided by Google Places Platform.",
                        tags=["Google Places", place_type.capitalize(), country],
                        cameraDistance=cam_distance,
                    )
                    results.append(norm_loc)

                if results:
                    return results

            else:
                logger.warning(f"Google Places Text Search returned {resp.status_code}: {resp.text}")

    except Exception as exc:
        logger.error(f"Error calling Google Places API: {exc}")

    # Fallback to universal Nominatim geocoding if Google API failed or returned 0 results
    logger.info(f"Falling back to universal geocoder for query '{clean_query}'")
    return await GeocodingService.search(clean_query)

async def get_place_details_google(place_id: str, language_code: str = "en") -> Optional[NormalizedLocation]:
    """
    Fetches detailed place information from Google Place Details (New).
    """
    if not place_id or not GOOGLE_MAPS_SERVER_API_KEY:
        return None

    clean_id = place_id.replace("google-", "")
    url = f"https://places.googleapis.com/v1/places/{clean_id}"
    headers = {
        "X-Goog-Api-Key": GOOGLE_MAPS_SERVER_API_KEY,
        "X-Goog-FieldMask": "id,displayName,formattedAddress,location,types,photos,googleMapsUri,viewport",
    }
    params = {"languageCode": language_code or "en"}

    try:
        async with httpx.AsyncClient(timeout=6.0) as client:
            resp = await client.get(url, headers=headers, params=params)
            if resp.status_code == 200:
                place = resp.json()
                display_name = place.get("displayName", {}).get("text") or "Place"
                formatted_address = place.get("formattedAddress", "")
                location = place.get("location", {})
                lat = location.get("latitude")
                lng = location.get("longitude")
                if lat is None or lng is None:
                    return None

                types = place.get("types", [])
                place_type, cam_distance = map_google_types_to_normalized(types)
                country, region = extract_country_and_region_from_address(formatted_address)

                photos = place.get("photos", [])
                photo_refs = []
                photo_attributions = []
                primary_photo_url = None

                if photos and len(photos) > 0:
                    first_photo = photos[0]
                    photo_name = first_photo.get("name")
                    if photo_name:
                        photo_refs.append(photo_name)
                        primary_photo_url = build_google_photo_url(photo_name)
                    
                    author_attributions = first_photo.get("authorAttributions", [])
                    for attr in author_attributions:
                        photo_attributions.append({
                            "displayName": attr.get("displayName"),
                            "uri": attr.get("uri"),
                            "photoUri": attr.get("photoUri"),
                        })

                if not primary_photo_url:
                    primary_photo_url = await fetch_place_photo(display_name)

                return NormalizedLocation(
                    id=f"google-{place['id']}",
                    name=display_name,
                    country=country,
                    region=region,
                    latitude=lat,
                    longitude=lng,
                    type=place_type, # type: ignore
                    source="google",
                    provider="google",
                    providerPlaceId=place["id"],
                    formattedName=formatted_address or f"{display_name}, {country}",
                    curated=False,
                    image=primary_photo_url,
                    photoReferences=photo_refs,
                    photoUrl=primary_photo_url,
                    photoAttributions=photo_attributions,
                    googleMapsUri=place.get("googleMapsUri"),
                    viewport=place.get("viewport"),
                    travelStyle="Worldwide Cultural Discovery & Scenic Exploration",
                    shortDescription=f"{display_name} in {country} resolved via Google Places Details.",
                    description=f"Explore {display_name}, {country}. Real coordinates, authentic photos, and navigation data provided by Google Places Platform.",
                    tags=["Google Places", place_type.capitalize(), country],
                    cameraDistance=cam_distance,
                )
    except Exception as exc:
        logger.error(f"Error fetching Google Place details: {exc}")

    return None

async def search_nearby_google(
    lat: float,
    lng: float,
    radius: float = 15000.0,
    language_code: str = "en",
    limit: int = 6
) -> List[NearbyPlace]:
    """
    Queries Google Places Nearby Search (New) around latitude and longitude.
    Falls back cleanly to Overpass/Nominatim nearby if Google is unavailable.
    """
    if not GOOGLE_MAPS_SERVER_API_KEY:
        return await fetch_nearby_places(lat, lng, limit=limit)

    url = "https://places.googleapis.com/v1/places:searchNearby"
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_MAPS_SERVER_API_KEY,
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location,places.types,places.photos,places.rating,places.googleMapsUri",
    }
    payload = {
        "includedTypes": [
            "tourist_attraction",
            "historical_landmark",
            "museum",
            "park",
            "natural_feature",
            "viewpoint",
        ],
        "maxResultCount": limit,
        "locationRestriction": {
            "circle": {
                "center": {"latitude": lat, "longitude": lng},
                "radius": radius,
            }
        },
        "languageCode": language_code or "en",
    }

    try:
        async with httpx.AsyncClient(timeout=6.0) as client:
            resp = await client.post(url, json=payload, headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                places = data.get("places", [])
                nearby_list: List[NearbyPlace] = []

                for p in places:
                    p_id = p.get("id")
                    name = p.get("displayName", {}).get("text")
                    if not name:
                        continue
                    p_loc = p.get("location", {})
                    p_lat = p_loc.get("latitude")
                    p_lng = p_loc.get("longitude")
                    if p_lat is None or p_lng is None:
                        continue

                    # Photo
                    photo_url = None
                    photos = p.get("photos", [])
                    if photos and len(photos) > 0:
                        photo_name = photos[0].get("name")
                        if photo_name:
                            photo_url = build_google_photo_url(photo_name, max_width_px=600)

                    # Types
                    types = p.get("types", [])
                    cat = "Attraction"
                    if "museum" in types:
                        cat = "Museum"
                    elif "park" in types or "natural_feature" in types:
                        cat = "Nature & Scenic"
                    elif "historical_landmark" in types:
                        cat = "Historical Landmark"

                    nearby_list.append(
                        NearbyPlace(
                            id=f"google-{p_id}",
                            name=name,
                            category=cat,
                            latitude=p_lat,
                            longitude=p_lng,
                            rating=float(p.get("rating", 4.7)),
                            description=p.get("formattedAddress"),
                            image=photo_url,
                        )
                    )

                if nearby_list:
                    return nearby_list
    except Exception as exc:
        logger.error(f"Error querying Google Places searchNearby: {exc}")

    # Fallback
    return await GeocodingService.get_nearby_places(lat, lng, limit=limit)
