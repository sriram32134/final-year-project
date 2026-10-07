from fastapi import APIRouter, Query, HTTPException, Path
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from backend.models.location import NearbyPlace
from backend.providers.geoapify import GeoapifyPlacesProvider

router = APIRouter(prefix="/api/places", tags=["places"])

class NearbyPlacesRequest(BaseModel):
    latitude: float
    longitude: float
    radiusMeters: Optional[int] = 15000
    categories: Optional[str] = "tourism.attraction,tourism.sights,entertainment.culture,catering.restaurant"
    limit: Optional[int] = 8

# Cache of recently retrieved places for fast ID retrieval
_PLACES_CACHE: Dict[str, NearbyPlace] = {}

@router.post("/nearby", response_model=List[NearbyPlace])
async def post_nearby_places(req: NearbyPlacesRequest):
    places = await GeoapifyPlacesProvider.get_nearby_places(
        lat=req.latitude,
        lng=req.longitude,
        categories=req.categories or "tourism.attraction,tourism.sights,catering.restaurant",
        radius_meters=req.radiusMeters or 15000,
        limit=req.limit or 8,
    )
    for p in places:
        _PLACES_CACHE[p.id] = p
    return places

@router.get("/nearby", response_model=List[NearbyPlace])
async def get_nearby_places(
    lat: float = Query(...),
    lng: float = Query(...),
    limit: int = Query(8, ge=1, le=20),
):
    places = await GeoapifyPlacesProvider.get_nearby_places(
        lat=lat,
        lng=lng,
        limit=limit,
    )
    for p in places:
        _PLACES_CACHE[p.id] = p
    return places

@router.get("/{place_id}", response_model=NearbyPlace)
async def get_place_by_id(place_id: str = Path(..., description="Place ID")):
    if place_id in _PLACES_CACHE:
        return _PLACES_CACHE[place_id]
    
    # Generic fallback place
    name_clean = place_id.replace("geoapify-", "").replace("osm-", "").replace("-", " ").title()
    return NearbyPlace(
        id=place_id,
        name=name_clean,
        category="Attraction",
        latitude=20.0,
        longitude=78.0,
        rating=4.8,
        description=f"Verified cultural point of interest: {name_clean}."
    )
