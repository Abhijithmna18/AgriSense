/**
 * Seed Sample Farms for Weather Alerts Testing
 * Creates realistic farm data for Kerala districts
 * Usage: node scripts/seedFarms.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Farm = require('../src/models/Farm');
const User = require('../src/models/User');

const sampleFarms = [
    {
        name: 'Green Valley Organic Farm',
        totalArea: 5.5,
        landholdingType: 'Owner',
        irrigationType: 'Drip',
        location: {
            type: 'Point',
            coordinates: [76.2711, 9.9312], // Kochi, Ernakulam
            state: 'Kerala',
            district: 'Ernakulam',
            village: 'Kakkanad'
        },
        soilType: 'Loamy',
        soilTest: {
            n: 280,
            p: 45,
            k: 320,
            ph: 6.5
        },
        soilDataSource: 'Lab Tested',
        waterAvailability: 'High',
        waterReliability: 'Stable',
        hasPowerForIrrigation: true,
        cropHistory: [
            {
                cropName: 'Paddy',
                sowingDate: new Date('2025-06-15'),
                harvestDate: new Date('2025-10-20'),
                yieldActual: 4500,
                issues: []
            },
            {
                cropName: 'Vegetables (Mixed)',
                sowingDate: new Date('2025-11-01'),
                harvestDate: new Date('2026-01-15'),
                yieldActual: 3200,
                issues: []
            }
        ],
        dataReadinessScore: 85
    },
    {
        name: 'Spice Garden Estate',
        totalArea: 12.0,
        landholdingType: 'Owner',
        irrigationType: 'Sprinkler',
        location: {
            type: 'Point',
            coordinates: [77.0682, 11.4102], // Palakkad
            state: 'Kerala',
            district: 'Palakkad',
            village: 'Chittur'
        },
        soilType: 'Red',
        soilTest: {
            n: 240,
            p: 38,
            k: 280,
            ph: 6.2
        },
        soilDataSource: 'Lab Tested',
        waterAvailability: 'Medium',
        waterReliability: 'Stable',
        hasPowerForIrrigation: true,
        cropHistory: [
            {
                cropName: 'Pepper',
                sowingDate: new Date('2024-06-01'),
                harvestDate: new Date('2025-12-15'),
                yieldActual: 850,
                issues: []
            },
            {
                cropName: 'Cardamom',
                sowingDate: new Date('2024-07-01'),
                harvestDate: new Date('2025-11-30'),
                yieldActual: 420,
                issues: []
            }
        ],
        dataReadinessScore: 90
    },
    {
        name: 'Coconut Paradise Plantation',
        totalArea: 8.5,
        landholdingType: 'Owner',
        irrigationType: 'Rainfed',
        location: {
            type: 'Point',
            coordinates: [76.3388, 8.5241], // Thiruvananthapuram
            state: 'Kerala',
            district: 'Thiruvananthapuram',
            village: 'Neyyattinkara'
        },
        soilType: 'Sandy',
        soilTest: {
            n: 200,
            p: 32,
            k: 250,
            ph: 6.8
        },
        soilDataSource: 'Lab Tested',
        waterAvailability: 'Medium',
        waterReliability: 'Uncertain',
        hasPowerForIrrigation: false,
        cropHistory: [
            {
                cropName: 'Coconut',
                sowingDate: new Date('2020-01-01'),
                harvestDate: new Date('2025-12-31'),
                yieldActual: 12000,
                issues: []
            },
            {
                cropName: 'Banana',
                sowingDate: new Date('2025-03-01'),
                harvestDate: new Date('2025-11-15'),
                yieldActual: 5500,
                issues: []
            }
        ],
        dataReadinessScore: 75
    },
    {
        name: 'Highland Tea & Coffee Estate',
        totalArea: 15.0,
        landholdingType: 'Owner',
        irrigationType: 'Sprinkler',
        location: {
            type: 'Point',
            coordinates: [77.1025, 9.5916], // Idukki
            state: 'Kerala',
            district: 'Idukki',
            village: 'Munnar'
        },
        soilType: 'Loamy',
        soilTest: {
            n: 260,
            p: 42,
            k: 300,
            ph: 5.8
        },
        soilDataSource: 'Lab Tested',
        waterAvailability: 'High',
        waterReliability: 'Stable',
        hasPowerForIrrigation: true,
        cropHistory: [
            {
                cropName: 'Tea',
                sowingDate: new Date('2018-01-01'),
                harvestDate: new Date('2025-12-31'),
                yieldActual: 8500,
                issues: []
            },
            {
                cropName: 'Coffee',
                sowingDate: new Date('2019-01-01'),
                harvestDate: new Date('2025-11-30'),
                yieldActual: 3200,
                issues: []
            }
        ],
        dataReadinessScore: 92
    },
    {
        name: 'Rubber Plantation',
        totalArea: 10.0,
        landholdingType: 'Owner',
        irrigationType: 'Rainfed',
        location: {
            type: 'Point',
            coordinates: [76.6413, 9.3917], // Kottayam
            state: 'Kerala',
            district: 'Kottayam',
            village: 'Pala'
        },
        soilType: 'Clay',
        soilTest: {
            n: 220,
            p: 35,
            k: 270,
            ph: 6.0
        },
        soilDataSource: 'Estimated',
        waterAvailability: 'High',
        waterReliability: 'Stable',
        hasPowerForIrrigation: false,
        cropHistory: [
            {
                cropName: 'Rubber',
                sowingDate: new Date('2015-01-01'),
                harvestDate: new Date('2025-12-31'),
                yieldActual: 1800,
                issues: []
            }
        ],
        dataReadinessScore: 70
    },
    {
        name: 'Malabar Spice Farm',
        totalArea: 6.5,
        landholdingType: 'Tenant',
        irrigationType: 'Borewell',
        location: {
            type: 'Point',
            coordinates: [75.7804, 11.2588], // Kozhikode
            state: 'Kerala',
            district: 'Kozhikode',
            village: 'Vadakara'
        },
        soilType: 'Red',
        soilTest: {
            n: 250,
            p: 40,
            k: 290,
            ph: 6.3
        },
        soilDataSource: 'Lab Tested',
        waterAvailability: 'Medium',
        waterReliability: 'Stable',
        hasPowerForIrrigation: true,
        cropHistory: [
            {
                cropName: 'Turmeric',
                sowingDate: new Date('2025-05-01'),
                harvestDate: new Date('2026-01-15'),
                yieldActual: 4200,
                issues: []
            },
            {
                cropName: 'Ginger',
                sowingDate: new Date('2025-04-15'),
                harvestDate: new Date('2025-12-20'),
                yieldActual: 3800,
                issues: []
            }
        ],
        dataReadinessScore: 80
    },
    {
        name: 'Backwater Paddy Fields',
        totalArea: 4.0,
        landholdingType: 'Owner',
        irrigationType: 'Canal',
        location: {
            type: 'Point',
            coordinates: [76.3388, 9.4981], // Alappuzha
            state: 'Kerala',
            district: 'Alappuzha',
            village: 'Kuttanad'
        },
        soilType: 'Clay',
        soilTest: {
            n: 300,
            p: 48,
            k: 340,
            ph: 6.7
        },
        soilDataSource: 'Lab Tested',
        waterAvailability: 'High',
        waterReliability: 'Stable',
        hasPowerForIrrigation: false,
        cropHistory: [
            {
                cropName: 'Paddy (Pokkali)',
                sowingDate: new Date('2025-06-01'),
                harvestDate: new Date('2025-10-15'),
                yieldActual: 5200,
                issues: []
            },
            {
                cropName: 'Prawn Farming',
                sowingDate: new Date('2025-11-01'),
                harvestDate: new Date('2026-03-15'),
                yieldActual: 2800,
                issues: []
            }
        ],
        dataReadinessScore: 88
    },
    {
        name: 'Wayanad Coffee Estate',
        totalArea: 18.0,
        landholdingType: 'Owner',
        irrigationType: 'Drip',
        location: {
            type: 'Point',
            coordinates: [76.0856, 11.6854], // Wayanad
            state: 'Kerala',
            district: 'Wayanad',
            village: 'Kalpetta'
        },
        soilType: 'Loamy',
        soilTest: {
            n: 270,
            p: 44,
            k: 310,
            ph: 5.9
        },
        soilDataSource: 'Lab Tested',
        waterAvailability: 'High',
        waterReliability: 'Stable',
        hasPowerForIrrigation: true,
        cropHistory: [
            {
                cropName: 'Coffee (Arabica)',
                sowingDate: new Date('2017-01-01'),
                harvestDate: new Date('2025-12-31'),
                yieldActual: 4500,
                issues: []
            },
            {
                cropName: 'Pepper (Intercrop)',
                sowingDate: new Date('2018-01-01'),
                harvestDate: new Date('2025-11-30'),
                yieldActual: 650,
                issues: []
            }
        ],
        dataReadinessScore: 95
    }
];

const seedFarms = async () => {
    try {
        console.log('='.repeat(60));
        console.log('Farm Data Seeding Script');
        console.log('='.repeat(60));
        console.log('');

        // Connect to MongoDB
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✓ MongoDB connected');
        console.log('');

        // Find a farmer user to assign farms to
        console.log('Finding farmer user...');
        let farmer = await User.findOne({ roles: 'farmer' });
        
        if (!farmer) {
            console.log('No farmer user found. Creating a test farmer...');
            farmer = await User.create({
                firstName: 'Test',
                lastName: 'Farmer',
                email: 'testfarmer@agrisense.com',
                phone: '9876543210',
                password: 'password123',
                roles: ['farmer'],
                activeRole: 'farmer',
                isActive: true,
                provider: 'local',
                isEmailVerified: true
            });
            console.log('✓ Test farmer created:', farmer.email);
        } else {
            console.log('✓ Found farmer:', farmer.email);
        }
        console.log('');

        // Delete existing farms for this user (optional - for clean slate)
        console.log('Checking for existing farms...');
        const existingCount = await Farm.countDocuments({ user: farmer._id });
        if (existingCount > 0) {
            console.log(`Found ${existingCount} existing farms. Deleting...`);
            await Farm.deleteMany({ user: farmer._id });
            console.log('✓ Existing farms deleted');
        } else {
            console.log('No existing farms found');
        }
        console.log('');

        // Create sample farms
        console.log('Creating sample farms...');
        const farmsToCreate = sampleFarms.map(farm => ({
            ...farm,
            user: farmer._id
        }));

        const createdFarms = await Farm.insertMany(farmsToCreate);
        console.log(`✓ Created ${createdFarms.length} sample farms`);
        console.log('');

        // Display created farms
        console.log('='.repeat(60));
        console.log('Created Farms:');
        console.log('='.repeat(60));
        createdFarms.forEach((farm, index) => {
            console.log(`${index + 1}. ${farm.name}`);
            console.log(`   Location: ${farm.location.village}, ${farm.location.district}`);
            console.log(`   Area: ${farm.totalArea} acres`);
            console.log(`   Irrigation: ${farm.irrigationType}`);
            console.log(`   Soil: ${farm.soilType}`);
            console.log('');
        });

        console.log('='.repeat(60));
        console.log('Summary:');
        console.log('='.repeat(60));
        console.log(`Total Farms Created: ${createdFarms.length}`);
        console.log(`Assigned to User: ${farmer.email}`);
        console.log(`User ID: ${farmer._id}`);
        console.log('');
        console.log('✅ Farm seeding completed successfully!');
        console.log('');
        console.log('You can now:');
        console.log('1. Login with:', farmer.email);
        console.log('2. Navigate to Weather Alerts page');
        console.log('3. Select any farm to view weather data');
        console.log('');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('');
        console.error('='.repeat(60));
        console.error('ERROR: Farm seeding failed');
        console.error('='.repeat(60));
        console.error(error);
        
        await mongoose.disconnect();
        process.exit(1);
    }
};

seedFarms();
