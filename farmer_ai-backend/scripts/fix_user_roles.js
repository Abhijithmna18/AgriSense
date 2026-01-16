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
 * Fix user role inconsistencies
 * This script ensures that activeRole is always present in the roles array
 * 
 * Options:
 * 1. Sync activeRole to roles (add activeRole to roles if missing)
 * 2. Reset to farmer (set both activeRole and roles to farmer)
 * 3. Make admin (add admin to roles and set as activeRole)
 */
const fixUserRoles = async () => {
    await connectDB();

    const email = 'abhijithmnair885@gmail.com'; // From user data

    try {
        const user = await User.findOne({ email });

        if (!user) {
            console.log(`❌ User not found: ${email}`);
            process.exit(1);
        }

        console.log('\n========================================');
        console.log('🔧 FIXING USER ROLE INCONSISTENCY');
        console.log('========================================\n');

        console.log('📊 BEFORE:');
        console.log(`   Roles: [${user.roles.join(', ')}]`);
        console.log(`   Active Role: ${user.activeRole}`);

        // Check if activeRole is in roles array
        const isConsistent = user.roles.includes(user.activeRole);

        if (isConsistent) {
            console.log('\n✅ Roles are already consistent. No changes needed.');
        } else {
            console.log('\n❌ Inconsistency detected!');
            console.log(`   activeRole "${user.activeRole}" is not in roles array [${user.roles.join(', ')}]`);

            // OPTION 1: Add activeRole to roles array (sync approach)
            console.log('\n🔄 Applying fix: Adding activeRole to roles array...');

            if (!user.roles.includes(user.activeRole)) {
                user.roles.push(user.activeRole);
            }

            // Save the changes
            await user.save();

            console.log('\n✅ FIXED!');
            console.log('📊 AFTER:');
            console.log(`   Roles: [${user.roles.join(', ')}]`);
            console.log(`   Active Role: ${user.activeRole}`);

            console.log('\n✨ User role consistency restored!');
            console.log(`   - User can now access the ${user.activeRole} dashboard`);
            console.log(`   - All role-based permissions are properly aligned`);
        }

        console.log('\n========================================\n');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        mongoose.connection.close();
        process.exit();
    }
};

fixUserRoles();
