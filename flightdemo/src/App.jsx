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
  const urlParams = new URLSearchParams(window.location.search);
  const paramFrom = urlParams.get('origin') || urlParams.get('from') || 'Hyderabad';
  const paramTo = urlParams.get('destination') || urlParams.get('to') || 'Bengaluru';
  const paramDate = urlParams.get('departureDate') || urlParams.get('date') || '2026-10-10';
  const paramReturnDate = urlParams.get('returnDate') || '';
  const paramPassengers = parseInt(urlParams.get('travelers') || urlParams.get('passengers') || '1', 10);
  const paramTripId = urlParams.get('tripId') || '';
  const paramReturnUrl = urlParams.get('returnUrl') || (paramTripId ? `http://localhost:5173/trip/${paramTripId}` : 'http://localhost:5173/');

  // Search parameters state
  const [searchParams, setSearchParams] = useState({
    from: paramFrom,
    to: paramTo,
    departureDate: paramDate,
    returnDate: paramReturnDate,
    passengers: paramPassengers,
    tripId: paramTripId,
    returnUrl: paramReturnUrl,
  });

  // Has user performed a search (or default search active)
  const [hasSearched, setHasSearched] = useState(true);

  // Filter states
  const [maxPrice, setMaxPrice] = useState(100000);
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
    setMaxPrice(100000);
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

    let list = FLIGHTS_DATA.filter(flight => {
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
    });

    // Dynamic generation fallback: If no exact pre-configured flights exist, create realistic flights for this route
    if (list.length === 0 && searchParams.from && searchParams.to) {
      const AIRPORT_MAP = {
        'united states': { code: 'JFK', lat: 40.6413, lng: -73.7781 },
        'usa': { code: 'JFK', lat: 40.6413, lng: -73.7781 },
        'us': { code: 'JFK', lat: 40.6413, lng: -73.7781 },
        'new york': { code: 'JFK', lat: 40.6413, lng: -73.7781 },
        'san francisco': { code: 'SFO', lat: 37.6213, lng: -122.3790 },
        'los angeles': { code: 'LAX', lat: 33.9416, lng: -118.4085 },
        'united kingdom': { code: 'LHR', lat: 51.4700, lng: -0.4543 },
        'uk': { code: 'LHR', lat: 51.4700, lng: -0.4543 },
        'england': { code: 'LHR', lat: 51.4700, lng: -0.4543 },
        'london': { code: 'LHR', lat: 51.4700, lng: -0.4543 },
        'france': { code: 'CDG', lat: 49.0097, lng: 2.5479 },
        'paris': { code: 'CDG', lat: 49.0097, lng: 2.5479 },
        'japan': { code: 'HND', lat: 35.5494, lng: 139.7798 },
        'tokyo': { code: 'HND', lat: 35.5494, lng: 139.7798 },
        'dubai': { code: 'DXB', lat: 25.2532, lng: 55.3657 },
        'uae': { code: 'DXB', lat: 25.2532, lng: 55.3657 },
        'singapore': { code: 'SIN', lat: 1.3644, lng: 103.9915 },
        'italy': { code: 'FCO', lat: 41.8003, lng: 12.2389 },
        'rome': { code: 'FCO', lat: 41.8003, lng: 12.2389 },
        'bali': { code: 'DPS', lat: -8.7482, lng: 115.1672 },
        'indonesia': { code: 'DPS', lat: -8.7482, lng: 115.1672 },
        'switzerland': { code: 'ZRH', lat: 47.4582, lng: 8.5555 },
        'zurich': { code: 'ZRH', lat: 47.4582, lng: 8.5555 },
        'germany': { code: 'FRA', lat: 50.0379, lng: 8.5622 },
        'spain': { code: 'BCN', lat: 41.2974, lng: 2.0833 },
        'barcelona': { code: 'BCN', lat: 41.2974, lng: 2.0833 },
        'hyderabad': { code: 'HYD', lat: 17.2403, lng: 78.4294 },
        'bengaluru': { code: 'BLR', lat: 13.1986, lng: 77.7066 },
        'bangalore': { code: 'BLR', lat: 13.1986, lng: 77.7066 },
        'delhi': { code: 'DEL', lat: 28.5562, lng: 77.1000 },
        'new delhi': { code: 'DEL', lat: 28.5562, lng: 77.1000 },
        'mumbai': { code: 'BOM', lat: 19.0896, lng: 72.8656 },
        'goa': { code: 'GOI', lat: 15.3808, lng: 73.8313 },
      };

      const resolveHub = (name, fallback) => {
        const lower = (name || '').toLowerCase().trim();
        for (const [k, v] of Object.entries(AIRPORT_MAP)) {
          if (lower.includes(k) || k.includes(lower)) return v;
        }
        const clean = (name || fallback || 'DST').replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase();
        return { code: clean.length === 3 ? clean : fallback, lat: 20.0, lng: 78.0 };
      };

      const fromHub = resolveHub(searchParams.from, 'HYD');
      const toHub = resolveHub(searchParams.to, 'LHR');
      const fromC = searchParams.from;
      const toC = searchParams.to;
      const fromCd = fromHub.code;
      const toCd = toHub.code;
      const depDate = searchParams.departureDate || '2026-10-10';

      // Haversine distance
      const R = 6371;
      const dLat = (toHub.lat - fromHub.lat) * Math.PI / 180;
      const dLon = (toHub.lng - fromHub.lng) * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(fromHub.lat * Math.PI / 180) * Math.cos(toHub.lat * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distKm = Math.max(500, Math.round(R * c));

      // Realistic flight duration calculation
      let flightMins = 75;
      let aircraftType = 'Airbus A320neo';
      let basePrice = 3600;

      if (distKm <= 500) {
        flightMins = 75;
        aircraftType = 'Airbus A320neo';
        basePrice = 3400;
      } else if (distKm <= 1500) {
        flightMins = Math.round(45 + (distKm / 800) * 60);
        aircraftType = 'Airbus A321neo';
        basePrice = 5200;
      } else if (distKm <= 3500) {
        flightMins = Math.round(40 + (distKm / 820) * 60);
        aircraftType = 'Boeing 787-8 Dreamliner';
        basePrice = 17500;
      } else if (distKm <= 6000) {
        flightMins = Math.round(45 + (distKm / 830) * 60);
        aircraftType = 'Airbus A350-900';
        basePrice = 38000;
      } else if (distKm <= 9500) {
        // e.g. London / UK (~7700 km) -> ~9h 45m
        flightMins = Math.round(50 + (distKm / 840) * 60);
        aircraftType = 'Boeing 777-300ER';
        basePrice = 46000;
      } else {
        // e.g. United States (~13500 km) -> ~16h 30m
        flightMins = Math.round(55 + (distKm / 850) * 60);
        aircraftType = 'Boeing 777-200LR';
        basePrice = 64000;
      }

      const durH = Math.floor(flightMins / 60);
      const durM = flightMins % 60;
      const durationStr = `${durH}h ${durM < 10 ? '0' : ''}${durM}m`;

      const computeArrival = (depH, depM, addM) => {
        const total = (depH * 60 + depM + addM) % (24 * 60);
        const h = Math.floor(total / 60);
        const m = total % 60;
        return `${h < 10 ? '0' : ''}${h}:${m < 10 ? '0' : ''}${m}`;
      };

      const isLongHaul = distKm > 3000;
      const airlineA = isLongHaul ? (toCd === 'LHR' ? 'British Airways' : toCd === 'JFK' || toCd === 'SFO' ? 'Air India' : toCd === 'CDG' ? 'Air France' : 'Emirates') : 'IndiGo';
      const codeA = isLongHaul ? (toCd === 'LHR' ? 'BA' : toCd === 'CDG' ? 'AF' : 'AI') : '6E';
      const airlineB = isLongHaul ? 'Air India' : 'Air India';
      const airlineC = isLongHaul ? 'Qatar Airways' : 'Akasa Air';

      list = [
        {
          id: `FL-${fromCd}-${toCd}-001`,
          airline: airlineA,
          airlineCode: codeA,
          flightNumber: `${codeA}-${Math.floor(100 + Math.random() * 800)}`,
          from: fromC,
          fromCode: fromCd,
          to: toC,
          toCode: toCd,
          departureDate: depDate,
          departureTime: "06:30",
          arrivalTime: computeArrival(6, 30, flightMins),
          duration: durationStr,
          stops: 0,
          price: Math.round(basePrice * 1.05),
          currency: "INR",
          availableSeats: 14,
          aircraft: aircraftType,
          refundable: true,
          baggage: isLongHaul ? "23 kg Check-in, 10 kg Cabin" : "15 kg Check-in, 7 kg Cabin",
          status: "On Time"
        },
        {
          id: `FL-${fromCd}-${toCd}-002`,
          airline: airlineB,
          airlineCode: "AI",
          flightNumber: `AI-${Math.floor(100 + Math.random() * 800)}`,
          from: fromC,
          fromCode: fromCd,
          to: toC,
          toCode: toCd,
          departureDate: depDate,
          departureTime: "10:15",
          arrivalTime: computeArrival(10, 15, flightMins + (isLongHaul ? 15 : 5)),
          duration: durationStr,
          stops: 0,
          price: Math.round(basePrice * 0.92),
          currency: "INR",
          availableSeats: 8,
          aircraft: isLongHaul ? "Boeing 787-9 Dreamliner" : "Airbus A320neo",
          refundable: true,
          baggage: isLongHaul ? "2 x 23 kg Check-in, 8 kg Cabin" : "25 kg Check-in, 8 kg Cabin",
          status: "Filling Fast"
        },
        {
          id: `FL-${fromCd}-${toCd}-003`,
          airline: airlineC,
          airlineCode: isLongHaul ? "QR" : "QP",
          flightNumber: `${isLongHaul ? 'QR' : 'QP'}-${Math.floor(100 + Math.random() * 800)}`,
          from: fromC,
          fromCode: fromCd,
          to: toC,
          toCode: toCd,
          departureDate: depDate,
          departureTime: "17:45",
          arrivalTime: computeArrival(17, 45, flightMins + (isLongHaul ? 120 : 0)),
          duration: isLongHaul ? `${durH + 2}h ${durM}m` : durationStr,
          stops: isLongHaul ? 1 : 0,
          price: Math.round(basePrice * 0.85),
          currency: "INR",
          availableSeats: 18,
          aircraft: isLongHaul ? "Airbus A350-1000" : "Boeing 737 MAX",
          refundable: false,
          baggage: isLongHaul ? "30 kg Check-in, 7 kg Cabin" : "15 kg Check-in, 7 kg Cabin",
          status: "Scheduled"
        }
      ];
    }

    return list.sort((a, b) => {
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

  const autoBookParam = urlParams.get('autoBook') === 'true' || urlParams.get('agent') === 'true';
  const autoOpenParam = autoBookParam || urlParams.get('autoOpen') === 'true' || urlParams.get('autoSelect') === 'true';

  React.useEffect(() => {
    if (autoOpenParam && filteredFlights.length > 0 && !selectedFlightForBooking) {
      setSelectedFlightForBooking(filteredFlights[0]);
    }
  }, [autoOpenParam, filteredFlights, selectedFlightForBooking]);

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
          isAutoBook={autoBookParam}
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
