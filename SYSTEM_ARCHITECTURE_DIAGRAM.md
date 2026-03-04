# Farm Weather Monitoring System - Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    FARM WEATHER MONITORING SYSTEM                            │
│                         (Automated Every 6 Hours)                            │
└─────────────────────────────────────────────────────────────────────────────┘

                                    ┌──────────┐
                                    │  CRON    │
                                    │  JOB     │
                                    │ 00,06,   │
                                    │ 12,18    │
                                    └────┬─────┘
                                         │
                                         ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                     BATCH MONITORING SERVICE                                │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  1. Fetch all active farms with coordinates                          │  │
│  │  2. Process in batches (10 farms per batch)                          │  │
│  │  3. Delay 1 second between batches                                   │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────┬───────────────────────────────────────┘
                                     │
                    ┌────────────────┴────────────────┐
                    │                                  │
                    ▼                                  ▼
        ┌───────────────────┐              ┌───────────────────┐
        │   BATCH 1         │              │   BATCH 2         │
        │   (10 farms)      │              │   (10 farms)      │
        └─────────┬─────────┘              └─────────┬─────────┘
                  │                                   │
                  └───────────────┬───────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        FOR EACH FARM                                         │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  Step 1: Fetch Weather Data                                           │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │  Open-Meteo API                                                  │  │  │
│  │  │  GET /forecast?lat={lat}&lon={lon}                               │  │  │
│  │  │  Returns: temp, humidity, rain, wind, UV, forecast              │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                         │  │
│  │  Step 2: Evaluate Alert Rules                                          │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │  Check 10 threshold rules:                                       │  │  │
│  │  │  • frost (temp ≤ 0°C)                                            │  │  │
│  │  │  • cold_stress (0°C < temp < 15°C)                               │  │  │
│  │  │  • heat_stress (temp > 35°C)                                     │  │  │
│  │  │  • extreme_heat (temp > 40°C)                                    │  │  │
│  │  │  • heavy_rain (rain > 50mm)                                      │  │  │
│  │  │  • moderate_rain (25mm < rain ≤ 50mm)                            │  │  │
│  │  │  • strong_wind (wind > 12 m/s)                                   │  │  │
│  │  │  • high_humidity (humidity > 85%)                                │  │  │
│  │  │  • high_uv (UV > 8)                                              │  │  │
│  │  │  • drought_risk (rain < 5mm/5 days)                              │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                         │  │
│  │  Step 3: Check Cooldown                                                │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │  Query: WeatherAlert.findOne({                                   │  │  │
│  │  │    user: userId,                                                 │  │  │
│  │  │    alertType: 'heat_stress',                                     │  │  │
│  │  │    sentAt: { $gte: Date.now() - cooldownMs }                    │  │  │
│  │  │  })                                                              │  │  │
│  │  │  If found → Skip alert                                           │  │  │
│  │  │  If not found → Send alert                                       │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                         │  │
│  │  Step 4: Send Notification                                             │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │  notificationService.createNotification({                        │  │  │
│  │  │    recipient: userId,                                            │  │  │
│  │  │    type: 'weather_alert',                                        │  │  │
│  │  │    title: '🔴 Critical Weather Alert',                           │  │  │
│  │  │    message: 'Heat stress at Farm A: 38°C...'                    │  │  │
│  │  │  })                                                              │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                         │  │
│  │  Step 5: Track in Database                                             │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │  WeatherAlert.create({                                           │  │  │
│  │  │    user, farm, alertType, severity, message,                    │  │  │
│  │  │    weatherData, location, sentAt, expiresAt                     │  │  │
│  │  │  })                                                              │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           RESULTS & METRICS                                  │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  📊 Farms Checked: 150                                                │  │
│  │  ✅ Successful: 148                                                   │  │
│  │  ❌ Failed: 2                                                         │  │
│  │  📨 Alerts Sent: 45                                                   │  │
│  │  ⏭️  Alerts Skipped: 12                                               │  │
│  │  ⏱️  Avg Time: 234ms                                                  │  │
│  │  ⏱️  Total Duration: 35s                                              │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Database Schema

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            DATABASE MODELS                                   │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐         ┌──────────────────────┐
│       Farm           │         │       User           │
├──────────────────────┤         ├──────────────────────┤
│ _id                  │◄────────┤ _id                  │
│ user (ref)           │         │ firstName            │
│ name                 │         │ lastName             │
│ location: {          │         │ email                │
│   type: 'Point'      │         │ isActive             │
│   coordinates: [     │         │ roles: []            │
│     longitude,       │         └──────────────────────┘
│     latitude         │                    ▲
│   ],                 │                    │
│   state,             │                    │
│   district           │                    │
│ }                    │                    │
│ soilType             │                    │
│ irrigationType       │                    │
└──────────────────────┘                    │
         │                                  │
         │                                  │
         ▼                                  │
┌──────────────────────┐                    │
│   WeatherAlert       │                    │
├──────────────────────┤                    │
│ _id                  │                    │
│ user (ref)           │────────────────────┘
│ farm (ref)           │────────┐
│ alertType            │        │
│ severity             │        │
│ message              │        │
│ weatherData: {       │        │
│   temperature        │        │
│   rainfall           │        │
│   humidity           │        │
│   windSpeed          │        │
│   uvIndex            │        │
│ }                    │        │
│ location: {          │        │
│   city               │        │
│   coordinates: []    │        │
│ }                    │        │
│ sentAt               │        │
│ expiresAt            │        │
└──────────────────────┘        │
         │                      │
         │                      │
         ▼                      │
┌──────────────────────┐        │
│   Notification       │        │
├──────────────────────┤        │
│ _id                  │        │
│ recipient (ref)      │────────┘
│ type                 │
│ title                │
│ message              │
│ isRead               │
│ createdAt            │
└──────────────────────┘
```

## Index Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DATABASE INDEXES                                     │
└─────────────────────────────────────────────────────────────────────────────┘

Farm Collection:
┌────────────────────────────────────────────────────────────────────────────┐
│  Index 1: { 'location.coordinates': '2dsphere' }                           │
│  Purpose: Geospatial queries                                               │
│  Performance: Enables fast location-based lookups                          │
├────────────────────────────────────────────────────────────────────────────┤
│  Index 2: { user: 1, 'location.coordinates': 1 }                           │
│  Purpose: User farm lookups with coordinates                               │
│  Performance: < 1ms for user's farms with valid coordinates                │
├────────────────────────────────────────────────────────────────────────────┤
│  Index 3: { user: 1 }                                                      │
│  Purpose: User farm lookups                                                │
│  Performance: < 1ms for all user's farms                                   │
└────────────────────────────────────────────────────────────────────────────┘

WeatherAlert Collection:
┌────────────────────────────────────────────────────────────────────────────┐
│  Index 1: { user: 1, alertType: 1, sentAt: -1 }  ⭐ CRITICAL               │
│  Purpose: Cooldown checks                                                  │
│  Performance: < 1ms to check if alert was sent recently                    │
│  Query: Find recent alert of same type for user                            │
├────────────────────────────────────────────────────────────────────────────┤
│  Index 2: { farm: 1, sentAt: -1 }                                          │
│  Purpose: Farm alert history                                               │
│  Performance: < 1ms for farm's alert history                               │
├────────────────────────────────────────────────────────────────────────────┤
│  Index 3: { alertType: 1, sentAt: -1 }                                     │
│  Purpose: Statistics and analytics                                         │
│  Performance: < 5ms for alert type statistics                              │
├────────────────────────────────────────────────────────────────────────────┤
│  Index 4: { sentAt: 1 } with TTL 30 days                                   │
│  Purpose: Auto-delete old alerts                                           │
│  Performance: Automatic cleanup, no manual intervention                    │
└────────────────────────────────────────────────────────────────────────────┘

User Collection:
┌────────────────────────────────────────────────────────────────────────────┐
│  Index: { isActive: 1, roles: 1 }                                          │
│  Purpose: Find active farmers                                              │
│  Performance: < 1ms to get all active farmers                              │
└────────────────────────────────────────────────────────────────────────────┘

Notification Collection:
┌────────────────────────────────────────────────────────────────────────────┐
│  Index 1: { recipient: 1, type: 1, createdAt: -1 }                         │
│  Purpose: User notifications by type                                       │
│  Performance: < 1ms for user's weather alerts                              │
├────────────────────────────────────────────────────────────────────────────┤
│  Index 2: { recipient: 1, isRead: 1, createdAt: -1 }                       │
│  Purpose: Unread notifications                                             │
│  Performance: < 1ms for user's unread notifications                        │
└────────────────────────────────────────────────────────────────────────────┘
```

## Alert Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          ALERT DECISION FLOW                                 │
└─────────────────────────────────────────────────────────────────────────────┘

                            ┌──────────────┐
                            │ Weather Data │
                            │  Received    │
                            └──────┬───────┘
                                   │
                                   ▼
                        ┌──────────────────────┐
                        │ Evaluate Alert Rules │
                        │  (10 thresholds)     │
                        └──────┬───────────────┘
                               │
                ┌──────────────┴──────────────┐
                │                             │
                ▼                             ▼
        ┌───────────────┐           ┌───────────────┐
        │ No Alerts     │           │ Alerts        │
        │ Triggered     │           │ Triggered     │
        └───────┬───────┘           └───────┬───────┘
                │                           │
                ▼                           ▼
        ┌───────────────┐           ┌───────────────────┐
        │ Skip Farm     │           │ For Each Alert:   │
        │ (Success)     │           │ Check Cooldown    │
        └───────────────┘           └───────┬───────────┘
                                            │
                                ┌───────────┴───────────┐
                                │                       │
                                ▼                       ▼
                    ┌───────────────────┐   ┌───────────────────┐
                    │ Alert Sent        │   │ Alert NOT Sent    │
                    │ Recently          │   │ Recently          │
                    │ (Within Cooldown) │   │ (Outside Cooldown)│
                    └───────┬───────────┘   └───────┬───────────┘
                            │                       │
                            ▼                       ▼
                    ┌───────────────────┐   ┌───────────────────┐
                    │ Skip Alert        │   │ Send Notification │
                    │ (Cooldown)        │   │ Create Alert      │
                    └───────────────────┘   │ Track in DB       │
                                            └───────┬───────────┘
                                                    │
                                                    ▼
                                            ┌───────────────────┐
                                            │ Alert Sent        │
                                            │ (Success)         │
                                            └───────────────────┘
```

## Performance Characteristics

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PERFORMANCE METRICS                                   │
└─────────────────────────────────────────────────────────────────────────────┘

Query Performance (with indexes):
┌────────────────────────────────────────────────────────────────────────────┐
│  Operation                          │ Time      │ Index Used                │
├─────────────────────────────────────┼───────────┼──────────────────────────┤
│  Cooldown check                     │ < 1ms     │ user+alertType+sentAt    │
│  Farm lookup by user                │ < 1ms     │ user+coordinates         │
│  Active farmers query               │ < 1ms     │ isActive+roles           │
│  Alert statistics                   │ < 5ms     │ alertType+sentAt         │
│  User notifications                 │ < 1ms     │ recipient+type+createdAt │
└────────────────────────────────────────────────────────────────────────────┘

Batch Processing Performance:
┌────────────────────────────────────────────────────────────────────────────┐
│  Farms     │ Batches │ Time      │ Alerts/sec │ API Calls/sec             │
├────────────┼─────────┼───────────┼────────────┼──────────────────────────┤
│  10        │ 1       │ 3-4s      │ 2-3        │ 2-3                       │
│  100       │ 10      │ 30-40s    │ 2-3        │ 2-3                       │
│  1000      │ 100     │ 5-6min    │ 2-3        │ 2-3                       │
└────────────────────────────────────────────────────────────────────────────┘

Resource Usage:
┌────────────────────────────────────────────────────────────────────────────┐
│  Resource  │ Usage         │ Notes                                         │
├────────────┼───────────────┼──────────────────────────────────────────────┤
│  Memory    │ ~50MB         │ Additional to base server                     │
│  CPU       │ Minimal       │ Batch processing spreads load                 │
│  Network   │ ~1KB/farm     │ Weather API response size                     │
│  Database  │ ~500B/alert   │ WeatherAlert document size                    │
└────────────────────────────────────────────────────────────────────────────┘
```

## Cooldown System

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         COOLDOWN MECHANISM                                   │
└─────────────────────────────────────────────────────────────────────────────┘

Alert Type Cooldown Periods:
┌────────────────────────────────────────────────────────────────────────────┐
│  Alert Type      │ Cooldown │ Reason                                       │
├──────────────────┼──────────┼─────────────────────────────────────────────┤
│  frost           │ 12 hours │ Critical but slow-changing condition         │
│  cold_stress     │ 12 hours │ Gradual temperature changes                  │
│  heat_stress     │ 12 hours │ Gradual temperature changes                  │
│  extreme_heat    │ 12 hours │ Critical but slow-changing condition         │
│  heavy_rain      │ 6 hours  │ Fast-changing, needs frequent updates        │
│  moderate_rain   │ 6 hours  │ Fast-changing, needs frequent updates        │
│  strong_wind     │ 6 hours  │ Fast-changing, needs frequent updates        │
│  high_humidity   │ 24 hours │ Slow-changing, informational                 │
│  high_uv         │ 24 hours │ Slow-changing, informational                 │
│  drought_risk    │ 24 hours │ Slow-developing condition                    │
└────────────────────────────────────────────────────────────────────────────┘

Cooldown Check Process:
┌────────────────────────────────────────────────────────────────────────────┐
│  1. Alert triggered (e.g., heat_stress)                                    │
│  2. Query: Find recent alert of same type for user                         │
│     WeatherAlert.findOne({                                                 │
│       user: userId,                                                        │
│       alertType: 'heat_stress',                                            │
│       sentAt: { $gte: Date.now() - 12*60*60*1000 }  // 12 hours           │
│     })                                                                     │
│  3. If found → Skip alert (within cooldown)                                │
│  4. If not found → Send alert and create WeatherAlert record               │
│  5. Set expiresAt = Date.now() + cooldownMs                                │
└────────────────────────────────────────────────────────────────────────────┘

Example Timeline:
┌────────────────────────────────────────────────────────────────────────────┐
│  Time    │ Event                                                            │
├──────────┼─────────────────────────────────────────────────────────────────┤
│  00:00   │ Cron runs, detects heat_stress (38°C)                           │
│          │ → Alert sent, cooldown until 12:00                              │
├──────────┼─────────────────────────────────────────────────────────────────┤
│  06:00   │ Cron runs, still heat_stress (39°C)                             │
│          │ → Alert skipped (within 12h cooldown)                           │
├──────────┼─────────────────────────────────────────────────────────────────┤
│  12:00   │ Cron runs, still heat_stress (40°C)                             │
│          │ → Alert sent (cooldown expired), new cooldown until 00:00       │
├──────────┼─────────────────────────────────────────────────────────────────┤
│  18:00   │ Cron runs, still heat_stress (38°C)                             │
│          │ → Alert skipped (within 12h cooldown)                           │
└────────────────────────────────────────────────────────────────────────────┘
```

---

**Legend**:
- ⭐ = Critical for performance
- ◄─ = Database reference
- → = Data flow
- ▼ = Process flow
