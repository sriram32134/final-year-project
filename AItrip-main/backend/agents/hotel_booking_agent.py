import os
import re
import logging
import httpx
import asyncio
from datetime import datetime
from typing import Dict, Any, Optional

from backend.services.browser_service import BrowserService
from backend.models.booking import HotelBookingRequest, HotelBookingResponse

logger = logging.getLogger("hotel_booking_agent")


class HotelBookingAgent:
    """
    Autonomous Hotel Booking Agent.
    Operates local hotel demo website using visible Playwright Chromium BrowserService.
    Extracts booking confirmation reference, hotel details, dates, guest info, and pricing.
    """

    PORTAL_URLS = [
        "http://localhost:5175",
        "http://127.0.0.1:5175",
        "http://localhost:3000",
    ]

    @classmethod
    async def _resolve_portal_url(cls) -> str:
        """Find active local hotel portal URL or fallback to default localhost:5175."""
        async with httpx.AsyncClient(timeout=1.5) as client:
            for url in cls.PORTAL_URLS:
                try:
                    resp = await client.get(url)
                    if resp.status_code == 200:
                        return url
                except Exception:
                    pass
        return "http://localhost:5175"

    @classmethod
    def _calculate_nights(cls, checkin_str: str, checkout_str: str) -> int:
        """Calculate number of nights between check-in and check-out dates."""
        for fmt in ("%Y-%m-%d", "%d-%m-%Y", "%m/%d/%Y", "%d/%m/%Y"):
            try:
                d1 = datetime.strptime(checkin_str.strip(), fmt)
                d2 = datetime.strptime(checkout_str.strip(), fmt)
                nights = (d2 - d1).days
                return max(1, nights)
            except ValueError:
                continue
        return 1

    @classmethod
    def _parse_price(cls, price_text: str) -> Optional[float]:
        """Extract numeric float from price string (e.g., '$150/night', '₹4,500')."""
        if not price_text:
            return None
        cleaned = re.sub(r"[^\d.]", "", price_text.replace(",", ""))
        try:
            return float(cleaned) if cleaned else None
        except ValueError:
            return None

    @classmethod
    async def book_hotel(
        cls, req: HotelBookingRequest, override_url: Optional[str] = None
    ) -> HotelBookingResponse:
        """
        Automates hotel booking on the target hotel website via Playwright.
        Opens Chromium visibly (headless=False, slow_mo=600ms) for demonstration.
        """
        browser_svc = BrowserService(headless=False, slow_mo=600)
        page = None
        context = None

        try:
            portal_url = override_url or await cls._resolve_portal_url()
            logger.info(f"[HotelBookingAgent] Launching visible browser automation on target: {portal_url}")

            # 1. Start browser & create context/page
            context = await browser_svc.create_context()
            page = await browser_svc.create_page(context)

            # STEP 1: Open hotel portal URL
            try:
                await page.goto(portal_url, timeout=10000)
                await asyncio.sleep(0.5)
                logger.info(f"[HotelBookingAgent] Hotel portal opened: {portal_url}")
            except Exception as e:
                return HotelBookingResponse(
                    success=False,
                    status="failed",
                    error=f"Hotel portal unreachable: Could not navigate to portal URL '{portal_url}'. Details: {str(e)}"
                )

            # STEP 2 - 5: Fill search form
            try:
                await page.wait_for_selector('[data-testid="destination-input"]', timeout=5000)

                # STEP 2: Destination Input
                dest_el = await page.query_selector('[data-testid="destination-input"]')
                if dest_el:
                    dest_tag = await page.evaluate("(el) => el.tagName.toLowerCase()", dest_el)
                    if dest_tag == "select":
                        try:
                            await page.select_option('[data-testid="destination-input"]', label=req.destination)
                        except Exception:
                            await page.select_option('[data-testid="destination-input"]', req.destination)
                    else:
                        await page.fill('[data-testid="destination-input"]', req.destination)

                # STEP 3: Check-in Date
                await page.fill('[data-testid="checkin-date"]', req.checkin_date)

                # STEP 4: Check-out Date
                await page.fill('[data-testid="checkout-date"]', req.checkout_date)

                # STEP 5: Guests Input
                guests_el = await page.query_selector('[data-testid="guests-input"]')
                if guests_el:
                    guests_tag = await page.evaluate("(el) => el.tagName.toLowerCase()", guests_el)
                    if guests_tag == "select":
                        await page.select_option('[data-testid="guests-input"]', str(req.guests))
                    else:
                        await page.fill('[data-testid="guests-input"]', str(req.guests))

                await asyncio.sleep(0.5)

            except Exception as e:
                return HotelBookingResponse(
                    success=False,
                    status="failed",
                    error=f"Hotel search form fill failure for destination '{req.destination}': {str(e)}"
                )

            # STEP 6: Click Search Hotels
            try:
                await page.click('[data-testid="search-hotels"]')
                logger.info(
                    f"[HotelBookingAgent] Hotel search submitted for {req.destination} "
                    f"({req.checkin_date} to {req.checkout_date}, {req.guests} guest(s))"
                )
            except Exception as e:
                return HotelBookingResponse(
                    success=False,
                    status="failed",
                    error=f"Destination search failed: Unable to click search button for '{req.destination}': {str(e)}"
                )

            # STEP 7: Wait for Hotel Results
            try:
                await page.wait_for_selector('[data-testid="hotel-result"]', timeout=5000)
                await asyncio.sleep(0.8)
            except Exception as e:
                return HotelBookingResponse(
                    success=False,
                    status="failed",
                    error=f"No hotel results found for destination '{req.destination}'. Details: {str(e)}"
                )

            # STEP 8 & 9: Select First Hotel Result & Extract Info
            hotel_id = "HOTEL-001"
            hotel_name = f"{req.destination} Grand Stay"
            room_type = "Deluxe Suite"
            price_per_night = 4500.0

            try:
                results = await page.query_selector_all('[data-testid="hotel-result"]')
                if not results:
                    return HotelBookingResponse(
                        success=False,
                        status="failed",
                        error="No hotel result cards present on page after search."
                    )

                first_result = results[0]
                extracted_id = await first_result.get_attribute("data-hotel-id")
                if extracted_id:
                    hotel_id = extracted_id

                # Try reading visible hotel information
                result_text = await first_result.inner_text()
                lines = [line.strip() for line in result_text.split("\n") if line.strip()]

                # Attempt to extract hotel name from heading or text lines
                h_elem = await first_result.query_selector("h2, h3, h4, [data-testid='hotel-name']")
                if h_elem:
                    h_text = (await h_elem.inner_text()).strip()
                    if h_text:
                        hotel_name = h_text
                elif lines:
                    hotel_name = lines[0]

                # Attempt to extract room type & price per night from result card
                for line in lines:
                    if any(term in line.lower() for term in ["suite", "room", "deluxe", "king", "queen", "villa", "studio"]):
                        room_type = line
                        break

                parsed_price = cls._parse_price(result_text)
                if parsed_price:
                    price_per_night = parsed_price

                logger.info(f"[HotelBookingAgent] Hotel result selected: {hotel_name} (ID: {hotel_id})")

            except Exception as e:
                return HotelBookingResponse(
                    success=False,
                    status="failed",
                    error=f"Hotel selection failure: {str(e)}"
                )

            # STEP 10: Click Book Hotel
            try:
                book_btn = await first_result.query_selector('[data-testid="book-hotel"]')
                if book_btn:
                    await book_btn.click()
                else:
                    await page.click('[data-testid="book-hotel"]')

                logger.info("[HotelBookingAgent] Hotel booking form opened")
                await asyncio.sleep(0.8)

            except Exception as e:
                return HotelBookingResponse(
                    success=False,
                    status="failed",
                    error=f"Booking button not found or click failed: {str(e)}"
                )

            # STEP 11 - 13: Fill Guest Details Form
            try:
                await page.wait_for_selector('[data-testid="guest-name-input"]', timeout=5000)
                await page.fill('[data-testid="guest-name-input"]', req.guest_name)

                if await page.query_selector('[data-testid="guest-email-input"]'):
                    await page.fill('[data-testid="guest-email-input"]', req.email)

                if await page.query_selector('[data-testid="guest-phone-input"]'):
                    await page.fill('[data-testid="guest-phone-input"]', req.phone)

                logger.info(f"[HotelBookingAgent] Guest details submitted for {req.guest_name}")
                await asyncio.sleep(0.8)

            except Exception as e:
                return HotelBookingResponse(
                    success=False,
                    status="failed",
                    error=f"Guest form failed: Unable to populate guest details: {str(e)}"
                )

            # STEP 14: Click Confirm Booking
            try:
                await page.click('[data-testid="confirm-hotel-booking"]')
            except Exception as e:
                return HotelBookingResponse(
                    success=False,
                    status="failed",
                    error=f"Confirm booking click failed: {str(e)}"
                )

            # STEP 15: Wait for Confirmation
            try:
                await page.wait_for_selector('[data-testid="hotel-booking-confirmation"]', timeout=5000)
                await asyncio.sleep(1.0)
            except Exception as e:
                return HotelBookingResponse(
                    success=False,
                    status="failed",
                    error=f"Confirmation not found: Timed out waiting for confirmation screen: {str(e)}"
                )

            # STEP 16 - 18: Extract Confirmation Reference, Status & Total Price
            try:
                ref_el = await page.query_selector('[data-testid="hotel-booking-reference"]')
                confirmation_reference = (await ref_el.inner_text()).strip() if ref_el else f"HTL-REF-{hotel_id}"

                status_el = await page.query_selector('[data-testid="hotel-booking-status"]')
                status = (await status_el.inner_text()).strip() if status_el else "confirmed"

                # Extract or calculate total price
                nights = cls._calculate_nights(req.checkin_date, req.checkout_date)
                total_price = round(nights * price_per_night, 2)

                total_el = await page.query_selector('[data-testid="total-price"], [data-testid="hotel-total-price"]')
                if total_el:
                    extracted_total = cls._parse_price(await total_el.inner_text())
                    if extracted_total:
                        total_price = extracted_total

                logger.info(f"[HotelBookingAgent] Hotel booking confirmed with reference: {confirmation_reference}")

                return HotelBookingResponse(
                    success=True,
                    status=status,
                    booking_id=confirmation_reference,
                    confirmation_reference=confirmation_reference,
                    hotel_id=hotel_id,
                    hotel_name=hotel_name,
                    destination=req.destination,
                    checkin_date=req.checkin_date,
                    checkout_date=req.checkout_date,
                    guests=req.guests,
                    guest_name=req.guest_name,
                    room_type=room_type,
                    price_per_night=price_per_night,
                    total_price=total_price,
                )

            except Exception as e:
                return HotelBookingResponse(
                    success=False,
                    status="failed",
                    error=f"Confirmation details extraction failure: {str(e)}"
                )

        except Exception as e:
            return HotelBookingResponse(
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
