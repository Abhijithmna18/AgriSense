# Weather Alerts Widget Integration

## Overview
The Weather Alerts Widget has been integrated into the AI Farm Intelligence dashboard to provide real-time weather information alongside crop recommendations.

## Component Location
- **Widget Component**: `src/components/weather/WeatherAlertsWidget.jsx`
- **Integrated In**: `src/pages/AiRecommendationsPage.jsx`

## Features

### Compact View (Default)
- Kerala-specific weather alert (time and season-aware)
- Current weather conditions (Temperature, Humidity, Rain, Wind)
- Expandable/collapsible interface

### Expanded View
- Active weather alerts for the farm
- 5-day weather forecast
- Detailed weather metrics

## Usage

```jsx
import WeatherAlertsWidget from '../components/weather/WeatherAlertsWidget';

<WeatherAlertsWidget 
  farmId={farmId} 
  farmLocation={farmLocation}
/>
```

### Props
- `farmId` (required): The ID of the farm to fetch weather data for
- `farmLocation` (required): Object containing farm location details
  - `district`: District name
  - `state`: State name

## Integration Points

### AI Farm Intelligence Dashboard
The widget is positioned in the left sidebar of the AI Farm Intelligence page, above the "Farm Context Used" section. This provides farmers with:

1. **Immediate weather awareness** - See current conditions at a glance
2. **Contextual alerts** - Kerala-specific alerts based on time and season
3. **Planning capability** - 5-day forecast for activity planning
4. **Seamless experience** - Weather data alongside crop recommendations

## API Endpoints Used

- `GET /api/weather/farm/:farmId` - Fetch current weather for farm
- `GET /api/weather/forecast?city={city}` - Fetch 7-day forecast

## Design Principles

1. **Non-intrusive**: Compact by default, expands on demand
2. **Contextual**: Shows Kerala-specific alerts relevant to farming
3. **Actionable**: Provides clear weather information for decision-making
4. **Consistent**: Matches the admin dashboard design system

## Kerala Weather Alert System

The widget includes an intelligent Kerala-specific alert system that:

- Detects current time of day (morning, afternoon, evening, night)
- Identifies current season (Southwest Monsoon, Northeast Monsoon, Summer, Winter)
- Generates contextually relevant alerts with:
  - Severity level (Warning, Watch, Advisory)
  - Appropriate icon and color coding
  - Farming-specific recommendations

### Alert Examples

**Southwest Monsoon + Morning**
- Severity: Warning
- Message: Heavy rainfall expected. Postpone spraying and ensure proper drainage.

**Summer + Afternoon**
- Severity: Warning  
- Message: High temperatures expected. Irrigate during early morning or evening only.

**Winter + Morning**
- Severity: Advisory
- Message: Ideal conditions for agricultural activities and planting.

## Future Enhancements

- [ ] Add weather-based crop recommendations
- [ ] Include soil moisture predictions
- [ ] Add pest/disease risk based on weather
- [ ] Historical weather data comparison
- [ ] Weather-based irrigation scheduling

## Testing

To test the widget:

1. Navigate to AI Farm Intelligence page for any farm
2. Widget should appear in the left sidebar
3. Click expand/collapse button to toggle detailed view
4. Verify Kerala alert changes based on time and season
5. Check that current weather data loads correctly
6. Confirm 5-day forecast displays when expanded

## Troubleshooting

**Widget not loading weather data:**
- Check that backend weather API is running
- Verify farm has valid location data (district, state)
- Check browser console for API errors

**Kerala alert not showing:**
- Alert is always generated based on current time/season
- Check browser time settings if alert seems incorrect

**Forecast not displaying:**
- Ensure farm location has valid district and state
- Check that forecast API endpoint is accessible
