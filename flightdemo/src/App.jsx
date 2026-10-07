import React, { useState, useMemo } from 'react';
import Navbar from './components/Navbar';
import SearchForm from './components/SearchForm';
import PopularRoutes from './components/PopularRoutes';
import FilterSidebar from './components/FilterSidebar';
import FlightCard from './components/FlightCard';
import BookingModal from './components/BookingModal';
import Footer from './components/Footer';
import { FLIGHTS_DATA } from './data/flights';

export default function App() {
  // Search parameters state
  const [searchParams, setSearchParams] = useState({
    from: 'Hyderabad',
    to: 'Bengaluru',
    departureDate: '2026-10-10',
    passengers: 1
  });

  // Has user performed a search (or default search active)
  const [hasSearched, setHasSearched] = useState(true);

  // Filter states
  const [maxPrice, setMaxPrice] = useState(8000);
  const [selectedStops, setSelectedStops] = useState([]);
  const [selectedAirlines, setSelectedAirlines] = useState([]);
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState([]);

  // Sorting state: 'cheapest', 'fastest', 'earliest'
  const [sortBy, setSortBy] = useState('cheapest');

  // Booking modal state
  const [selectedFlightForBooking, setSelectedFlightForBooking] = useState(null);

  // Available airlines list
  const availableAirlines = useMemo(() => {
    return Array.from(new Set(FLIGHTS_DATA.map(f => f.airline)));
  }, []);

  // Helper to parse duration string e.g. "1h 15m" to total minutes
  const parseDurationMinutes = (durationStr) => {
    let minutes = 0;
    const hoursMatch = durationStr.match(/(\d+)\s*h/);
    const minsMatch = durationStr.match(/(\d+)\s*m/);
    if (hoursMatch) minutes += parseInt(hoursMatch[1], 10) * 60;
    if (minsMatch) minutes += parseInt(minsMatch[1], 10);
    return minutes || 999;
  };

  // Helper to classify departure time into slots
  const getTimeSlot = (timeStr) => {
    const hour = parseInt(timeStr.split(':')[0], 10);
    if (hour >= 0 && hour < 6) return 'earlyMorning';
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    return 'evening'; // 18 to 24
  };

  // Handle Search Submission
  const handleSearch = (newParams) => {
    setSearchParams(newParams);
    setHasSearched(true);
  };

  // Handle Quick Route Selection
  const handleQuickRoute = (from, to, date) => {
    const updated = { ...searchParams, from, to, departureDate: date };
    setSearchParams(updated);
    setHasSearched(true);
  };

  // Handle Reset Filters
  const handleResetFilters = () => {
    setMaxPrice(8000);
    setSelectedStops([]);
    setSelectedAirlines([]);
    setSelectedTimeOfDay([]);
    setSortBy('cheapest');
  };

  // Handle Reset Search
  const handleResetSearch = () => {
    setSearchParams({
      from: 'Hyderabad',
      to: 'Bengaluru',
      departureDate: '2026-10-10',
      passengers: 1
    });
    handleResetFilters();
    setHasSearched(true);
  };

  // Filter & Sort Logic
  const filteredFlights = useMemo(() => {
    if (!hasSearched) return [];

    return FLIGHTS_DATA.filter(flight => {
      // 1. Origin match (Check city name or airport code)
      const matchesFrom = 
        flight.from.toLowerCase() === searchParams.from.toLowerCase() ||
        flight.fromCode.toLowerCase() === searchParams.from.toLowerCase();

      // 2. Destination match
      const matchesTo = 
        flight.to.toLowerCase() === searchParams.to.toLowerCase() ||
        flight.toCode.toLowerCase() === searchParams.to.toLowerCase();

      // 3. Departure Date match
      const matchesDate = !searchParams.departureDate || flight.departureDate === searchParams.departureDate;

      // 4. Seats availability match
      const matchesSeats = flight.availableSeats >= (searchParams.passengers || 1);

      if (!matchesFrom || !matchesTo || !matchesDate || !matchesSeats) {
        return false;
      }

      // Sidebar Filters:
      // Price
      if (maxPrice && flight.price > maxPrice) return false;

      // Stops
      if (selectedStops.length > 0 && !selectedStops.includes(flight.stops)) return false;

      // Airlines
      if (selectedAirlines.length > 0 && !selectedAirlines.includes(flight.airline)) return false;

      // Departure Time of Day
      if (selectedTimeOfDay.length > 0) {
        const slot = getTimeSlot(flight.departureTime);
        if (!selectedTimeOfDay.includes(slot)) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'cheapest') {
        return a.price - b.price;
      }
      if (sortBy === 'fastest') {
        return parseDurationMinutes(a.duration) - parseDurationMinutes(b.duration);
      }
      if (sortBy === 'earliest') {
        return a.departureTime.localeCompare(b.departureTime);
      }
      return 0;
    });
  }, [searchParams, hasSearched, maxPrice, selectedStops, selectedAirlines, selectedTimeOfDay, sortBy]);

  return (
    <div className="min-vh-100 d-flex flex-column">
      <Navbar onResetSearch={handleResetSearch} />

      {/* Hero Header */}
      <header className="hero-section text-center">
        <div className="container position-relative">
          <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 rounded-pill fw-bold text-uppercase mb-3">
            <i className="bi bi-rocket-takeoff-fill me-1"></i> Standalone Flight Booking Engine
          </span>
          <h1 className="fw-extrabold display-5 mb-2">
            Find & Book Demo Commercial Flights
          </h1>
          <p className="lead text-light opacity-75 max-w-2xl mx-auto fs-6">
            Realistic, deterministic flight search and booking simulation running on <code className="text-warning">localhost:5174</code>
          </p>
        </div>
      </header>

      {/* Search Form Card (Overlapping Hero) */}
      <div className="container search-card-wrapper">
        <SearchForm 
          onSearch={handleSearch} 
          initialParams={searchParams}
          key={`${searchParams.from}-${searchParams.to}-${searchParams.departureDate}`}
        />
        <PopularRoutes onSelectRoute={handleQuickRoute} />
      </div>

      {/* Main Results Section */}
      <main className="container my-5 flex-grow-1">
        <div className="row g-4">
          
          {/* Filter Sidebar */}
          <div className="col-lg-3">
            <FilterSidebar
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              selectedStops={selectedStops}
              setSelectedStops={setSelectedStops}
              selectedAirlines={selectedAirlines}
              setSelectedAirlines={setSelectedAirlines}
              selectedTimeOfDay={selectedTimeOfDay}
              setSelectedTimeOfDay={setSelectedTimeOfDay}
              availableAirlines={availableAirlines}
              onResetFilters={handleResetFilters}
            />
          </div>

          {/* Results Area */}
          <div className="col-lg-9">
            {/* Header / Sort Bar */}
            <div className="d-flex flex-wrap align-items-center justify-content-between bg-white border rounded-3 p-3 mb-3 shadow-sm">
              <div>
                <h5 className="fw-bold mb-0 text-dark">
                  Flights from <span className="text-primary">{searchParams.from}</span> to <span className="text-primary">{searchParams.to}</span>
                </h5>
                <span className="text-muted extra-small" data-testid="results-count">
                  Found <strong className="text-dark">{filteredFlights.length}</strong> matching flights for {searchParams.departureDate} ({searchParams.passengers} passenger)
                </span>
              </div>

              {/* Sort Dropdown */}
              <div className="d-flex align-items-center gap-2 mt-2 mt-sm-0">
                <label className="small text-muted fw-semibold mb-0">Sort By:</label>
                <select
                  className="form-select form-select-sm fw-semibold text-dark shadow-none border"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  data-testid="sort-select"
                  aria-label="Sort flights"
                >
                  <option value="cheapest">Cheapest (Price Low to High)</option>
                  <option value="fastest">Fastest (Shortest Duration)</option>
                  <option value="earliest">Earliest Departure</option>
                </select>
              </div>
            </div>

            {/* Flight Cards List */}
            {filteredFlights.length > 0 ? (
              filteredFlights.map((flight) => (
                <FlightCard
                  key={flight.id}
                  flight={flight}
                  passengerCount={searchParams.passengers || 1}
                  onBook={(f) => setSelectedFlightForBooking(f)}
                />
              ))
            ) : (
              /* No Flights Found View */
              <div className="bg-white border rounded-3 p-5 text-center shadow-sm">
                <div className="text-muted mb-3">
                  <i className="bi bi-search-heart display-3 text-secondary opacity-50"></i>
                </div>
                <h4 className="fw-bold text-dark mb-2">No Flights Found</h4>
                <p className="text-muted mb-4">
                  No flights match your search criteria for <strong>{searchParams.from} → {searchParams.to}</strong> on <strong>{searchParams.departureDate}</strong>.
                </p>
                <div className="d-flex justify-content-center gap-2">
                  <button className="btn btn-outline-primary fw-semibold rounded-pill px-4" onClick={handleResetFilters}>
                    Reset Filters
                  </button>
                  <button className="btn btn-primary fw-semibold rounded-pill px-4" onClick={handleResetSearch}>
                    Search HYD → BLR (Default)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Booking Modal */}
      {selectedFlightForBooking && (
        <BookingModal
          flight={selectedFlightForBooking}
          searchParams={searchParams}
          onClose={() => setSelectedFlightForBooking(null)}
          onBookingSuccess={(details) => {
            console.log("Demo booking created:", details);
          }}
        />
      )}

      <Footer />
    </div>
  );
}
