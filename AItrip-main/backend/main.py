import os
import sys
import asyncio
import logging
from contextlib import asynccontextmanager

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

from backend.database import init_db
from backend.routers import locations, places, trips, preferences, images

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables on startup
    try:
        init_db()
        logger.info("Database initialized successfully on startup.")
    except Exception as e:
        logger.warning(f"Database initialization warning: {e}")
    yield

app = FastAPI(
    title="AITrip Agentic AI Travel Planner API",
    description="Production-grade FastAPI backend for Location Resolution, LangGraph Multi-Agent Orchestration, and Dynamic Itinerary Synthesis.",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS configuration for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(locations.router)
app.include_router(places.router)
app.include_router(trips.router)
app.include_router(preferences.router)
app.include_router(images.router)

@app.get("/")
async def root():
    return {
        "status": "online",
        "service": "AITrip Agentic AI Travel Planner API",
        "version": "2.0.0",
        "docs": "/docs",
    }

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "database": "active",
        "geocoder": "maptiler",
        "places": "geoapify",
        "research": "tavily",
        "weather": "open-meteo",
        "llm": "groq",
        "agents": [
            "Supervisor", "Planner", "Research", "Weather",
            "Transport", "Hotel", "Experiences", "Safety",
            "Budget", "ConflictDetector", "Packing", "Optimizer", "Replanning"
        ],
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("backend.main:app", host="0.0.0.0", port=port, reload=True)
