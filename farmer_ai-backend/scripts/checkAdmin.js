const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../src/models/User');

const checkAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB\n');

        const admin = await User.findOne({ email: 'admin@agrisense.com' });

        if (!admin) {
            console.log('❌ Admin user NOT found in database');
            console.log('Run: node scripts/seedAdmin.js (after restarting server)');
        } else {
            console.log('✅ Admin user found!');
            console.log('Details:');
            console.log('  Email:', admin.email);
            console.log('  Role:', admin.role);
            console.log('  Active:', admin.isActive);
            console.log('  Email Verified:', admin.isEmailVerified);
            console.log('  Provider:', admin.provider);
            console.log('  Has Password:', !!admin.password);
        }

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

checkAdmin();
