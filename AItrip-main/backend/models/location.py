from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Literal
from datetime import datetime

class NearbyPlace(BaseModel):
    id: str
    name: str
    category: str
    latitude: float
    longitude: float
    distanceKm: Optional[float] = None
    rating: Optional[float] = 4.8
    description: Optional[str] = None
    image: Optional[str] = None

class NormalizedLocation(BaseModel):
    id: str
    name: str
    country: str
    region: Optional[str] = None
    latitude: float
    longitude: float
    type: Literal["city", "country", "landmark", "region", "destination", "mountain", "ocean", "desert"] = "city"
    source: Literal["curated", "maptiler", "nominatim", "overpass", "google", "dynamic"] = "google"
    provider: Optional[Literal["google", "nominatim", "curated", "dynamic"]] = "google"
    providerPlaceId: Optional[str] = None
    formattedName: Optional[str] = None
    curated: bool = False
    providerId: Optional[str] = None
    image: Optional[str] = None
    photoReferences: Optional[List[str]] = Field(default_factory=list)
    photoUrl: Optional[str] = None
    photoAttributions: Optional[List[Dict[str, Any]]] = Field(default_factory=list)
    googleMapsUri: Optional[str] = None
    attributions: Optional[List[Dict[str, Any]]] = Field(default_factory=list)
    viewport: Optional[Dict[str, Any]] = None
    travelStyle: Optional[str] = None
    weather: Optional[Dict[str, Any]] = None
    startingBudget: Optional[float] = None
    bestSeason: Optional[str] = None
    shortDescription: Optional[str] = None
    description: Optional[str] = None
    attractions: Optional[List[Dict[str, Any]]] = Field(default_factory=list)
    nearbyPlaces: Optional[List[NearbyPlace]] = Field(default_factory=list)
    tags: Optional[List[str]] = Field(default_factory=list)
    cameraDistance: Optional[float] = None

class LocationSearchResponse(BaseModel):
    query: str
    results: List[NormalizedLocation]
    total: int

class LocationResolveRequest(BaseModel):
    query: str

class TripOrigin(BaseModel):
    name: str = "Hyderabad"
    latitude: Optional[float] = 17.3850
    longitude: Optional[float] = 78.4867
    country: Optional[str] = "India"

class TripDestination(BaseModel):
    name: str
    country: str = "Global"
    region: Optional[str] = None
    latitude: Optional[float] = 20.0
    longitude: Optional[float] = 78.0
    type: Optional[str] = "city"
    curated: bool = False
    image: Optional[str] = None
    shortDescription: Optional[str] = None

class TripPlanRequest(BaseModel):
    origin: TripOrigin
    destination: TripDestination
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    durationDays: int = 4
    travelers: int = 2
    budget: float = 30000.0
    budgetTier: Optional[str] = "Comfort (Curated Boutique)"
    travelStyle: Optional[str] = "Bespoke Cultural & Scenic Discovery"
    pace: Optional[str] = "Moderate (Balanced Exploration)"
    preferences: List[str] = Field(default_factory=lambda: ["nature", "relaxed", "culture", "culinary"])
    userPrompt: Optional[str] = None

class ItineraryWaypoint(BaseModel):
    id: str
    time: str
    title: str
    description: str
    location: str
    lat: float
    lng: float
    category: str
    cost: float = 0.0
    duration: str = "1.5 hours"
    transitTime: Optional[str] = "15 mins transit"
    icon: Optional[str] = "Compass"

class DayItinerary(BaseModel):
    day: int
    title: str
    theme: Optional[str] = None
    morning: Optional[str] = None
    afternoon: Optional[str] = None
    evening: Optional[str] = None
    diningRecommendation: Optional[str] = None
    activities: List[ItineraryWaypoint] = Field(default_factory=list)

class AgentTelemetryEvent(BaseModel):
    agent: str
    status: Literal["initiated", "running", "completed", "warning", "replanned"] = "completed"
    message: str
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().strftime("%H:%M:%S"))
    details: Optional[Dict[str, Any]] = None

class TripPlanResponse(BaseModel):
    tripId: str
    status: Literal["completed", "in_progress", "failed"] = "completed"
    origin: TripOrigin
    destination: TripDestination
    summary: str
    durationDays: int
    travelers: int
    estimatedBudget: Dict[str, Any]
    weatherOverview: Dict[str, Any]
    transportRecommendation: Dict[str, Any]
    hotelRecommendation: Dict[str, Any]
    safetyAdvisories: Dict[str, Any]
    packingChecklist: List[Dict[str, Any]] = Field(default_factory=list)
    itinerary: List[DayItinerary]
    agentEvents: List[AgentTelemetryEvent] = Field(default_factory=list)
    conflictsDetected: List[Dict[str, Any]] = Field(default_factory=list)
    optimizationsApplied: List[str] = Field(default_factory=list)
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class TripReplanRequest(BaseModel):
    tripId: str
    conditionChange: str
    disruptionType: Literal["flight_delay", "weather_alert", "attraction_closure", "budget_cut", "custom"] = "custom"
    severity: Literal["low", "medium", "critical"] = "medium"
    currentTrip: Dict[str, Any]
    userOverrideNotes: Optional[str] = None

class TripReplanResponse(BaseModel):
    tripId: str
    status: Literal["replanned", "unchanged", "failed"] = "replanned"
    conditionChange: str
    replanSummary: str
    conflictsIdentified: List[Dict[str, Any]]
    adaptationsApplied: List[str]
    updatedItinerary: List[DayItinerary]
    updatedBudget: Optional[Dict[str, Any]] = None
    agentEvents: List[AgentTelemetryEvent] = Field(default_factory=list)
    updated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
