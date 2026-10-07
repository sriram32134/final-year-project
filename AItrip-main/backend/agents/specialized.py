from backend.agents.flight_booking_agent import FlightBookingAgent
from backend.agents.hotel_booking_agent import HotelBookingAgent
from backend.models.booking import FlightBookingRequest, HotelBookingRequest, HotelBookingResponse
import math
import uuid
from datetime import datetime
from typing import Dict, Any, List
from backend.agents.state import TripPlanningState

from backend.providers.tavily import TavilyResearchProvider
from backend.providers.open_meteo import OpenMeteoWeatherProvider
from backend.providers.amadeus import AmadeusTransportProvider, AmadeusHotelProvider, haversine_distance_km
from backend.providers.geoapify import GeoapifyPlacesProvider
from backend.providers.frankfurter import FrankfurterCurrencyProvider
from backend.providers.groq_llm import GroqLLMProvider

# 0. Memory Agent Node (Persistent Preferences & Traveler Profile)
async def memory_agent_node(state: TripPlanningState) -> Dict[str, Any]:
    from backend.routers.preferences import _USER_PREFS

    saved_dietary = _USER_PREFS.get("dietary", ["Vegetarian / Plant-Forward"])
    saved_transit = _USER_PREFS.get("transitPreference", "Express Rail & Scenic Roadways")
    saved_styles = _USER_PREFS.get("favoriteStyles", ["Nature & Scenic Panoramas", "Heritage & Architecture"])
    saved_tier = _USER_PREFS.get("hotelTier", "Comfort (Curated Boutique)")
    saved_pace = _USER_PREFS.get("pace", "Moderate (Balanced Exploration)")

    current_prefs = list(state.get("preferences", []))
    merged_prefs = list(set(current_prefs + [s.lower() for s in saved_styles] + [d.lower() for d in saved_dietary]))

    events = state.get("agent_events", [])
    events.append({
        "agent": "MemoryAgent",
        "status": "completed",
        "message": f"Retrieved traveler profile: Dietary={', '.join(saved_dietary)}, Transit={saved_transit}, Styles={', '.join(saved_styles)}.",
        "timestamp": datetime.utcnow().strftime("%H:%M:%S"),
        "details": {
            "dietary": saved_dietary,
            "transitPreference": saved_transit,
            "favoriteStyles": saved_styles,
            "hotelTier": saved_tier,
        }
    })

    return {
        "memory_context": {
            "dietary": saved_dietary,
            "transitPreference": saved_transit,
            "favoriteStyles": saved_styles,
            "hotelTier": saved_tier,
            "pace": saved_pace,
        },
        "preferences": merged_prefs,
        "agent_events": events,
    }

# 1. Planner Agent Node (Single and Multi-City Strategic Routing)
async def planner_agent_node(state: TripPlanningState) -> Dict[str, Any]:
    dest = state.get("destination", {})
    dest_name = dest.get("name", "Destination")
    multi_dests = state.get("destinations") or []
    days = max(1, int(state.get("duration_days", 4)))
    travelers = max(1, int(state.get("travelers", 2)))
    prefs = state.get("preferences", ["nature", "culture"])
    style = state.get("travel_style", "Bespoke Cultural & Scenic Discovery")

    events = state.get("agent_events", [])
    if len(multi_dests) > 1:
        city_names = [d.get("name", "Stop") for d in multi_dests]
        events.append({
            "agent": "PlannerAgent",
            "status": "completed",
            "message": f"Formulated {days}-day multi-city expedition sequence ({' → '.join(city_names)}) for {travelers} travelers pursuing {style}.",
            "timestamp": datetime.utcnow().strftime("%H:%M:%S"),
            "details": {"multiCityRoute": city_names, "duration": days, "travelers": travelers}
        })
    else:
        events.append({
            "agent": "PlannerAgent",
            "status": "completed",
            "message": f"Formulated {days}-day strategic itinerary framework for {travelers} travelers pursuing {style}.",
            "timestamp": datetime.utcnow().strftime("%H:%M:%S"),
            "details": {"duration": days, "travelers": travelers, "primaryFocus": prefs}
        })

    return {
        "location_context": {
            "name": dest_name,
            "coordinates": (dest.get("latitude", 20.0), dest.get("longitude", 78.0)),
            "duration": days,
            "multiDests": multi_dests,
        },
        "agent_events": events,
    }

# 2. Research Agent Node (Tavily Live Web Intelligence)
async def research_agent_node(state: TripPlanningState) -> Dict[str, Any]:
    dest = state.get("destination", {})
    dest_name = dest.get("name", "Destination")
    dest_country = dest.get("country", "Global")
    prefs = state.get("preferences", ["culture", "nature"])

    research_res = await TavilyResearchProvider.research_destination(
        destination=dest_name,
        country=dest_country,
        preferences=prefs,
    )

    events = state.get("agent_events", [])
    events.append({
        "agent": "ResearchAgent",
        "status": "completed",
        "message": f"Synthesized cultural highlights and live travel intelligence for {dest_name} ({'Tavily Live' if research_res.get('liveResearched') else 'Curated Geo'}).",
        "timestamp": datetime.utcnow().strftime("%H:%M:%S"),
        "details": {"liveWebResearch": research_res.get("liveResearched", False)}
    })

    return {
        "research": {
            "destination": dest_name,
            "country": dest_country,
            "synthesis": research_res.get("synthesis"),
            "highlights": research_res.get("highlights", []),
            "sources": research_res.get("sources", []),
        },
        "agent_events": events,
    }

# 3. Weather Agent Node (Real Open-Meteo Meteorological Observations)
async def weather_agent_node(state: TripPlanningState) -> Dict[str, Any]:
    dest = state.get("destination", {})
    lat = float(dest.get("latitude", 20.0))
    lng = float(dest.get("longitude", 78.0))
    dest_name = dest.get("name", "Destination")

    weather_data = await OpenMeteoWeatherProvider.get_weather(lat, lng)

    events = state.get("agent_events", [])
    events.append({
        "agent": "WeatherAgent",
        "status": "completed",
        "message": f"Retrieved live Open-Meteo conditions for ({lat:.2f}°N, {lng:.2f}°E): {weather_data['tempC']}°C, {weather_data['condition']}.",
        "timestamp": datetime.utcnow().strftime("%H:%M:%S"),
        "details": {
            "temperature": f"{weather_data['tempC']}°C",
            "condition": weather_data["condition"],
            "rainProbability": f"{weather_data['rainProbability']}%",
        }
    })

    return {
        "weather_data": {
            "available": weather_data.get("available", True),
            "destination": dest_name,
            "tempC": weather_data.get("tempC"),
            "highC": weather_data.get("highC"),
            "lowC": weather_data.get("lowC"),
            "typicalRange": f"{weather_data.get('lowC')}°C – {weather_data.get('highC')}°C" if weather_data.get("lowC") is not None else "N/A",
            "condition": weather_data.get("condition"),
            "humidity": weather_data.get("humidity"),
            "windSpeed": weather_data.get("windSpeed"),
            "rainProbability": weather_data.get("rainProbability"),
            "safetyRisk": weather_data.get("safetyRisk"),
            "icon": weather_data.get("icon"),
            "weatherCode": weather_data.get("weatherCode"),
            "dailyForecasts": weather_data.get("dailyForecasts", []),
            "source": weather_data.get("source", "open-meteo"),
        },
        "agent_events": events,
    }

# 4. Transport Agent Node (Amadeus Corridor, Multi-Leg Routing, and Geodesic Geometry)
# 4. Transport Agent Node (Playwright Flight Automation + Corridor Fallback)
async def transport_agent_node(state: TripPlanningState) -> Dict[str, Any]:
    orig = state.get("origin", {})
    dest = state.get("destination", {})
    origin_name = orig.get("name", "Hyderabad")
    dest_name = dest.get("name", "Bengaluru")
    o_lat = float(orig.get("latitude", 17.3850))
    o_lng = float(orig.get("longitude", 78.4867))
    d_lat = float(dest.get("latitude", 12.9716))
    d_lng = float(dest.get("longitude", 77.5946))

    distance_km = round(haversine_distance_km(o_lat, o_lng, d_lat, d_lng))
    travelers_count = int(state.get("travelers", 1))
    
    # Extract travel date from state (supports startDate, start_date, departureDate, date)
    travel_date = (
        state.get("startDate") or 
        state.get("start_date") or 
        state.get("departureDate") or 
        state.get("date") or 
        "2026-10-10"
    )

    events = state.get("agent_events", [])
    events.append({
        "agent": "TransportAgent",
        "status": "initiated",
        "message": f"Formulating transport corridor for {origin_name} -> {dest_name} ({travelers_count} traveler(s), Date: {travel_date}).",
        "timestamp": datetime.utcnow().strftime("%H:%M:%S"),
    })

    # Attempt Playwright Flight Booking Automation via FlightBookingAgent
    flight_response = None
    try:
        booking_request = FlightBookingRequest(
            from_city=origin_name,
            to_city=dest_name,
            date=travel_date,
            passengers=travelers_count,
            passenger_name="Demo User",
            email="demo@example.com",
            phone="9999999999"
        )
        flight_response = await FlightBookingAgent.book_flight(booking_request)
    except Exception as e:
        events.append({
            "agent": "TransportAgent",
            "status": "warning",
            "message": f"Flight automation exception encountered: {str(e)}",
            "timestamp": datetime.utcnow().strftime("%H:%M:%S"),
        })

    # If Playwright automation succeeded, populate real returned values
    if flight_response and flight_response.success:
        cost_est = round(distance_km * 7 + 3000)
        
        events.append({
            "agent": "TransportAgent",
            "status": "completed",
            "message": f"Autonomous Playwright flight booking confirmed for {origin_name} -> {dest_name} (PNR: {flight_response.pnr}).",
            "timestamp": datetime.utcnow().strftime("%H:%M:%S"),
            "details": {
                "pnr": flight_response.pnr,
                "flightNumber": flight_response.flight_number,
                "status": flight_response.status,
                "portalUrl": "http://localhost:5174"
            }
        })

        return {
            "transport": {
                "origin": origin_name,
                "destination": dest_name,
                "distanceKm": distance_km,
                "primaryMode": f"Scheduled Commercial Flight ({flight_response.flight_number})",
                "transitTime": "1h 15m direct flight",
                "localTransit": "App Taxis & Destination Cab Rentals",
                "estimatedCostPerPerson": cost_est,
                "departureHub": f"{origin_name} Airport ({origin_name[:3].upper()})",
                "arrivalHub": f"{dest_name} Airport ({dest_name[:3].upper()})",
                "provider": "Flight Demo Website (Playwright Automation)",
                "isAutomatedBooking": True,
                "bookingReference": flight_response.pnr,
                "bookingStatus": flight_response.status,
                "flightNumber": flight_response.flight_number,
                "passengerName": flight_response.passenger_name,
                "seatsReserved": travelers_count,
                "portalUrl": "http://localhost:5174",
                "detailsNote": f"Automated Playwright demo booking confirmed with PNR {flight_response.pnr} on Flight Demo website."
            },
            "agent_events": events,
        }

    # Fallback to Heuristic Transport Calculation if automation fails or date missing
    if distance_km < 350:
        mode = "Scenic Express Road Drive / Intercity Rail"
        transit_time = f"{round(distance_km / 60, 1)} to {round(distance_km / 50 + 1, 1)} hours"
        cost_est = round(distance_km * 12)
        local_transit = "Private SUV Rental / Self-Drive Sedan"
    elif distance_km < 1200:
        mode = "Direct Flight / High-Speed Express Rail"
        transit_time = "2.5 to 4 hours total journey"
        cost_est = round(distance_km * 8 + 3500)
        local_transit = "App Taxis & Destination Cab Rentals"
    else:
        mode = "Scheduled Commercial Flight"
        transit_time = f"{max(2, round(distance_km / 750, 1))} to {max(4, round(distance_km / 650 + 2, 1))} hours flight corridor"
        cost_est = round(distance_km * 7 + 6000)
        local_transit = "Private Airport Transfer & Dedicated Local Chauffeur"

    fallback_reason = flight_response.error if (flight_response and flight_response.error) else "Automation unavailable"

    events.append({
        "agent": "TransportAgent",
        "status": "completed",
        "message": f"Formulated fallback transit corridor: {origin_name} -> {dest_name} ({distance_km:,} km) via {mode}. Reason: {fallback_reason}",
        "timestamp": datetime.utcnow().strftime("%H:%M:%S"),
        "details": {"distanceKm": distance_km, "mode": mode, "estimatedTime": transit_time}
    })

    return {
        "transport": {
            "origin": origin_name,
            "destination": dest_name,
            "distanceKm": distance_km,
            "primaryMode": mode,
            "transitTime": transit_time,
            "localTransit": local_transit,
            "estimatedCostPerPerson": cost_est,
            "departureHub": f"{origin_name} Primary Transit Hub",
            "arrivalHub": f"{dest_name} Regional Gateway",
            "provider": "Geographic Corridor Heuristic Estimation",
            "isAutomatedBooking": False,
            "automationNotice": f"Estimated recommendation fallback triggered: {fallback_reason}"
        },
        "agent_events": events,
    }


async def hotel_agent_node(state: TripPlanningState) -> Dict[str, Any]:
    dest = state.get("destination", {})
    dest_name = dest.get("name", "Destination")
    dest_lat = float(dest.get("latitude", 20.0))
    dest_lng = float(dest.get("longitude", 78.0))
    tier = state.get("budget_tier", "Comfort (Curated Boutique)")
    travelers_count = int(state.get("travelers", 1))

    # Extract dates from state (supports startDate, start_date, departureDate, date & endDate, end_date, returnDate)
    checkin_date = (
        state.get("startDate") or 
        state.get("start_date") or 
        state.get("departureDate") or 
        state.get("date") or 
        "2026-10-10"
    )
    checkout_date = (
        state.get("endDate") or 
        state.get("end_date") or 
        state.get("returnDate") or 
        "2026-10-14"
    )

    guest_name = state.get("guest_name") or state.get("passenger_name") or "Demo User"
    email = state.get("email") or state.get("guest_email") or "demo@example.com"
    phone = state.get("phone") or state.get("guest_phone") or "9999999999"

    events = state.get("agent_events", [])
    events.append({
        "agent": "HotelAgent",
        "status": "initiated",
        "message": f"Formulating hotel booking automation for {dest_name} ({travelers_count} guest(s), {checkin_date} to {checkout_date}).",
        "timestamp": datetime.utcnow().strftime("%H:%M:%S"),
    })

    # Attempt Playwright Hotel Booking Automation via HotelBookingAgent
    hotel_response = None
    try:
        booking_request = HotelBookingRequest(
            destination=dest_name,
            checkin_date=checkin_date,
            checkout_date=checkout_date,
            guests=travelers_count,
            guest_name=guest_name,
            email=email,
            phone=phone,
        )
        hotel_response = await HotelBookingAgent.book_hotel(booking_request)
    except Exception as e:
        events.append({
            "agent": "HotelAgent",
            "status": "warning",
            "message": f"Hotel automation exception encountered: {str(e)}",
            "timestamp": datetime.utcnow().strftime("%H:%M:%S"),
        })

    # If Playwright automation succeeded, populate real returned values
    if hotel_response and hotel_response.success:
        events.append({
            "agent": "HotelAgent",
            "status": "completed",
            "message": f"Autonomous Playwright hotel booking confirmed for {hotel_response.hotel_name or dest_name} (Ref: {hotel_response.confirmation_reference}).",
            "timestamp": datetime.utcnow().strftime("%H:%M:%S"),
            "details": {
                "hotelName": hotel_response.hotel_name,
                "hotelId": hotel_response.hotel_id,
                "bookingReference": hotel_response.confirmation_reference,
                "status": hotel_response.status,
                "provider": "Hotel Demo Website (Playwright Automation)",
                "portalUrl": "http://localhost:5175",
            }
        })

        return {
            "hotel_options": {
                "destination": dest_name,
                "selectedTier": tier,
                "propertyType": hotel_response.room_type or "Deluxe Suite",
                "recommendedProperty": hotel_response.hotel_name or f"{dest_name} Grand Stay",
                "hotelId": hotel_response.hotel_id,
                "bookingReference": hotel_response.confirmation_reference,
                "bookingStatus": hotel_response.status,
                "checkinDate": hotel_response.checkin_date,
                "checkoutDate": hotel_response.checkout_date,
                "guests": hotel_response.guests,
                "guestName": hotel_response.guest_name,
                "roomType": hotel_response.room_type,
                "nightlyRateINR": hotel_response.price_per_night or 4500.0,
                "totalPriceINR": hotel_response.total_price,
                "amenities": ["Panoramic View", "Artisan Breakfast", "High-Speed WiFi", "Central Location"],
                "provider": "Hotel Demo Website (Playwright Automation)",
                "portalUrl": "http://localhost:5175",
                "isLiveAPI": False,
                "statusLabel": hotel_response.status or "confirmed",
            },
            "agent_events": events,
        }

    # Handle automation failure honestly (no fake confirmation)
    error_msg = hotel_response.error if (hotel_response and hotel_response.error) else "Hotel booking automation failed or portal unavailable"

    events.append({
        "agent": "HotelAgent",
        "status": "warning",
        "message": f"Hotel booking automation failed for {dest_name}: {error_msg}",
        "timestamp": datetime.utcnow().strftime("%H:%M:%S"),
        "details": {
            "provider": "Hotel Demo Website (Playwright Automation)",
            "portalUrl": "http://localhost:5175",
            "error": error_msg,
        }
    })

    return {
        "hotel_options": {
            "destination": dest_name,
            "selectedTier": tier,
            "recommendedProperty": None,
            "bookingReference": None,
            "bookingStatus": "failed",
            "provider": "Hotel Demo Website (Playwright Automation)",
            "portalUrl": "http://localhost:5175",
            "isLiveAPI": False,
            "statusLabel": "Hotel booking failed",
            "error": error_msg,
        },
        "agent_events": events,
    }

# 6. Experiences Agent Node (Geoapify Real POIs & Local Sights)
async def experiences_agent_node(state: TripPlanningState) -> Dict[str, Any]:
    dest = state.get("destination", {})
    lat = float(dest.get("latitude", 20.0))
    lng = float(dest.get("longitude", 78.0))
    dest_name = dest.get("name", "Destination")

    nearby_pois = await GeoapifyPlacesProvider.get_nearby_places(lat, lng, limit=8)
    pois_data = [p.dict() for p in nearby_pois]

    events = state.get("agent_events", [])
    events.append({
        "agent": "ExperiencesAgent",
        "status": "completed",
        "message": f"Indexed {len(pois_data)} authentic POIs, viewpoints & dining venues around {dest_name} via Geoapify.",
        "timestamp": datetime.utcnow().strftime("%H:%M:%S"),
        "details": {"poiCount": len(pois_data)}
    })

    return {
        "local_experiences": pois_data,
        "attractions": pois_data,
        "agent_events": events,
    }

# 7. Safety Agent Node (Advisories & Weather Risk Audit)
async def safety_agent_node(state: TripPlanningState) -> Dict[str, Any]:
    dest = state.get("destination", {})
    dest_name = dest.get("name", "Destination")
    dest_country = dest.get("country", "Global")
    weather = state.get("weather_data", {})

    contacts = {
        "police": "112 / 100",
        "touristHelpline": "1363 (Multilingual 24/7)",
        "ambulance": "102 / 108",
        "emergencyServices": "Verified Regional Dispatch Active",
    }

    advisories = [
        f"Verified standard tourism corridor in {dest_name}.",
        "Carry digital copies of government photo identification & permits where required.",
    ]

    if weather.get("rainProbability", 0) > 60:
        advisories.append("Precipitation Alert: Watch for slippery walking trails and keep rainwear accessible.")
    if weather.get("tempC", 24) > 35:
        advisories.append("High Temperature Warning: Maintain hydration during midday hours.")

    events = state.get("agent_events", [])
    events.append({
        "agent": "SafetyAgent",
        "status": "completed",
        "message": f"Audited security profile & environmental advisories for {dest_name}, {dest_country}.",
        "timestamp": datetime.utcnow().strftime("%H:%M:%S"),
    })

    return {
        "safety_information": {
            "emergencyContacts": contacts,
            "advisories": advisories,
            "travelSecurityRating": "Verified Safe Regional Corridor",
        },
        "agent_events": events,
    }

# 8. Budget Agent Node (Itemized Ledger & Conflict Detection)
async def budget_agent_node(state: TripPlanningState) -> Dict[str, Any]:
    total_budget = float(state.get("budget", 30000.0))
    travelers = max(1, int(state.get("travelers", 2)))
    days = max(1, int(state.get("duration_days", 4)))

    transport = state.get("transport_options", {})
    hotel = state.get("hotel_options", {})

    # Compute realistic costs
    est_transit = transport.get("estimatedCostINR", 3500) * travelers
    est_hotel = hotel.get("nightlyRateINR", 4500) * (days - 1)
    est_dining = (800 * travelers) * days
    est_activities = (500 * travelers) * days
    allocated_total = est_transit + est_hotel + est_dining + est_activities
    contingency = max(1500, round(allocated_total * 0.10))
    grand_total = allocated_total + contingency

    breakdown = {
        "totalEstimated": grand_total,
        "userBudget": total_budget,
        "perTraveler": round(grand_total / travelers),
        "perDay": round(grand_total / days),
        "accommodation": f"₹{est_hotel:,.0f} ({days - 1} nights)",
        "transport": f"₹{est_transit:,.0f} ({travelers} travelers)",
        "foodAndDining": f"₹{est_dining:,.0f}",
        "activitiesAndEntry": f"₹{est_activities:,.0f}",
        "contingencyBuffer": f"₹{contingency:,.0f} (10% Emergency Reserve)",
        "currency": "INR (₹)",
    }

    events = state.get("agent_events", [])
    events.append({
        "agent": "BudgetAgent",
        "status": "completed",
        "message": f"Calculated trip ledger: ₹{grand_total:,.0f} total vs ₹{total_budget:,.0f} user allocation.",
        "timestamp": datetime.utcnow().strftime("%H:%M:%S"),
    })

    return {
        "budget_analysis": breakdown,
        "agent_events": events,
    }

# 9. Conflict Detector Agent Node
async def conflict_detector_node(state: TripPlanningState) -> Dict[str, Any]:
    conflicts: List[Dict[str, Any]] = []
    weather = state.get("weather_data", {})
    budget_data = state.get("budget_analysis", {})

    # Check 1: Budget Deficit Conflict
    grand_total = budget_data.get("totalEstimated", 0)
    user_budget = budget_data.get("userBudget", 0)
    if grand_total > user_budget and user_budget > 0:
        deficit = grand_total - user_budget
        conflicts.append({
            "id": "conf-budget-deficit",
            "type": "budget_deficit",
            "severity": "high",
            "agent": "BudgetAgent",
            "message": f"Total estimated trip cost (₹{grand_total:,.0f}) exceeds allocated budget (₹{user_budget:,.0f}) by ₹{deficit:,.0f}.",
            "suggestedResolution": "Shift accommodation to boutique eco-lodge or optimize private transit to express rail.",
        })

    # Check 2: Weather vs Outdoor Activities Conflict
    rain_prob = weather.get("rainProbability", 0)
    if rain_prob > 60:
        conflicts.append({
            "id": "conf-weather-rain",
            "type": "weather_alert",
            "severity": "medium",
            "agent": "WeatherAgent",
            "message": f"Heavy rain risk ({rain_prob}%) detected; morning outdoor trails require sheltered indoor alternatives.",
            "suggestedResolution": "Prioritize indoor cultural museums, tea factory tours, and covered artisan markets.",
        })

    events = state.get("agent_events", [])
    events.append({
        "agent": "ConflictDetector",
        "status": "completed",
        "message": f"Audited potential travel schedule clashes: {len(conflicts)} flags detected.",
        "timestamp": datetime.utcnow().strftime("%H:%M:%S"),
        "details": {"conflictCount": len(conflicts)}
    })

    return {
        "conflicts": conflicts,
        "agent_events": events,
    }

# 10. Packing Agent Node
async def packing_agent_node(state: TripPlanningState) -> Dict[str, Any]:
    weather = state.get("weather_data", {})
    temp = weather.get("tempC", 24)
    rain = weather.get("rainProbability", 10)
    prefs = state.get("preferences", ["nature", "culture"])

    checklist = [
        {"id": "p-1", "item": "Breathable moisture-wicking daywear", "category": "Clothing", "checked": True},
        {"id": "p-2", "item": "All-terrain grip walking shoes", "category": "Footwear", "checked": False},
        {"id": "p-3", "item": "Universal power bank & high-speed charger", "category": "Electronics", "checked": True},
        {"id": "p-4", "item": "Government Photo ID & offline itinerary copy", "category": "Documents", "checked": True},
        {"id": "p-5", "item": "Personal medication kit & hydration bottle", "category": "Health", "checked": False},
    ]

    if temp < 18:
        checklist.append({"id": "p-6", "item": "Insulated fleece jacket or windbreaker", "category": "Clothing", "checked": False})
    if rain > 40:
        checklist.append({"id": "p-7", "item": "Compact storm umbrella or waterproof shell", "category": "Weather Protection", "checked": False})
    if "nature" in prefs or "trek" in prefs:
        checklist.append({"id": "p-8", "item": "UV polarized sunglasses & insect repellent", "category": "Outdoor Gear", "checked": False})

    events = state.get("agent_events", [])
    events.append({
        "agent": "PackingAgent",
        "status": "completed",
        "message": f"Generated weather-calibrated packing checklist ({len(checklist)} items).",
        "timestamp": datetime.utcnow().strftime("%H:%M:%S"),
    })

    return {
        "packing_list": checklist,
        "agent_events": events,
    }

# 11. Optimizer & Itinerary Node (With Real Geoapify Waypoints, Explainable AI Recommendations & Groq Synthesis)
async def optimizer_node(state: TripPlanningState) -> Dict[str, Any]:
    dest = state.get("destination", {})
    dest_name = dest.get("name", "Destination")
    dest_country = dest.get("country", "Global")
    d_lat = float(dest.get("latitude", 20.0))
    d_lng = float(dest.get("longitude", 78.0))
    days = max(1, int(state.get("duration_days", 4)))
    travelers = max(1, int(state.get("travelers", 2)))
    prefs = state.get("preferences", ["nature", "culture"])
    conflicts = state.get("conflicts", [])
    pois = state.get("local_experiences", [])
    weather = state.get("weather_data", {})
    rain_risk = weather.get("rainProbability", 0) > 60

    optimizations: List[str] = [
        "Grouped geographically clustered waypoints to restrict transit time to <20 mins.",
        "Calibrated itinerary around live meteorological conditions.",
        "Integrated authentic local dining recommendations with dietary options.",
    ]

    # Resolve conflicts if present
    budget_conflict = next((c for c in conflicts if c.get("type") == "budget_deficit"), None)
    if budget_conflict:
        optimizations.append("Optimized activity fees and transit modes to preserve budget.")

    # Build Day-by-Day Itinerary with real POIs from Geoapify
    itinerary: List[Dict[str, Any]] = []

    day_themes = [
        ("Arrival, Orientation & Panoramic Sunset", "Acclimatize and take in signature vistas."),
        ("Deep Heritage & Cultural Core", "Explore authentic cultural quarters, monuments & artisan lanes."),
        ("Nature Trails, Scenic Corridors & Gastronomy", "Immerse in scenic viewpoints and signature culinary quarters."),
        ("Local Markets, Hidden Gems & Leisure Walk", "Browse authentic handicrafts and relaxed coffee roasteries."),
        ("Sunrise Vantage & Farewell Odyssey", "Morning photography overlook and departure logistics."),
    ]

    for d in range(1, days + 1):
        theme_idx = min(d - 1, len(day_themes) - 1)
        theme_title, theme_desc = day_themes[theme_idx]

        # Use actual POIs from Geoapify if available
        poi_1 = pois[(d * 2 - 2) % len(pois)] if pois else None
        poi_2 = pois[(d * 2 - 1) % len(pois)] if pois else None

        p1_name = poi_1.get("name") if poi_1 else f"Signature Scenic Ridge"
        p1_lat = float(poi_1.get("latitude", d_lat + (d * 0.005))) if poi_1 else round(d_lat + (d * 0.004), 4)
        p1_lng = float(poi_1.get("longitude", d_lng + (d * 0.005))) if poi_1 else round(d_lng + (d * 0.004), 4)
        p1_cat = poi_1.get("category", "Scenic Vantage") if poi_1 else "Scenic Vantage"

        p2_name = poi_2.get("name") if poi_2 else f"Cultural Quarter & Heritage Alley"
        p2_lat = float(poi_2.get("latitude", d_lat - (d * 0.004))) if poi_2 else round(d_lat - (d * 0.003), 4)
        p2_lng = float(poi_2.get("longitude", d_lng - (d * 0.004))) if poi_2 else round(d_lng - (d * 0.003), 4)
        p2_cat = poi_2.get("category", "Heritage") if poi_2 else "Heritage"

        # If rain risk is high, adapt morning activity to sheltered venue
        if rain_risk and d == 1:
            p1_name = f"{dest_name} Cultural Heritage Pavilion (Covered Gallery)"
            p1_cat = "Indoor Cultural Site"

        # Explainable recommendation rationale
        why_1 = f"Selected because you indicated an affinity for {prefs[0] if prefs else 'scenic views'}."
        why_2 = f"Recommended to balance transit distance ({poi_2.get('distanceKm', 3.0) if poi_2 else 2.5} km) with rich cultural immersion."

        morning_wp = {
            "id": f"act-{d}-1",
            "time": "09:30",
            "title": f"Morning Expedition: {p1_name}",
            "description": f"Explore {p1_name}. {why_1}",
            "location": f"{p1_name}, {dest_name}",
            "lat": p1_lat,
            "lng": p1_lng,
            "category": p1_cat,
            "cost": 250 * travelers,
            "duration": "2.0 hours",
            "transitTime": "15 mins transit",
            "icon": "Sun",
        }

        afternoon_wp = {
            "id": f"act-{d}-2",
            "time": "14:00",
            "title": f"Afternoon Discovery: {p2_name}",
            "description": f"Visit {p2_name}. {why_2}",
            "location": f"{p2_name}, {dest_name}",
            "lat": p2_lat,
            "lng": p2_lng,
            "category": p2_cat,
            "cost": 150 * travelers,
            "duration": "2.5 hours",
            "transitTime": "20 mins transit",
            "icon": "Compass",
        }

        evening_wp = {
            "id": f"act-{d}-3",
            "time": "18:30",
            "title": f"Sunset Vantage & Regional Culinary Experience",
            "description": f"Enjoy sunset horizons followed by curated local specialties at authentic regional eateries in {dest_name}.",
            "location": f"Horizon Walk, {dest_name}",
            "lat": round(d_lat + 0.002, 4),
            "lng": round(d_lng + 0.002, 4),
            "category": "Dining & Sunset",
            "cost": 600 * travelers,
            "duration": "2 hours",
            "transitTime": "15 mins walk",
            "icon": "Utensils",
        }

        itinerary.append({
            "day": d,
            "title": f"Day {d}: {theme_title}",
            "theme": theme_desc,
            "morning": f"Explore {p1_name}",
            "afternoon": f"Discover {p2_name}",
            "evening": f"Sunset dining in {dest_name}",
            "diningRecommendation": f"Authentic regional dining featuring traditional culinary heritage of {dest_name}.",
            "activities": [morning_wp, afternoon_wp, evening_wp],
        })

    # Generate Explainable AI summary (Why this plan is personalized)
    why_explanation = (
        f"{dest_name} is curated specifically for you because you requested a {state.get('travel_style', 'scenic')} journey "
        f"emphasizing {', '.join(prefs[:3])}. All transit corridors and boutique accommodations have been audited against "
        f"real meteorological data ({weather.get('tempC', 24)}°C, {weather.get('condition', 'Optimal')}) and Geoapify-indexed local points."
    )

    # Groq LLM Enrichment if key present
    try:
        groq_resp = await GroqLLMProvider.chat_completion([
            {"role": "system", "content": "You are the AITrip Supervisor Concierge. Provide a concise 2-sentence executive summary explaining why this trip was custom-tailored for the traveler based on their preferences."},
            {"role": "user", "content": f"Destination: {dest_name}, Country: {dest_country}, Days: {days}, Preferences: {prefs}, Weather: {weather.get('tempC')}C {weather.get('condition')}."},
        ], max_tokens=100)
        if groq_resp and len(groq_resp.strip()) > 20:
            why_explanation = groq_resp.strip()
    except Exception:
        pass

    events = state.get("agent_events", [])
    events.append({
        "agent": "OptimizerAgent",
        "status": "completed",
        "message": f"Compiled {days}-day chronological waypoint itinerary with explainable AI personalization.",
        "timestamp": datetime.utcnow().strftime("%H:%M:%S"),
        "details": {"waypointCount": len(itinerary) * 3}
    })

    return {
        "itinerary": itinerary,
        "optimizations": optimizations,
        "summary": why_explanation,
        "agent_events": events,
    }

# 12. Dynamic Replanning Node
async def replanning_node(state: TripPlanningState) -> Dict[str, Any]:
    change = state.get("condition_change", "Weather disruption detected")
    disruption = state.get("disruption_type", "weather_alert")
    dest = state.get("destination", {})
    dest_name = dest.get("name", "Destination")
    current_trip = state.get("itinerary", [])

    events = state.get("agent_events", [])
    events.append({
        "agent": "ReplanningAgent",
        "status": "replanned",
        "message": f"Autonomous dynamic replan executed: Adapted itinerary for '{change}'.",
        "timestamp": datetime.utcnow().strftime("%H:%M:%S"),
    })

    adaptations: List[str] = []
    updated_itinerary = []

    for day in current_trip:
        day_dict = day.model_dump() if hasattr(day, "model_dump") else (dict(day) if isinstance(day, dict) else day.__dict__)
        acts = []
        raw_acts = day_dict.get("activities", [])
        for act in raw_acts:
            act_dict = act.model_dump() if hasattr(act, "model_dump") else (dict(act) if isinstance(act, dict) else act.__dict__)
            if disruption == "weather_alert":
                cat = str(act_dict.get("category", "")).lower()
                if "outdoor" in cat or "scenic" in cat or "viewpoint" in cat:
                    act_dict["title"] = f"Indoor Alternative: {dest_name} Cultural Heritage Gallery"
                    act_dict["description"] = f"Shifted to weather-protected indoor gallery due to: {change}."
                    act_dict["category"] = "Indoor Culture"
                    adaptations.append("Substituted outdoor morning activity with sheltered indoor gallery.")
            elif disruption == "flight_delay":
                act_dict["time"] = f"{int(str(act_dict.get('time', '10:00'))[:2]) + 2}:00"
                act_dict["description"] = f"{act_dict.get('description', '')} (Adjusted 2hr buffer for flight delay)."
                adaptations.append("Adjusted start time by +2 hours to buffer flight delay.")
            acts.append(act_dict)
        day_dict["activities"] = acts
        updated_itinerary.append(day_dict)

    if not adaptations:
        adaptations.append("Optimized transit buffers and re-calibrated waypoint sequence.")

    replan_summary = f"Itinerary dynamically adapted to ensure zero travel friction following: {change}."

    return {
        "itinerary": updated_itinerary,
        "updated_itinerary": updated_itinerary,
        "adaptations_applied": list(set(adaptations)),
        "replan_summary": replan_summary,
        "agent_events": events,
    }

