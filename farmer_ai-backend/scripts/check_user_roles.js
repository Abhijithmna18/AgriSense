require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('Connection Error:', err);
        process.exit(1);
    }
};

const checkUserRoles = async () => {
    await connectDB();

    const email = 'abhijithmnair885@gmail.com'; // From user data

    try {
        const user = await User.findOne({ email });

        if (!user) {
            console.log(`❌ User not found: ${email}`);
            process.exit(1);
        }

        console.log('\n========================================');
        console.log('📊 CURRENT USER STATE');
        console.log('========================================\n');

        console.log(`👤 Name: ${user.firstName} ${user.lastName}`);
        console.log(`📧 Email: ${user.email}`);
        console.log(`📱 Phone: ${user.phone}`);
        console.log(`🔐 Provider: ${user.provider}`);
        console.log(`✅ Email Verified: ${user.isEmailVerified}`);
        console.log(`🟢 Active: ${user.isActive}`);

        console.log('\n--- ROLE INFORMATION ---');
        console.log(`🎭 Roles Array: [${user.roles.join(', ')}]`);
        console.log(`⭐ Active Role: ${user.activeRole}`);

        console.log('\n--- ROLE CONSISTENCY CHECK ---');

        // Check if activeRole is in roles array
        const isConsistent = user.roles.includes(user.activeRole);

        if (isConsistent) {
            console.log('✅ CONSISTENT: activeRole is present in roles array');
        } else {
            console.log('❌ INCONSISTENT: activeRole is NOT in roles array!');
            console.log(`   - activeRole: "${user.activeRole}"`);
            console.log(`   - roles: [${user.roles.join(', ')}]`);
            console.log('\n⚠️  This mismatch will cause authorization issues!');
        }

        console.log('\n--- TIMESTAMPS ---');
        console.log(`📅 Created: ${user.createdAt}`);
        console.log(`🔄 Updated: ${user.updatedAt}`);
        if (user.emailVerifiedAt) {
            console.log(`✉️  Email Verified At: ${user.emailVerifiedAt}`);
        }

        console.log('\n========================================\n');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        mongoose.connection.close();
        process.exit();
    }
};

checkUserRoles();
