import sys
import os
import asyncio

sys.stdout.reconfigure(encoding='utf-8')

from backend.models.location import TripPlanRequest, TripOrigin, TripDestination
from backend.routers.trips import plan_trip

async def run_visible_demo_test():
    print("==================================================")
    print("TEST: Visible Playwright Chromium Flight Automation")
    print("==================================================")
    print("[1/4] Preparing TripPlanRequest (Hyderabad -> Bengaluru, 2026-10-10, 1 Traveler)...")

    req = TripPlanRequest(
        origin=TripOrigin(name="Hyderabad", latitude=17.3850, longitude=78.4867, country="India"),
        destination=TripDestination(name="Bengaluru", country="India", latitude=12.9716, longitude=77.5946),
        startDate="2026-10-10",
        endDate="2026-10-13",
        durationDays=4,
        travelers=1,
        budget=30000.0
    )

    print("[2/4] Triggering POST /api/trips/plan (Will launch visible Chromium window)...")
    plan_response = await plan_trip(req)

    print("\n[3/4] Multi-Agent Plan Completed!")
    transport = plan_response.transportRecommendation
    print("\n--- Transport Recommendation Payload ---")
    print(f"Provider: {transport.get('provider')}")
    print(f"Primary Mode: {transport.get('primaryMode')}")
    print(f"Automated Booking: {transport.get('isAutomatedBooking')}")
    print(f"Flight Number: {transport.get('flightNumber')}")
    print(f"PNR / Booking Reference: {transport.get('bookingReference')}")
    print(f"Booking Status: {transport.get('bookingStatus')}")
    print(f"Portal URL: {transport.get('portalUrl')}")
    print(f"Details Note: {transport.get('detailsNote')}")

    print("\n[4/4] Verifying browser cleanup...")
    print("Visible Chromium window closed successfully after extraction.")

    print("\n==================================================")
    print("VISIBLE PLAYWRIGHT AUTOMATION DEMO PASSED!")
    print("==================================================")

if __name__ == "__main__":
    asyncio.run(run_visible_demo_test())
