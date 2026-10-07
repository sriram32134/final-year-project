import logging
from fastapi import APIRouter, Query, HTTPException, Path
from typing import List, Optional
from backend.models.location import NormalizedLocation, LocationSearchResponse, LocationResolveRequest, NearbyPlace
from backend.services.curated_service import CuratedLocationService
from backend.providers.maptiler import MapTilerLocationProvider
from backend.providers.wikimedia import WikimediaImageProvider
from backend.providers.geoapify import GeoapifyPlacesProvider

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/locations", tags=["locations"])

@router.get("/search", response_model=LocationSearchResponse)
async def search_locations(
    q: str = Query(..., min_length=1, description="Location search query"),
    lang: str = Query("en", description="Preferred language code (en)"),
):
    query = q.strip()
    results: List[NormalizedLocation] = []
    seen = set()

    # LAYER 1: Showcase Curated Destinations (Instant)
    curated = CuratedLocationService.search(query)
    for c in curated:
        key = f"{c.name.lower()}-{c.country.lower()}"
        if key not in seen:
            seen.add(key)
            results.append(c)

    # LAYER 2: MapTiler Global Geocoding Runtime Resolution (with Nominatim Fallback)
    try:
        maptiler_results = await MapTilerLocationProvider.search(query, limit=6)
        for loc in maptiler_results:
            key = f"{loc.name.lower()}-{loc.country.lower()}"
            if key not in seen:
                seen.add(key)
                results.append(loc)
    except Exception as e:
        logger.warning(f"MapTiler search error: {e}")

    return LocationSearchResponse(
        query=query,
        results=results,
        total=len(results),
    )

@router.post("/resolve", response_model=NormalizedLocation)
async def resolve_location(req: LocationResolveRequest):
    query = req.query.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    # 1. Check curated showcase
    curated_match = CuratedLocationService.get_by_name(query)
    if curated_match:
        return curated_match

    # 2. Check MapTiler
    try:
        resolved = await MapTilerLocationProvider.resolve(query)
        if resolved:
            # Resolve image concurrently with 3.0s timeout
            if not resolved.image:
                try:
                    img = await WikimediaImageProvider.get_location_image(
                        resolved.name, country=resolved.country, region=resolved.region
                    )
                    if img:
                        resolved.image = img
                        resolved.photoUrl = img
                except Exception:
                    pass
            return resolved
    except Exception as e:
        logger.warning(f"Location resolution error: {e}")

    raise HTTPException(status_code=404, detail="Location not found. Try another spelling or place name.")

@router.get("/details", response_model=Optional[NormalizedLocation])
async def get_place_details(
    placeId: str = Query(..., description="Place ID or internal ID"),
    name: Optional[str] = Query(None),
):
    if name:
        resolved = await MapTilerLocationProvider.resolve(name)
        if resolved:
            return resolved
    return None

@router.get("/nearby", response_model=List[NearbyPlace])
async def get_nearby(
    lat: float = Query(..., description="Latitude"),
    lng: float = Query(..., description="Longitude"),
    radius: float = Query(15000.0, description="Search radius in meters"),
    limit: int = Query(6, ge=1, le=20),
):
    try:
        return await GeoapifyPlacesProvider.get_nearby_places(
            lat, lng, radius_meters=int(radius), limit=limit
        )
    except Exception as e:
        logger.warning(f"Error fetching nearby places: {e}")
        return []
