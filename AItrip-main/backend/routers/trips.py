from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, List, Optional, Any
import uuid
import json
from datetime import datetime
from backend.models.location import (
    TripPlanRequest,
    TripPlanResponse,
    TripReplanRequest,
    TripReplanResponse,
    AgentTelemetryEvent,
)
from backend.agents.supervisor import SupervisorAgent
from backend.database import get_db, SessionLocal
from backend.models.db_models import Trip, TripDestination, TripSegment, TripActivity, AgentRun, AgentEvent, TripRevision, WeatherRecord

router = APIRouter(prefix="/api/trips", tags=["trips"])

# In-memory trip store and recent request cache to prevent duplicate executions
_TRIP_STORE: Dict[str, TripPlanResponse] = {}
_RECENT_PLAN_CACHE: Dict[str, Any] = {}

def _persist_trip_to_db(plan: TripPlanResponse):
    try:
        with SessionLocal() as db:
            db_trip = Trip(
                id=plan.tripId,
                origin_name=plan.origin.name,
                origin_lat=plan.origin.latitude,
                origin_lng=plan.origin.longitude,
                destination_name=plan.destination.name,
                destination_lat=plan.destination.latitude,
                destination_lng=plan.destination.longitude,
                duration_days=plan.durationDays,
                travelers=plan.travelers,
                budget=plan.estimatedBudget.get("totalEstimated", 30000.0),
                currency="INR",
                summary=plan.summary,
                status=plan.status,
            )
            db.merge(db_trip)

            # Prevent duplicate child rows by cleaning previous entries for this tripId
            db.query(TripDestination).filter(TripDestination.trip_id == plan.tripId).delete()
            db.query(AgentRun).filter(AgentRun.trip_id == plan.tripId).delete()
            db.query(AgentEvent).filter(AgentEvent.trip_id == plan.tripId).delete()
            db.query(TripActivity).filter(TripActivity.trip_id == plan.tripId).delete()

            # Persist destination
            dest = TripDestination(
                id=f"td-{uuid.uuid4().hex[:8]}",
                trip_id=plan.tripId,
                name=plan.destination.name,
                country=plan.destination.country,
                latitude=plan.destination.latitude,
                longitude=plan.destination.longitude,
            )
            db.add(dest)

            # Persist agent run and telemetry events
            run = AgentRun(
                id=f"run-{uuid.uuid4().hex[:8]}",
                trip_id=plan.tripId,
                trigger_type="plan_creation",
                status="completed",
                total_events=len(plan.agentEvents),
            )
            db.add(run)

            for ev in plan.agentEvents:
                a_ev = AgentEvent(
                    id=f"ev-{uuid.uuid4().hex[:8]}",
                    run_id=run.id,
                    trip_id=plan.tripId,
                    agent_name=ev.agent,
                    status=ev.status,
                    message=ev.message,
                    timestamp=ev.timestamp,
                    details_json=json.dumps(ev.details) if ev.details else None,
                )
                db.add(a_ev)

            # Persist activities
            for day in plan.itinerary:
                for act in day.activities:
                    db_act = TripActivity(
                        id=act.id,
                        trip_id=plan.tripId,
                        day_number=day.day,
                        time_slot=act.time,
                        title=act.title,
                        description=act.description,
                        location=act.location,
                        latitude=act.lat,
                        longitude=act.lng,
                        category=act.category,
                        cost=act.cost,
                        duration=act.duration,
                        transit_time=act.transitTime,
                        icon=act.icon,
                    )
                    db.merge(db_act)

            # Persist weather records if real weather data available
            if plan.weatherOverview and plan.weatherOverview.get("available", True) and plan.weatherOverview.get("source") != "unavailable":
                db.query(WeatherRecord).filter(WeatherRecord.trip_id == plan.tripId).delete()
                daily_forecasts = plan.weatherOverview.get("dailyForecasts", [])
                if daily_forecasts:
                    for df in daily_forecasts:
                        w_rec = WeatherRecord(
                            id=f"wx-{uuid.uuid4().hex[:8]}",
                            trip_id=plan.tripId,
                            destination=plan.destination.name,
                            latitude=plan.destination.latitude,
                            longitude=plan.destination.longitude,
                            forecast_date=df.get("date"),
                            temperature_max=df.get("max_temp"),
                            temperature_min=df.get("min_temp"),
                            weather_code=df.get("code"),
                            precipitation_probability=df.get("precipitation_prob"),
                            humidity=plan.weatherOverview.get("humidity"),
                        )
                        db.add(w_rec)
                else:
                    w_rec = WeatherRecord(
                        id=f"wx-{uuid.uuid4().hex[:8]}",
                        trip_id=plan.tripId,
                        destination=plan.destination.name,
                        latitude=plan.destination.latitude,
                        longitude=plan.destination.longitude,
                        forecast_date=None,
                        temperature_max=plan.weatherOverview.get("highC"),
                        temperature_min=plan.weatherOverview.get("lowC"),
                        weather_code=plan.weatherOverview.get("weatherCode"),
                        precipitation_probability=plan.weatherOverview.get("rainProbability"),
                        humidity=plan.weatherOverview.get("humidity"),
                    )
                    db.add(w_rec)

            # Persist transport segment with duplicate protection
            if plan.transportRecommendation:
                db.query(TripSegment).filter(TripSegment.trip_id == plan.tripId).delete()
                tr = plan.transportRecommendation
                from_name = tr.get("origin") or tr.get("from_name") or plan.origin.name
                to_name = tr.get("destination") or tr.get("to_name") or plan.destination.name
                transit_mode = tr.get("primaryMode") or tr.get("mode") or tr.get("transit_mode") or "Flight / Express Rail"
                estimated_duration = tr.get("transitTime") or tr.get("estimatedDuration") or tr.get("estimated_duration") or "2 hours"
                estimated_cost = float(tr.get("estimatedCostPerPerson") or tr.get("estimated_cost") or tr.get("cost") or 0.0)

                db_seg = TripSegment(
                    id=f"seg-{uuid.uuid4().hex[:8]}",
                    trip_id=plan.tripId,
                    from_name=from_name,
                    to_name=to_name,
                    transit_mode=str(transit_mode),
                    estimated_duration=str(estimated_duration),
                    estimated_cost=estimated_cost,
                    sequence_order=1,
                )
                db.add(db_seg)

            db.commit()
    except Exception as e:
        # Non-blocking db persistence
        pass


def _convert_db_trip_to_response(db_trip: Trip, db) -> TripPlanResponse:
    trip_id = db_trip.id

    # If full plan exists in _TRIP_STORE during current process lifetime, use it & attach weather records
    if trip_id in _TRIP_STORE:
        plan = _TRIP_STORE[trip_id]
        weather_recs = db.query(WeatherRecord).filter(WeatherRecord.trip_id == trip_id).order_by(WeatherRecord.created_at.asc()).all()
        if weather_recs:
            dfs = []
            for w in weather_recs:
                dfs.append({
                    "date": w.forecast_date,
                    "max_temp": w.temperature_max,
                    "min_temp": w.temperature_min,
                    "code": w.weather_code,
                    "precipitation_prob": w.precipitation_probability,
                })
            plan.weatherOverview["dailyForecasts"] = dfs
            plan.weatherOverview["recordCount"] = len(weather_recs)
        return plan

    # Otherwise reconstruct from PostgreSQL tables
    db_dest = db.query(TripDestination).filter(TripDestination.trip_id == trip_id).first()
    dest_name = db_dest.name if db_dest else db_trip.destination_name
    dest_country = db_dest.country if db_dest else "Global"
    dest_lat = db_dest.latitude if db_dest else db_trip.destination_lat
    dest_lng = db_dest.longitude if db_dest else db_trip.destination_lng

    # Fetch weather records from PostgreSQL
    weather_recs = db.query(WeatherRecord).filter(WeatherRecord.trip_id == trip_id).order_by(WeatherRecord.created_at.asc()).all()
    daily_forecasts = []
    for w in weather_recs:
        daily_forecasts.append({
            "date": w.forecast_date,
            "max_temp": w.temperature_max,
            "min_temp": w.temperature_min,
            "code": w.weather_code,
            "precipitation_prob": w.precipitation_probability,
        })

    weather_overview = {
        "available": True if weather_recs else False,
        "destination": dest_name,
        "tempC": round(weather_recs[0].temperature_max) if weather_recs and weather_recs[0].temperature_max is not None else 24,
        "highC": round(weather_recs[0].temperature_max) if weather_recs and weather_recs[0].temperature_max is not None else 28,
        "lowC": round(weather_recs[0].temperature_min) if weather_recs and weather_recs[0].temperature_min is not None else 19,
        "typicalRange": f"{weather_recs[0].temperature_min}°C - {weather_recs[0].temperature_max}°C" if weather_recs and weather_recs[0].temperature_min is not None else "N/A",
        "condition": "Meteorological Observations Active" if weather_recs else "Weather Data Unavailable",
        "humidity": weather_recs[0].humidity if weather_recs and weather_recs[0].humidity else "55%",
        "windSpeed": "12 km/h",
        "rainProbability": round(weather_recs[0].precipitation_probability) if weather_recs and weather_recs[0].precipitation_probability is not None else 0,
        "safetyRisk": "Optimal Travel Conditions",
        "icon": "Sun",
        "source": "open-meteo",
        "weatherCode": weather_recs[0].weather_code if weather_recs else None,
        "dailyForecasts": daily_forecasts,
        "recordCount": len(weather_recs),
    }

    # Fetch agent telemetry events & transport/PNR info from PostgreSQL
    db_events = db.query(AgentEvent).filter(AgentEvent.trip_id == trip_id).all()
    agent_events = []
    transport_rec = {"mode": "Express Rail / Scenic Highway", "estimatedDuration": "3 hours"}

    for ev in db_events:
        agent_events.append({
            "agent": ev.agent_name,
            "status": ev.status or "completed",
            "message": ev.message,
            "timestamp": ev.timestamp or "00:00:00",
        })
        if ev.agent_name == "TransportAgent" and ev.details_json:
            try:
                details = json.loads(ev.details_json) if isinstance(ev.details_json, str) else ev.details_json
                if isinstance(details, dict) and "pnr" in details:
                    transport_rec = {
                        "origin": db_trip.origin_name,
                        "destination": dest_name,
                        "primaryMode": f"Scheduled Commercial Flight ({details.get('flightNumber', '6E-532')})",
                        "provider": "Flight Demo Website (Playwright Automation)",
                        "isAutomatedBooking": True,
                        "bookingReference": details.get("pnr"),
                        "bookingStatus": details.get("status", "confirmed"),
                        "flightNumber": details.get("flightNumber"),
                        "transitTime": f"{details.get('duration', '2h 15m')} flight",
                        "duration": details.get("duration", "2h 15m"),
                        "aircraft": details.get("aircraft", "Boeing 787-9 Dreamliner"),
                        "distanceKm": details.get("distanceKm", 1200),
                        "portalUrl": details.get("portalUrl", "http://localhost:5174")
                    }
            except Exception:
                pass

    # Fetch activities & reconstruct itinerary from PostgreSQL
    db_acts = db.query(TripActivity).filter(TripActivity.trip_id == trip_id).all()
    day_map: Dict[int, List[Dict[str, Any]]] = {}
    for act in db_acts:
        d_num = act.day_number
        if d_num not in day_map:
            day_map[d_num] = []
        day_map[d_num].append({
            "id": act.id,
            "time": act.time_slot or "09:00",
            "title": act.title,
            "description": act.description or "",
            "location": act.location or dest_name,
            "lat": act.latitude or dest_lat,
            "lng": act.longitude or dest_lng,
            "category": act.category or "Activity",
            "cost": act.cost or 0.0,
            "duration": act.duration or "2 hours",
            "transitTime": act.transit_time or "15 mins transit",
            "icon": act.icon or "Compass",
        })

    itinerary_days = []
    for day_num in sorted(day_map.keys()):
        itinerary_days.append({
            "day": day_num,
            "title": f"Day {day_num}: Regional Exploration",
            "theme": "Curated itinerary day",
            "activities": day_map[day_num],
        })

    response_data = {
        "tripId": db_trip.id,
        "status": db_trip.status or "completed",
        "origin": {
            "name": db_trip.origin_name,
            "latitude": db_trip.origin_lat,
            "longitude": db_trip.origin_lng,
        },
        "destination": {
            "name": dest_name,
            "country": dest_country,
            "latitude": dest_lat,
            "longitude": dest_lng,
        },
        "summary": db_trip.summary or f"Personalized expedition to {dest_name}",
        "durationDays": db_trip.duration_days,
        "travelers": db_trip.travelers,
        "estimatedBudget": {
            "totalEstimated": db_trip.budget,
            "currency": db_trip.currency or "INR",
        },
        "weatherOverview": weather_overview,
        "transportRecommendation": transport_rec,
        "hotelRecommendation": {"recommendedProperty": "Curated Boutique Eco-Lodge", "nightlyRateINR": 4500},
        "safetyAdvisories": {"advisories": ["Standard tourist corridor safe"], "emergencyContacts": {"police": "112"}},
        "packingChecklist": [],
        "itinerary": itinerary_days,
        "agentEvents": agent_events,
        "conflictsDetected": [],
        "optimizationsApplied": ["Retrieved from PostgreSQL database"],
        "created_at": db_trip.created_at.isoformat() if db_trip.created_at else datetime.utcnow().isoformat(),
    }

    return TripPlanResponse(**response_data)


@router.get("", response_model=List[TripPlanResponse])
async def list_trips():
    """
    PostgreSQL-backed trip list endpoint.
    Queries PostgreSQL trips table using SQLAlchemy SessionLocal.
    Returns [] if database contains no trips. Deduplicates duplicate entries.
    """
    try:
        with SessionLocal() as db:
            db_trips = db.query(Trip).order_by(Trip.created_at.desc()).all()
            if not db_trips:
                return []
            
            results = []
            seen_trips = set()
            for db_trip in db_trips:
                # Deduplicate trips that have the same destination and were created within 60s
                dup_key = f"{db_trip.destination_name}:{db_trip.origin_name}:{db_trip.created_at.strftime('%Y%m%d%H%M') if db_trip.created_at else ''}"
                if dup_key in seen_trips:
                    continue
                seen_trips.add(dup_key)
                res = _convert_db_trip_to_response(db_trip, db)
                results.append(res)
            return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database trips retrieval error: {str(e)}")


@router.post("", response_model=TripPlanResponse)
async def create_trip(request: TripPlanRequest):
    plan = await SupervisorAgent.orchestrate_plan(request)
    _TRIP_STORE[plan.tripId] = plan
    _persist_trip_to_db(plan)
    return plan


@router.post("/plan", response_model=TripPlanResponse)
async def plan_trip(request: TripPlanRequest):
    try:
        cache_key = f"{request.origin.name.lower()}:{request.destination.name.lower()}:{request.durationDays}:{request.travelers}"
        now_ts = datetime.utcnow().timestamp()

        # In-flight deduplication: return cached plan if same request received within 12 seconds
        if cache_key in _RECENT_PLAN_CACHE:
            cached_entry = _RECENT_PLAN_CACHE[cache_key]
            if now_ts - cached_entry.get("time", 0) < 12.0:
                return cached_entry.get("plan")

        plan = await SupervisorAgent.orchestrate_plan(request)
        _TRIP_STORE[plan.tripId] = plan
        _persist_trip_to_db(plan)
        _RECENT_PLAN_CACHE[cache_key] = {"time": now_ts, "plan": plan}
        return plan
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Trip Planning orchestration error: {str(e)}")


@router.get("/{trip_id}", response_model=TripPlanResponse)
async def get_trip(trip_id: str):
    try:
        with SessionLocal() as db:
            db_trip = db.query(Trip).filter(Trip.id == trip_id).first()
            if not db_trip:
                raise HTTPException(status_code=404, detail="Trip not found")

            return _convert_db_trip_to_response(db_trip, db)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database trip retrieval error: {str(e)}")


@router.post("/{trip_id}/replan", response_model=TripReplanResponse)
async def replan_specific_trip(trip_id: str, request: TripReplanRequest):
    try:
        request.tripId = trip_id
        replan = await SupervisorAgent.replan_trip(request)
        return replan
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Dynamic Replanning error: {str(e)}")


@router.post("/replan", response_model=TripReplanResponse)
async def replan_trip(request: TripReplanRequest):
    try:
        replan = await SupervisorAgent.replan_trip(request)
        return replan
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Dynamic Replanning error: {str(e)}")


@router.get("/{trip_id}/events", response_model=List[AgentTelemetryEvent])
async def get_trip_events(trip_id: str):
    try:
        with SessionLocal() as db:
            db_events = db.query(AgentEvent).filter(AgentEvent.trip_id == trip_id).all()
            if db_events:
                return [
                    AgentTelemetryEvent(
                        agent=ev.agent_name,
                        status=ev.status or "completed",
                        message=ev.message,
                        timestamp=ev.timestamp or "00:00:00",
                    )
                    for ev in db_events
                ]
    except Exception:
        pass
    if trip_id in _TRIP_STORE:
        return _TRIP_STORE[trip_id].agentEvents
    raise HTTPException(status_code=404, detail="Trip not found")
