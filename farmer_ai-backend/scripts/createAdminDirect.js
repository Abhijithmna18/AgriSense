const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const createAdminDirectly = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        const adminEmail = 'admin@agrisense.com';

        // Check if admin exists
        const User = mongoose.connection.collection('users');
        const existing = await User.findOne({ email: adminEmail });

        if (existing) {
            console.log('⚠️  Admin user already exists!');
            console.log('Email:', existing.email);
            console.log('Role:', existing.role);

            // Update to ensure it's an admin
            await User.updateOne(
                { email: adminEmail },
                { $set: { role: 'admin', isActive: true, isEmailVerified: true } }
            );
            console.log('\n✅ Updated existing user to admin role');
        } else {
            // Hash password manually
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('Admin@123', salt);

            // Insert directly without triggering hooks
            await User.insertOne({
                firstName: 'Admin',
                lastName: 'User',
                email: adminEmail,
                phone: '+1234567890',
                password: hashedPassword,
                role: 'admin',
                isActive: true,
                isEmailVerified: true,
                emailVerifiedAt: new Date(),
                provider: 'local',
                createdAt: new Date(),
                updatedAt: new Date()
            });

            console.log('✅ Admin user created successfully!');
        }

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 Email: admin@agrisense.com');
        console.log('🔑 Password: Admin@123');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\n📍 Login at: http://localhost:5173/login');
        console.log('📍 Then go to: http://localhost:5173/admin\n');

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        await mongoose.connection.close();
        process.exit(1);
    }
};

createAdminDirectly();
