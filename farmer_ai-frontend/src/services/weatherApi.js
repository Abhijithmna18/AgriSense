import axios from 'axios';

// Create a dedicated axios instance for the main backend (Port 5000)
// where weather routes are registered.
const api = axios.create({
    baseURL: 'http://localhost:5000'
});

// Add token interceptor in case backend requires auth (though weather routes might be public, good practice)
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const weatherApi = {
    getCurrentWeather: (lat, lon) => api.get(`/api/weather/current?lat=${lat}&lon=${lon}`),
    getForecast: (lat, lon) => api.get(`/api/weather/forecast?lat=${lat}&lon=${lon}`)
};
