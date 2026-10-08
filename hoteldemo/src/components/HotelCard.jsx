import React from 'react';

export default function HotelCard({ hotel, onSelectHotel }) {
  return (
    <div 
      className="hotel-card d-flex flex-column h-100"
      data-testid="hotel-result"
      data-hotel-id={hotel.id}
    >
      <div className="hotel-image-wrapper">
        <img 
          src={hotel.image} 
          alt={hotel.name}
          onError={(e) => {
            e.target.onerror = null; 
            e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <div className="position-absolute top-0 end-0 m-3">
          <span className="badge-rating">
            ★ {hotel.rating} <span className="text-muted fw-normal fs-7">({hotel.reviewCount})</span>
          </span>
        </div>
      </div>

      <div className="p-4 d-flex flex-column flex-grow-1">
        <div className="d-flex align-items-start justify-content-between mb-2">
          <div>
            <h5 className="fw-bold mb-1 text-dark" data-testid="hotel-name">{hotel.name}</h5>
            <p className="text-muted fs-7 mb-2">
              📍 {hotel.location}
            </p>
          </div>
        </div>

        <p className="fs-7 text-secondary mb-3 multi-line-truncate">
          {hotel.description}
        </p>

        <div className="mb-3">
          <span className="badge-tag me-2 mb-1 d-inline-block">
            🛌 {hotel.roomType}
          </span>
          {hotel.breakfastIncluded && (
            <span className="badge bg-success-subtle text-success border border-success-subtle me-2 mb-1 d-inline-block fs-7">
              🍳 Free Breakfast
            </span>
          )}
          {hotel.freeCancellation && (
            <span className="badge bg-info-subtle text-info-emphasis border border-info-subtle me-2 mb-1 d-inline-block fs-7">
              ✓ Free Cancellation
            </span>
          )}
        </div>

        {/* Amenities Pills */}
        <div className="mb-3">
          {hotel.amenities && hotel.amenities.map((amenity, idx) => (
            <span key={idx} className="amenity-pill">
              {amenity}
            </span>
          ))}
        </div>

        <div className="mt-auto pt-3 border-top d-flex align-items-center justify-content-between">
          <div>
            <div className="price-tag">
              ₹{hotel.pricePerNight.toLocaleString()}
            </div>
            <div className="price-unit">per night • excl. taxes</div>
            <div className="fs-7 text-success fw-semibold">
              {hotel.availableRooms} rooms available
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary-custom px-4 py-2"
            onClick={() => onSelectHotel(hotel)}
            data-testid="book-hotel"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}
