"""
MapTiler Location Provider for AITrip.
Implements global geocoding, search, and geographic resolution using MapTiler Cloud
with automatic Referer header support, street-address deduplication, and universal
OpenStreetMap Nominatim fallback for world landmarks, oceans, seas, and mountains.
"""

import os
import httpx
import logging
import urllib.parse
from typing import List, Optional, Dict, Any
from backend.models.location import NormalizedLocation

logger = logging.getLogger(__name__)

MAPTILER_API_KEY = (
    os.getenv("MAPTILER_API_KEY")
    or os.getenv("VITE_MAPTILER_API_KEY")
    or ""
).strip()

REFERER_HEADER = os.getenv("FRONTEND_URL", "http://localhost:5173/")

class MapTilerLocationProvider:
    @staticmethod
    def _map_feature_type(place_types: List[str], text_name: str) -> tuple[str, float]:
        pts = set(p.lower() for p in (place_types or []))
        lower_name = text_name.lower()

        if any(w in lower_name for w in ["ocean", "sea", "bay", "gulf", "channel"]):
            return "ocean", 5.5
        if any(w in lower_name for w in ["mount", "peak", "himalaya", "alps", "range", "mountain"]):
            return "mountain", 4.2
        if any(p in pts for p in ["poi", "landmark", "attraction", "monument", "historic"]):
            return "landmark", 3.25
        if any(p in pts for p in ["municipality", "city", "town", "village", "local"]):
            return "city", 3.8
        if any(p in pts for p in ["region", "subregion", "county", "state", "province"]):
            return "region", 4.8
        if "country" in pts:
            return "country", 5.5
        if any(p in pts for p in ["natural", "water"]):
            return "ocean", 5.2
        return "city", 3.8

    @classmethod
    async def search(cls, query: str, limit: int = 6) -> List[NormalizedLocation]:
        if not query or not query.strip():
            return []
        
        q = query.strip()
        results: List[NormalizedLocation] = []
        seen = set()

        # 1. MapTiler Global Geocoding API
        if MAPTILER_API_KEY:
            try:
                encoded_q = urllib.parse.quote(q)
                url = f"https://api.maptiler.com/geocoding/{encoded_q}.json"
                params = {"key": MAPTILER_API_KEY, "limit": limit, "language": "en"}
                headers = {
                    "Referer": REFERER_HEADER,
                    "Origin": REFERER_HEADER.rstrip("/"),
                    "Accept": "application/json",
                }

                async with httpx.AsyncClient(timeout=6.0) as client:
                    resp = await client.get(url, params=params, headers=headers)
                    if resp.status_code == 200:
                        data = resp.json()
                        features = data.get("features", [])
                        for feat in features:
                            coords = feat.get("geometry", {}).get("coordinates", [0.0, 0.0])
                            lng = float(coords[0])
                            lat = float(coords[1])
                            
                            text_name = feat.get("text", "") or feat.get("place_name", "").split(",")[0].strip()
                            place_name = feat.get("place_name", text_name)
                            place_types = feat.get("place_type", [])
                            
                            # Filter out street addresses if user is searching for broader places/cities/landmarks
                            # unless the query explicitly contains words like 'street' or 'road'
                            if "address" in place_types and not any(k in q.lower() for k in ["street", "road", "ave", "lane", "crescent"]):
                                # Keep searching down the list for municipality/city/poi
                                continue

                            country = "Global"
                            region = None
                            for ctx in feat.get("context", []):
                                cid = ctx.get("id", "")
                                if cid.startswith("country"):
                                    country = ctx.get("text", country)
                                elif cid.startswith("region") or cid.startswith("subregion"):
                                    if not region:
                                        region = ctx.get("text")

                            item_type, cam_dist = cls._map_feature_type(place_types, text_name)
                            dedup_key = f"{text_name.lower()}-{country.lower()}"

                            if dedup_key not in seen:
                                seen.add(dedup_key)
                                loc = NormalizedLocation(
                                    id=f"maptiler-{feat.get('id', text_name).replace('.', '-')}",
                                    name=text_name,
                                    country=country,
                                    region=region,
                                    latitude=lat,
                                    longitude=lng,
                                    type=item_type,
                                    source="maptiler",
                                    provider="dynamic",
                                    formattedName=place_name,
                                    cameraDistance=cam_dist,
                                    curated=False,
                                    shortDescription=f"{text_name} located in {region + ', ' if region else ''}{country}.",
                                )
                                results.append(loc)
            except Exception as e:
                logger.warning(f"MapTiler geocoding request warning: {e}")

        # 2. Universal OpenStreetMap Nominatim Fallback & Landmark / Feature Resolver
        # If MapTiler returned fewer than 2 results, or for landmarks/oceans/mountains, enrich with Nominatim
        if len(results) < limit:
            try:
                url = "https://nominatim.openstreetmap.org/search"
                params = {
                    "format": "json",
                    "q": q,
                    "limit": limit,
                    "addressdetails": 1,
                    "accept-language": "en,en-US;q=0.9",
                }
                headers = {"User-Agent": "AITrip-Agentic-App/2.0 (contact@aitrip.local; educational)"}

                async with httpx.AsyncClient(timeout=6.0) as client:
                    resp = await client.get(url, params=params, headers=headers)
                    if resp.status_code == 200:
                        items = resp.json()
                        for item in items:
                            lat = float(item.get("lat", 0.0))
                            lng = float(item.get("lon", 0.0))
                            addr = item.get("address", {})
                            country = addr.get("country", "Global")
                            region = addr.get("state") or addr.get("region") or addr.get("county")
                            name = item.get("name") or item.get("display_name", "").split(",")[0].strip()

                            raw_type = str(item.get("type", "")).lower()
                            raw_class = str(item.get("class", "")).lower()
                            lower_name = name.lower()

                            if any(w in lower_name for w in ["ocean", "sea", "bay", "gulf", "channel"]) or raw_type in ["water", "ocean", "sea"]:
                                item_type = "ocean"
                                cam_dist = 5.2
                            elif any(w in lower_name for w in ["mount", "peak", "himalaya", "alps", "range"]) or raw_type in ["peak", "mountain"]:
                                item_type = "mountain"
                                cam_dist = 4.2
                            elif raw_class in ["tourism", "historic"] or raw_type in ["monument", "attraction", "memorial"]:
                                item_type = "landmark"
                                cam_dist = 3.25
                            elif raw_type in ["country"] or raw_class == "boundary":
                                item_type = "country"
                                cam_dist = 5.5
                            elif raw_type in ["state", "region", "county"]:
                                item_type = "region"
                                cam_dist = 4.8
                            else:
                                item_type = "city"
                                cam_dist = 3.8

                            dedup_key = f"{name.lower()}-{country.lower()}"
                            if dedup_key not in seen:
                                seen.add(dedup_key)
                                results.append(
                                    NormalizedLocation(
                                        id=f"osm-{item.get('place_id', name)}",
                                        name=name,
                                        country=country,
                                        region=region,
                                        latitude=lat,
                                        longitude=lng,
                                        type=item_type,
                                        source="maptiler",
                                        provider="dynamic",
                                        formattedName=item.get("display_name", name),
                                        cameraDistance=cam_dist,
                                        curated=False,
                                        shortDescription=f"{name} located in {region + ', ' if region else ''}{country}.",
                                    )
                                )
                                if len(results) >= limit:
                                    break
            except Exception as e:
                logger.warning(f"Nominatim fallback error: {e}")

        return results

    @classmethod
    async def resolve(cls, query: str) -> Optional[NormalizedLocation]:
        results = await cls.search(query, limit=1)
        return results[0] if results else None
