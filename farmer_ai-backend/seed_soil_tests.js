require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Farm = require('./src/models/Farm');
const SoilTest = require('./src/models/SoilTest');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/farmer_ai';

// Sample soil test data for different soil types
const soilTestTemplates = {
  'Loamy': {
    ph: 6.5,
    nitrogen: 280,
    phosphorus: 45,
    potassium: 220,
    organicCarbon: 0.75
  },
  'Red': {
    ph: 6.2,
    nitrogen: 240,
    phosphorus: 38,
    potassium: 200,
    organicCarbon: 0.65
  },
  'Sandy': {
    ph: 6.8,
    nitrogen: 200,
    phosphorus: 32,
    potassium: 180,
    organicCarbon: 0.55
  },
  'Clay': {
    ph: 7.0,
    nitrogen: 300,
    phosphorus: 48,
    potassium: 240,
    organicCarbon: 0.85
  },
  'Black': {
    ph: 7.2,
    nitrogen: 320,
    phosphorus: 52,
    potassium: 260,
    organicCarbon: 0.95
  },
  'Alluvial': {
    ph: 6.8,
    nitrogen: 290,
    phosphorus: 46,
    potassium: 230,
    organicCarbon: 0.80
  }
};

async function seedSoilTests() {
  try {
    console.log('🌱 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all farms
    const farms = await Farm.find();
    console.log(`📊 Found ${farms.length} farms`);

    let created = 0;
    let skipped = 0;

    for (const farm of farms) {
      // Check if soil test already exists
      const existingTest = await SoilTest.findOne({ farm: farm._id });
      
      if (existingTest) {
        console.log(`⏭️  Skipping ${farm.name} - soil test already exists`);
        skipped++;
        continue;
      }

      // Get template based on soil type
      const soilType = farm.soilType || 'Loamy';
      const template = soilTestTemplates[soilType] || soilTestTemplates['Loamy'];
      
      console.log(`   Using ${soilType} template for ${farm.name}`);

      // Add some variation to make it realistic
      const variation = () => 0.9 + Math.random() * 0.2; // 90% to 110%

      const soilTest = new SoilTest({
        user: farm.user,
        farm: farm._id,
        plotName: 'Main Field',
        testDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
        labName: 'AgriSense Lab',
        ph: parseFloat((template.ph * variation()).toFixed(1)),
        nitrogen: Math.round(template.nitrogen * variation()),
        phosphorus: Math.round(template.phosphorus * variation()),
        potassium: Math.round(template.potassium * variation()),
        organicCarbon: parseFloat((template.organicCarbon * variation()).toFixed(2)),
        sulfur: Math.round(15 + Math.random() * 10),
        zinc: parseFloat((2 + Math.random() * 3).toFixed(1)),
        boron: parseFloat((0.5 + Math.random() * 1).toFixed(1)),
        iron: parseFloat((10 + Math.random() * 15).toFixed(1)),
        manganese: parseFloat((5 + Math.random() * 10).toFixed(1)),
        copper: parseFloat((1 + Math.random() * 2).toFixed(1))
      });

      await soilTest.save();
      console.log(`✅ Created soil test for ${farm.name} (${soilType} soil)`);
      created++;
    }

    console.log('\n📊 Summary:');
    console.log(`   ✅ Created: ${created}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   📝 Total farms: ${farms.length}`);

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding soil tests:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the seeding
seedSoilTests();
