# 🌍 Autonomous Agentic AI Travel Planner — Final Year Project

> **An End-to-End Autonomous Multi-Agent Travel Operating System.**  
> Plan anywhere on Earth with LangGraph AI orchestration, autonomous flight & hotel booking execution, real-world aviation physics, interactive dark vector maps, and official trip itinerary PDF export (`plan.pdf`).

[![React 18](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.11+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![LangGraph](https://img.shields.io/badge/AI%20Orchestration-LangGraph%20%7C%20LangChain-FF9900)](https://langchain-ai.github.io/langgraph/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%20%7C%20SQLAlchemy-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Three.js](https://img.shields.io/badge/3D%20Globe-Three.js%20WebGL-black?logo=three.js)](https://threejs.org/)
[![jsPDF](https://img.shields.io/badge/Document%20Engine-jsPDF%20Vector-E34F26)](https://github.com/parallax/jsPDF)
[![Build Status](https://img.shields.io/badge/Build-Passing%20(0%20errors)-brightgreen)]()

---

## 📌 Project Overview

**AITrip** is a comprehensive, production-grade final-year project that transforms trip planning into an autonomous multi-agent experience. Instead of static travel recommendations, this platform deploys specialized AI agents that collaboratively research destinations, estimate geodesic flight corridors, locate curated accommodations, balance multi-category budgets, and automatically execute real-time flight and hotel bookings across dedicated booking portals without requiring human intervention.

Once the automated bookings are secured, users receive an official vector-rendered travel itinerary exportable directly to their browser download shelf as **`plan.pdf`**.

---

## 🏛️ System Architecture & Microservices

The repository comprises three interconnected frontend applications and a high-performance Python FastAPI backend:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           1. AITrip Main Platform                           │
│                 http://localhost:5173  (React 18 + Vite)                    │
│                                                                             │
│   • 3D WebGL Globe & Destination Explorer                                   │
│   • Multi-Agent Supervisor Telemetry Dashboard                              │
│   • Interactive Day-by-Day Timeline & Route Map                             │
│   • Dynamic Replanning Engine (flight delays, weather disruptions)          │
│   • Official Itinerary PDF Export (plan.pdf)                                │
└──────────────────────┬───────────────────────────────▲──────────────────────┘
                       │                               │
            1. Dispatches Planner Parameters           │ 4. Returns with PNR & Hotel Ref
                       ▼                               │    (booking=full_success)
┌──────────────────────────────────────────────┐       │
│           2. Flight Booking Portal           │       │
│   http://localhost:5174  (Standalone App)    │       │
│                                              │       │
│   • Multi-origin domestic & international    │       │
│   • Geodesic distance & duration physics     │       │
│   • Autonomous flight reservation agent      │       │
│   • Deterministic PNR generation             │       │
└──────────────────────┬───────────────────────┘       │
                       │                               │
            2. Auto-Chains to Hotel Portal             │
                       ▼                               │
┌──────────────────────────────────────────────────────┴──────────────────────┐
│                           3. Hotel Booking Portal                           │
│                   http://localhost:5175  (Standalone App)                   │
│                                                                             │
│   • Budget-to-luxury accommodation portfolio (₹1,100 to ₹75,000/night)      │
│   • Autonomous stay selection agent (finds and reserves cheapest stay)      │
│   • Booking reference confirmation voucher generation                       │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       │ REST API Calls & Telemetry
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            4. FastAPI AI Backend                            │
│                        http://127.0.0.1:8000 (Python)                       │
│                                                                             │
│   • LangGraph Multi-Agent Orchestration (Weather, Transport, Stay, Budget)  │
│   • Geodesic Haversine Distance & Transit Physics Engine                    │
│   • PostgreSQL Database Persistence (Trips, Destinations, Activities)       │
│   • MapTiler & OpenStreetMap Geocoding Fallbacks                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🌟 Key Features

### 1. 🤖 100% Autonomous Multi-Agent Booking Execution
- **Zero Human Intervention**: The supervisor agent orchestrates the entire workflow from user intent to confirmed reservations.
- **Automated Flight Booking**: Programmatically redirects to the flight demo portal, identifies the optimal flight matching passenger count and departure schedule, issues an official PNR code, and automatically transitions to the hotel engine.
- **Automated Hotel Booking**: The hotel agent evaluates available accommodations in the destination city, books the most cost-effective match, and redirects back to the main trip dashboard.
- **State Synchronization**: Confirmed booking references (`pnr`, `flightNumber`, `hotelRef`, `hotelName`) are injected directly into the itinerary state and PostgreSQL database.

### 2. 📄 Official Travel Itinerary PDF Generator (`plan.pdf`)
- Built using **`jsPDF`** vector rendering engine.
- Generates a multi-page PDF document featuring:
  - **Flight Boarding Pass**: Airline, aircraft type (Boeing 787, Airbus A320), PNR code, terminal, seat assignment, and flight corridor.
  - **Hotel Voucher**: Property name, booking reference ID, check-in/out policies, room tier, and amenities.
  - **Daily Activity Timetable**: Morning, afternoon, and evening slots with transit buffers, addresses, and ticket costs.
  - **Financial Summary**: Segmented budget breakdown (accommodation, transit, gastronomy, activities).
  - **Climate & Safety Advisories**: Regional weather overview and emergency service numbers.
- Integrated download button triggers a direct browser download as **`plan.pdf`**.

### 3. ✈️ Realistic Aviation Corridors & Global Fleet
- Replaced static durations with dynamic spherical trigonometry (geodesic distance):
  - **Domestic**: Hyderabad $\rightarrow$ Bengaluru (~1h 15m on Airbus A320neo).
  - **Medium-Haul**: Delhi $\rightarrow$ Dubai (~3h 45m on Boeing 777-200).
  - **Long-Haul**: Hyderabad $\rightarrow$ London Heathrow (~10h 15m on Boeing 777-300ER).
  - **Ultra Long-Haul**: Mumbai $\rightarrow$ New York JFK (~17h 18m on Boeing 777-200LR).
- Multi-origin support across major global airline hubs: `HYD`, `DEL`, `BOM`, `BLR`, `LHR`, `JFK`, `SIN`.
- Real IATA carriers: British Airways, Emirates, Air France, Singapore Airlines, Qatar Airways, Air India, IndiGo.

### 4. 🏨 Comprehensive Accommodation Portfolio
- Diverse stay inventory catering to all traveler tiers:
  - **Budget Backpacker Pods**: ₹1,100 – ₹2,500/night (e.g., Zostel, Capsule Stays).
  - **Curated Boutique Hotels**: ₹4,000 – ₹12,000/night (Heritage manors, eco-lodges).
  - **5-Star Luxury Resorts**: ₹18,000 – ₹75,000/night (The Taj, Ritz-Carlton, Four Seasons).
- Curated across top destinations: London, New York, Paris, Tokyo, Dubai, Bali, Goa, Hyderabad, Bengaluru.

### 5. 🗺️ Interactive Route Mapping (Watermark-Free)
- High-contrast, dark-mode Leaflet route map with waypoint numbering and polyline transit paths.
- Powered by active **MapTiler** vector tiles with an automatic zero-watermark fallback to **Esri World Dark Gray Canvas**, eliminating third-party watermark notices.

### 6. 🔄 Dynamic Replanning Engine
- Real-time simulation of unexpected travel disruptions:
  - Flight delays (e.g., 3-hour departure hold).
  - Severe weather warnings (torrential rain, tropical storm).
  - Sudden attraction closures.
  - Budget constraints.
- Reorganizes subsequent schedule nodes, recalculates transit buffers, and protects evening reservations without disrupting the entire trip.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Main Frontend** | React 18, Vite, Tailwind CSS, Three.js, React Three Fiber, Lucide Icons |
| **Demo Microservices** | React, Bootstrap 5, Vite (Flight & Hotel portals) |
| **AI Orchestration** | LangGraph, LangChain, Google Gemini API, Specialized Agent Workers |
| **Backend API** | Python 3.11+, FastAPI, Uvicorn, Pydantic v2 |
| **Database** | PostgreSQL, SQLAlchemy ORM |
| **Mapping & Geospatial** | Leaflet.js, MapTiler API, Esri ArcGIS Canvas, Haversine Geodesic Math |
| **Document Generation** | jsPDF (vector PDF formatting) |

---

## 🚀 Getting Started & Local Setup

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **Python** (v3.10 or higher)
- **PostgreSQL** (running locally on port 5432)
- **Git**

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/sriram32134/final-year-project.git
cd final-year-project
git checkout added-features
```

---

### Step 2: Backend Setup (FastAPI + PostgreSQL)

1. Open a terminal and navigate to the main project directory:
   ```bash
   cd AItrip-main
   ```

2. Create and activate a Python virtual environment:
   ```bash
   # Windows (PowerShell)
   python -m venv venv
   .\venv\Scripts\Activate.ps1

   # macOS / Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Create your `.env` configuration file in `AItrip-main/.env`:
   ```env
   # PostgreSQL Database URL
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/aitrip

   # AI & Map API Keys
   GEMINI_API_KEY=your_gemini_api_key_here
   VITE_MAPTILER_API_KEY=6czgNWWGGJaL7AFCplmb

   # Backend Host & Ports
   BACKEND_PORT=8000
   VITE_BACKEND_URL=http://127.0.0.1:8000
   ```

5. Start the FastAPI backend server:
   ```bash
   python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   *The backend will be live at `http://127.0.0.1:8000` (Swagger docs available at `http://127.0.0.1:8000/docs`).*

---

### Step 3: Start the Microservices

Open three separate terminal windows:

#### Terminal 1 — Main AITrip Application (`localhost:5173`)
```bash
cd AItrip-main
npm install
npm run dev
```

#### Terminal 2 — Flight Booking Engine (`localhost:5174`)
```bash
cd flightdemo
npm install
npm run dev
```

#### Terminal 3 — Hotel Booking Engine (`localhost:5175`)
```bash
cd hoteldemo
npm install
npm run dev
```

---

## 🌐 Port Allocation Summary

| Service | Port | Description |
| :--- | :--- | :--- |
| **AITrip Main App** | `http://localhost:5173` | Core travel planner, 3D globe & itinerary dashboard |
| **Flight Demo Portal** | `http://localhost:5174` | Autonomous flight booking engine & search |
| **Hotel Demo Portal** | `http://localhost:5175` | Autonomous hotel booking engine & catalog |
| **FastAPI Backend** | `http://127.0.0.1:8000` | LangGraph agent pipeline, REST APIs & database sync |

---

## 📋 Primary REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/trips/plan` | Triggers LangGraph multi-agent trip synthesis pipeline |
| `GET` | `/api/trips` | Retrieves all saved trips from PostgreSQL database |
| `GET` | `/api/trips/{id}` | Fetches detailed trip itinerary by unique identifier |
| `POST` | `/api/trips/{id}/replan` | Dispatches dynamic replanning condition adaptation |
| `GET` | `/api/locations/search` | Performs multi-tier global destination autocomplete search |
| `POST` | `/api/locations/resolve` | Normalizes place name to GPS coordinates and imagery |

---

## 👥 Contributors

- **Jnana Sriram Ubbisetti** ([@sriram32134](https://github.com/sriram32134))
- **Sohan Kumar Sahu** ([@sohan-12](https://github.com/sohan-12))

---

## 📄 License
This project is developed as an academic Final Year Project. Open-sourced under the MIT License.
