# 🌍 AITrip — Global Agentic AI Travel Planner

> **An Autonomous, Location-Aware Multi-Agent Travel Operating System.**  
> Search **ANY** place on Earth • Experience Real-Time Geographic Navigation • Synthesize Intelligent Multi-Agent Itineraries via **LangGraph** & **Google Places**.

[![React](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/3D%20Globe-Three.js%20%7C%20R3F-black?logo=three.js)](https://threejs.org/)
[![Google Maps](https://img.shields.io/badge/Maps-Google%20Places%20(New)-4285F4?logo=google-maps&logoColor=white)](https://developers.google.com/maps)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![LangGraph](https://img.shields.io/badge/Multi--Agent-LangGraph%20%7C%20LangChain-FF9900)](https://langchain-ai.github.io/langgraph/)
[![Build Status](https://img.shields.io/badge/Build-Passing%20(0%20errors)-brightgreen)]()

---

## 📌 Executive Overview

**AITrip** is a next-generation AI travel platform designed to eliminate static, restricted destination databases. Unlike legacy trip planners that limit users to a fixed list of 50-100 popular tourist cities, **AITrip allows travelers to search, explore, and plan personalized itineraries for ANY location on Earth** — from bustling metropolises (*Tokyo, New York, Bangalore*) and hidden hill stations (*Munnar, Tawang, Araku Valley*) to global natural wonders (*Mount Everest, Hallstatt, Taj Mahal*) and oceans (*Indian Ocean, Arabian Sea*).

The platform pairs a **cinematic dark 3D WebGL Globe** and **Google Maps Platform (Satellite / Hybrid view)** with an **autonomous 10-Agent LangGraph supervisor workflow** that reasons over real geography, live weather, transit corridors, itemized budgets, and dynamic replanning triggers.

---

## 🏛️ System Architecture

```
                                USER QUERY
                                    │
                                    ▼
                     DEBOUNCED SEARCH AUTOCOMPLETE
                                    │
             ┌──────────────────────┴──────────────────────┐
             ▼                                             ▼
    CURATED SHOWCASE LAYER                      GOOGLE PLACES API (NEW)
(Intentional Featured Destinations)          (Runtime Worldwide Resolution)
             │                                             │
             └──────────────────────┬──────────────────────┘
                                    │
                                    ▼
                  NORMALIZED RUNTIME LOCATION MODEL
                  • Real GPS Coordinates (lat, lng)
                  • English Display Name & Formatted Address
                  • Place Type & Viewport Bounds
                  • Google Place Photos & Author Attribution
                  • Google Maps Source URI
                                    │
                  ┌─────────────────┴─────────────────┐
                  ▼                                   ▼
        DUAL-ENGINE NAVIGATION                DYNAMIC LOCATION CARD
    • 3D WebGL Earth Fly-to              • Live About & Coordinates
    • Dynamic Camera Distance Altitude   • Official Photo Attribution
    • Runtime 3D Pin Mounting            • Real Nearby Attractions
    • Instant Search Clear Lifecycle     • "Plan This Trip" One-Click
                  │                                   │
                  └─────────────────┬─────────────────┘
                                    │
                                    ▼
                         FASTAPI REST GATEWAY
                                    │
                                    ▼
                 LANGGRAPH MULTI-AGENT STATE GRAPH
    ┌──────────────────────────────────────────────────────────────┐
    │  Supervisor Agent (State Machine & Sequential Orchestrator)   │
    ├──────────────────────────────────────────────────────────────┤
    │  1. Research Agent   ──> Real attraction intel & culture      │
    │  2. Weather Agent    ──> Live Open-Meteo meteorological data  │
    │  3. Transport Agent  ──> Great-Circle distances & transit     │
    │  4. Hotel Agent      ──> Accommodation & boutique stays       │
    │  5. Experiences      ──> Culinary, historic & outdoor pacing  │
    │  6. Safety Agent     ──> Emergency contacts & health advisory │
    │  7. Budget Agent     ──> Tiered itemized financial estimates  │
    │  8. Conflict Agent   ──> Identifies overlaps & weather risks  │
    │  9. Optimizer Agent  ──> Chronological day-by-day synthesis   │
    │ 10. Dynamic Replan   ──> Real-time contingency recalculation  │
    └──────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                 PERSONALIZED CHRONOLOGICAL ITINERARY
                 • Day-by-Day Morning / Afternoon / Evening
                 • Interactive Route Waypoint Map (Leaflet)
                 • Itemized Cost Breakdown (Flights, Stay, Food)
                 • Real-Time Replanning Simulator
```

---

## ✅ What We Have Done (Completed Features)

### 1. Universal Real-Time Location Resolution (Zero Static Data)
- **Eliminated static destination JSON dependency**: Removed static coordinate files and hardcoded city lists.
- **Search ANY place on Earth**: Resolves cities, towns, valleys, landmarks, mountains, and water bodies dynamically.
- **Official Google Places API (New)**: Integrated Google Places Text Search (New), Place Details (New), and Nearby Search with strict Field Masks (`places.id,places.displayName,places.formattedAddress,places.location,places.types,places.photos,places.googleMapsUri,places.viewport`).
- **Resilient Fallback**: If Google API keys are absent, cleanly delegates to worldwide OpenStreetMap Nominatim and English Wikimedia photography without crashing or fabricating fake data.

### 2. Strict English Language Normalization
- All location queries explicitly pass `languageCode: "en"` and `Accept-Language: en,en-US;q=0.9`.
- Names in foreign scripts (e.g. *भारत*, *मुंबई*, *पेरिस*, *東京*) are automatically normalized into clean English text (*India*, *Mumbai*, *Paris*, *Tokyo*).

### 3. Authentic Place Photos & Author Attribution (Zero Fake Images)
- **Google Places Photos**: Fetches authentic runtime photography directly from the Google Places Photo API.
- **Photo Author Attribution**: Respects Google Maps Platform guidelines by rendering author credits with external Google Maps profile links (e.g., `Photo © [Contributor Name] on Google Maps`).
- **Clean Neutral Visual Fallback**: If no verified photo exists for an obscure location, the app displays a sleek dark map visual with `"No location photo available"`. Never generates fake AI images or substitutes random unrelated cities.

### 4. Dual-Engine Geographic Interface
- **Engine 1: 3D WebGL Earth Canvas**:
  - Photorealistic blue-marble Earth with bump-mapped topology, atmospheric rim glow, and high-performance 60 FPS starfield.
  - Curved 3D great-circle flight arcs between major global hubs.
  - Screen-space label decluttering and collision prevention.
- **Engine 2: Google Maps Satellite / Hybrid Mode**:
  - Interactive Google Maps satellite mode with 45° tilt and rotation controls.
  - Drops a custom glowing **🎯 TARGET GOAL: {place_name}** pin with coordinates and info window.
  - Zero-config Leaflet Esri World Satellite fallback when Google Maps key is not yet configured.

### 5. Dynamic Camera Distance Calibration & Marker Lifecycle
- **Type-Aware Camera Distance**: Automatically zooms to the correct altitude based on location type and bounding box:
  - *Landmark / POI* (`3.25` altitude / zoom `15`) — *Eiffel Tower, Taj Mahal*
  - *City / Town* (`3.5` altitude / zoom `12`) — *Bangalore, Munnar, Paris*
  - *Region / Valley* (`4.5` altitude / zoom `8`) — *Araku Valley, Kerala*
  - *Country* (`5.5` altitude / zoom `5`) — *India, Japan*
  - *Natural Feature / Ocean* (`5.0 - 5.2` altitude / zoom `4`) — *Indian Ocean, Himalayas*
- **Strict Search Clear Behavior**:
  - Clicking `X` or deleting search text removes: search dropdown, selected search card, dynamic location card, temporary search markers, and selected location state.
  - Returns the globe smoothly to default world exploration altitude (`6.6`) and resumes slow orbit.
- **Clean Second Search Replacement**: Searching *Munnar* then *Paris* cleanly destroys Munnar's marker/card and flies directly to Paris with zero ghost markers.

### 6. LangGraph 10-Agent Autonomous Workflow
Built with Python 3.11+, FastAPI, and LangGraph:
1. **Supervisor Agent**: Manages the state machine, evaluates execution prerequisites, and records telemetry events.
2. **Research Agent**: Scrapes and compiles attractions, local culture, and seasonal nuances.
3. **Weather Agent**: Queries real-time Open-Meteo meteorological endpoints with exact GPS coordinates.
4. **Transport Agent**: Calculates Great-Circle/Haversine transit routes and road travel times.
5. **Hotel Agent**: Selects authentic boutique accommodations tailored to user budget tier.
6. **Experiences Agent**: Curates morning, afternoon, and evening itineraries with exact pacing.
7. **Safety Agent**: Compiles regional emergency numbers, local healthcare facilities, and safety advisories.
8. **Budget Agent**: Synthesizes itemized financial breakdowns (Transport, Stay, Food, Activities, Buffer).
9. **Conflict Detector Agent**: Detects schedule overlaps, inclement weather hazards, or flight delays.
10. **Optimizer Agent**: Formulates the final chronological day-by-day itinerary with GPS waypoints.

### 7. Interactive Dynamic Replanning Simulator
- Built-in simulation trigger in the itinerary view allowing users to simulate real-world travel disruptions:
  - 🌧️ *Severe weather / Thunderstorm*
  - ✈️ *Flight delay (+4 hours)*
  - 💰 *Budget constraint recalculation*
- Submits dynamic replan requests to `/api/trips/replan`, executing the LangGraph replanning node to generate revised itineraries with instant notifications.

---

## 🚀 Roadmap: What Needs To Be Done (Final Product Completion)

To take AITrip from this robust core architecture to a complete, commercial-grade travel application:

### Phase 1: Authentication & User Persistence
- [ ] **Multi-Provider Authentication**: Implement Google OAuth, GitHub OAuth, and magic email links via Supabase / Firebase / NextAuth.
- [ ] **Cloud Database Persistence**: Connect PostgreSQL with Prisma/SQLAlchemy to persist user accounts, saved trips, favorites, and preference profiles.
- [ ] **User Trip Dashboard**: Create a "My Trips" drawer to review, export, and delete past trip plans.

### Phase 2: Live Booking & Inventory Integration
- [ ] **Live Flight Booking (GDS / Amadeus / Skyscanner API)**:
  - Transition from estimated fares to real-time seat availability, live airline routes, and booking links.
- [ ] **Live Hotel Booking (Booking.com / Expedia Partner Solutions)**:
  - Connect real-time room availability, live nightly pricing, and instant checkout.
- [ ] **Experience Tickets (Viator / GetYourGuide API)**:
  - Direct booking for museum passes, guided tours, and adventure activities.

### Phase 3: Collaborative Multi-User Planning
- [ ] **Real-Time Group Collaboration**:
  - WebSockets / Supabase Realtime to allow friends and families to co-plan an itinerary in real-time.
  - Interactive voting on hotels, activities, and budget adjustments.
- [ ] **Public Trip Sharing**:
  - Unique shareable URLs (`aitrip.com/share/{tripId}`) with preview cards for social media (OpenGraph/Twitter).

### Phase 4: Mobile Native App & Offline Capability
- [ ] **Progressive Web App (PWA) & React Native**:
  - Full offline support with cached vector maps and downloaded itinerary cards.
- [ ] **Export to PDF & Calendar**:
  - One-click export to formatted PDF travel guides and synchronization with Google Calendar / Apple iCal (.ics).

### Phase 5: Payment Processing & Booking Checkout
- [ ] **Stripe / Razorpay Payment Gateway**:
  - Secure payment processing for package bookings, hotel reservations, and trip insurance.
- [ ] **Automated Booking Confirmation & E-Tickets**:
  - PDF receipt generation with QR codes for hotel check-in and transit passes.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Core** | React 18, Vite, React Router v6 |
| **3D Visualization** | Three.js, React Three Fiber (`@react-three/fiber`), Drei (`@react-three/drei`) |
| **Interactive Maps** | Google Maps JavaScript API (New), Leaflet, Esri World Imagery, CartoDB Voyager |
| **Styling & Icons** | Tailwind CSS, Lucide React, Glassmorphism design tokens |
| **Backend Framework** | Python 3.11+, FastAPI, Uvicorn, Pydantic v2 |
| **Multi-Agent AI** | LangGraph, LangChain Core, Groq / OpenAI LLM APIs |
| **External APIs** | Google Places API (New), Open-Meteo Weather API, English Wikimedia API, OpenStreetMap |
| **Tooling & Quality** | Oxlint, ESLint, Git, Vite Production Bundler |

---

## 📁 Project Directory Structure

```
AItrip/
├── backend/
│   ├── main.py                     # FastAPI server entry point & CORS
│   ├── models/
│   │   └── location.py             # Pydantic schemas (NormalizedLocation, TripPlan, etc.)
│   ├── routers/
│   │   ├── locations.py            # /api/locations (search, resolve, details, nearby)
│   │   └── trips.py                # /api/trips (plan, replan)
│   ├── services/
│   │   ├── google_places_service.py# Google Places API (New) & photo attribution service
│   │   ├── geocoding_service.py    # Universal GIS geocoder & Wikimedia photo resolver
│   │   └── curated_service.py      # Curated showcase destination provider
│   └── agents/
│       ├── state.py                # LangGraph TripPlanningState & AgentEvent models
│       ├── specialized.py          # 10 specialized agent node functions
│       └── supervisor.py           # Compiled LangGraph StateGraph workflow
├── src/
│   ├── components/
│   │   ├── globe/                  # 3D Earth, GoogleMapsView, Controls, LocationPanel
│   │   ├── itinerary/              # DayTimeline, RouteMap, ItineraryHeader
│   │   ├── budget/                 # BudgetView itemized financial breakdowns
│   │   ├── transport/              # TransportView route corridors & transit
│   │   ├── notifications/          # NotificationDrawer & Replanning Modal
│   │   └── common/                 # DestinationImage with photo fallback
│   ├── services/
│   │   ├── googlePlacesClient.js   # Client Google Places API (New) handler
│   │   ├── locationResolverService.js # Unified frontend-to-backend API gateway
│   │   ├── globalLocationService.js# Client 2-stage resolver & photo fetcher
│   │   └── index.js                # tripService, executionService, notificationStore
│   ├── pages/
│   │   ├── Landing.jsx             # 3D Globe exploration & search bar
│   │   ├── Planner.jsx             # Trip constraints & traveler preferences form
│   │   ├── Generation.jsx          # Live 10-Agent telemetry animation console
│   │   └── TripDetails.jsx         # Final itinerary, dynamic replanning simulator
│   └── data/                       # Curated showcase cities, countries & flight routes
├── .env.example                    # Environment variables template
├── package.json                    # Node dependencies & scripts
├── vite.config.js                  # Vite configuration & build optimization
└── README.md                       # Complete project documentation
```

---

## ⚡ Quickstart & Local Setup

### 1. Clone the Repository
```bash
git clone https://github.com/sohan-12/AItrip.git
cd AItrip
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```
Populate the required keys:
```env
# Google Maps Platform (Maps JS, Places API New, Geocoding)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_browser_key
GOOGLE_MAPS_SERVER_API_KEY=your_google_maps_server_key

# AI LLM Provider (Optional: mock heuristic agents activate out-of-the-box)
GROQ_API_KEY=your_groq_api_key_or_leave_blank
OPENAI_API_KEY=your_openai_key_or_leave_blank

# Server Port
PORT=8000
```

### 3. Setup & Run the Python Backend
```bash
# Create and activate virtual environment
python -m venv .venv
# Windows:
.\.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Install Python dependencies
pip install fastapi uvicorn httpx pydantic langgraph langchain-core

# Start FastAPI server
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be live at `http://127.0.0.1:8000/docs`.

### 4. Setup & Run the Frontend
In a new terminal:
```bash
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

### 5. Production Build Verification
```bash
npm run build
```

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/locations/search?q={query}&lang=en` | Searches curated showcase and Google Places API (New) worldwide |
| `POST` | `/api/locations/resolve` | Resolves any user query to a single `NormalizedLocation` |
| `GET` | `/api/locations/details?placeId={id}` | Fetches Google Place Details with field masks |
| `GET` | `/api/locations/nearby?lat={lat}&lng={lng}` | Fetches real nearby attractions around coordinates |
| `POST` | `/api/trips/plan` | Executes 10-Agent LangGraph pipeline to generate itinerary |
| `POST` | `/api/trips/replan` | Re-executes LangGraph dynamic replanner upon weather/delay disruption |

---

## 👨‍💻 Contributors

- **Sohan** ([@sohan-12](https://github.com/sohan-12)) — *Lead Architecture & Development*

---

## 📄 License
This project is licensed under the MIT License.
