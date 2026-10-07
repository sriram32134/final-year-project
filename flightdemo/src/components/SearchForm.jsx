import React, { useState } from 'react';
import { POPULAR_CITIES } from '../data/flights';

export default function SearchForm({ onSearch, initialParams }) {
  const [from, setFrom] = useState(initialParams?.from || 'Hyderabad');
  const [to, setTo] = useState(initialParams?.to || 'Bengaluru');
  const [departureDate, setDepartureDate] = useState(initialParams?.departureDate || '2026-10-10');
  const [returnDate, setReturnDate] = useState(initialParams?.returnDate || '');
  const [passengers, setPassengers] = useState(initialParams?.passengers || 1);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({
      from,
      to,
      departureDate,
      returnDate,
      passengers: parseInt(passengers, 10) || 1
    });
  };

  const handleSwap = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  return (
    <div className="search-card">
      <form onSubmit={handleSubmit}>
        <div className="row g-3 align-items-center">
          {/* From Field */}
          <div className="col-lg-3 col-md-6">
            <label className="form-label fw-semibold text-secondary small mb-1">
              <i className="bi bi-geo-alt-fill text-primary me-1"></i> From
            </label>
            <select
              className="form-select form-select-lg fs-6 fw-semibold text-dark shadow-none border"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              data-testid="from-input"
              name="from"
              required
            >
              {POPULAR_CITIES.map(city => (
                <option key={`from-${city.code}`} value={city.name}>
                  {city.name} ({city.code})
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <div className="col-lg-1 col-md-12 d-flex justify-content-center">
            <button
              type="button"
              className="swap-btn"
              onClick={handleSwap}
              title="Swap From & To"
              data-testid="swap-routes"
            >
              <i className="bi bi-arrow-left-right"></i>
            </button>
          </div>

          {/* To Field */}
          <div className="col-lg-3 col-md-6">
            <label className="form-label fw-semibold text-secondary small mb-1">
              <i className="bi bi-pin-map-fill text-danger me-1"></i> To
            </label>
            <select
              className="form-select form-select-lg fs-6 fw-semibold text-dark shadow-none border"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              data-testid="to-input"
              name="to"
              required
            >
              {POPULAR_CITIES.map(city => (
                <option key={`to-${city.code}`} value={city.name}>
                  {city.name} ({city.code})
                </option>
              ))}
            </select>
          </div>

          {/* Departure Date */}
          <div className="col-lg-2 col-md-6">
            <label className="form-label fw-semibold text-secondary small mb-1">
              <i className="bi bi-calendar3 text-primary me-1"></i> Departure Date
            </label>
            <input
              type="date"
              className="form-control form-control-lg fs-6 fw-semibold shadow-none border"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              data-testid="departure-date"
              name="departureDate"
              required
            />
          </div>

          {/* Passengers */}
          <div className="col-lg-1 col-md-6">
            <label className="form-label fw-semibold text-secondary small mb-1">
              <i className="bi bi-people-fill text-primary me-1"></i> Seats
            </label>
            <input
              type="number"
              min="1"
              max="9"
              className="form-control form-control-lg fs-6 fw-semibold shadow-none border text-center"
              value={passengers}
              onChange={(e) => setPassengers(e.target.value)}
              data-testid="passengers-input"
              name="passengers"
              required
            />
          </div>

          {/* Search Button */}
          <div className="col-lg-2 col-md-12 d-grid">
            <label className="form-label fw-semibold text-secondary small mb-1 d-none d-lg-block">&nbsp;</label>
            <button
              type="submit"
              className="btn btn-primary btn-lg rounded-3 fw-bold fs-6 shadow-sm"
              data-testid="search-flights"
            >
              <i className="bi bi-search me-2"></i> Search Flights
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
