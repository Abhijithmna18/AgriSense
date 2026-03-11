# Feature Flags Management System - Setup Guide

## Overview
A production-level Feature Flag Management System has been implemented for AgriSense. This allows administrators to control platform features dynamically without code deployment, similar to LaunchDarkly or Firebase Remote Config.

## Features Implemented

### 1. Backend Components

#### Enhanced Model
**Location:** `farmer_ai-backend/src/models/FeatureFlag.js`

**Fields:**
- `name` - Human-readable flag name
- `key` - Unique identifier (lowercase with underscores)
- `description` - What the flag controls
- `isEnabled` - On/Off status
- `environment` - production, staging, development, or all
- `rolloutPercentage` - Gradual rollout (0-100%)
- `targetRoles` - Specific roles (farmer, buyer, vendor, admin)
- `targetUsers` - Specific user IDs
- `createdBy` / `updatedBy` - Audit trail
- `createdAt` / `lastUpdated` - Timestamps

#### Controller
**Location:** `farmer_ai-backend/src/controllers/featureFlagController.js`

**Endpoints:**
- `getFeatureFlags()` - List all flags with filters
- `getFeatureFlag()` - Get single flag details
- `createFeatureFlag()` - Create new flag
- `updateFeatureFlag()` - Update flag settings
- `toggleFeatureFlag()` - Quick on/off toggle
- `deleteFeatureFlag()` - Remove flag
- `checkFeatureFlag()` - Check if enabled for user

#### Routes
All routes integrated into `/api/admin/feature-flags`

### 2. Frontend Components

#### Feature Flags Admin Page
**Location:** `farmer_ai-frontend/src/pages/admin/FeatureFlagsAdmin.jsx`

**Features:**
- ✅ Feature flags table with search and filters
- ✅ Environment filter (Production, Staging, Development, All)
- ✅ Status filter (Enabled, Disabled)
- ✅ Quick toggle switches in table
- ✅ Create flag modal with all options
- ✅ Edit flag modal
- ✅ Delete confirmation
- ✅ Rollout percentage slider
- ✅ Role targeting checkboxes
- ✅ Empty state for first-time setup
- ✅ Pagination support
- ✅ Responsive design matching admin theme

#### Custom Hook
**Location:** `farmer_ai-frontend/src/hooks/useFeatureFlag.js`

**Usage:**
```javascript
import { useFeatureFlag, FeatureFlag } from '../hooks/useFeatureFlag';

// Hook usage
const { isEnabled, loading } = useFeatureFlag('ai_crop_predictions');

// Component usage
<FeatureFlag flagKey="vendor_marketplace">
  <VendorMarketplace />
</FeatureFlag>
```

### 3. Database Schema

```javascript
{
  name: String,
  key: String (unique, lowercase),
  description: String,
  isEnabled: Boolean,
  environment: String (enum),
  rolloutPercentage: Number (0-100),
  targetRoles: [String],
  targetUsers: [ObjectId],
  createdBy: ObjectId,
  updatedBy: ObjectId,
  createdAt: Date,
  lastUpdated: Date
}
```

## Setup Instructions

### Step 1: Restart Backend Server

The routes are already integrated. Just restart:

```bash
cd farmer_ai-backend
# Stop current server (Ctrl+C)
npm start
```

### Step 2: Restart Frontend

```bash
cd farmer_ai-frontend
# Stop current server (Ctrl+C)
npm run dev
```

### Step 3: Access Feature Flags

1. Log in as an admin user
2. Navigate to Admin Dashboard
3. Click on "Feature Flags" in the sidebar
4. You should see the feature flags management interface

## API Endpoints

### Admin Endpoints (Protected)

```
GET    /api/admin/feature-flags              - List all flags
POST   /api/admin/feature-flags              - Create flag
GET    /api/admin/feature-flags/:id          - Get single flag
PUT    /api/admin/feature-flags/:id          - Update flag
PATCH  /api/admin/feature-flags/:id/toggle   - Toggle on/off
DELETE /api/admin/feature-flags/:id          - Delete flag
```

### Public Endpoint

```
GET    /api/feature-flags/check/:key         - Check if enabled
```

## Usage Guide

### Creating a Feature Flag

1. Click "Create Flag" button
2. Fill in the form:
   - **Flag Name**: Human-readable name (e.g., "AI Crop Predictions")
   - **Key**: Unique identifier (e.g., "ai_crop_predictions")
   - **Description**: What this flag controls
   - **Environment**: Where it applies (Production/Staging/Development/All)
   - **Default Status**: Enabled or Disabled
   - **Rollout Percentage**: 0-100% (for gradual rollout)
   - **Target Roles**: Optional role targeting
3. Click "Create Flag"

### Toggling a Feature

1. Find the flag in the table
2. Click the toggle button (ON/OFF)
3. Feature is immediately enabled/disabled
4. Success notification appears

### Editing a Feature Flag

1. Click the edit icon on any flag
2. Modify settings (key cannot be changed)
3. Click "Save Changes"

### Deleting a Feature Flag

1. Click the delete icon
2. Type "DELETE" to confirm
3. Flag is permanently removed

### Using Feature Flags in Code

#### Method 1: React Hook

```javascript
import { useFeatureFlag } from '../hooks/useFeatureFlag';

function MyComponent() {
    const { isEnabled, loading } = useFeatureFlag('ai_crop_predictions');

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            {isEnabled && <AICropPredictions />}
        </div>
    );
}
```

#### Method 2: Component Wrapper

```javascript
import { FeatureFlag } from '../hooks/useFeatureFlag';

function MyComponent() {
    return (
        <FeatureFlag 
            flagKey="vendor_marketplace"
            fallback={<div>Feature not available</div>}
        >
            <VendorMarketplace />
        </FeatureFlag>
    );
}
```

#### Method 3: API Call

```javascript
const checkFeature = async () => {
    const response = await api.get('/feature-flags/check/ai_crop_predictions');
    if (response.data.enabled) {
        // Show feature
    }
};
```

## Advanced Features

### 1. Gradual Rollout

Set rollout percentage to gradually enable features:

```
0%   - Disabled for everyone
25%  - Enabled for 25% of users
50%  - Enabled for 50% of users
100% - Enabled for everyone
```

The system uses a hash-based algorithm to ensure consistent user experience.

### 2. Role Targeting

Target specific user roles:

- Farmer
- Buyer
- Vendor
- Admin

Leave empty to target all roles.

### 3. Environment Targeting

Control where features are available:

- **Production** - Live environment
- **Staging** - Testing environment
- **Development** - Dev environment
- **All** - All environments

### 4. User Targeting

Target specific users by ID (advanced usage):

```javascript
// In backend
flag.targetUsers = [userId1, userId2];
await flag.save();
```

## Example Use Cases

### Use Case 1: New AI Feature

```javascript
// Create flag
{
  name: "AI Crop Predictions",
  key: "ai_crop_predictions",
  description: "Enables AI-powered crop yield predictions",
  isEnabled: true,
  environment: "production",
  rolloutPercentage: 25,  // Start with 25%
  targetRoles: ["farmer"]  // Only for farmers
}

// In code
<FeatureFlag flagKey="ai_crop_predictions">
  <AICropPredictionModule />
</FeatureFlag>
```

### Use Case 2: Beta Feature

```javascript
// Create flag
{
  name: "Vendor Marketplace Beta",
  key: "vendor_marketplace_beta",
  description: "New vendor marketplace interface",
  isEnabled: true,
  environment: "staging",
  rolloutPercentage: 100,
  targetRoles: ["vendor"]
}
```

### Use Case 3: Emergency Kill Switch

```javascript
// Quickly disable problematic feature
// Just toggle OFF in admin panel
// No code deployment needed!
```

## Security Features

1. **Admin-Only Access**
   - All management endpoints require admin authentication
   - Protected by `protect` and `adminOnly` middleware

2. **Audit Logging**
   - All flag operations logged to AdminAudit collection
   - Tracks who created/modified/deleted flags
   - Records before/after states

3. **Validation**
   - Unique key enforcement
   - Environment enum validation
   - Rollout percentage bounds (0-100)

## Monitoring & Analytics

### Check Flag Usage

```javascript
// In MongoDB
db.featureflags.find({ isEnabled: true })

// Check specific flag
db.featureflags.findOne({ key: "ai_crop_predictions" })
```

### Audit Trail

```javascript
// Check who modified flags
db.adminaudits.find({ 
  action: { $in: ['feature_flag_created', 'feature_flag_updated', 'feature_flag_toggled'] }
}).sort({ timestamp: -1 })
```

## Troubleshooting

### Issue: Flag not appearing in frontend
**Solution:**
1. Check backend is running
2. Verify admin authentication
3. Check browser console for API errors

### Issue: Feature not enabling
**Solution:**
1. Verify flag is enabled in admin panel
2. Check rollout percentage is > 0
3. Verify role targeting includes user's role
4. Check environment matches

### Issue: Cannot create flag
**Solution:**
1. Ensure key is unique
2. Use lowercase with underscores
3. Check all required fields are filled

## Best Practices

1. **Naming Convention**
   - Use descriptive names
   - Keys: lowercase_with_underscores
   - Example: `ai_crop_predictions`, `vendor_marketplace_v2`

2. **Gradual Rollout**
   - Start with low percentage (10-25%)
   - Monitor for issues
   - Gradually increase to 100%

3. **Environment Strategy**
   - Test in development first
   - Move to staging for QA
   - Finally enable in production

4. **Documentation**
   - Write clear descriptions
   - Document what the flag controls
   - Note any dependencies

5. **Cleanup**
   - Remove flags after full rollout
   - Don't accumulate unused flags
   - Keep the list manageable

## Integration Examples

### Example 1: Conditional Navigation

```javascript
function Navigation() {
    const { isEnabled: showNewDashboard } = useFeatureFlag('new_dashboard');

    return (
        <nav>
            {showNewDashboard ? (
                <Link to="/dashboard-v2">Dashboard</Link>
            ) : (
                <Link to="/dashboard">Dashboard</Link>
            )}
        </nav>
    );
}
```

### Example 2: Feature Module

```javascript
function FarmManagement() {
    const { isEnabled: aiEnabled } = useFeatureFlag('ai_recommendations');
    const { isEnabled: weatherEnabled } = useFeatureFlag('weather_alerts');

    return (
        <div>
            <FarmList />
            {aiEnabled && <AIRecommendations />}
            {weatherEnabled && <WeatherAlerts />}
        </div>
    );
}
```

### Example 3: API Endpoint Control

```javascript
// Backend route
router.get('/advanced-analytics', protect, async (req, res) => {
    const flag = await FeatureFlag.findOne({ key: 'advanced_analytics' });
    
    if (!flag || !flag.isEnabled) {
        return res.status(403).json({ message: 'Feature not available' });
    }

    // Proceed with advanced analytics
});
```

## Summary

The Feature Flags Management System is now fully functional and provides:

- ✅ Dynamic feature control without deployment
- ✅ Gradual rollout capabilities
- ✅ Role and environment targeting
- ✅ Admin interface for easy management
- ✅ React hooks for easy integration
- ✅ Audit logging for compliance
- ✅ Production-ready implementation

You can now control any feature in your application dynamically through the admin dashboard!
