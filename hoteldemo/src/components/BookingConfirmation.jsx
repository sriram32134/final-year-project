import React from 'react';

export default function BookingConfirmation({ booking, hotel, searchParams, onReset }) {
  // Deterministic Confirmation Number generation (NO Math.random())
  const cleanDate = searchParams.checkinDate ? searchParams.checkinDate.replace(/-/g, '') : '20261010';
  const confirmationNumber = booking.confirmationNumber || `HT-${hotel.id}-${cleanDate}`;

  return (
    <div className="row justify-content-center my-4">
      <div className="col-lg-8">
        <div 
          className="confirmation-card text-center"
          data-testid="hotel-booking-confirmation"
        >
          <div className="mb-3">
            <span className="display-4">🎉</span>
          </div>

          <h2 className="fw-extrabold text-dark mb-2">Booking Confirmed!</h2>
          <p className="text-muted mb-4">Your reservation has been successfully placed.</p>

          <div className="mb-4">
            <div className="text-uppercase text-muted fs-7 fw-bold mb-1">Confirmation Number</div>
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
              Confirmed
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
                <strong className="text-dark fs-6">{hotel.city}</strong>
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
                <strong className="text-primary fs-5">₹{booking.totalPrice.toLocaleString()}</strong>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary-custom px-5 py-2 fw-bold"
            onClick={onReset}
          >
            Start New Search
          </button>
        </div>
      </div>
    </div>
  );
}
