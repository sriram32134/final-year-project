import React, { useState, useEffect } from 'react';

export default function BookingModal({ flight, searchParams, onClose, onBookingSuccess, isAutoBook }) {
  const [passengerName, setPassengerName] = useState('John Doe');
  const [email, setEmail] = useState('john.doe@example.com');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingReference, setBookingReference] = useState('');
  const [autoRedirectSeconds, setAutoRedirectSeconds] = useState(2);

  if (!flight) return null;

  const totalAmount = flight.price * (searchParams?.passengers || 1);

  // Generate deterministic/unique demo booking reference
  const generateBookingRef = () => {
    const code = (flight.airlineCode || 'FL').slice(0, 2).toUpperCase();
    const randNum = Math.floor(1000 + Math.random() * 9000);
    return `DEMO-${code}${randNum}`;
  };

  const handleConfirmBooking = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const ref = bookingReference || generateBookingRef();
    setBookingReference(ref);
    setBookingConfirmed(true);
    if (onBookingSuccess) {
      onBookingSuccess({
        reference: ref,
        flight,
        passengerName,
        email,
        totalAmount,
        date: searchParams?.departureDate || flight.departureDate
      });
    }
  };

  // Step 1: Autonomous Flight Booking execution
  useEffect(() => {
    if (isAutoBook && !bookingConfirmed) {
      const timer = setTimeout(() => {
        handleConfirmBooking();
      }, 1100);
      return () => clearTimeout(timer);
    }
  }, [isAutoBook, bookingConfirmed]);

  // Step 2: Autonomous Hotel Portal Redirection
  useEffect(() => {
    if (isAutoBook && bookingConfirmed && bookingReference) {
      const timer = setTimeout(() => {
        const hotelUrl = `http://localhost:5175/?destination=${encodeURIComponent(flight.to)}&checkinDate=${encodeURIComponent(searchParams?.departureDate || flight.departureDate || '2026-10-10')}&checkoutDate=2026-10-14&guests=${encodeURIComponent(searchParams?.passengers || 2)}&tripId=${encodeURIComponent(searchParams?.tripId || '')}&autoBook=true&autoOpen=true&pnr=${encodeURIComponent(bookingReference)}&flight=${encodeURIComponent(flight.flightNumber)}&returnUrl=${encodeURIComponent(searchParams?.returnUrl || 'http://localhost:5173')}`;
        window.location.href = hotelUrl;
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isAutoBook, bookingConfirmed, bookingReference, flight, searchParams]);

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.75)', zIndex: 1050 }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          
          {/* Header */}
          <div className="modal-header bg-dark text-white p-4" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)' }}>
            <div className="d-flex align-items-center gap-2">
              <div className="bg-primary text-white rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: 36, height: 36 }}>
                <i className="bi bi-ticket-perforated-fill fs-5"></i>
              </div>
              <div>
                <h5 className="modal-title fw-bold mb-0">
                  {bookingConfirmed ? '✓ Demo Flight Booking Confirmed' : 'DEMO FLIGHT BOOKING'}
                </h5>
                <span className="extra-small text-light opacity-75">
                  Academic Demo Booking Engine
                </span>
              </div>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              data-testid="close-booking-modal"
              aria-label="Close"
            ></button>
          </div>

          <div className="modal-body p-4">
            {/* Demo Banner / Agent Banner */}
            {isAutoBook ? (
              <div className="alert alert-info py-2 px-3 mb-3 d-flex align-items-center justify-content-between rounded-3 border-info shadow-sm">
                <div className="d-flex align-items-center gap-2">
                  <div className="spinner-border spinner-border-sm text-info" role="status"></div>
                  <span className="small fw-bold">🤖 AI Flight Agent: Autonomously reserving flight ticket (Zero Human Intervention)...</span>
                </div>
                <span className="badge bg-primary">Auto-Booking</span>
              </div>
            ) : (
              <div className="demo-badge-banner mb-4 d-flex align-items-center gap-2">
                <i className="bi bi-info-circle-fill fs-5 text-warning"></i>
                <div>
                  <strong>Demo Booking Mode:</strong> No actual payment is required or processed. This simulation is built for testing and automation.
                </div>
              </div>
            )}

            {!bookingConfirmed ? (
              <form onSubmit={handleConfirmBooking}>
                {/* Flight Details Summary Box */}
                <div className="card bg-light border-0 rounded-3 p-3 mb-4">
                  <div className="row align-items-center g-3">
                    <div className="col-md-4">
                      <span className="badge bg-primary px-2 py-1 mb-1">{flight.airline} ({flight.flightNumber})</span>
                      <h6 className="fw-bold mb-0">{flight.from} ({flight.fromCode}) → {flight.to} ({flight.toCode})</h6>
                      <small className="text-muted"><i className="bi bi-calendar-event me-1"></i>{searchParams?.departureDate || flight.departureDate}</small>
                    </div>
                    <div className="col-md-5 text-md-center border-start-md border-end-md">
                      <div className="d-flex justify-content-center align-items-center gap-2">
                        <div>
                          <div className="fw-bold fs-5">{flight.departureTime}</div>
                          <div className="extra-small text-muted">{flight.fromCode}</div>
                        </div>
                        <div className="px-2 text-muted">
                          <i className="bi bi-arrow-right"></i>
                          <div className="extra-small">{flight.duration}</div>
                        </div>
                        <div>
                          <div className="fw-bold fs-5">{flight.arrivalTime}</div>
                          <div className="extra-small text-muted">{flight.toCode}</div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3 text-md-end">
                      <div className="text-muted extra-small">Total Price:</div>
                      <div className="fs-4 fw-extrabold text-primary">₹{totalAmount.toLocaleString('en-IN')}</div>
                      <div className="extra-small text-muted">{searchParams?.passengers || 1} Passenger(s)</div>
                    </div>
                  </div>
                </div>

                {/* Passenger Form */}
                <h6 className="fw-bold mb-3 text-dark">
                  <i className="bi bi-person-lines-fill text-primary me-2"></i> Passenger Information
                </h6>

                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-secondary">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={passengerName}
                      onChange={(e) => setPassengerName(e.target.value)}
                      data-testid="passenger-name-input"
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-secondary">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      data-testid="passenger-email-input"
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-secondary">Phone Number</label>
                    <input
                      type="text"
                      className="form-control"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      data-testid="passenger-phone-input"
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-secondary">Baggage Preference</label>
                    <input
                      type="text"
                      className="form-control bg-light"
                      value={flight.baggage}
                      disabled
                    />
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <button type="button" className="btn btn-light border px-4" onClick={onClose}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success rounded-pill px-4 fw-bold"
                    data-testid="confirm-booking-btn"
                  >
                    CONFIRM DEMO BOOKING <i className="bi bi-check-lg ms-1"></i>
                  </button>
                </div>
              </form>
            ) : (
              /* Confirmation Screen */
              <div data-testid="booking-confirmation" className="py-3">
                {isAutoBook && (
                  <div className="alert alert-success py-2 px-3 mb-3 d-flex align-items-center justify-content-between rounded-3 border-success shadow-sm">
                    <div className="d-flex align-items-center gap-2">
                      <div className="spinner-border spinner-border-sm text-success" role="status"></div>
                      <span className="small fw-bold">✓ Flight Booked! AI Agent transferring autonomously to Hotel Booking in 1.5s...</span>
                    </div>
                    <span className="badge bg-success">Next: Hotel Agent</span>
                  </div>
                )}
                <div className="text-center mb-4">
                  <div className="d-inline-flex bg-success text-white rounded-circle p-3 mb-3 shadow-sm">
                    <i className="bi bi-check-lg display-6"></i>
                  </div>
                  <h4 className="fw-bold text-success mb-1">Booking Successfully Confirmed!</h4>
                  <p className="text-muted small">Your demo flight ticket has been reserved into the system.</p>
                </div>

                {/* Booking Reference Display */}
                <div className="booking-ref-box mb-4">
                  <div className="text-success extra-small fw-bold text-uppercase mb-1">Demo Booking Reference (PNR)</div>
                  <div className="booking-ref-code" data-testid="booking-reference">
                    {bookingReference}
                  </div>
                </div>

                {/* Summary Table */}
                <div className="table-responsive mb-4">
                  <table className="table table-bordered table-sm align-middle mb-0">
                    <tbody>
                      <tr>
                        <th className="bg-light w-35">Airline & Flight</th>
                        <td>{flight.airline} ({flight.flightNumber}) - {flight.aircraft}</td>
                      </tr>
                      <tr>
                        <th className="bg-light">Route</th>
                        <td>{flight.from} ({flight.fromCode}) → {flight.to} ({flight.toCode})</td>
                      </tr>
                      <tr>
                        <th className="bg-light">Date & Time</th>
                        <td>{searchParams?.departureDate || flight.departureDate} at {flight.departureTime} (Arrival: {flight.arrivalTime})</td>
                      </tr>
                      <tr>
                        <th className="bg-light">Passenger</th>
                        <td>{passengerName} ({email})</td>
                      </tr>
                      <tr>
                        <th className="bg-light">Status & Terms</th>
                        <td>
                          <span className="badge bg-success me-2">CONFIRMED</span>
                          {flight.refundable ? <span className="badge bg-info text-dark">Refundable</span> : <span className="badge bg-secondary">Non-refundable</span>}
                        </td>
                      </tr>
                      <tr>
                        <th className="bg-light">Total Paid (Demo)</th>
                        <td className="fw-bold text-primary fs-6">₹{totalAmount.toLocaleString('en-IN')}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="d-flex flex-wrap justify-content-center align-items-center gap-3">
                  <a
                    href={
                      searchParams?.returnUrl
                        ? `${searchParams.returnUrl}${searchParams.returnUrl.includes('?') ? '&' : '?'}booking=flight_success&pnr=${encodeURIComponent(bookingReference)}&flight=${encodeURIComponent(flight.flightNumber)}&from=${encodeURIComponent(flight.from)}&to=${encodeURIComponent(flight.to)}`
                        : "http://localhost:5173"
                    }
                    className="btn btn-success rounded-pill px-4 py-2 fw-bold shadow"
                    data-testid="return-to-trip-btn"
                  >
                    <i className="bi bi-arrow-left-circle me-2"></i>
                    RETURN TO TRIP
                  </a>
                  <a
                    href={`http://localhost:5175/?destination=${encodeURIComponent(flight.to)}&checkinDate=${encodeURIComponent(searchParams?.departureDate || flight.departureDate || '2026-10-10')}&checkoutDate=2026-10-14&guests=${encodeURIComponent(searchParams?.passengers || 2)}&tripId=${encodeURIComponent(searchParams?.tripId || '')}&autoOpen=true&returnUrl=${encodeURIComponent(searchParams?.returnUrl ? `${searchParams.returnUrl}${searchParams.returnUrl.includes('?') ? '&' : '?'}booking=flight_success&pnr=${encodeURIComponent(bookingReference)}&flight=${encodeURIComponent(flight.flightNumber)}&from=${encodeURIComponent(flight.from)}&to=${encodeURIComponent(flight.to)}` : 'http://localhost:5173')}`}
                    className="btn btn-primary rounded-pill px-4 py-2 fw-bold shadow"
                    data-testid="proceed-to-hotel-btn"
                  >
                    <i className="bi bi-building me-2"></i>
                    BOOK HOTEL (DEMO) ➔
                  </a>
                  <button className="btn btn-outline-secondary rounded-pill px-3 py-2 fw-bold" onClick={onClose} data-testid="done-booking-btn">
                    Stay on Portal
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
