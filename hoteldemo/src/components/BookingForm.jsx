import React, { useState } from 'react';

export default function BookingForm({ hotel, searchParams, onConfirmBooking, onCancel }) {
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Calculate nights & total price
  const calculateNights = () => {
    if (!searchParams.checkinDate || !searchParams.checkoutDate) return 1;
    const checkin = new Date(searchParams.checkinDate);
    const checkout = new Date(searchParams.checkoutDate);
    const diffTime = Math.abs(checkout - checkin);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const nights = calculateNights();
  const totalPrice = nights * hotel.pricePerNight;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!guestName || !guestName.trim()) {
      setErrorMsg('Please enter guest full name.');
      return;
    }

    if (!guestEmail || !guestEmail.trim()) {
      setErrorMsg('Please enter email address.');
      return;
    }

    if (!guestPhone || !guestPhone.trim()) {
      setErrorMsg('Please enter phone number.');
      return;
    }

    onConfirmBooking({
      guestName: guestName.trim(),
      guestEmail: guestEmail.trim(),
      guestPhone: guestPhone.trim(),
      nights,
      totalPrice
    });
  };

  return (
    <div className="booking-modal-card p-4 my-4">
      <div className="d-flex align-items-center justify-content-between pb-3 mb-4 border-bottom">
        <div>
          <h4 className="fw-bold mb-1 text-dark">Complete Your Booking</h4>
          <p className="text-muted mb-0 fs-7">Review hotel details and enter primary guest information</p>
        </div>
        <button 
          type="button" 
          className="btn btn-outline-secondary btn-sm"
          onClick={onCancel}
        >
          ← Back to Results
        </button>
      </div>

      <div className="row g-4">
        {/* Selected Hotel Summary */}
        <div className="col-lg-5">
          <div className="p-3 rounded-3 bg-light border">
            <h5 className="fw-bold text-dark mb-2">{hotel.name}</h5>
            <p className="fs-7 text-muted mb-3">📍 {hotel.location}</p>
            
            <div className="mb-3 border-top pt-3">
              <div className="d-flex justify-content-between fs-7 mb-2">
                <span className="text-muted">Destination:</span>
                <span className="fw-semibold">{hotel.city}</span>
              </div>
              <div className="d-flex justify-content-between fs-7 mb-2">
                <span className="text-muted">Check-in:</span>
                <span className="fw-semibold">{searchParams.checkinDate} ({hotel.checkInTime})</span>
              </div>
              <div className="d-flex justify-content-between fs-7 mb-2">
                <span className="text-muted">Check-out:</span>
                <span className="fw-semibold">{searchParams.checkoutDate} ({hotel.checkOutTime})</span>
              </div>
              <div className="d-flex justify-content-between fs-7 mb-2">
                <span className="text-muted">Guests:</span>
                <span className="fw-semibold">{searchParams.guests} Person(s)</span>
              </div>
              <div className="d-flex justify-content-between fs-7 mb-2">
                <span className="text-muted">Room Type:</span>
                <span className="fw-semibold">{hotel.roomType}</span>
              </div>
            </div>

            <div className="border-top pt-3">
              <div className="d-flex justify-content-between fs-7 mb-1">
                <span className="text-muted">Price per night:</span>
                <span>₹{hotel.pricePerNight.toLocaleString()}</span>
              </div>
              <div className="d-flex justify-content-between fs-7 mb-2">
                <span className="text-muted">Duration:</span>
                <span>{nights} Night(s)</span>
              </div>
              <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                <span className="fw-bold fs-6">Total Amount:</span>
                <span className="fw-bold fs-4 text-primary">₹{totalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Guest Details Form */}
        <div className="col-lg-7">
          <form onSubmit={handleSubmit} className="p-3">
            <h6 className="fw-bold mb-3 text-dark">Guest Details</h6>

            {/* Guest Name */}
            <div className="mb-3">
              <label htmlFor="guest-name-input" className="form-label">
                Full Name
              </label>
              <input
                id="guest-name-input"
                type="text"
                className="form-control"
                placeholder="e.g. John Doe"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                data-testid="guest-name-input"
              />
            </div>

            {/* Email */}
            <div className="mb-3">
              <label htmlFor="guest-email-input" className="form-label">
                Email Address
              </label>
              <input
                id="guest-email-input"
                type="email"
                className="form-control"
                placeholder="e.g. john@example.com"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                data-testid="guest-email-input"
              />
            </div>

            {/* Phone */}
            <div className="mb-3">
              <label htmlFor="guest-phone-input" className="form-label">
                Phone Number
              </label>
              <input
                id="guest-phone-input"
                type="tel"
                className="form-control"
                placeholder="e.g. +91 9876543210"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                data-testid="guest-phone-input"
              />
            </div>

            {errorMsg && (
              <div className="alert alert-danger py-2 fs-7 mb-3" role="alert">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary-custom w-100 py-3 mt-2 fw-bold fs-6"
              data-testid="confirm-hotel-booking"
            >
              Confirm Booking
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
