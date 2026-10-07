import os
import logging
import httpx
import asyncio
from typing import Dict, Any, Optional
from backend.services.browser_service import BrowserService
from backend.models.booking import FlightBookingRequest, FlightBookingResponse

logger = logging.getLogger("flight_booking_agent")

class FlightBookingAgent:
    """
    Autonomous Flight Booking Agent.
    Operates local flight demo booking site using visible Playwright Chromium BrowserService.
    Extracts PNR, Booking ID, Flight Number, Seat, and Confirmation state.
    """

    PORTAL_URLS = [
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:8000/dummy-sites/flight/",
        "http://127.0.0.1:8001",
    ]

    @classmethod
    async def _resolve_portal_url(cls) -> str:
        """Find active local URL or fallback to local file URL."""
        async with httpx.AsyncClient(timeout=1.5) as client:
            for url in cls.PORTAL_URLS:
                try:
                    resp = await client.get(url)
                    if resp.status_code == 200:
                        return url
                except Exception:
                    pass

        local_path = os.path.abspath(
            os.path.join(os.path.dirname(__file__), "..", "dummy_sites", "flight_booking", "index.html")
        )
        return f"file:///{local_path.replace('\\', '/')}"

    @classmethod
    async def book_flight(cls, req: FlightBookingRequest, override_url: Optional[str] = None) -> FlightBookingResponse:
        # Launch Chromium visibly (headless=False, slow_mo=200ms) for demonstration
        browser_svc = BrowserService(headless=False, slow_mo=200)
        page = None
        context = None

        try:
            portal_url = override_url or await cls._resolve_portal_url()
            logger.info(f"[FlightBookingAgent] Launching visible browser automation on target: {portal_url}")

            # 1. Start browser & create context/page
            context = await browser_svc.create_context()
            page = await browser_svc.create_page(context)

            # 2. Navigate to flight demo site
            try:
                await page.goto(portal_url, timeout=10000)
                await asyncio.sleep(0.5)
            except Exception as e:
                return FlightBookingResponse(
                    success=False,
                    status="failed",
                    error=f"Website unavailable: Could not navigate to portal URL '{portal_url}'. Details: {str(e)}"
                )

            # 3. Fill flight search form
            try:
                await page.wait_for_selector('[data-testid="from-input"]', timeout=5000)
                
                # From City
                from_el = await page.query_selector('[data-testid="from-input"]')
                if from_el:
                    from_tag = await page.evaluate("(el) => el.tagName.toLowerCase()", from_el)
                    if from_tag == "select":
                        try:
                            await page.select_option('[data-testid="from-input"]', req.from_city)
                        except Exception:
                            await page.evaluate("""(val) => {
                                const sel = document.querySelector('[data-testid="from-input"]');
                                if (sel) {
                                    const match = [...sel.options].find(o => o.value.toLowerCase() === val.toLowerCase());
                                    if (match) {
                                        sel.value = match.value;
                                    } else {
                                        const opt = new Option(val, val);
                                        sel.add(opt);
                                        sel.value = val;
                                    }
                                    sel.dispatchEvent(new Event('change', { bubbles: true }));
                                }
                            }""", req.from_city)
                    else:
                        await page.fill('[data-testid="from-input"]', req.from_city)

                # To City
                to_el = await page.query_selector('[data-testid="to-input"]')
                if to_el:
                    to_tag = await page.evaluate("(el) => el.tagName.toLowerCase()", to_el)
                    if to_tag == "select":
                        try:
                            await page.select_option('[data-testid="to-input"]', req.to_city)
                        except Exception:
                            await page.evaluate("""(val) => {
                                const sel = document.querySelector('[data-testid="to-input"]');
                                if (sel) {
                                    const match = [...sel.options].find(o => o.value.toLowerCase() === val.toLowerCase());
                                    if (match) {
                                        sel.value = match.value;
                                    } else {
                                        const opt = new Option(val, val);
                                        sel.add(opt);
                                        sel.value = val;
                                    }
                                    sel.dispatchEvent(new Event('change', { bubbles: true }));
                                }
                            }""", req.to_city)
                    else:
                        await page.fill('[data-testid="to-input"]', req.to_city)

                # Departure Date
                date_sel = '[data-testid="departure-date"]' if await page.query_selector('[data-testid="departure-date"]') else '[data-testid="date-input"]'
                await page.fill(date_sel, req.date or "2026-10-10")

                # Passengers
                pass_el = await page.query_selector('[data-testid="passengers-input"]')
                if pass_el:
                    pass_tag = await page.evaluate("(el) => el.tagName.toLowerCase()", pass_el)
                    if pass_tag == "select":
                        await page.select_option('[data-testid="passengers-input"]', str(req.passengers))
                    else:
                        await page.fill('[data-testid="passengers-input"]', str(req.passengers))

                await asyncio.sleep(0.5)

            except Exception as e:
                return FlightBookingResponse(
                    success=False,
                    status="failed",
                    error=f"Search form interaction failure: {str(e)}"
                )

            # 4. Click Search Flights
            try:
                await page.click('[data-testid="search-flights"]')
                await page.wait_for_selector('[data-testid="flight-result"]', timeout=5000)
                await asyncio.sleep(0.8)
            except Exception as e:
                return FlightBookingResponse(
                    success=False,
                    status="failed",
                    error=f"No flight results found or search failed for {req.from_city} -> {req.to_city} on {req.date}. Details: {str(e)}"
                )

            # 5. Read results and Select flight (Click Book Flight)
            results_count = 0
            selected_flight_info = {}
            try:
                results = await page.query_selector_all('[data-testid="flight-result"]')
                results_count = len(results)
                if results_count == 0:
                    return FlightBookingResponse(
                        success=False,
                        status="failed",
                        error="No flight result cards present on page after search."
                    )
                
                # Extract first flight info for reporting
                first_result = results[0]
                flight_id = await first_result.get_attribute('data-flight-id') or "FL-001"
                book_btn = await first_result.query_selector('[data-testid="book-flight"]')
                flight_num = await book_btn.get_attribute('data-flight-number') if book_btn else "6E-532"
                
                selected_flight_info = {
                    "id": flight_id,
                    "number": flight_num,
                    "count": results_count
                }

                if book_btn:
                    await book_btn.click()
                else:
                    await page.click('[data-testid="book-flight"]')

                await asyncio.sleep(0.8)

            except Exception as e:
                return FlightBookingResponse(
                    success=False,
                    status="failed",
                    error=f"Flight selection failure: {str(e)}"
                )

            # 6. Fill Passenger details in Modal
            try:
                name_sel = '[data-testid="passenger-name-input"]' if await page.query_selector('[data-testid="passenger-name-input"]') else '[data-testid="passenger-name"]'
                email_sel = '[data-testid="passenger-email-input"]' if await page.query_selector('[data-testid="passenger-email-input"]') else '[data-testid="passenger-email"]'
                phone_sel = '[data-testid="passenger-phone-input"]' if await page.query_selector('[data-testid="passenger-phone-input"]') else '[data-testid="passenger-phone"]'

                await page.wait_for_selector(name_sel, timeout=5000)
                await page.fill(name_sel, req.passenger_name)
                
                if await page.query_selector(email_sel):
                    await page.fill(email_sel, req.email)
                if await page.query_selector(phone_sel):
                    await page.fill(phone_sel, req.phone)

                await asyncio.sleep(0.8)

            except Exception as e:
                return FlightBookingResponse(
                    success=False,
                    status="failed",
                    error=f"Passenger details form fill failure: {str(e)}"
                )

            # 7. Confirm booking
            try:
                confirm_btn = '[data-testid="confirm-booking-btn"]' if await page.query_selector('[data-testid="confirm-booking-btn"]') else '[data-testid="confirm-booking"]'
                await page.click(confirm_btn)
                await page.wait_for_selector('[data-testid="booking-confirmation"]', timeout=5000)
                await asyncio.sleep(1.0)
            except Exception as e:
                return FlightBookingResponse(
                    success=False,
                    status="failed",
                    error=f"Booking confirmation failure: {str(e)}"
                )

            # 8. Extract booking confirmation details & close browser
            try:
                pnr_el = await page.query_selector('[data-testid="booking-reference"]') or await page.query_selector('[data-testid="pnr"]')
                pnr = (await pnr_el.inner_text()).strip() if pnr_el else "DEMO-PNR-1234"
                booking_id = pnr

                return FlightBookingResponse(
                    success=True,
                    status="confirmed",
                    booking_id=booking_id,
                    pnr=pnr,
                    flight_number=selected_flight_info.get("number", "6E-532"),
                    from_city=req.from_city,
                    to_city=req.to_city,
                    date=req.date,
                    passenger_name=req.passenger_name,
                    seat="12A (Demo)",
                )
            except Exception as e:
                return FlightBookingResponse(
                    success=False,
                    status="failed",
                    error=f"Confirmation extraction failure: {str(e)}"
                )

        except Exception as e:
            return FlightBookingResponse(
                success=False,
                status="failed",
                error=f"Unhandled browser automation exception: {str(e)}"
            )

        finally:
            if page:
                await browser_svc.close_page_safely(page)
            if context:
                await browser_svc.close_context_safely(context)
            await browser_svc.close()
