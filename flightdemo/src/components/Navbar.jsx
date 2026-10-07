import React from 'react';

export default function Navbar({ onResetSearch }) {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark py-3 shadow-sm" style={{ background: '#0f172a' }}>
      <div className="container">
        <a className="navbar-brand d-flex align-items-center gap-2 fw-bold fs-4" href="#" onClick={(e) => { e.preventDefault(); onResetSearch(); }}>
          <div className="navbar-brand-logo">
            <i className="bi bi-airplane-engines-fill"></i>
          </div>
          <span>Aero<span className="text-primary">Flight</span></span>
        </a>

        <div className="d-flex align-items-center gap-3">
          <span className="custom-nav-badge d-none d-md-inline-block">
            <i className="bi bi-shield-check me-1"></i> Automation Flight Demo
          </span>
          <span className="badge bg-secondary opacity-75 fw-normal px-2 py-1 fs-7">
            Port: 5174
          </span>
          <button 
            className="btn btn-outline-light btn-sm rounded-pill px-3"
            onClick={onResetSearch}
            title="Reset to default search parameters"
          >
            <i className="bi bi-arrow-counterclockwise me-1"></i> Reset Search
          </button>
        </div>
      </div>
    </nav>
  );
}
