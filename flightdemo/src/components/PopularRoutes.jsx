import React from 'react';

export default function PopularRoutes({ onSelectRoute }) {
  const routes = [
    { from: "Hyderabad", to: "Bengaluru", date: "2026-10-10", label: "HYD → BLR (7+ Flights)" },
    { from: "Bengaluru", to: "Hyderabad", date: "2026-10-10", label: "BLR → HYD (2+ Flights)" },
    { from: "Hyderabad", to: "Delhi", date: "2026-10-10", label: "HYD → DEL (Vistara)" },
    { from: "Delhi", to: "Mumbai", date: "2026-10-10", label: "DEL → BOM (IndiGo)" }
  ];

  return (
    <div className="d-flex flex-wrap align-items-center gap-2 mt-3">
      <span className="text-muted small fw-semibold me-1">
        <i className="bi bi-lightning-charge-fill text-warning me-1"></i> Quick Test Routes:
      </span>
      {routes.map((r, idx) => (
        <button
          key={idx}
          className="btn btn-sm btn-light border rounded-pill px-3 py-1 shadow-sm text-secondary fw-medium"
          onClick={() => onSelectRoute(r.from, r.to, r.date)}
          data-testid={`quick-route-${r.from.toLowerCase()}-${r.to.toLowerCase()}`}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}
