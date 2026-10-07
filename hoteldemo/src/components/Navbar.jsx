import React from 'react';

export default function Navbar({ onReset }) {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow-sm py-3" style={{ backgroundColor: '#0f172a' }}>
      <div className="container">
        <a 
          className="navbar-brand d-flex align-items-center gap-2 fw-bold text-white fs-4" 
          href="#"
          onClick={(e) => {
            e.preventDefault();
            if (onReset) onReset();
          }}
        >
          <span className="p-2 rounded-3 bg-primary text-white d-inline-flex align-items-center justify-content-center" style={{ width: '38px', height: '38px' }}>
            🏨
          </span>
          <span>StayFinder</span>
        </a>
        <span className="navbar-text text-light opacity-75 d-none d-sm-inline fs-6">
          Find your perfect stay
        </span>
        <div className="ms-auto d-flex align-items-center gap-2">
          {onReset && (
            <button 
              className="btn btn-outline-light btn-sm rounded-pill px-3"
              onClick={onReset}
            >
              Reset Search
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
