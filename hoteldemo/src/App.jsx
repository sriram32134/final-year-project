import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HotelSearch from './components/HotelSearch';
import HotelCard from './components/HotelCard';
import BookingForm from './components/BookingForm';
import BookingConfirmation from './components/BookingConfirmation';
import { hotelsData } from './data/hotels';

export default function App() {
  const urlParams = new URLSearchParams(window.location.search);
  const paramDestination = urlParams.get('destination') || urlParams.get('to') || urlParams.get('city') || '';
  const paramCheckIn = urlParams.get('checkinDate') || urlParams.get('checkIn') || urlParams.get('departureDate') || '2026-10-10';
  const paramCheckOut = urlParams.get('checkoutDate') || urlParams.get('checkOut') || urlParams.get('returnDate') || '2026-10-12';
  const paramGuests = parseInt(urlParams.get('guests') || urlParams.get('travelers') || '1', 10);
  const paramTripId = urlParams.get('tripId') || '';
  const paramReturnUrl = urlParams.get('returnUrl') || (paramTripId ? `http://localhost:5173/trip/${paramTripId}` : 'http://localhost:5173/');

  const [searchParams, setSearchParams] = useState({
    destination: paramDestination,
    checkinDate: paramCheckIn,
    checkoutDate: paramCheckOut,
    guests: paramGuests,
    tripId: paramTripId,
    returnUrl: paramReturnUrl
  });
  const [searchResults, setSearchResults] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [bookingDetails, setBookingDetails] = useState(null);

  useEffect(() => {
    if (paramDestination) {
      handleSearch({
        destination: paramDestination,
        checkinDate: paramCheckIn,
        checkoutDate: paramCheckOut,
        guests: paramGuests,
        tripId: paramTripId,
        returnUrl: paramReturnUrl
      });
    }
  }, []);

  const handleSearch = (params) => {
    setSearchParams(prev => ({ ...prev, ...params }));
    setHasSearched(true);
    setSelectedHotel(null);
    setBookingDetails(null);

    const term = (params.destination || '').toLowerCase().trim();
    const aliases = {
      'united states': ['new york', 'nyc'],
      'usa': ['new york', 'nyc'],
      'us': ['new york', 'nyc'],
      'united kingdom': ['london'],
      'uk': ['london'],
      'england': ['london'],
      'france': ['paris'],
      'japan': ['tokyo'],
      'uae': ['dubai'],
      'indonesia': ['bali'],
      'india': ['hyderabad', 'bengaluru', 'mumbai', 'delhi', 'goa']
    }[term] || [];

    // Filter hotels by city, location, name or country alias matching search term
    const filtered = hotelsData.filter((hotel) => {
      const c = hotel.city.toLowerCase();
      const l = hotel.location.toLowerCase();
      const n = hotel.name.toLowerCase();
      if (c.includes(term) || l.includes(term) || n.includes(term) || (term.length > 3 && term.includes(c))) return true;
      return aliases.some(a => c.includes(a) || l.includes(a));
    });

    if (filtered.length === 0 && term) {
      const cap = term.charAt(0).toUpperCase() + term.slice(1);
      const code = cap.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'HTL';
      const dynamicHotels = [
        {
          id: `${code}-001`,
          name: `${cap} Travelers Pod & Backpacker Inn (Cheapest)`,
          city: cap,
          location: `Old Central Quarter, ${cap}`,
          rating: 4.4,
          reviewCount: 650,
          pricePerNight: 1550,
          currency: "INR",
          roomType: "Standard Pod / Economy Queen Room",
          amenities: ["Free Wi-Fi", "Express Check-in", "Luggage Lockers", "Transit Access"],
          image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80",
          description: `Super affordable, clean, and modern budget stay for solo travelers and value seekers in ${cap}.`,
          availableRooms: 15,
          breakfastIncluded: false,
          freeCancellation: true,
          checkInTime: "13:00",
          checkOutTime: "11:00"
        },
        {
          id: `${code}-002`,
          name: `The Royal Vista Boutique Suites ${cap} (Comfort)`,
          city: cap,
          location: `Heritage Hill Quarter, ${cap}`,
          rating: 4.7,
          reviewCount: 820,
          pricePerNight: 3600,
          currency: "INR",
          roomType: "Executive Balcony Studio Suite",
          amenities: ["Free Wi-Fi", "Breakfast Included", "Panoramic Balcony", "Airport Shuttle"],
          image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
          description: `Boutique luxury stay offering serenity, panoramic vistas, and verified affordable comfort in ${cap}.`,
          availableRooms: 8,
          breakfastIncluded: true,
          freeCancellation: true,
          checkInTime: "14:00",
          checkOutTime: "12:00"
        },
        {
          id: `${code}-003`,
          name: `${cap} Skyline Executive 4-Star Hotel (Mid-Range)`,
          city: cap,
          location: `Financial & Arts District, ${cap}`,
          rating: 4.8,
          reviewCount: 1100,
          pricePerNight: 7200,
          currency: "INR",
          roomType: "Deluxe City View King Suite",
          amenities: ["Free Wi-Fi", "Breakfast Buffet", "Skyline Infinity Pool", "Fitness & Spa", "Valet Parking"],
          image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
          description: `Contemporary 4-star executive hotel with premium skyline amenities and business facilities in ${cap}.`,
          availableRooms: 6,
          breakfastIncluded: true,
          freeCancellation: true,
          checkInTime: "14:00",
          checkOutTime: "11:00"
        },
        {
          id: `${code}-004`,
          name: `The ${cap} Grand Imperial 5-Star Palace (Highest Luxury)`,
          city: cap,
          location: `Royal Waterfront Boulevard, ${cap}`,
          rating: 4.9,
          reviewCount: 2400,
          pricePerNight: 28500,
          currency: "INR",
          roomType: "Presidential Royal Suite with 24/7 Butler",
          amenities: ["24/7 Butler Service", "Private Heated Pool", "Michelin-Inspired Dining", "Chauffeur Fleet", "Private Spa Sanctuary"],
          image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
          description: `Peerless 5-star palace resort delivering world-class hospitality, opulent interiors, and royal luxury in ${cap}.`,
          availableRooms: 3,
          breakfastIncluded: true,
          freeCancellation: true,
          checkInTime: "15:00",
          checkOutTime: "12:00"
        }
      ];
      // Sort to guarantee cheapest hotel is first
      const sorted = [...dynamicHotels].sort((a, b) => a.pricePerNight - b.pricePerNight);
      setSearchResults(sorted);
      if ((urlParams.get('autoOpen') === 'true' || urlParams.get('autoBook') === 'true') && sorted.length > 0) {
        setSelectedHotel(sorted[0]);
      }
    } else {
      // Sort existing filtered hotels by price ascending to pick cheapest
      const sorted = [...filtered].sort((a, b) => a.pricePerNight - b.pricePerNight);
      setSearchResults(sorted);
      if ((urlParams.get('autoOpen') === 'true' || urlParams.get('autoBook') === 'true') && sorted.length > 0) {
        setSelectedHotel(sorted[0]);
      }
    }
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
            isAutoBook={urlParams.get('autoBook') === 'true' || urlParams.get('agent') === 'true'}
            onReset={handleReset}
          />
        ) : selectedHotel ? (
          <BookingForm
            hotel={selectedHotel}
            searchParams={searchParams}
            isAutoBook={urlParams.get('autoBook') === 'true' || urlParams.get('agent') === 'true'}
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
