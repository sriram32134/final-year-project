import json
import os
from typing import List, Optional
from backend.models.location import NormalizedLocation

# Curated reference cities and countries matching frontend globeData
CURATED_ITEMS: List[dict] = [
    # Countries
    {"id": "india", "name": "India", "country": "India", "latitude": 20.5937, "longitude": 78.9629, "type": "country", "travelStyle": "Heritage & Diverse Landscapes"},
    {"id": "japan", "name": "Japan", "country": "Japan", "latitude": 36.2048, "longitude": 138.2529, "type": "country", "travelStyle": "Temples & Modern Innovation"},
    {"id": "france", "name": "France", "country": "France", "latitude": 46.2276, "longitude": 2.2137, "type": "country", "travelStyle": "Art, Architecture & French Gastronomy"},
    {"id": "italy", "name": "Italy", "country": "Italy", "latitude": 41.8719, "longitude": 12.5674, "type": "country", "travelStyle": "Roman Heritage & Coastal Scenery"},
    {"id": "thailand", "name": "Thailand", "country": "Thailand", "latitude": 15.87, "longitude": 100.9925, "type": "country", "travelStyle": "Golden Temples & Tropical Islands"},
    {"id": "egypt", "name": "Egypt", "country": "Egypt", "latitude": 26.8206, "longitude": 30.8025, "type": "country", "travelStyle": "Pharaonic Antiquity & Nile Sailing"},
    {"id": "united_states", "name": "United States", "country": "United States", "latitude": 37.0902, "longitude": -95.7129, "type": "country", "travelStyle": "National Parks & Metropolises"},
    {"id": "united_kingdom", "name": "United Kingdom", "country": "United Kingdom", "latitude": 55.3781, "longitude": -3.436, "type": "country", "travelStyle": "Royal History & British Culture"},
    {"id": "spain", "name": "Spain", "country": "Spain", "latitude": 40.4637, "longitude": -3.7492, "type": "country", "travelStyle": "Catalan Modernism & Mediterranean Coast"},
    {"id": "switzerland", "name": "Switzerland", "country": "Switzerland", "latitude": 46.8182, "longitude": 8.2275, "type": "country", "travelStyle": "Alpine Peaks & Scenic Railways"},
    {"id": "uae", "name": "UAE", "country": "UAE", "latitude": 23.4241, "longitude": 53.8478, "type": "country", "travelStyle": "Modern Architecture & Desert Safaris"},
    {"id": "indonesia", "name": "Indonesia", "country": "Indonesia", "latitude": -0.7893, "longitude": 113.9213, "type": "country", "travelStyle": "Island Heritage & Tropical Wellness"},

    # Cities
    {"id": "goa", "name": "Goa", "country": "India", "region": "Goa", "latitude": 15.2993, "longitude": 74.1240, "type": "city", "travelStyle": "Coastal Escapes & Portuguese Heritage", "startingBudget": 15000, "bestSeason": "November – February"},
    {"id": "mumbai", "name": "Mumbai", "country": "India", "region": "Maharashtra", "latitude": 19.0760, "longitude": 72.8777, "type": "city", "travelStyle": "Urban Culture & Coastal City Life", "startingBudget": 22000, "bestSeason": "November – February"},
    {"id": "kochi", "name": "Kochi", "country": "India", "region": "Kerala", "latitude": 9.9312, "longitude": 76.2673, "type": "city", "travelStyle": "Coastal Heritage & Backwater Experiences", "startingBudget": 16000, "bestSeason": "October – March"},
    {"id": "hyderabad", "name": "Hyderabad", "country": "India", "region": "Telangana", "latitude": 17.3850, "longitude": 78.4867, "type": "city", "travelStyle": "Deccan Heritage & Culinary Culture", "startingBudget": 12000, "bestSeason": "October – March"},
    {"id": "manali", "name": "Manali", "country": "India", "region": "Himachal Pradesh", "latitude": 32.2396, "longitude": 77.1887, "type": "city", "travelStyle": "Himalayan Adventure & Mountain Retreats", "startingBudget": 18000, "bestSeason": "October – June"},
    {"id": "new_delhi", "name": "New Delhi", "country": "India", "region": "Delhi", "latitude": 28.6139, "longitude": 77.2090, "type": "city", "travelStyle": "Historic Monuments & Culinary Bazaars", "startingBudget": 16000, "bestSeason": "October – March"},
    {"id": "paris", "name": "Paris", "country": "France", "region": "Île-de-France", "latitude": 48.8566, "longitude": 2.3522, "type": "city", "travelStyle": "Art, Architecture & French Culture", "startingBudget": 90000, "bestSeason": "April – June / September – October"},
    {"id": "nice", "name": "Nice", "country": "France", "region": "Provence-Alpes-Côte d'Azur", "latitude": 43.7102, "longitude": 7.2620, "type": "city", "travelStyle": "French Riviera & Mediterranean Promenades", "startingBudget": 85000, "bestSeason": "May – October"},
    {"id": "lyon", "name": "Lyon", "country": "France", "region": "Auvergne-Rhône-Alpes", "latitude": 45.7640, "longitude": 4.8357, "type": "city", "travelStyle": "French Gastronomy & Historic Riverfronts", "startingBudget": 75000, "bestSeason": "May – September"},
    {"id": "tokyo", "name": "Tokyo", "country": "Japan", "region": "Kanto", "latitude": 35.6762, "longitude": 139.6503, "type": "city", "travelStyle": "Urban Culture, Technology & Japanese Tradition", "startingBudget": 85000, "bestSeason": "March – May / October – November"},
    {"id": "kyoto", "name": "Kyoto", "country": "Japan", "region": "Kansai", "latitude": 35.0116, "longitude": 135.7681, "type": "city", "travelStyle": "Zen Gardens, Historic Shrines & Traditional Tea Culture", "startingBudget": 80000, "bestSeason": "March – May / October – November"},
    {"id": "osaka", "name": "Osaka", "country": "Japan", "region": "Kansai", "latitude": 34.6937, "longitude": 135.5023, "type": "city", "travelStyle": "Street Food Culture & Castle History", "startingBudget": 75000, "bestSeason": "March – May / October – November"},
    {"id": "rome", "name": "Rome", "country": "Italy", "region": "Lazio", "latitude": 41.9028, "longitude": 12.4964, "type": "city", "travelStyle": "Ancient History, Art & Italian Culture", "startingBudget": 80000, "bestSeason": "April – June / September – October"},
    {"id": "venice", "name": "Venice", "country": "Italy", "region": "Veneto", "latitude": 45.4408, "longitude": 12.3155, "type": "city", "travelStyle": "Canal Navigation & Venetian Gothic Heritage", "startingBudget": 85000, "bestSeason": "April – June / September – October"},
    {"id": "london", "name": "London", "country": "United Kingdom", "region": "Greater London", "latitude": 51.5074, "longitude": -0.1278, "type": "city", "travelStyle": "Historic Landmarks & British Culture", "startingBudget": 95000, "bestSeason": "May – September"},
    {"id": "barcelona", "name": "Barcelona", "country": "Spain", "region": "Catalonia", "latitude": 41.3851, "longitude": 2.1734, "type": "city", "travelStyle": "Modernist Architecture & Coastal Culture", "startingBudget": 75000, "bestSeason": "May – October"},
    {"id": "dubai", "name": "Dubai", "country": "UAE", "region": "Dubai", "latitude": 25.2048, "longitude": 55.2708, "type": "city", "travelStyle": "Modern Architecture & Desert Safaris", "startingBudget": 60000, "bestSeason": "November – March"},
    {"id": "bali", "name": "Bali", "country": "Indonesia", "region": "Bali", "latitude": -8.4095, "longitude": 115.1889, "type": "city", "travelStyle": "Island Heritage & Tropical Wellness", "startingBudget": 45000, "bestSeason": "April – October"},
    {"id": "cairo", "name": "Cairo", "country": "Egypt", "region": "Cairo", "latitude": 30.0444, "longitude": 31.2357, "type": "city", "travelStyle": "Pharaonic Wonders & Nile Exploration", "startingBudget": 48000, "bestSeason": "October – April"},
    {"id": "interlaken", "name": "Interlaken", "country": "Switzerland", "region": "Bern", "latitude": 46.6863, "longitude": 7.8632, "type": "city", "travelStyle": "Bernese Oberland Adventure & Jungfrau Glaciers", "startingBudget": 95000, "bestSeason": "May – October / December – March"},
    {"id": "zurich", "name": "Zurich", "country": "Switzerland", "region": "Zurich", "latitude": 47.3769, "longitude": 8.5417, "type": "city", "travelStyle": "Lakeside Culture, Historic Guilds & Swiss Banking", "startingBudget": 100000, "bestSeason": "June – September"}
]

class CuratedLocationService:
    @staticmethod
    def search(query: str) -> List[NormalizedLocation]:
        q = (query or "").strip().lower()
        if not q:
            return []

        matches = []
        for item in CURATED_ITEMS:
            if q in item["name"].lower() or q in item["country"].lower():
                matches.append(NormalizedLocation(
                    id=item["id"],
                    name=item["name"],
                    country=item["country"],
                    region=item.get("region"),
                    latitude=item["latitude"],
                    longitude=item["longitude"],
                    type=item["type"],
                    source="curated",
                    curated=True,
                    travelStyle=item.get("travelStyle"),
                    startingBudget=item.get("startingBudget"),
                    bestSeason=item.get("bestSeason"),
                    shortDescription=f"Curated destination: {item['name']}, {item['country']}.",
                    description=f"{item['name']} is part of our verified curated travel directory with signature experiences.",
                ))
        return matches

    @staticmethod
    def get_by_name(name: str) -> Optional[NormalizedLocation]:
        q = name.strip().lower()
        for item in CURATED_ITEMS:
            if item["name"].lower() == q or item["id"].lower() == q:
                return NormalizedLocation(
                    id=item["id"],
                    name=item["name"],
                    country=item["country"],
                    region=item.get("region"),
                    latitude=item["latitude"],
                    longitude=item["longitude"],
                    type=item["type"],
                    source="curated",
                    curated=True,
                    travelStyle=item.get("travelStyle"),
                    startingBudget=item.get("startingBudget"),
                    bestSeason=item.get("bestSeason"),
                )
        return None
