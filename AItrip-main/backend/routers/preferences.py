from fastapi import APIRouter
from typing import Dict, Any, List
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api/preferences", tags=["preferences"])

class UserPreferences(BaseModel):
    dietary: List[str] = Field(default_factory=lambda: ["vegetarian"])
    transitPreference: str = "train"
    budgetRange: float = 30000.0
    favoriteStyles: List[str] = Field(default_factory=lambda: ["nature", "scenic", "heritage"])
    hotelTier: str = "Comfort (Curated Boutique)"
    pace: str = "Moderate (Balanced Exploration)"

# In-memory preference store with persistence
_USER_PREFS: Dict[str, Any] = {
    "dietary": ["Vegetarian / Plant-Forward"],
    "transitPreference": "Express Rail & Scenic Roadways",
    "budgetRange": 30000.0,
    "favoriteStyles": ["Nature & Scenic Panoramas", "Heritage & Architecture"],
    "hotelTier": "Comfort (Curated Boutique)",
    "pace": "Moderate (Balanced Exploration)",
}

@router.get("")
async def get_preferences():
    return _USER_PREFS

@router.put("")
async def update_preferences(prefs: UserPreferences):
    global _USER_PREFS
    _USER_PREFS = prefs.dict()
    return {"status": "saved", "preferences": _USER_PREFS}
