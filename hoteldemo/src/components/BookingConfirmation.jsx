import React, { useEffect } from 'react';

export default function BookingConfirmation({ booking, hotel, searchParams, onReset, isAutoBook }) {
  // Demo Booking Reference format
  const cleanDate = searchParams?.checkinDate ? searchParams.checkinDate.replace(/-/g, '') : '20261010';
  const confirmationNumber = booking.confirmationNumber || `HOTEL-DEMO-${hotel.id.replace(/[^a-zA-Z0-9]/g, '')}-${cleanDate}`;

  // Autonomous Return to Trip Details
  useEffect(() => {
    if (isAutoBook) {
      const timer = setTimeout(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const pnr = urlParams.get('pnr') || '';
        const flight = urlParams.get('flight') || '';
        const cleanBaseReturn = (searchParams?.returnUrl || 'http://localhost:5173').split('?')[0];
        const target = `${cleanBaseReturn}?booking=full_success&pnr=${encodeURIComponent(pnr)}&flight=${encodeURIComponent(flight)}&hotelRef=${encodeURIComponent(confirmationNumber)}&hotelName=${encodeURIComponent(hotel.name)}&destination=${encodeURIComponent(hotel.city || searchParams?.destination || '')}`;
        window.location.href = target;
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isAutoBook, confirmationNumber, hotel, searchParams]);

  return (
    <div className="row justify-content-center my-4">
      <div className="col-lg-8">
        <div 
          className="confirmation-card text-center"
          data-testid="hotel-booking-confirmation"
        >
          {isAutoBook && (
            <div className="alert alert-success py-2 px-3 mb-3 d-flex align-items-center justify-content-between rounded-3 border-success shadow-sm text-start">
              <div className="d-flex align-items-center gap-2">
                <div className="spinner-border spinner-border-sm text-success" role="status"></div>
                <span className="small fw-bold">✓ Cheapest Hotel Stay Confirmed! AI Travel Agent finalizing itinerary & returning to Trip Details in 1.5s...</span>
              </div>
              <span className="badge bg-success">Complete</span>
            </div>
          )}
          <div className="mb-3">
            <span className="display-4">🎉</span>
          </div>

          <h2 className="fw-extrabold text-success mb-2">✓ Demo Hotel Booking Confirmed</h2>
          <p className="text-muted mb-4">Your demo reservation is recorded for academic presentation and trip execution.</p>

          <div className="mb-4">
            <div className="text-uppercase text-muted fs-7 fw-bold mb-1">Booking Reference:</div>
            <div 
              className="ref-code-box"
              data-testid="hotel-booking-reference"
            >
              {confirmationNumber}
            </div>
          </div>

          <div className="mb-4">
            <span className="text-uppercase text-muted fs-7 fw-bold me-2">Booking Status:</span>
            <span 
              className="status-badge-confirmed"
              data-testid="hotel-booking-status"
            >
              DEMO CONFIRMED
            </span>
          </div>

          <div className="bg-white p-4 rounded-3 border text-start mb-4 shadow-sm">
            <h5 className="fw-bold border-bottom pb-3 mb-3 text-dark">Reservation Details</h5>
            <div className="row g-3 fs-7">
              <div className="col-sm-6">
                <span className="text-muted d-block">Hotel</span>
                <strong className="text-dark fs-6">{hotel.name}</strong>
              </div>
              <div className="col-sm-6">
                <span className="text-muted d-block">Destination</span>
                <strong className="text-dark fs-6">{hotel.city || searchParams.destination}</strong>
              </div>
              <div className="col-sm-6">
                <span className="text-muted d-block">Guest Name</span>
                <strong className="text-dark fs-6">{booking.guestName}</strong>
              </div>
              <div className="col-sm-6">
                <span className="text-muted d-block">Contact Info</span>
                <strong className="text-dark fs-6">{booking.guestEmail} | {booking.guestPhone}</strong>
              </div>
              <div className="col-sm-4">
                <span className="text-muted d-block">Check-in</span>
                <strong className="text-dark fs-6">{searchParams.checkinDate}</strong>
              </div>
              <div className="col-sm-4">
                <span className="text-muted d-block">Check-out</span>
                <strong className="text-dark fs-6">{searchParams.checkoutDate}</strong>
              </div>
              <div className="col-sm-4">
                <span className="text-muted d-block">Guests</span>
                <strong className="text-dark fs-6">{searchParams.guests} Person(s)</strong>
              </div>
              <div className="col-sm-6 border-top pt-2 mt-2">
                <span className="text-muted d-block">Room Type</span>
                <strong className="text-dark fs-6">{hotel.roomType}</strong>
              </div>
              <div className="col-sm-6 border-top pt-2 mt-2">
                <span className="text-muted d-block">Total Paid</span>
                <strong className="text-primary fs-5">₹{booking.totalPrice?.toLocaleString() || '4,500'}</strong>
              </div>
            </div>
          </div>

          <div className="d-flex flex-wrap justify-content-center align-items-center gap-3">
            <a
              href={
                searchParams?.returnUrl
                  ? `${searchParams.returnUrl}${searchParams.returnUrl.includes('?') ? '&' : '?'}${isAutoBook ? 'booking=full_success' : 'booking=hotel_success'}&hotelRef=${encodeURIComponent(confirmationNumber)}&hotelName=${encodeURIComponent(hotel.name)}&destination=${encodeURIComponent(hotel.city || searchParams.destination || '')}`
                  : "http://localhost:5173"
              }
              className="btn btn-success px-5 py-2 fw-bold rounded-pill shadow"
              data-testid="return-to-trip-btn"
            >
              RETURN TO TRIP
            </a>
            <button
              type="button"
              className="btn btn-outline-secondary px-4 py-2 fw-bold rounded-pill"
              onClick={onReset}
            >
              Start New Search
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
