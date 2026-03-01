# Frontend Integration Guide - Weather Alert System

## 🎨 Quick Integration for React/Vue/Angular

### 1. Weather Dashboard Component

```javascript
// WeatherDashboard.jsx (React example)
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const WeatherDashboard = () => {
  const [weather, setWeather] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch weather analysis for user's location
  const fetchWeatherAnalysis = async (city) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/weather/analysis?city=${city}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setWeather(response.data.data.current);
      setAlerts(response.data.data.alerts.all);
    } catch (error) {
      console.error('Failed to fetch weather:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check weather for all user's farms and send alerts
  const checkFarmsWeather = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/weather/check-user-farms', {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      alert(`Checked ${response.data.farmsChecked} farms. Sent ${response.data.results.reduce((sum, r) => sum + r.alertsSent, 0)} alerts.`);
    } catch (error) {
      console.error('Failed to check farms:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherAnalysis('Pune'); // Replace with user's city
  }, []);

  return (
    <div className="weather-dashboard">
      <h2>Weather Dashboard</h2>
      
      {loading && <div>Loading...</div>}
      
      {weather && (
        <div className="current-weather">
          <h3>Current Conditions</h3>
          <div className="weather-stats">
            <div>🌡️ Temperature: {weather.temp}°C</div>
            <div>💧 Humidity: {weather.humidity}%</div>
            <div>🌧️ Rainfall: {weather.rain_1h}mm</div>
            <div>💨 Wind: {weather.wind_speed} m/s</div>
          </div>
        </div>
      )}
      
      <div className="alerts-section">
        <h3>Weather Alerts</h3>
        <button onClick={checkFarmsWeather} disabled={loading}>
          Check All Farms
        </button>
        
        {alerts.map((alert, index) => (
          <div 
            key={index} 
            className={`alert alert-${alert.type}`}
          >
            <span className="alert-icon">
              {alert.type === 'danger' ? '🔴' : 
               alert.type === 'warning' ? '🟠' : 
               alert.type === 'info' ? 'ℹ️' : '✅'}
            </span>
            <span className="alert-message">{alert.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeatherDashboard;
```

### 2. Weather Widget (Compact)

```javascript
// WeatherWidget.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const WeatherWidget = ({ farmId }) => {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await axios.get(`/api/weather/farm/${farmId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setWeather(response.data.data);
      } catch (error) {
        console.error('Failed to fetch weather:', error);
      }
    };

    fetchWeather();
    // Refresh every 30 minutes
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [farmId]);

  if (!weather) return <div>Loading weather...</div>;

  return (
    <div className="weather-widget">
      <div className="weather-icon">
        {weather.temp > 35 ? '☀️' : 
         weather.temp < 10 ? '❄️' : 
         weather.rain_1h > 0 ? '🌧️' : '⛅'}
      </div>
      <div className="weather-info">
        <div className="temp">{weather.temp}°C</div>
        <div className="description">{weather.description}</div>
      </div>
      {weather.alerts && weather.alerts.length > 0 && (
        <div className="alert-badge">
          {weather.alerts.filter(a => a.type === 'danger' || a.type === 'warning').length}
        </div>
      )}
    </div>
  );
};

export default WeatherWidget;
```

### 3. Forecast Component

```javascript
// WeatherForecast.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const WeatherForecast = ({ city }) => {
  const [forecast, setForecast] = useState([]);

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        const response = await axios.get(`/api/weather/forecast?city=${city}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setForecast(response.data.data);
      } catch (error) {
        console.error('Failed to fetch forecast:', error);
      }
    };

    fetchForecast();
  }, [city]);

  return (
    <div className="weather-forecast">
      <h3>7-Day Forecast</h3>
      <div className="forecast-grid">
        {forecast.map((day, index) => (
          <div key={index} className="forecast-day">
            <div className="date">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</div>
            <div className="icon">
              {day.rain_mm > 10 ? '🌧️' : 
               day.temp_max > 35 ? '☀️' : 
               day.temp_min < 10 ? '❄️' : '⛅'}
            </div>
            <div className="temps">
              <span className="high">{day.temp_max}°</span>
              <span className="low">{day.temp_min}°</span>
            </div>
            {day.rain_mm > 0 && (
              <div className="rain">💧 {day.rain_mm}mm</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeatherForecast;
```

### 4. Alert Notification Component

```javascript
// WeatherAlertNotification.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const WeatherAlertNotification = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get('/api/notifications', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        // Filter weather alerts
        const weatherAlerts = response.data.data.filter(
          n => n.type === 'weather_alert' && !n.isRead
        );
        setNotifications(weatherAlerts);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    fetchNotifications();
    // Poll every 5 minutes
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(`/api/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNotifications(notifications.filter(n => n._id !== notificationId));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="weather-alerts-popup">
      {notifications.map(notification => (
        <div key={notification._id} className="alert-notification">
          <div className="alert-header">
            <span className="alert-title">{notification.title}</span>
            <button onClick={() => markAsRead(notification._id)}>×</button>
          </div>
          <div className="alert-body">{notification.message}</div>
          <div className="alert-time">
            {new Date(notification.createdAt).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
};

export default WeatherAlertNotification;
```

## 🎨 CSS Styling Examples

```css
/* WeatherDashboard.css */
.weather-dashboard {
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
}

.current-weather {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.weather-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.weather-stats > div {
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
  font-size: 14px;
}

.alerts-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.alert {
  padding: 12px;
  margin: 10px 0;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.alert-danger {
  background: #fee;
  border-left: 4px solid #dc3545;
}

.alert-warning {
  background: #fff3cd;
  border-left: 4px solid #ffc107;
}

.alert-info {
  background: #d1ecf1;
  border-left: 4px solid #17a2b8;
}

.alert-success {
  background: #d4edda;
  border-left: 4px solid #28a745;
}

/* WeatherWidget.css */
.weather-widget {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  position: relative;
}

.weather-icon {
  font-size: 48px;
}

.weather-info .temp {
  font-size: 24px;
  font-weight: bold;
}

.weather-info .description {
  font-size: 14px;
  color: #666;
}

.alert-badge {
  position: absolute;
  top: 5px;
  right: 5px;
  background: #dc3545;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

/* WeatherForecast.css */
.weather-forecast {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.forecast-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.forecast-day {
  text-align: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.forecast-day .date {
  font-weight: bold;
  margin-bottom: 10px;
}

.forecast-day .icon {
  font-size: 32px;
  margin: 10px 0;
}

.forecast-day .temps {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin: 10px 0;
}

.forecast-day .high {
  color: #dc3545;
  font-weight: bold;
}

.forecast-day .low {
  color: #17a2b8;
}

.forecast-day .rain {
  font-size: 12px;
  color: #666;
  margin-top: 5px;
}

/* WeatherAlertNotification.css */
.weather-alerts-popup {
  position: fixed;
  top: 80px;
  right: 20px;
  width: 350px;
  max-height: 80vh;
  overflow-y: auto;
  z-index: 1000;
}

.alert-notification {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  margin-bottom: 10px;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.alert-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #eee;
}

.alert-title {
  font-weight: bold;
  font-size: 14px;
}

.alert-header button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
}

.alert-body {
  padding: 15px;
  font-size: 14px;
  line-height: 1.5;
}

.alert-time {
  padding: 10px 15px;
  font-size: 12px;
  color: #999;
  border-top: 1px solid #eee;
}
```

## 🔌 API Service Helper

```javascript
// services/weatherApi.js
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5002/api';

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`
});

export const weatherApi = {
  // Get current weather
  getCurrentWeather: async (city) => {
    const response = await axios.get(`${API_BASE}/weather/current?city=${city}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // Get weather by coordinates
  getCurrentWeatherByCoords: async (lat, lon) => {
    const response = await axios.get(`${API_BASE}/weather/current?lat=${lat}&lon=${lon}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // Get 7-day forecast
  getForecast: async (city) => {
    const response = await axios.get(`${API_BASE}/weather/forecast?city=${city}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // Get comprehensive weather analysis
  getWeatherAnalysis: async (city) => {
    const response = await axios.get(`${API_BASE}/weather/analysis?city=${city}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // Get weather for specific farm
  getFarmWeather: async (farmId) => {
    const response = await axios.get(`${API_BASE}/weather/farm/${farmId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // Check weather and send alerts for specific farm
  checkFarmWeather: async (farmId) => {
    const response = await axios.post(`${API_BASE}/weather/check-farm/${farmId}`, {}, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // Check weather for all user's farms
  checkUserFarms: async () => {
    const response = await axios.post(`${API_BASE}/weather/check-user-farms`, {}, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // Get farming alerts
  getFarmingAlerts: async (city) => {
    const response = await axios.get(`${API_BASE}/weather/alerts?city=${city}`, {
      headers: getAuthHeader()
    });
    return response.data;
  }
};
```

## 🎯 Usage in Pages

### Dashboard Page

```javascript
// pages/Dashboard.jsx
import React from 'react';
import WeatherWidget from '../components/WeatherWidget';
import WeatherAlertNotification from '../components/WeatherAlertNotification';

const Dashboard = () => {
  const userFarms = [/* user's farms */];

  return (
    <div className="dashboard">
      <WeatherAlertNotification />
      
      <div className="dashboard-header">
        <h1>Farmer Dashboard</h1>
      </div>

      <div className="farms-grid">
        {userFarms.map(farm => (
          <div key={farm._id} className="farm-card">
            <h3>{farm.name}</h3>
            <WeatherWidget farmId={farm._id} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
```

### Weather Page

```javascript
// pages/WeatherPage.jsx
import React from 'react';
import WeatherDashboard from '../components/WeatherDashboard';
import WeatherForecast from '../components/WeatherForecast';

const WeatherPage = () => {
  const userCity = 'Pune'; // Get from user profile

  return (
    <div className="weather-page">
      <WeatherDashboard />
      <WeatherForecast city={userCity} />
    </div>
  );
};

export default WeatherPage;
```

## 📱 Mobile Responsive

```css
/* Mobile styles */
@media (max-width: 768px) {
  .weather-stats {
    grid-template-columns: 1fr;
  }

  .forecast-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }

  .weather-alerts-popup {
    width: calc(100% - 40px);
    right: 20px;
    left: 20px;
  }

  .forecast-day {
    padding: 10px;
  }

  .forecast-day .icon {
    font-size: 24px;
  }
}
```

## 🔔 Push Notifications (Optional)

```javascript
// services/pushNotifications.js
export const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
};

export const showWeatherNotification = (title, message) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body: message,
      icon: '/weather-icon.png',
      badge: '/badge-icon.png',
      tag: 'weather-alert'
    });
  }
};

// Usage in component
useEffect(() => {
  requestNotificationPermission();
}, []);
```

## ✅ Integration Checklist

- [ ] Install axios: `npm install axios`
- [ ] Create weather API service helper
- [ ] Add WeatherWidget to dashboard
- [ ] Add WeatherDashboard page
- [ ] Add WeatherForecast component
- [ ] Add WeatherAlertNotification component
- [ ] Style components with CSS
- [ ] Test on mobile devices
- [ ] Add error handling
- [ ] Add loading states
- [ ] Test with real farm data
- [ ] (Optional) Add push notifications

## 🎨 UI/UX Best Practices

1. **Show weather prominently** on dashboard
2. **Use color coding** for alert severity
3. **Display icons** for quick recognition
4. **Auto-refresh** weather data every 30 minutes
5. **Show timestamps** for data freshness
6. **Make alerts dismissible** but persistent until read
7. **Use animations** for new alerts
8. **Provide manual refresh** button
9. **Show loading states** during API calls
10. **Handle errors gracefully** with user-friendly messages

## 🚀 Performance Tips

1. **Cache weather data** for 10-15 minutes
2. **Lazy load** forecast component
3. **Debounce** manual refresh button
4. **Use React.memo** for weather widgets
5. **Implement virtual scrolling** for long forecast lists
6. **Optimize images** and icons
7. **Use service workers** for offline support

---

**Ready to integrate!** Start with the WeatherWidget component and expand from there.
