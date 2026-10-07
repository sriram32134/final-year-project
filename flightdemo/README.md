# Flight Demo Website (Standalone)

A modern, commercial-grade flight search and booking web application built with **React**, **Vite**, and **Bootstrap 5**. Designed specifically as a controlled testbed for Playwright test automation and transport agents.

---

## 🚀 Quick Start Guide

### 1. Installation
Navigate to the project directory and install dependencies:
```bash
npm install
```

### 2. Running Locally
Start the development server:
```bash
npm run dev
```

The application will run on **`http://localhost:5174`**.

---

## 📊 Dummy Flight Dataset Documentation

The flight dataset is stored in `src/data/flights.js`. It contains **13 realistic, deterministic flight records**.

### Summary of Dataset
- **Total Records:** 13 flights
- **Airlines Included:** IndiGo (6E), Air India (AI), Vistara (UK), Akasa Air (QP), SpiceJet (SG)
- **Primary Route:** Hyderabad (`HYD`) → Bengaluru (`BLR`) (8 Flights on `2026-10-10`)
- **Return Route:** Bengaluru (`BLR`) → Hyderabad (`HYD`) (3 Flights)
- **Other Routes:** Hyderabad (`HYD`) → Delhi (`DEL`), Delhi (`DEL`) → Mumbai (`BOM`)
- **Dates Covered:** `2026-10-10`, `2026-10-12`

### Master Flight Records Table

| ID | Airline | Code | Flight # | Route | Date | Dep Time | Arr Time | Duration | Stops | Price (₹) | Seats | Refundable | Aircraft |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `FL-HYD-BLR-001` | IndiGo | 6E | 6E-532 | HYD → BLR | 2026-10-10 | 06:00 | 07:15 | 1h 15m | 0 (Nonstop) | 3,250 | 8 | No | Airbus A320neo |
| `FL-HYD-BLR-002` | Air India | AI | AI-841 | HYD → BLR | 2026-10-10 | 08:30 | 09:50 | 1h 20m | 0 (Nonstop) | 4,100 | 4 | Yes | Airbus A320 |
| `FL-HYD-BLR-003` | Vistara | UK | UK-892 | HYD → BLR | 2026-10-10 | 11:15 | 12:35 | 1h 20m | 0 (Nonstop) | 4,850 | 12 | Yes | Airbus A321neo |
| `FL-HYD-BLR-004` | Akasa Air | QP | QP-1104 | HYD → BLR | 2026-10-10 | 14:20 | 15:35 | 1h 15m | 0 (Nonstop) | 2,990 | 15 | No | Boeing 737 MAX |
| `FL-HYD-BLR-005` | SpiceJet | SG | SG-403 | HYD → BLR | 2026-10-10 | 16:45 | 19:10 | 2h 25m | 1 Stop | 3,600 | 3 | No | Boeing 737-800 |
| `FL-HYD-BLR-006` | IndiGo | 6E | 6E-718 | HYD → BLR | 2026-10-10 | 19:00 | 20:15 | 1h 15m | 0 (Nonstop) | 3,800 | 6 | Yes | Airbus A320neo |
| `FL-HYD-BLR-007` | Air India | AI | AI-509 | HYD → BLR | 2026-10-10 | 21:30 | 22:45 | 1h 15m | 0 (Nonstop) | 3,400 | 10 | No | Airbus A320 |
| `FL-HYD-BLR-008` | Vistara | UK | UK-896 | HYD → BLR | 2026-10-10 | 22:50 | 00:05 | 1h 15m | 0 (Nonstop) | 5,200 | 5 | Yes | Airbus A320neo |
| `FL-BLR-HYD-001` | IndiGo | 6E | 6E-533 | BLR → HYD | 2026-10-10 | 07:45 | 09:00 | 1h 15m | 0 (Nonstop) | 3,300 | 14 | No | Airbus A320neo |
| `FL-BLR-HYD-002` | Air India | AI | AI-842 | BLR → HYD | 2026-10-10 | 18:20 | 19:40 | 1h 20m | 0 (Nonstop) | 4,200 | 7 | Yes | Airbus A320 |
| `FL-BLR-HYD-003` | Akasa Air | QP | QP-1105 | BLR → HYD | 2026-10-12 | 10:15 | 11:30 | 1h 15m | 0 (Nonstop) | 3,100 | 11 | No | Boeing 737 MAX |
| `FL-HYD-DEL-001` | Vistara | UK | UK-870 | HYD → DEL | 2026-10-10 | 09:00 | 11:15 | 2h 15m | 0 (Nonstop) | 6,500 | 9 | Yes | Airbus A320neo |
| `FL-DEL-BOM-001` | IndiGo | 6E | 6E-201 | DEL → BOM | 2026-10-10 | 10:00 | 12:10 | 2h 10m | 0 (Nonstop) | 5,400 | 16 | No | Airbus A321neo |

---

## 🧪 Example Test Searches & Expected Results

1. **Default Search (HYD → BLR on 2026-10-10)**
   - **From:** `Hyderabad`
   - **To:** `Bengaluru`
   - **Date:** `2026-10-10`
   - **Expected Results:** **8 flights** returned.
   - **Cheapest Flight:** `Akasa Air QP-1104` (₹2,990)
   - **Fastest Flights:** `1h 15m` (IndiGo 6E-532, Akasa QP-1104, IndiGo 6E-718, Air India AI-509, Vistara UK-896)

2. **Return Route Search (BLR → HYD on 2026-10-10)**
   - **From:** `Bengaluru`
   - **To:** `Hyderabad`
   - **Date:** `2026-10-10`
   - **Expected Results:** **2 flights** returned (`6E-533` & `AI-842`).

3. **No Matches Search (e.g. Mumbai → Chennai)**
   - **From:** `Mumbai`
   - **To:** `Chennai`
   - **Expected Results:** Shows clean "No Flights Found" state.

---

## 🤖 Playwright Test Selectors

All interactive components include stable `data-testid` attributes:

| Component / Action | Selector Attribute |
|---|---|
| From City Select | `data-testid="from-input"` |
| To City Select | `data-testid="to-input"` |
| Departure Date | `data-testid="departure-date"` |
| Passengers Count | `data-testid="passengers-input"` |
| Search Button | `data-testid="search-flights"` |
| Swap Route Button | `data-testid="swap-routes"` |
| Flight Result Card | `data-testid="flight-result"` |
| Flight ID Attribute | `data-flight-id="<ID>"` |
| Book Now Button | `data-testid="book-flight"` |
| Sort Dropdown | `data-testid="sort-select"` |
| Max Price Slider | `data-testid="price-filter"` |
| Non-stop Filter Checkbox | `data-testid="filter-nonstop"` |
| 1 Stop Filter Checkbox | `data-testid="filter-1stop"` |
| Airline Checkbox | `data-testid="filter-airline-<airline-slug>"` |
| Booking Modal Container | `data-testid="booking-confirmation"` |
| Booking Reference Code | `data-testid="booking-reference"` |
| Confirm Booking Button | `data-testid="confirm-booking-btn"` |
| Passenger Name Input | `data-testid="passenger-name-input"` |

---

## 📁 Project Structure

```
flightdemo/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── SearchForm.jsx
│   │   ├── PopularRoutes.jsx
│   │   ├── FilterSidebar.jsx
│   │   ├── FlightCard.jsx
│   │   ├── BookingModal.jsx
│   │   └── Footer.jsx
│   ├── data/
│   │   └── flights.js         # Local dummy flight dataset
│   ├── App.jsx                # Main layout, search logic, sorting & filtering
│   ├── main.jsx               # React DOM entrypoint
│   └── index.css              # Custom styling & Bootstrap imports
├── public/
│   └── favicon.svg
├── index.html
├── package.json
├── vite.config.js             # Configured for localhost:5174
└── README.md
```
