/**
 * WeatherProvider Abstraction
 * Fetches real-world meteorological forecasts and climate telemetry.
 * Integrates Open-Meteo for free worldwide weather or custom WeatherAPI provider.
 */

export class BaseWeatherProvider {
  async getWeather(lat, lng) {
    throw new Error('getWeather must be implemented');
  }
}

export class RealWeatherProvider extends BaseWeatherProvider {
  async getWeather(lat, lng) {
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return {
        temperature: 24,
        condition: 'Pleasant & Mild',
        windSpeed: '12 km/h',
        humidity: '65%',
        source: 'climate_estimate',
        isRealData: false,
      };
    }

    try {
      // Free worldwide high-resolution meteorological API (Open-Meteo)
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lng.toFixed(
          4
        )}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto`
      );

      if (res.ok) {
        const data = await res.json();
        const current = data.current || {};
        const temp = Math.round(current.temperature_2m ?? 24);
        const code = current.weather_code ?? 0;

        let condition = 'Clear Skies & Sunny';
        let icon = 'Sun';

        if (code >= 1 && code <= 3) {
          condition = 'Partly Cloudy';
          icon = 'Cloud';
        } else if (code >= 45 && code <= 48) {
          condition = 'Misty / Foggy';
          icon = 'CloudFog';
        } else if (code >= 51 && code <= 67) {
          condition = 'Light Showers';
          icon = 'CloudRain';
        } else if (code >= 71 && code <= 86) {
          condition = 'Alpine Snow';
          icon = 'Snowflake';
        } else if (code >= 95) {
          condition = 'Thunderstorms';
          icon = 'CloudLightning';
        }

        return {
          temperature: temp,
          condition,
          icon,
          windSpeed: `${Math.round(current.wind_speed_10m || 10)} km/h`,
          humidity: `${Math.round(current.relative_humidity_2m || 60)}%`,
          source: 'open_meteo_live',
          isRealData: true,
          dailyMin: data.daily?.temperature_2m_min?.[0],
          dailyMax: data.daily?.temperature_2m_max?.[0],
        };
      }
    } catch (err) {
      console.warn('Real weather API call failed, using graceful estimate:', err);
    }

    return {
      temperature: 23,
      condition: 'Typical Seasonal Climate',
      icon: 'Sun',
      windSpeed: '10 km/h',
      humidity: '55%',
      source: 'typical_climate_estimate',
      isRealData: false,
    };
  }
}

export const weatherProvider = new RealWeatherProvider();
