"""
Open-Meteo Weather Provider for AITrip.
Fetches real meteorological observations, forecast temperatures, precipitation probability,
wind speed, and climate risk assessments with zero API key required.
"""

import httpx
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

WEATHER_CODE_MAP = {
    0: ("Clear Skies", "Sun", 0),
    1: ("Mainly Clear", "Sun", 5),
    2: ("Partly Cloudy", "CloudSun", 15),
    3: ("Overcast", "Cloud", 25),
    45: ("Foggy & Mist", "CloudFog", 20),
    48: ("Depositing Rime Fog", "CloudFog", 30),
    51: ("Light Drizzle", "CloudDrizzle", 45),
    53: ("Moderate Drizzle", "CloudDrizzle", 60),
    55: ("Dense Drizzle", "CloudDrizzle", 75),
    61: ("Slight Rain", "CloudRain", 65),
    63: ("Moderate Rain", "CloudRain", 80),
    65: ("Heavy Rain & Showers", "CloudRain", 95),
    71: ("Slight Snow", "Snowflake", 50),
    73: ("Moderate Snow", "Snowflake", 70),
    75: ("Heavy Snowfall", "Snowflake", 90),
    80: ("Isolated Rain Showers", "CloudRain", 70),
    81: ("Moderate Rain Showers", "CloudRain", 85),
    82: ("Violent Rain Showers", "CloudLightning", 95),
    95: ("Thunderstorm", "CloudLightning", 90),
}

class OpenMeteoWeatherProvider:
    @classmethod
    async def get_weather(cls, lat: float, lng: float) -> Dict[str, Any]:
        try:
            url = "https://api.open-meteo.com/v1/forecast"
            params = {
                "latitude": lat,
                "longitude": lng,
                "current": "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m",
                "daily": "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
                "timezone": "auto",
            }

            async with httpx.AsyncClient(timeout=6.0) as client:
                resp = await client.get(url, params=params)
                if resp.status_code == 200:
                    data = resp.json()
                    current = data.get("current", {})
                    daily = data.get("daily", {})

                    code = current.get("weather_code", 0)
                    condition_text, icon_name, default_rain = WEATHER_CODE_MAP.get(code, ("Pleasant", "Sun", 15))

                    temp_c = round(current.get("temperature_2m", 24))
                    humidity = f"{current.get('relative_humidity_2m', 55)}%"
                    wind = f"{current.get('wind_speed_10m', 10)} km/h"

                    daily_rain = daily.get("precipitation_probability_max", [default_rain])
                    rain_prob = daily_rain[0] if daily_rain else default_rain

                    highs = daily.get("temperature_2m_max", [temp_c + 4])
                    lows = daily.get("temperature_2m_min", [temp_c - 5])

                    risk = "Optimal Travel Conditions"
                    if rain_prob > 70 or code in [65, 82, 95]:
                        risk = "High Precipitation Alert: Indoor Activities Recommended"
                    elif temp_c > 38:
                        risk = "Heatwave Advisory: Midday Outdoor Caution"
                    elif temp_c < 2:
                        risk = "Sub-Zero Alpine Advisory: Thermal Gear Required"

                    # Parse itemized daily forecasts
                    dates = daily.get("time", [])
                    maxs = daily.get("temperature_2m_max", [])
                    mins = daily.get("temperature_2m_min", [])
                    codes = daily.get("weather_code", [])
                    precips = daily.get("precipitation_probability_max", [])

                    daily_forecasts = []
                    for i in range(len(dates)):
                        daily_forecasts.append({
                            "date": dates[i],
                            "max_temp": float(maxs[i]) if i < len(maxs) and maxs[i] is not None else None,
                            "min_temp": float(mins[i]) if i < len(mins) and mins[i] is not None else None,
                            "code": int(codes[i]) if i < len(codes) and codes[i] is not None else code,
                            "precipitation_prob": float(precips[i]) if i < len(precips) and precips[i] is not None else float(rain_prob),
                        })

                    return {
                        "available": True,
                        "tempC": temp_c,
                        "condition": condition_text,
                        "icon": icon_name,
                        "rainProbability": rain_prob,
                        "windSpeed": wind,
                        "humidity": humidity,
                        "highC": round(highs[0]) if highs else temp_c + 4,
                        "lowC": round(lows[0]) if lows else temp_c - 5,
                        "safetyRisk": risk,
                        "source": "open-meteo",
                        "weatherCode": code,
                        "dailyForecasts": daily_forecasts,
                    }
        except Exception as e:
            logger.warning(f"Open-Meteo forecast error: {e}")

        # Return explicit unavailable state instead of fake data
        return {
            "available": False,
            "tempC": None,
            "condition": "Weather Data Unavailable",
            "icon": "Cloud",
            "rainProbability": 0,
            "windSpeed": "N/A",
            "humidity": "N/A",
            "highC": None,
            "lowC": None,
            "safetyRisk": "Live weather telemetry currently unavailable",
            "source": "unavailable",
            "weatherCode": None,
            "dailyForecasts": [],
        }

