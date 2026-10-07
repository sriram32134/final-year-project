import React from 'react';

export default function FlightCard({ flight, passengerCount, onBook }) {
  const getAirlineColor = (code) => {
    switch (code) {
      case '6E': return '#002B7F'; // IndiGo
      case 'AI': return '#ED1C24'; // Air India
      case 'UK': return '#582C83'; // Vistara
      case 'QP': return '#FF6600'; // Akasa Air
      case 'SG': return '#D32F2F'; // SpiceJet
      default: return '#1e40af';
    }
  };

  const totalPrice = flight.price * passengerCount;

  return (
    <div 
      className="flight-card p-3 p-md-4 mb-3"
      data-testid="flight-result"
      data-flight-id={flight.id}
    >
      <div className="row align-items-center g-3">
        {/* Airline Info */}
        <div className="col-lg-3 col-md-4 d-flex align-items-center gap-3">
          <div 
            className="airline-badge text-white shadow-sm"
            style={{ backgroundColor: getAirlineColor(flight.airlineCode) }}
          >
            {flight.airlineCode}
          </div>
          <div>
            <h6 className="fw-bold mb-0 text-dark">{flight.airline}</h6>
            <div className="text-muted small fw-medium">
              <span className="badge bg-light text-dark border me-1">{flight.flightNumber}</span>
              <span className="extra-small">{flight.aircraft}</span>
            </div>
          </div>
        </div>

        {/* Flight Time & Route */}
        <div className="col-lg-5 col-md-5">
          <div className="row text-center align-items-center">
            {/* Departure */}
            <div className="col-4 text-start text-md-center">
              <div className="flight-time-large">{flight.departureTime}</div>
              <div className="fw-bold text-dark fs-6">{flight.fromCode}</div>
              <div className="text-muted extra-small text-truncate">{flight.from}</div>
            </div>

            {/* Flight Duration Visual */}
            <div className="col-4">
              <div className="flight-duration-line">
                <span className="flight-duration-badge">
                  {flight.duration}
                </span>
              </div>
              <div className="extra-small fw-semibold mt-1">
                {flight.stops === 0 ? (
                  <span className="text-success"><i className="bi bi-check-circle-fill me-1"></i>Non-stop</span>
                ) : (
                  <span className="text-warning"><i className="bi bi-clock-history me-1"></i>1 Stop</span>
                )}
              </div>
            </div>

            {/* Arrival */}
            <div className="col-4 text-end text-md-center">
              <div className="flight-time-large">{flight.arrivalTime}</div>
              <div className="fw-bold text-dark fs-6">{flight.toCode}</div>
              <div className="text-muted extra-small text-truncate">{flight.to}</div>
            </div>
          </div>
        </div>

        {/* Additional Tags & Price + Book Button */}
        <div className="col-lg-4 col-md-3 border-start-md ps-md-4 text-end text-md-end">
          <div className="d-flex flex-wrap justify-content-end gap-1 mb-2">
            <span className="badge bg-light text-secondary border extra-small">
              <i className="bi bi-briefcase-fill me-1"></i>{flight.baggage}
            </span>
            {flight.refundable ? (
              <span className="badge-refundable">Refundable</span>
            ) : (
              <span className="badge-non-refundable">Non-refundable</span>
            )}
            <span className="badge-seats-left">
              <i className="bi bi-person-fill me-1"></i>{flight.availableSeats} seats left
            </span>
          </div>

          <div className="d-flex align-items-baseline justify-content-end gap-1 mb-2">
            <span className="text-muted extra-small">Total:</span>
            <span className="price-text">₹{totalPrice.toLocaleString('en-IN')}</span>
          </div>
          {passengerCount > 1 && (
            <div className="text-muted extra-small mb-2">
              (₹{flight.price.toLocaleString('en-IN')} × {passengerCount} passengers)
            </div>
          )}

          <button
            className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm w-100 w-md-auto"
            onClick={() => onBook(flight)}
            data-testid="book-flight"
            data-flight-number={flight.flightNumber}
          >
            Book Now <i className="bi bi-arrow-right ms-1"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
