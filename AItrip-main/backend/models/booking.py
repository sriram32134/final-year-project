from typing import Optional
from pydantic import BaseModel


class FlightBookingRequest(BaseModel):
    from_city: str
    to_city: str
    date: str
    passengers: int = 1
    passenger_name: str = "Demo User"
    email: str = "demo@example.com"
    phone: str = "9999999999"


class FlightBookingResponse(BaseModel):
    success: bool
    status: str
    booking_id: Optional[str] = None
    pnr: Optional[str] = None
    flight_number: Optional[str] = None
    from_city: Optional[str] = None
    to_city: Optional[str] = None
    date: Optional[str] = None
    passenger_name: Optional[str] = None
    seat: Optional[str] = None
    error: Optional[str] = None


class HotelBookingRequest(BaseModel):
    destination: str
    checkin_date: str
    checkout_date: str
    guests: int = 1
    guest_name: str = "Demo User"
    email: str = "demo@example.com"
    phone: str = "9999999999"


class HotelBookingResponse(BaseModel):
    success: bool
    status: str
    booking_id: Optional[str] = None
    confirmation_reference: Optional[str] = None
    hotel_id: Optional[str] = None
    hotel_name: Optional[str] = None
    destination: Optional[str] = None
    checkin_date: Optional[str] = None
    checkout_date: Optional[str] = None
    guests: Optional[int] = None
    guest_name: Optional[str] = None
    room_type: Optional[str] = None
    price_per_night: Optional[float] = None
    total_price: Optional[float] = None
    error: Optional[str] = None

