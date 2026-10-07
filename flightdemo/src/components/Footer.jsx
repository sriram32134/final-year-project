import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-dark text-white-50 py-4 mt-5 border-top border-secondary">
      <div className="container text-center">
        <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
          <i className="bi bi-airplane-fill text-primary"></i>
          <span className="fw-bold text-white">AeroFlight Automation Demo</span>
        </div>
        <p className="small mb-1">
          Standalone flight booking demo app running on port 5174. Deterministic local dataset for Playwright test automation.
        </p>
        <p className="extra-small text-muted mb-0">
          No external APIs, databases, or real payments involved.
        </p>
      </div>
    </footer>
  );
}
