const axios = require('axios');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require('./src/models/User');
const Farm = require('./src/models/Farm');

async function testPestPrediction() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        // 1. Get a user
        let user = await User.findOne({ role: 'farmer' });
        if (!user) {
            console.log('No farmer user found. Creating a test user...');
            user = await User.create({
                firstName: "Test",
                lastName: "Farmer",
                email: `testfarmer_${Date.now()}@example.com`,
                password: "password123",
                role: 'farmer',
                phone: "1234567890",
                isEmailVerified: true
            });
        }
        console.log(`Testing with user: ${user.email} (${user._id})`);

        // 2. Generate Token
        // payload must match what auth middleware expects (userId)
        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: '30d'
        });

        // 3. Get a farm for this user
        let farm = await Farm.findOne({ user: user._id });
        if (!farm) {
            console.log('No farm found for user. Creating a mock farm...');
            farm = await Farm.create({
                user: user._id,
                name: "Test Farm",
                location: {
                    type: "Point",
                    coordinates: [76.5222, 9.5916], // [long, lat]
                    district: "Kottayam",
                    state: "Kerala"
                },
                irrigationType: "Rainfed", // Added required field
                totalArea: 5,
                unit: "acres",
                soilType: "Loamy" // Changed to valid enum
            });
        }
        console.log(`Using farm: ${farm.name} (${farm._id})`);

        // 4. Make API Request
        const payload = {
            farmId: farm._id,
            crop: "Rice",
            cropStage: "Vegetative",
            daysSinceSowing: 45,
            weatherData: {
                current: {
                    temperature: 28,
                    humidity: 80,
                    rainfall: 5,
                    wind: 12
                }
            }
        };

        console.log('Sending request to API...');
        const response = await axios.post('http://localhost:5002/api/pest-prediction/analyze', payload, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('\n--- API RESPONSE ---');
        console.log(JSON.stringify(response.data, null, 2));

        // 5. Verify Structure
        const data = response.data;
        if (data.zone && data.crop && data.prediction_window && Array.isArray(data.pest_risks)) {
            console.log('\n✅ Structure Verification PASSED');

            // Check pesticide constraint
            const pesticideViolation = data.pest_risks.some(pest =>
                pest.risk_percent <= 60 && pest.preventive_actions.some(a => a.type === 'chemical')
            );

            if (pesticideViolation) {
                console.error('❌ FAILED: Found chemical action for risk <= 60%');
            } else {
                console.log('✅ Pesticide Constraint PASSED');
            }

        } else {
            console.error('❌ Structure Verification FAILED');
        }

    } catch (error) {
        console.error('Error during test:', error.message);
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
        }
    } finally {
        await mongoose.disconnect();
    }
}

testPestPrediction();
