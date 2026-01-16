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

/**
 * Reset user to farmer role
 * This script resets the user to have only the farmer role
 * Use this if you want to start fresh as a farmer
 */
const resetToFarmer = async () => {
    await connectDB();

    const email = 'abhijithmnair885@gmail.com';

    try {
        const user = await User.findOne({ email });

        if (!user) {
            console.log(`❌ User not found: ${email}`);
            process.exit(1);
        }

        console.log('\n========================================');
        console.log('🔄 RESETTING USER TO FARMER ROLE');
        console.log('========================================\n');

        console.log('📊 BEFORE:');
        console.log(`   Roles: [${user.roles.join(', ')}]`);
        console.log(`   Active Role: ${user.activeRole}`);

        // Reset to farmer
        user.roles = ['farmer'];
        user.activeRole = 'farmer';

        await user.save();

        console.log('\n✅ RESET COMPLETE!');
        console.log('📊 AFTER:');
        console.log(`   Roles: [${user.roles.join(', ')}]`);
        console.log(`   Active Role: ${user.activeRole}`);

        console.log('\n✨ User has been reset to farmer role!');
        console.log('   - You can now access the farmer dashboard');
        console.log('   - All admin privileges have been removed');

        console.log('\n========================================\n');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        mongoose.connection.close();
        process.exit();
    }
};

resetToFarmer();
