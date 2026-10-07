"""
AITrip SQLAlchemy Database Models.
Implements the 12 persistent tables specified in Section 35:
users, user_preferences, trips, trip_destinations, trip_segments,
trip_activities, saved_destinations, agent_runs, agent_events,
trip_revisions, provider_references, search_history.
"""

from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    Boolean,
    Text,
    DateTime,
    ForeignKey,
)
from sqlalchemy.orm import relationship
from backend.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    preferences = relationship("UserPreference", back_populates="user", uselist=False)
    trips = relationship("Trip", back_populates="user")
    saved = relationship("SavedDestination", back_populates="user")
    searches = relationship("SearchHistory", back_populates="user")

class UserPreference(Base):
    __tablename__ = "user_preferences"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False)
    dietary = Column(String, default="Vegetarian / Plant-Forward")
    transit_preference = Column(String, default="Express Rail & Scenic Roadways")
    budget_range = Column(Float, default=30000.0)
    favorite_styles = Column(String, default="Nature & Scenic Panoramas, Heritage & Architecture")
    hotel_tier = Column(String, default="Comfort (Curated Boutique)")
    pace = Column(String, default="Moderate (Balanced Exploration)")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="preferences")

class Trip(Base):
    __tablename__ = "trips"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    origin_name = Column(String, nullable=False, default="Hyderabad")
    origin_lat = Column(Float, nullable=True, default=17.3850)
    origin_lng = Column(Float, nullable=True, default=78.4867)
    destination_name = Column(String, nullable=False)
    destination_lat = Column(Float, nullable=False)
    destination_lng = Column(Float, nullable=False)
    duration_days = Column(Integer, default=4)
    travelers = Column(Integer, default=2)
    budget = Column(Float, default=30000.0)
    currency = Column(String, default="INR")
    summary = Column(Text, nullable=True)
    status = Column(String, default="completed")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="trips")
    destinations = relationship("TripDestination", back_populates="trip", cascade="all, delete-orphan")
    segments = relationship("TripSegment", back_populates="trip", cascade="all, delete-orphan")
    activities = relationship("TripActivity", back_populates="trip", cascade="all, delete-orphan")
    runs = relationship("AgentRun", back_populates="trip", cascade="all, delete-orphan")
    revisions = relationship("TripRevision", back_populates="trip", cascade="all, delete-orphan")
    weather_records = relationship("WeatherRecord", back_populates="trip", cascade="all, delete-orphan")

class TripDestination(Base):
    __tablename__ = "trip_destinations"

    id = Column(String, primary_key=True, index=True)
    trip_id = Column(String, ForeignKey("trips.id"), nullable=False)
    name = Column(String, nullable=False)
    country = Column(String, default="Global")
    region = Column(String, nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    sequence_order = Column(Integer, default=1)

    trip = relationship("Trip", back_populates="destinations")

class TripSegment(Base):
    __tablename__ = "trip_segments"

    id = Column(String, primary_key=True, index=True)
    trip_id = Column(String, ForeignKey("trips.id"), nullable=False)
    from_name = Column(String, nullable=False)
    to_name = Column(String, nullable=False)
    transit_mode = Column(String, default="Flight / Express Rail")
    estimated_duration = Column(String, nullable=True)
    estimated_cost = Column(Float, default=0.0)
    sequence_order = Column(Integer, default=1)

    trip = relationship("Trip", back_populates="segments")

class TripActivity(Base):
    __tablename__ = "trip_activities"

    id = Column(String, primary_key=True, index=True)
    trip_id = Column(String, ForeignKey("trips.id"), nullable=False)
    day_number = Column(Integer, nullable=False)
    time_slot = Column(String, default="09:00")
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    location = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    category = Column(String, default="Activity")
    cost = Column(Float, default=0.0)
    duration = Column(String, default="2 hours")
    transit_time = Column(String, default="15 mins transit")
    icon = Column(String, default="Compass")

    trip = relationship("Trip", back_populates="activities")

class SavedDestination(Base):
    __tablename__ = "saved_destinations"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    name = Column(String, nullable=False)
    country = Column(String, default="Global")
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    image_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="saved")

class AgentRun(Base):
    __tablename__ = "agent_runs"

    id = Column(String, primary_key=True, index=True)
    trip_id = Column(String, ForeignKey("trips.id"), nullable=False)
    trigger_type = Column(String, default="plan_creation") # plan_creation, dynamic_replan
    status = Column(String, default="completed")
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, default=datetime.utcnow)
    total_events = Column(Integer, default=0)

    trip = relationship("Trip", back_populates="runs")
    events = relationship("AgentEvent", back_populates="run", cascade="all, delete-orphan")

class AgentEvent(Base):
    __tablename__ = "agent_events"

    id = Column(String, primary_key=True, index=True)
    run_id = Column(String, ForeignKey("agent_runs.id"), nullable=True)
    trip_id = Column(String, ForeignKey("trips.id"), nullable=False)
    agent_name = Column(String, nullable=False)
    status = Column(String, default="completed")
    message = Column(Text, nullable=False)
    timestamp = Column(String, nullable=False)
    details_json = Column(Text, nullable=True)

    run = relationship("AgentRun", back_populates="events")

class TripRevision(Base):
    __tablename__ = "trip_revisions"

    id = Column(String, primary_key=True, index=True)
    trip_id = Column(String, ForeignKey("trips.id"), nullable=False)
    revision_number = Column(Integer, default=1)
    condition_change = Column(String, nullable=False)
    disruption_type = Column(String, default="weather_alert")
    summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    trip = relationship("Trip", back_populates="revisions")

class ProviderReference(Base):
    __tablename__ = "provider_references"

    id = Column(String, primary_key=True, index=True)
    entity_type = Column(String, nullable=False) # location, place, photo, route
    entity_id = Column(String, nullable=False)
    provider_name = Column(String, nullable=False) # maptiler, geoapify, wikimedia, amadeus
    provider_id = Column(String, nullable=True)
    raw_metadata_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class SearchHistory(Base):
    __tablename__ = "search_history"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    query = Column(String, nullable=False)
    resolved_name = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="searches")

class WeatherRecord(Base):
    __tablename__ = "weather_records"

    id = Column(String, primary_key=True, index=True)
    trip_id = Column(String, ForeignKey("trips.id"), nullable=False)
    destination = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    forecast_date = Column(String, nullable=True)
    temperature_max = Column(Float, nullable=True)
    temperature_min = Column(Float, nullable=True)
    weather_code = Column(Integer, nullable=True)
    precipitation_probability = Column(Float, nullable=True)
    humidity = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    trip = relationship("Trip", back_populates="weather_records")

