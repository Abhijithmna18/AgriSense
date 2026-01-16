const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars from parent directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Import User model
const User = require('../src/models/User');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    }
};

const createAdminUser = async () => {
    try {
        await connectDB();

        const adminEmail = 'admin@agrisense.com';

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log('\nFound existing admin user. Checking roles...');

            let needsSave = false;

            // Ensure 'admin' is in roles array
            if (!existingAdmin.roles.includes('admin')) {
                console.log('Adding "admin" to roles...');
                existingAdmin.roles.push('admin');
                needsSave = true;
            }

            // Ensure activeRole is 'admin'
            if (existingAdmin.activeRole !== 'admin') {
                console.log(`Updating activeRole from "${existingAdmin.activeRole}" to "admin"...`);
                existingAdmin.activeRole = 'admin';
                needsSave = true;
            }

            if (needsSave) {
                await existingAdmin.save();
                console.log('✅ Admin user roles updated successfully!');
            } else {
                console.log('✅ Admin user roles are already correct.');
            }

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('📧 Email: admin@agrisense.com');
            console.log('🔑 Password: Admin@123 (if unchanged)');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
            await mongoose.connection.close();
            process.exit(0);
        }

        // Create new admin user
        const adminUser = new User({
            firstName: 'Admin',
            lastName: 'User',
            email: adminEmail,
            phone: '+1234567890',
            password: 'Admin@123',
            role: 'admin',
            isActive: true,
            isEmailVerified: true,
            emailVerifiedAt: new Date(),
            provider: 'local'
        });

        await adminUser.save();

        console.log('\n✅ Admin user created successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 Email: admin@agrisense.com');
        console.log('🔑 Password: Admin@123');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\n📍 How to access Admin Dashboard:');
        console.log('1. Open: http://localhost:5173/login');
        console.log('2. Login with credentials above');
        console.log('3. Navigate to: http://localhost:5173/admin\n');

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error creating admin user:');
        console.error('Message:', error.message);

        if (error.errors) {
            console.error('\nValidation Errors:');
            Object.keys(error.errors).forEach(key => {
                console.error(`  - ${key}: ${error.errors[key].message}`);
            });
        }

        await mongoose.connection.close();
        process.exit(1);
    }
};

createAdminUser();
