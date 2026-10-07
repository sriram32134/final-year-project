import uuid
from typing import Dict, Any, List
from langgraph.graph import StateGraph, START, END

from backend.agents.state import TripPlanningState
from backend.agents.specialized import (
    memory_agent_node,
    planner_agent_node,
    research_agent_node,
    weather_agent_node,
    transport_agent_node,
    hotel_agent_node,
    experiences_agent_node,
    safety_agent_node,
    budget_agent_node,
    conflict_detector_node,
    packing_agent_node,
    optimizer_node,
    replanning_node,
)
from backend.models.location import (
    TripPlanRequest,
    TripPlanResponse,
    TripReplanRequest,
    TripReplanResponse,
    DayItinerary,
    ItineraryWaypoint,
    AgentTelemetryEvent,
)

# 1. Build Main Trip Planning StateGraph
workflow = StateGraph(TripPlanningState)
workflow.add_node("memory", memory_agent_node)
workflow.add_node("planner", planner_agent_node)
workflow.add_node("research", research_agent_node)
workflow.add_node("weather", weather_agent_node)
workflow.add_node("transport", transport_agent_node)
workflow.add_node("hotel", hotel_agent_node)
workflow.add_node("experiences", experiences_agent_node)
workflow.add_node("safety", safety_agent_node)
workflow.add_node("budget", budget_agent_node)
workflow.add_node("conflict_detector", conflict_detector_node)
workflow.add_node("packing", packing_agent_node)
workflow.add_node("optimizer", optimizer_node)

workflow.add_edge(START, "memory")
workflow.add_edge("memory", "planner")
workflow.add_edge("planner", "research")
workflow.add_edge("research", "weather")
workflow.add_edge("weather", "transport")
workflow.add_edge("transport", "hotel")
workflow.add_edge("hotel", "experiences")
workflow.add_edge("experiences", "safety")
workflow.add_edge("safety", "budget")
workflow.add_edge("budget", "conflict_detector")
workflow.add_edge("conflict_detector", "packing")
workflow.add_edge("packing", "optimizer")
workflow.add_edge("optimizer", END)

plan_graph = workflow.compile()

# 2. Build Dynamic Replanning StateGraph
replan_workflow = StateGraph(TripPlanningState)
replan_workflow.add_node("conflict_detector", conflict_detector_node)
replan_workflow.add_node("replan", replanning_node)

replan_workflow.add_edge(START, "conflict_detector")
replan_workflow.add_edge("conflict_detector", "replan")
replan_workflow.add_edge("replan", END)

replan_graph = replan_workflow.compile()

class SupervisorAgent:
    @staticmethod
    async def orchestrate_plan(req: TripPlanRequest) -> TripPlanResponse:
        trip_id = f"trip-{uuid.uuid4().hex[:8]}"

        initial_state: TripPlanningState = {
            "origin": req.origin.dict(),
            "destination": req.destination.dict(),
            "duration_days": req.durationDays,
            "travelers": req.travelers,
            "budget": req.budget,
            "budget_tier": req.budgetTier or "Comfort (Curated Boutique)",
            "travel_style": req.travelStyle or "Bespoke Cultural & Scenic Discovery",
            "pace": req.pace or "Moderate (Balanced Exploration)",
            "preferences": req.preferences or ["nature", "culture", "culinary"],
            "user_prompt": req.userPrompt,
            "agent_events": [
                {
                    "agent": "SupervisorAgent",
                    "status": "initiated",
                    "message": f"Orchestrating autonomous LangGraph multi-agent planning pipeline for {req.destination.name} ({req.durationDays} Days, {req.travelers} Travelers).",
                    "timestamp": "00:00:01",
                }
            ],
        }

        # Execute LangGraph plan
        final_state = await plan_graph.ainvoke(initial_state)

        # Convert itinerary to Pydantic models
        itinerary_days: List[DayItinerary] = []
        for d in final_state.get("itinerary", []):
            waypoints = []
            for act in d.get("activities", []):
                waypoints.append(
                    ItineraryWaypoint(
                        id=act["id"],
                        time=act["time"],
                        title=act["title"],
                        description=act["description"],
                        location=act["location"],
                        lat=act["lat"],
                        lng=act["lng"],
                        category=act["category"],
                        cost=act.get("cost", 0.0),
                        duration=act.get("duration", "2 hours"),
                        transitTime=act.get("transitTime", "15 mins"),
                        icon=act.get("icon", "Compass"),
                    )
                )

            itinerary_days.append(
                DayItinerary(
                    day=d["day"],
                    title=d["title"],
                    theme=d.get("theme"),
                    morning=d.get("morning"),
                    afternoon=d.get("afternoon"),
                    evening=d.get("evening"),
                    diningRecommendation=d.get("diningRecommendation"),
                    activities=waypoints,
                )
            )

        # Convert agent events
        telemetry: List[AgentTelemetryEvent] = []
        for ev in final_state.get("agent_events", []):
            telemetry.append(
                AgentTelemetryEvent(
                    agent=ev.get("agent", "Agent"),
                    status=ev.get("status", "completed"),
                    message=ev.get("message", ""),
                    timestamp=ev.get("timestamp", ""),
                    details=ev.get("details"),
                )
            )

        return TripPlanResponse(
            tripId=trip_id,
            status="completed",
            origin=req.origin,
            destination=req.destination,
            summary=final_state.get("summary", f"Custom tailored itinerary for {req.destination.name}"),
            durationDays=req.durationDays,
            travelers=req.travelers,
            estimatedBudget=final_state.get("budget_analysis", {}),
            weatherOverview=final_state.get("weather_data", {}),
            transportRecommendation=final_state.get("transport_options", {}),
            hotelRecommendation=final_state.get("hotel_options", {}),
            safetyAdvisories=final_state.get("safety_information", {}),
            packingChecklist=final_state.get("packing_list", []),
            itinerary=itinerary_days,
            agentEvents=telemetry,
            conflictsDetected=final_state.get("conflicts", []),
            optimizationsApplied=final_state.get("optimizations", []),
        )

    @staticmethod
    async def replan_trip(req: TripReplanRequest) -> TripReplanResponse:
        current = req.currentTrip
        dest = current.get("destination", {})
        if isinstance(dest, str):
            dest = {"name": dest, "latitude": 20.0, "longitude": 78.0}

        replan_state: TripPlanningState = {
            "destination": dest,
            "condition_change": req.conditionChange,
            "disruption_type": req.disruptionType,
            "itinerary": current.get("itinerary", []),
            "weather_data": current.get("weatherOverview", {}),
            "budget_analysis": current.get("estimatedBudget", {}),
            "agent_events": [
                {
                    "agent": "SupervisorAgent",
                    "status": "initiated",
                    "message": f"Supervisor triggered dynamic replanning: {req.conditionChange} (Severity: {req.severity}).",
                    "timestamp": "00:00:01",
                }
            ],
        }

        replan_output = await replan_graph.ainvoke(replan_state)

        updated_days: List[DayItinerary] = []
        for d in replan_output.get("updated_itinerary", []):
            waypoints = []
            for act in d.get("activities", []):
                waypoints.append(
                    ItineraryWaypoint(
                        id=act.get("id", str(uuid.uuid4())[:8]),
                        time=act.get("time", "10:00"),
                        title=act.get("title", ""),
                        description=act.get("description", ""),
                        location=act.get("location", ""),
                        lat=act.get("lat", 0.0),
                        lng=act.get("lng", 0.0),
                        category=act.get("category", "Activity"),
                        cost=act.get("cost", 0.0),
                        duration=act.get("duration", "2 hours"),
                        transitTime=act.get("transitTime", "15 mins"),
                        icon=act.get("icon", "Compass"),
                    )
                )

            updated_days.append(
                DayItinerary(
                    day=d.get("day", 1),
                    title=d.get("title", f"Day {d.get('day', 1)}"),
                    theme=d.get("theme"),
                    morning=d.get("morning"),
                    afternoon=d.get("afternoon"),
                    evening=d.get("evening"),
                    diningRecommendation=d.get("diningRecommendation"),
                    activities=waypoints,
                )
            )

        telemetry: List[AgentTelemetryEvent] = []
        for ev in replan_output.get("agent_events", []):
            telemetry.append(
                AgentTelemetryEvent(
                    agent=ev.get("agent", "ReplanningAgent"),
                    status=ev.get("status", "replanned"),
                    message=ev.get("message", ""),
                    timestamp=ev.get("timestamp", ""),
                    details=ev.get("details"),
                )
            )

        return TripReplanResponse(
            tripId=req.tripId,
            status="replanned",
            conditionChange=req.conditionChange,
            replanSummary=replan_output.get("replan_summary", f"Itinerary adapted for {req.conditionChange}"),
            conflictsIdentified=replan_output.get("conflicts", []),
            adaptationsApplied=replan_output.get("adaptations_applied", []),
            updatedItinerary=updated_days,
            updatedBudget=current.get("estimatedBudget"),
            agentEvents=telemetry,
        )
