/**
 * weatherAPI.js
 * Uses Open-Meteo API — 100% free, no API key, no registration required.
 * Docs: https://open-meteo.com/en/docs
 *
 * Also uses Open-Meteo Geocoding API to resolve city names to lat/lon.
 */
const axios = require('axios');

const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

/** Map WMO weather code to human description and farming-relevant context */
const WMO_CODES = {
    0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
    45: 'Foggy', 48: 'Freezing fog',
    51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
    61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
    71: 'Slight snowfall', 73: 'Moderate snowfall', 75: 'Heavy snowfall', 77: 'Snow grains',
    80: 'Slight rain showers', 81: 'Moderate rain showers', 82: 'Heavy rain showers',
    85: 'Slight snow showers', 86: 'Heavy snow showers',
    95: 'Thunderstorm', 96: 'Thunderstorm with slight hail', 99: 'Thunderstorm with heavy hail'
};

const getDescription = (code) => WMO_CODES[code] || 'Unknown';

/**
 * Resolve a city name to lat/lon using Open-Meteo Geocoding API.
 */
const geocodeCity = async (city) => {
    const { data } = await axios.get(GEO_URL, {
        params: { name: city, count: 1, language: 'en', format: 'json' },
        timeout: 8000
    });
    if (!data.results?.length) throw new Error(`City not found: ${city}`);
    const r = data.results[0];
    return { lat: r.latitude, lon: r.longitude, name: r.name, country: r.country_code };
};

/**
 * Get current weather by lat/lon from Open-Meteo.
 */
exports.getCurrentWeatherByCoords = async (lat, lon) => {
    const { data } = await axios.get(FORECAST_URL, {
        params: {
            latitude: lat,
            longitude: lon,
            current: [
                'temperature_2m', 'relative_humidity_2m', 'apparent_temperature',
                'precipitation', 'weather_code', 'wind_speed_10m', 'wind_gusts_10m',
                'cloud_cover', 'uv_index'
            ].join(','),
            hourly: 'precipitation_probability',
            forecast_days: 1,
            timezone: 'auto'
        },
        timeout: 10000
    });

    const c = data.current;
    return {
        city: `${lat.toFixed(2)}, ${lon.toFixed(2)}`,
        country: '',
        temp: c.temperature_2m,
        feels_like: c.apparent_temperature,
        humidity: c.relative_humidity_2m,
        wind_speed: c.wind_speed_10m,
        wind_gusts: c.wind_gusts_10m,
        cloud_cover: c.cloud_cover,
        description: getDescription(c.weather_code),
        weather_code: c.weather_code,
        rain_1h: c.precipitation,
        uv_index: c.uv_index,
        timestamp: c.time,
        source: 'open-meteo'
    };
};

/**
 * Get current weather by city name.
 */
exports.getCurrentWeatherByCity = async (city) => {
    const geo = await geocodeCity(city);
    const weather = await exports.getCurrentWeatherByCoords(geo.lat, geo.lon);
    return { ...weather, city: geo.name, country: geo.country };
};

/**
 * Get 7-day daily forecast by city name.
 */
exports.getForecastByCity = async (city) => {
    const geo = await geocodeCity(city);

    const { data } = await axios.get(FORECAST_URL, {
        params: {
            latitude: geo.lat,
            longitude: geo.lon,
            daily: [
                'weather_code', 'temperature_2m_max', 'temperature_2m_min',
                'precipitation_sum', 'wind_speed_10m_max',
                'precipitation_probability_max', 'uv_index_max'
            ].join(','),
            timezone: 'auto',
            forecast_days: 7
        },
        timeout: 10000
    });

    const d = data.daily;
    return d.time.map((date, i) => ({
        date,
        temp_min: d.temperature_2m_min[i],
        temp_max: d.temperature_2m_max[i],
        humidity: null, // not in daily summary
        description: getDescription(d.weather_code[i]),
        rain_mm: d.precipitation_sum[i],
        rain_probability: d.precipitation_probability_max[i],
        wind_max: d.wind_speed_10m_max[i],
        uv_index: d.uv_index_max[i],
        source: 'open-meteo'
    }));
};

/**
 * Detect weather-related farming alerts from current conditions.
 */
exports.generateWeatherAlerts = (weather) => {
    const alerts = [];
    
    // Extreme heat alert
    if (weather.temp > 38) {
        alerts.push({ 
            type: 'danger', 
            alertType: 'extreme_heat',
            message: 'Extreme heat — irrigate crops immediately and provide shade where possible.' 
        });
    } else if (weather.temp > 33) {
        alerts.push({ 
            type: 'warning', 
            alertType: 'extreme_heat',
            message: 'High temperatures — monitor soil moisture closely and consider evening irrigation.' 
        });
    }
    
    // Frost alert
    if (weather.temp <= 0) {
        alerts.push({ 
            type: 'danger', 
            alertType: 'frost',
            message: 'Frost warning! Temperature at or below freezing. Protect sensitive crops immediately.' 
        });
    } else if (weather.temp < 5) {
        alerts.push({ 
            type: 'danger', 
            alertType: 'frost',
            message: 'Near-frost temperatures — cover sensitive crops and protect seedlings overnight.' 
        });
    }
    
    // Heavy rain alert
    if (weather.rain_1h > 30) {
        alerts.push({ 
            type: 'danger', 
            alertType: 'heavy_rain',
            message: 'Heavy rainfall — delay spraying operations and check field drainage systems.' 
        });
    } else if (weather.rain_1h > 10) {
        alerts.push({ 
            type: 'warning', 
            alertType: 'heavy_rain',
            message: 'Moderate rainfall — avoid field operations until conditions improve.' 
        });
    }
    
    // Strong wind alert
    if (weather.wind_speed > 12) {
        alerts.push({ 
            type: 'warning', 
            alertType: 'strong_wind',
            message: 'Strong winds — avoid pesticide application; risk of spray drift.' 
        });
    }
    
    // High humidity alert
    if (weather.humidity > 85) {
        alerts.push({ 
            type: 'info', 
            alertType: 'high_humidity',
            message: 'High humidity — increased fungal disease risk. Consider preventive fungicide application.' 
        });
    }
    
    // High UV alert
    if (weather.uv_index > 8) {
        alerts.push({ 
            type: 'info', 
            alertType: 'high_uv',
            message: 'High UV index — avoid working in fields between 11am–3pm.' 
        });
    }
    
    if (alerts.length === 0) {
        alerts.push({ 
            type: 'success', 
            alertType: 'favorable',
            message: 'Weather conditions are favorable for farming today.' 
        });
    }
    
    return alerts;
};

/**
 * Analyze forecast data to detect upcoming adverse conditions
 * @param {Array} forecast - Array of daily forecast objects
 * @returns {Array} - Array of forecast-based alerts
 */
exports.analyzeForecastAlerts = (forecast) => {
    const alerts = [];
    
    if (!forecast || forecast.length === 0) return alerts;
    
    // Check next 3 days for critical conditions
    const nextThreeDays = forecast.slice(0, 3);
    
    nextThreeDays.forEach((day, index) => {
        const dayLabel = index === 0 ? 'today' : index === 1 ? 'tomorrow' : `in ${index} days`;
        
        // Frost warning
        if (day.temp_min <= 0) {
            alerts.push({
                type: 'danger',
                alertType: 'frost',
                message: `Frost expected ${dayLabel}. Minimum temperature: ${day.temp_min}°C. Protect sensitive crops.`,
                date: day.date
            });
        } else if (day.temp_min < 5) {
            alerts.push({
                type: 'warning',
                alertType: 'frost',
                message: `Near-frost conditions expected ${dayLabel}. Minimum temperature: ${day.temp_min}°C.`,
                date: day.date
            });
        }
        
        // Heavy rain warning
        if (day.rain_mm > 50) {
            alerts.push({
                type: 'danger',
                alertType: 'heavy_rain',
                message: `Heavy rainfall expected ${dayLabel}: ${day.rain_mm}mm. Prepare drainage systems.`,
                date: day.date
            });
        } else if (day.rain_mm > 25) {
            alerts.push({
                type: 'warning',
                alertType: 'heavy_rain',
                message: `Moderate to heavy rain expected ${dayLabel}: ${day.rain_mm}mm.`,
                date: day.date
            });
        }
        
        // Extreme heat warning
        if (day.temp_max > 40) {
            alerts.push({
                type: 'danger',
                alertType: 'extreme_heat',
                message: `Extreme heat expected ${dayLabel}: ${day.temp_max}°C. Ensure adequate irrigation.`,
                date: day.date
            });
        }
    });
    
    // Drought risk analysis (7-day outlook)
    const totalRainfall = forecast.reduce((sum, day) => sum + (day.rain_mm || 0), 0);
    const avgMaxTemp = forecast.reduce((sum, day) => sum + day.temp_max, 0) / forecast.length;
    
    if (totalRainfall < 5 && avgMaxTemp > 35) {
        alerts.push({
            type: 'warning',
            alertType: 'drought_risk',
            message: `Drought risk: Only ${totalRainfall.toFixed(1)}mm rainfall expected in next 7 days with high temperatures. Plan irrigation accordingly.`
        });
    }
    
    return alerts;
};

/**
 * Get comprehensive weather analysis with current and forecast alerts
 * @param {string} city - City name
 * @returns {Object} - Complete weather analysis with alerts
 */
exports.getWeatherAnalysis = async (city) => {
    try {
        const [currentWeather, forecast] = await Promise.all([
            exports.getCurrentWeatherByCity(city),
            exports.getForecastByCity(city)
        ]);
        
        const currentAlerts = exports.generateWeatherAlerts(currentWeather);
        const forecastAlerts = exports.analyzeForecastAlerts(forecast);
        
        return {
            current: currentWeather,
            forecast,
            alerts: {
                current: currentAlerts,
                forecast: forecastAlerts,
                all: [...currentAlerts, ...forecastAlerts]
            }
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Get weather analysis by coordinates
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Object} - Complete weather analysis with alerts
 */
exports.getWeatherAnalysisByCoords = async (lat, lon) => {
    try {
        const currentWeather = await exports.getCurrentWeatherByCoords(lat, lon);
        
        // Get forecast using coordinates
        const { data } = await axios.get(FORECAST_URL, {
            params: {
                latitude: lat,
                longitude: lon,
                daily: [
                    'weather_code', 'temperature_2m_max', 'temperature_2m_min',
                    'precipitation_sum', 'wind_speed_10m_max',
                    'precipitation_probability_max', 'uv_index_max'
                ].join(','),
                timezone: 'auto',
                forecast_days: 7
            },
            timeout: 10000
        });
        
        const d = data.daily;
        const forecast = d.time.map((date, i) => ({
            date,
            temp_min: d.temperature_2m_min[i],
            temp_max: d.temperature_2m_max[i],
            humidity: null,
            description: getDescription(d.weather_code[i]),
            rain_mm: d.precipitation_sum[i],
            rain_probability: d.precipitation_probability_max[i],
            wind_max: d.wind_speed_10m_max[i],
            uv_index: d.uv_index_max[i],
            source: 'open-meteo'
        }));
        
        const currentAlerts = exports.generateWeatherAlerts(currentWeather);
        const forecastAlerts = exports.analyzeForecastAlerts(forecast);
        
        return {
            current: currentWeather,
            forecast,
            alerts: {
                current: currentAlerts,
                forecast: forecastAlerts,
                all: [...currentAlerts, ...forecastAlerts]
            }
        };
    } catch (error) {
        throw error;
    }
};
