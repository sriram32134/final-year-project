from typing import TypedDict, List, Dict, Any, Optional
from backend.models.location import (
    TripOrigin,
    TripDestination,
    DayItinerary,
    AgentTelemetryEvent,
)

class TripPlanningState(TypedDict, total=False):
    # Core User Request & Context
    trip_id: Optional[str]
    tripId: Optional[str]
    user_request: Optional[str]
    origin: Dict[str, Any]
    destination: Dict[str, Any]
    destinations: Optional[List[Dict[str, Any]]] # Multi-city support
    travel_dates: Optional[Dict[str, str]]
    duration_days: int
    travelers: int
    budget: float
    currency: str
    budget_tier: str
    travel_style: str
    pace: str
    preferences: List[str]
    user_prompt: Optional[str]

    # Location & Provider Context
    location_context: Dict[str, Any]
    memory_context: Dict[str, Any]

    # Agent Deliverables
    research: Dict[str, Any]
    weather_data: Dict[str, Any]
    transport_options: Dict[str, Any]
    hotel_options: Dict[str, Any]
    attractions: List[Dict[str, Any]]
    local_experiences: List[Dict[str, Any]]
    safety_information: Dict[str, Any]
    budget_analysis: Dict[str, Any]
    packing_list: List[Dict[str, Any]]
    warnings: List[str]

    # Multi-Agent Coordination, Conflict Resolution & Synthesis
    conflicts: List[Dict[str, Any]]
    optimizations: List[str]
    itinerary: List[Dict[str, Any]]
    updated_itinerary: Optional[List[Dict[str, Any]]]
    agent_events: List[Dict[str, Any]]
    summary: str
    final_response: Dict[str, Any]

    # Dynamic Replanning State
    condition_change: Optional[str]
    disruption_type: Optional[str]
    replan_summary: Optional[str]
    adaptations_applied: List[str]
