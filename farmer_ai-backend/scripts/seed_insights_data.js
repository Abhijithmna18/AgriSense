const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../src/models/User');
const Farm = require('../src/models/Farm');
const CropCycle = require('../src/models/CropCycle');

// Load env vars
dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');

        // 1. Get User (First one found)
        const user = await User.findOne({});
        if (!user) {
            console.log('No user found at all. Please register a user first.');
            process.exit(1);
        }
        console.log(`Using User: ${user.name} (${user._id})`);

        // 2. Get or Create Farm
        let farm = await Farm.findOne({ user: user._id });
        if (!farm) {
            console.log('Creating Test Farm...');
            farm = await Farm.create({
                user: user._id,
                name: "Green Valley Test Farm",
                totalArea: 5.5,
                landholdingType: "Owner",
                irrigationType: "Borewell",
                location: {
                    type: "Point",
                    coordinates: [77.2090, 28.6139], // New Delhi
                    state: "Delhi",
                    district: "New Delhi"
                },
                soilType: "Loamy",
                waterAvailability: "Medium"
            });
        }
        console.log(`Using Farm: ${farm.name} (${farm._id})`);

        // 3. Clear existing CropCycles for clean slate (Optional - uncomment if needed)
        // await CropCycle.deleteMany({ farm: farm._id });

        // 4. Create Completed Crop Cycles
        console.log('Creating Completed Crop Cycles...');

        // Cycle 1: Wheat (Last Season - Lower Yield)
        await CropCycle.create({
            farm: farm._id,
            cropName: "Wheat",
            sowingDate: new Date('2024-11-01'),
            expectedHarvestDate: new Date('2025-04-01'),
            actualHarvestDate: new Date('2025-04-10'),
            status: 'Completed',
            yieldActual: 4000,
            yieldPredicted: 4200,
            marketableQuantity: 3800,
            wastageQuantity: 200
        });

        // Cycle 2: Wheat (Recent Season - Higher Yield)
        await CropCycle.create({
            farm: farm._id,
            cropName: "Wheat",
            sowingDate: new Date('2025-11-01'),
            expectedHarvestDate: new Date('2026-04-01'),
            actualHarvestDate: new Date('2026-04-10'),
            status: 'Completed',
            yieldActual: 4500, // +12.5% increase
            yieldPredicted: 4600,
            marketableQuantity: 4400,
            wastageQuantity: 100
        });

        console.log('✨ Seed Data Created Successfully!');
        console.log('Refreshed Dashboard should now show:');
        console.log('-> Yield Trend: Increased by ~12%');

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedData();
