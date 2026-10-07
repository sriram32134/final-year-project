"""
AITrip Database Layer.
Connects to PostgreSQL (via DATABASE_URL) with automatic, graceful fallback to SQLite
so the application runs out-of-the-box in any local environment.
"""

import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

DATABASE_URL = os.getenv("DATABASE_URL", "DATABASE_URL=postgresql://postgres:123%3B@localhost:5432/myapp")

# Determine engine with PostgreSQL primary and SQLite fallback
engine = None
try:
    if DATABASE_URL.startswith("postgresql"):
        # Test if postgres driver & connection works
        test_engine = create_engine(DATABASE_URL, pool_pre_ping=True, connect_args={"connect_timeout": 3})
        with test_engine.connect() as conn:
            pass
        engine = test_engine
        logger.info("Connected successfully to PostgreSQL database.")
except Exception as e:
    logger.warning(f"PostgreSQL connection unavailable ({e}). Falling back to local SQLite database.")

if engine is None:
    sqlite_url = "sqlite:///./aitrip.db"
    engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})
    logger.info("Using SQLite local database (aitrip.db).")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    from backend.models import db_models
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables verified and initialized successfully.")
