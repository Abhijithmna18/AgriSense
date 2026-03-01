# Farm Data Seeding Guide

## Purpose

This script creates sample farm data for testing the Weather Alerts page and other farm-related features. It generates 8 realistic farms across different Kerala districts with proper location coordinates, soil data, and crop history.

## Quick Start

### Run the Script

```bash
cd farmer_ai-backend
node scripts/seedFarms.js
```

## What It Creates

### 8 Sample Farms

1. **Green Valley Organic Farm** (Ernakulam, Kochi)
   - 5.5 acres, Drip irrigation
   - Crops: Paddy, Vegetables
   - Loamy soil, High water availability

2. **Spice Garden Estate** (Palakkad)
   - 12.0 acres, Sprinkler irrigation
   - Crops: Pepper, Cardamom
   - Red soil, Medium water availability

3. **Coconut Paradise Plantation** (Thiruvananthapuram)
   - 8.5 acres, Rainfed
   - Crops: Coconut, Banana
   - Sandy soil, Coastal area

4. **Highland Tea & Coffee Estate** (Idukki, Munnar)
   - 15.0 acres, Sprinkler irrigation
   - Crops: Tea, Coffee
   - Loamy soil, Highland region

5. **Rubber Plantation** (Kottayam)
   - 10.0 acres, Rainfed
   - Crops: Rubber
   - Clay soil, Midland area

6. **Malabar Spice Farm** (Kozhikode)
   - 6.5 acres, Borewell irrigation
   - Crops: Turmeric, Ginger
   - Red soil, Tenant farm

7. **Backwater Paddy Fields** (Alappuzha, Kuttanad)
   - 4.0 acres, Canal irrigation
   - Crops: Pokkali Paddy, Prawn farming
   - Clay soil, Backwater region

8. **Wayanad Coffee Estate** (Wayanad)
   - 18.0 acres, Drip irrigation
   - Crops: Arabica Coffee, Pepper
   - Loamy soil, Highland region

## Features

### Realistic Data
- ✅ Actual Kerala district coordinates
- ✅ Appropriate soil types for each region
- ✅ Lab-tested soil parameters (N, P, K, pH)
- ✅ Region-specific crops
- ✅ Realistic irrigation methods
- ✅ Crop history with dates and yields

### Geographic Coverage
- **Coastal**: Thiruvananthapuram, Alappuzha, Kozhikode
- **Midland**: Ernakulam, Kottayam, Palakkad
- **Highland**: Idukki, Wayanad

### Crop Diversity
- Paddy (including Pokkali variety)
- Coconut
- Rubber
- Pepper
- Cardamom
- Tea
- Coffee
- Turmeric
- Ginger
- Banana
- Vegetables

## Script Behavior

### 1. User Creation
If no farmer user exists, creates:
- Email: `testfarmer@agrisense.com`
- Password: `password123`
- Role: Farmer

### 2. Clean Slate (Optional)
- Checks for existing farms for the user
- Deletes them if found
- Ensures fresh data

### 3. Farm Creation
- Creates all 8 farms
- Assigns to the farmer user
- Sets proper coordinates and metadata

### 4. Output
Displays:
- Connection status
- User information
- Created farms list
- Summary statistics
- Login instructions

## Expected Output

```
============================================================
Farm Data Seeding Script
============================================================

Connecting to MongoDB...
✓ MongoDB connected

Finding farmer user...
✓ Found farmer: testfarmer@agrisense.com

Checking for existing farms...
No existing farms found

Creating sample farms...
✓ Created 8 sample farms

============================================================
Created Farms:
============================================================
1. Green Valley Organic Farm
   Location: Kakkanad, Ernakulam
   Area: 5.5 acres
   Irrigation: Drip
   Soil: Loamy

2. Spice Garden Estate
   Location: Chittur, Palakkad
   Area: 12 acres
   Irrigation: Sprinkler
   Soil: Red

... (and so on)

============================================================
Summary:
============================================================
Total Farms Created: 8
Assigned to User: testfarmer@agrisense.com
User ID: 507f1f77bcf86cd799439011

✅ Farm seeding completed successfully!

You can now:
1. Login with: testfarmer@agrisense.com
2. Navigate to Weather Alerts page
3. Select any farm to view weather data
```

## Testing the Weather Alerts Page

### Step 1: Run the Script
```bash
node scripts/seedFarms.js
```

### Step 2: Login
- Email: `testfarmer@agrisense.com`
- Password: `password123`

### Step 3: Navigate
Go to: **Dashboard → Weather Alerts**

### Step 4: Test
- Select different farms from dropdown
- View weather for different Kerala districts
- See location-specific weather data
- Test forecast functionality

## Troubleshooting

### Error: "No farmer user found" and creation fails
**Solution:** Check if User model exists and MongoDB connection is working.

### Error: "Duplicate key error"
**Solution:** The script tries to delete existing farms first. If this fails, manually delete farms:
```javascript
// In MongoDB shell
db.farms.deleteMany({ user: ObjectId("USER_ID") })
```

### Error: "Connection timeout"
**Solution:** Check MongoDB connection string in `.env` file:
```env
MONGO_URI=mongodb://localhost:27017/farmer_ai
# or
MONGODB_URI=mongodb+srv://...
```

### Farms not showing in UI
**Solution:** 
1. Check if user is logged in
2. Verify farms were created: `db.farms.find()`
3. Check browser console for API errors
4. Verify `/api/farms` endpoint is working

## Customization

### Add More Farms
Edit `sampleFarms` array in `seedFarms.js`:

```javascript
const sampleFarms = [
    // ... existing farms
    {
        name: 'Your New Farm',
        totalArea: 10.0,
        location: {
            coordinates: [longitude, latitude],
            state: 'Kerala',
            district: 'YourDistrict',
            village: 'YourVillage'
        },
        // ... other properties
    }
];
```

### Change User
Modify the user finding logic:

```javascript
let farmer = await User.findOne({ email: 'your@email.com' });
```

### Keep Existing Farms
Comment out the deletion section:

```javascript
// if (existingCount > 0) {
//     await Farm.deleteMany({ user: farmer._id });
// }
```

## Coordinates Reference

### Kerala District Coordinates
```javascript
Thiruvananthapuram: [76.9366, 8.5241]
Kollam: [76.6141, 8.8932]
Pathanamthitta: [76.7870, 9.2648]
Alappuzha: [76.3388, 9.4981]
Kottayam: [76.5222, 9.5916]
Idukki: [77.1025, 9.9186]
Ernakulam: [76.2711, 9.9312]
Thrissur: [76.2144, 10.5276]
Palakkad: [76.6547, 10.7867]
Malappuram: [76.0742, 11.0510]
Kozhikode: [75.7804, 11.2588]
Wayanad: [76.0856, 11.6854]
Kannur: [75.3704, 11.8745]
Kasaragod: [75.0047, 12.4996]
```

## Database Schema

### Farm Model Fields
```javascript
{
  user: ObjectId,              // Reference to User
  name: String,                // Farm name
  totalArea: Number,           // In acres
  landholdingType: String,     // Owner/Tenant
  irrigationType: String,      // Drip/Sprinkler/Canal/etc
  location: {
    type: 'Point',
    coordinates: [lon, lat],   // GeoJSON format
    state: String,
    district: String,
    village: String
  },
  soilType: String,            // Sandy/Loamy/Clay/etc
  soilTest: {
    n: Number,                 // Nitrogen
    p: Number,                 // Phosphorus
    k: Number,                 // Potassium
    ph: Number                 // pH level
  },
  soilDataSource: String,      // Lab Tested/Estimated
  waterAvailability: String,   // Low/Medium/High
  waterReliability: String,    // Stable/Uncertain
  hasPowerForIrrigation: Boolean,
  cropHistory: [{
    cropName: String,
    sowingDate: Date,
    harvestDate: Date,
    yieldActual: Number,
    issues: [String]
  }],
  dataReadinessScore: Number   // 0-100
}
```

## Integration with Weather Alerts

Once farms are seeded:

1. **Farm Selector**: Dropdown shows all 8 farms
2. **Location Data**: Used to fetch weather for specific coordinates
3. **District Display**: Shows in weather alerts
4. **Crop Context**: Can be used for crop-specific advisories
5. **Soil Data**: Can influence irrigation recommendations

## Cleanup

### Delete All Seeded Farms
```bash
# In MongoDB shell
use farmer_ai
db.farms.deleteMany({ user: ObjectId("USER_ID") })
```

### Delete Test User
```bash
db.users.deleteOne({ email: "testfarmer@agrisense.com" })
```

## Production Considerations

### Before Production
- [ ] Remove or secure test user credentials
- [ ] Add proper authentication checks
- [ ] Implement farm ownership verification
- [ ] Add data validation
- [ ] Set up proper error handling
- [ ] Add logging for farm operations

### Security
- Don't commit test credentials
- Use environment variables for sensitive data
- Implement proper access controls
- Validate all user inputs

## Next Steps

After seeding farms:

1. ✅ Test Weather Alerts page
2. ✅ Verify farm selector works
3. ✅ Check weather data displays correctly
4. ✅ Test with different districts
5. ✅ Verify Kerala alert system works
6. ✅ Test responsive design
7. ✅ Check forecast functionality

## Support

If you encounter issues:
1. Check MongoDB connection
2. Verify User model exists
3. Check Farm model schema
4. Review console output
5. Check database directly

---

**Status:** ✅ Ready to Use  
**Farms Created:** 8  
**Districts Covered:** 8  
**Test User:** testfarmer@agrisense.com  
**Password:** password123
