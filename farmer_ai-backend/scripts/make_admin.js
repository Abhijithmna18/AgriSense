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

const makeAdmin = async () => {
    await connectDB();

    const email = 'abhijithn893@gmail.com';

    try {
        let user = await User.findOne({ email });

        if (!user) {
            console.log('User not found!');
            process.exit(1);
        }

        console.log(`Current user: ${user.email}`);
        console.log(`Current roles: ${user.roles}`);
        console.log(`Current activeRole: ${user.activeRole}`);

        // Add admin role if not present
        if (!user.roles.includes('admin')) {
            user.roles.push('admin');
        }

        // Set active role to admin
        user.activeRole = 'admin';

        await user.save();
        console.log('\n✓ User updated successfully!');
        console.log(`New roles: ${user.roles}`);
        console.log(`New activeRole: ${user.activeRole}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.connection.close();
        process.exit();
    }
};

makeAdmin();
