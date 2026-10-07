from fastapi import APIRouter, Query
from typing import Optional, Dict, Any
from backend.providers.wikimedia import WikimediaImageProvider

router = APIRouter(prefix="/api/images", tags=["images"])

@router.get("/search")
async def search_image(
    q: str = Query(..., min_length=2, description="Place or landmark name"),
    country: Optional[str] = Query(None),
    region: Optional[str] = Query(None),
):
    url = await WikimediaImageProvider.get_location_image(
        name=q, country=country, region=region
    )
    return {
        "query": q,
        "imageUrl": url,
        "found": bool(url),
        "source": "wikimedia_commons" if url else None,
    }
