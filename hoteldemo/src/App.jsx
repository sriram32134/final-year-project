import React, { useState } from 'react';
import Navbar from './components/Navbar';
import HotelSearch from './components/HotelSearch';
import HotelCard from './components/HotelCard';
import BookingForm from './components/BookingForm';
import BookingConfirmation from './components/BookingConfirmation';
import { hotelsData } from './data/hotels';

export default function App() {
  const [searchParams, setSearchParams] = useState({
    destination: '',
    checkinDate: '',
    checkoutDate: '',
    guests: 1
  });
  const [searchResults, setSearchResults] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [bookingDetails, setBookingDetails] = useState(null);

  const handleSearch = (params) => {
    setSearchParams(params);
    setHasSearched(true);
    setSelectedHotel(null);
    setBookingDetails(null);

    const term = params.destination.toLowerCase().trim();
    // Filter hotels by city or location matching search term
    const filtered = hotelsData.filter((hotel) => 
      hotel.city.toLowerCase().includes(term) ||
      hotel.location.toLowerCase().includes(term) ||
      hotel.name.toLowerCase().includes(term)
    );

    setSearchResults(filtered);
  };

  const handleSelectHotel = (hotel) => {
    setSelectedHotel(hotel);
    setBookingDetails(null);
  };

  const handleConfirmBooking = (guestInfo) => {
    const cleanDate = searchParams.checkinDate ? searchParams.checkinDate.replace(/-/g, '') : '20261010';
    const confirmationNumber = `HT-${selectedHotel.id}-${cleanDate}`;

    setBookingDetails({
      ...guestInfo,
      confirmationNumber
    });
  };

  const handleReset = () => {
    setSearchParams({
      destination: '',
      checkinDate: '',
      checkoutDate: '',
      guests: 1
    });
    setSearchResults(null);
    setHasSearched(false);
    setSelectedHotel(null);
    setBookingDetails(null);
  };

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      <Navbar onReset={handleReset} />

      {/* Hero Header */}
      <div className="hero-section text-center">
        <div className="container position-relative">
          <h1 className="display-5 fw-extrabold mb-2">Find your perfect stay</h1>
          <p className="lead opacity-90 mb-0">Discover top hotels, luxury suites & beachfront resorts at guaranteed best rates</p>
        </div>
      </div>

      {/* Main Container */}
      <main className="container flex-grow-1 mb-5">
        {/* Search Bar Container */}
        <div className="search-box-container mb-4">
          <HotelSearch 
            onSearch={handleSearch} 
            initialSearch={searchParams} 
          />
        </div>

        {/* View Flow: Booking Confirmation -> Booking Form -> Search Results -> Default Promo */}
        {bookingDetails && selectedHotel ? (
          <BookingConfirmation
            booking={bookingDetails}
            hotel={selectedHotel}
            searchParams={searchParams}
            onReset={handleReset}
          />
        ) : selectedHotel ? (
          <BookingForm
            hotel={selectedHotel}
            searchParams={searchParams}
            onConfirmBooking={handleConfirmBooking}
            onCancel={() => setSelectedHotel(null)}
          />
        ) : hasSearched ? (
          <section className="mt-4">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h4 className="fw-bold text-dark mb-0">
                Hotels in {searchParams.destination} ({searchResults.length})
              </h4>
              <span className="text-muted fs-7">
                {searchParams.checkinDate} to {searchParams.checkoutDate} • {searchParams.guests} Guest(s)
              </span>
            </div>

            {searchResults.length > 0 ? (
              <div className="row g-4">
                {searchResults.map((hotel) => (
                  <div key={hotel.id} className="col-lg-4 col-md-6">
                    <HotelCard
                      hotel={hotel}
                      onSelectHotel={handleSelectHotel}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-5 bg-white rounded-3 border my-3">
                <div className="fs-1 mb-3">🔍</div>
                <h5 className="fw-bold text-dark">No hotels found for this destination.</h5>
                <p className="text-muted fs-7 mb-3">Try searching for popular cities like Bengaluru, Hyderabad, Mumbai, Delhi, or Goa.</p>
              </div>
            )}
          </section>
        ) : (
          <section className="mt-5 text-center py-4">
            <h5 className="fw-semibold text-secondary mb-3">Explore Popular Destinations</h5>
            <div className="row g-3 justify-content-center">
              {[
                { city: 'Bengaluru', desc: 'Garden City & Tech Hub', count: '3 Hotels' },
                { city: 'Hyderabad', desc: 'City of Pearls & Biryani', count: '2 Hotels' },
                { city: 'Mumbai', desc: 'Financial Capital & Beaches', count: '3 Hotels' },
                { city: 'Delhi', desc: 'Capital Heritage & Markets', count: '2 Hotels' },
                { city: 'Goa', desc: 'Sun, Sand & Beach Resorts', count: '2 Hotels' }
              ].map((dest) => (
                <div key={dest.city} className="col-md-4 col-sm-6">
                  <div 
                    className="p-3 bg-white border rounded-3 text-start shadow-sm cursor-pointer hover-shadow"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSearch({
                      destination: dest.city,
                      checkinDate: '2026-10-10',
                      checkoutDate: '2026-10-12',
                      guests: 2
                    })}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="fw-bold text-dark fs-6">{dest.city}</span>
                      <span className="badge bg-primary-subtle text-primary fs-7">{dest.count}</span>
                    </div>
                    <span className="text-muted fs-7">{dest.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-dark text-white-50 py-4 mt-auto">
        <div className="container text-center fs-7">
          <p className="mb-1 fw-semibold text-white">StayFinder Demo Website</p>
          <p className="mb-0 text-muted">Deterministic Local Hotel Booking Platform • Playwright Automation Ready</p>
        </div>
      </footer>
    </div>
  );
}
