import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Spinner from './Common/Spinner';
import './WeatherWidget.css';

const WeatherWidget = () => {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchWeather();
    }, []);

    const fetchWeather = async () => {
        setLoading(true);
        setError(null);

        try {
            // Try to get user's location
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        try {
                            const { latitude, longitude } = position.coords;
                            const response = await api.get(`/api/weather/current?lat=${latitude}&lng=${longitude}`);
                            setWeather(response.data);
                        } catch (err) {
                            console.error('Weather API error:', err);
                            fetchDefaultCityWeather();
                        } finally {
                            setLoading(false);
                        }
                    },
                    () => {
                        // Location denied, use default city
                        fetchDefaultCityWeather();
                    }
                );
            } else {
                fetchDefaultCityWeather();
            }
        } catch (err) {
            setError('Failed to fetch weather');
            setLoading(false);
        }
    };

    const fetchDefaultCityWeather = async () => {
        try {
            const defaultCity = import.meta.env.VITE_DEFAULT_CITY || 'Bengaluru';
            const response = await api.get(`/api/weather/current?city=${defaultCity}`);
            setWeather(response.data);
        } catch (err) {
            console.error('Default weather API error:', err);
            setError('Weather unavailable');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Spinner size="sm" />;
    if (error) {
        return (
            <div className="weather-widget error">
                <p>{error}</p>
                <button className="btn btn-sm btn-outline-light" onClick={fetchWeather}>
                    Retry
                </button>
            </div>
        );
    }
    if (!weather) return null;

    return (
        <div className="weather-widget">
            <div className="weather-header">
                <h6>{weather.location?.name || 'Unknown'}</h6>
            </div>
            <div className="weather-main">
                <div className="weather-temp">
                    <span className="temp-value">{Math.round(weather.current?.tempC || 0)}°</span>
                    <span className="temp-unit">C</span>
                </div>
                {weather.current?.iconUrl && (
                    <img
                        src={weather.current.iconUrl}
                        alt={weather.current.condition}
                        className="weather-icon"
                    />
                )}
            </div>
            <p className="weather-condition">{weather.current?.condition || 'N/A'}</p>
            <div className="weather-stats">
                <div className="stat">
                    <small>Humidity</small>
                    <strong>{weather.current?.humidity || 0}%</strong>
                </div>
                <div className="stat">
                    <small>Wind</small>
                    <strong>{weather.current?.windKph || 0} km/h</strong>
                </div>
            </div>
        </div>
    );
};

export default WeatherWidget;
