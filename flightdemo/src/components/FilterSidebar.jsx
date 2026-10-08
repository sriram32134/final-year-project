import React from 'react';

export default function FilterSidebar({
  maxPrice,
  setMaxPrice,
  selectedStops,
  setSelectedStops,
  selectedAirlines,
  setSelectedAirlines,
  selectedTimeOfDay,
  setSelectedTimeOfDay,
  availableAirlines,
  onResetFilters
}) {
  const handleStopToggle = (stopValue) => {
    if (selectedStops.includes(stopValue)) {
      setSelectedStops(selectedStops.filter(s => s !== stopValue));
    } else {
      setSelectedStops([...selectedStops, stopValue]);
    }
  };

  const handleAirlineToggle = (airline) => {
    if (selectedAirlines.includes(airline)) {
      setSelectedAirlines(selectedAirlines.filter(a => a !== airline));
    } else {
      setSelectedAirlines([...selectedAirlines, airline]);
    }
  };

  const handleTimeOfDayToggle = (timeSlot) => {
    if (selectedTimeOfDay.includes(timeSlot)) {
      setSelectedTimeOfDay(selectedTimeOfDay.filter(t => t !== timeSlot));
    } else {
      setSelectedTimeOfDay([...selectedTimeOfDay, timeSlot]);
    }
  };

  return (
    <div className="filter-card">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h5 className="filter-title mb-0">
          <i className="bi bi-funnel-fill text-primary me-2"></i> Filters
        </h5>
        <button
          className="btn btn-link btn-sm text-decoration-none p-0 text-primary fw-semibold"
          onClick={onResetFilters}
          data-testid="reset-filters"
        >
          Reset All
        </button>
      </div>

      {/* Price Range */}
      <div className="mb-4">
        <label className="form-label fw-bold text-dark small d-flex justify-content-between">
          <span>Max Price</span>
          <span className="text-primary fw-extrabold">₹{maxPrice ? maxPrice.toLocaleString('en-IN') : '1,00,000'}</span>
        </label>
        <input
          type="range"
          className="form-range"
          min="2000"
          max="100000"
          step="1000"
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          data-testid="price-filter"
        />
        <div className="d-flex justify-content-between text-muted extra-small" style={{ fontSize: '0.75rem' }}>
          <span>₹2,000</span>
          <span>₹1,00,000</span>
        </div>
      </div>

      {/* Stops Filter */}
      <div className="mb-4">
        <h6 className="fw-bold text-dark small mb-2">Stops</h6>
        <div className="form-check mb-2">
          <input
            className="form-check-input"
            type="checkbox"
            id="stop-0"
            checked={selectedStops.includes(0)}
            onChange={() => handleStopToggle(0)}
            data-testid="filter-nonstop"
          />
          <label className="form-check-label small text-secondary" htmlFor="stop-0">
            Non-stop
          </label>
        </div>
        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            id="stop-1"
            checked={selectedStops.includes(1)}
            onChange={() => handleStopToggle(1)}
            data-testid="filter-1stop"
          />
          <label className="form-check-label small text-secondary" htmlFor="stop-1">
            1 Stop
          </label>
        </div>
      </div>

      {/* Departure Time */}
      <div className="mb-4">
        <h6 className="fw-bold text-dark small mb-2">Departure Time</h6>
        {[
          { id: 'morning', label: '06:00 - 12:00 (Morning)', slot: 'morning' },
          { id: 'afternoon', label: '12:00 - 18:00 (Afternoon)', slot: 'afternoon' },
          { id: 'evening', label: '18:00 - 24:00 (Evening / Night)', slot: 'evening' },
          { id: 'earlyMorning', label: '00:00 - 06:00 (Early Morning)', slot: 'earlyMorning' }
        ].map(t => (
          <div className="form-check mb-2" key={t.id}>
            <input
              className="form-check-input"
              type="checkbox"
              id={`time-${t.id}`}
              checked={selectedTimeOfDay.includes(t.slot)}
              onChange={() => handleTimeOfDayToggle(t.slot)}
              data-testid={`filter-time-${t.id}`}
            />
            <label className="form-check-label small text-secondary" htmlFor={`time-${t.id}`}>
              {t.label}
            </label>
          </div>
        ))}
      </div>

      {/* Airlines Filter */}
      <div className="mb-2">
        <h6 className="fw-bold text-dark small mb-2">Airlines</h6>
        {availableAirlines.map(airline => (
          <div className="form-check mb-2" key={airline}>
            <input
              className="form-check-input"
              type="checkbox"
              id={`airline-${airline.replace(/\s+/g, '')}`}
              checked={selectedAirlines.includes(airline)}
              onChange={() => handleAirlineToggle(airline)}
              data-testid={`filter-airline-${airline.toLowerCase().replace(/\s+/g, '-')}`}
            />
            <label className="form-check-label small text-secondary" htmlFor={`airline-${airline.replace(/\s+/g, '')}`}>
              {airline}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
