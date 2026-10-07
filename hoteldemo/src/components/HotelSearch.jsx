import React, { useState } from 'react';

export default function HotelSearch({ onSearch, initialSearch = {} }) {
  const [destination, setDestination] = useState(initialSearch.destination || '');
  const [checkinDate, setCheckinDate] = useState(initialSearch.checkinDate || '');
  const [checkoutDate, setCheckoutDate] = useState(initialSearch.checkoutDate || '');
  const [guests, setGuests] = useState(initialSearch.guests || 1);
  const [errorMessage, setErrorMessage] = useState('');

  const quickCities = ['Bengaluru', 'Hyderabad', 'Mumbai', 'Delhi', 'Goa'];

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!destination || !destination.trim()) {
      setErrorMessage('Please enter a destination.');
      return;
    }

    if (!checkinDate) {
      setErrorMessage('Please select a check-in date.');
      return;
    }

    if (!checkoutDate) {
      setErrorMessage('Please select a check-out date.');
      return;
    }

    const checkin = new Date(checkinDate);
    const checkout = new Date(checkoutDate);

    if (checkout <= checkin) {
      setErrorMessage('Check-out date must be after check-in date.');
      return;
    }

    if (parseInt(guests, 10) < 1) {
      setErrorMessage('Guests count must be at least 1.');
      return;
    }

    onSearch({
      destination: destination.trim(),
      checkinDate,
      checkoutDate,
      guests: parseInt(guests, 10)
    });
  };

  return (
    <div className="search-card">
      <form onSubmit={handleSubmit}>
        <div className="row g-3 align-items-end">
          {/* Destination Field */}
          <div className="col-lg-4 col-md-6">
            <label htmlFor="destination-input" className="form-label">
              Destination
            </label>
            <input
              id="destination-input"
              type="text"
              className="form-control"
              placeholder="e.g. Bengaluru, Hyderabad, Goa..."
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              data-testid="destination-input"
            />
          </div>

          {/* Check-in Date Field */}
          <div className="col-lg-2 col-md-6 col-sm-6">
            <label htmlFor="checkin-date" className="form-label">
              Check-in Date
            </label>
            <input
              id="checkin-date"
              type="date"
              className="form-control"
              value={checkinDate}
              onChange={(e) => setCheckinDate(e.target.value)}
              data-testid="checkin-date"
            />
          </div>

          {/* Check-out Date Field */}
          <div className="col-lg-2 col-md-6 col-sm-6">
            <label htmlFor="checkout-date" className="form-label">
              Check-out Date
            </label>
            <input
              id="checkout-date"
              type="date"
              className="form-control"
              value={checkoutDate}
              onChange={(e) => setCheckoutDate(e.target.value)}
              data-testid="checkout-date"
            />
          </div>

          {/* Guests Field */}
          <div className="col-lg-2 col-md-6 col-sm-6">
            <label htmlFor="guests-input" className="form-label">
              Guests
            </label>
            <input
              id="guests-input"
              type="number"
              min="1"
              max="10"
              className="form-control"
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              data-testid="guests-input"
            />
          </div>

          {/* Search Button */}
          <div className="col-lg-2 col-md-6 col-sm-6">
            <button
              type="submit"
              className="btn btn-primary-custom w-100 py-2 d-flex align-items-center justify-content-center gap-2"
              data-testid="search-hotels"
            >
              <span>Search Hotels</span>
            </button>
          </div>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="mt-3 d-flex align-items-center gap-2 flex-wrap fs-7 text-muted">
          <span className="fw-semibold">Popular Cities:</span>
          {quickCities.map((city) => (
            <button
              key={city}
              type="button"
              className="btn btn-sm btn-outline-secondary rounded-pill py-0 px-2 fs-7"
              onClick={() => setDestination(city)}
            >
              {city}
            </button>
          ))}
        </div>

        {/* Error Validation Message */}
        {errorMessage && (
          <div className="alert alert-danger mt-3 py-2 px-3 mb-0 text-sm" role="alert">
            {errorMessage}
          </div>
        )}
      </form>
    </div>
  );
}
