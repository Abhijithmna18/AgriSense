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

const setupBuyer = async () => {
    await connectDB();

    const email = 'abhijithn893@gmail.com';
    const password = 'buyer@123';
    const firstName = 'Abhijith';
    const lastName = 'Buyer';

    try {
        let user = await User.findOne({ email });

        if (user) {
            console.log(`User found: ${user.email}`);

            // Update password
            user.password = password; // Will be hashed by pre-save hook

            // Ensure buyer role exists
            if (!user.roles.includes('buyer')) {
                user.roles.push('buyer');
            }

            // Set active role to buyer
            user.activeRole = 'buyer';

            await user.save();
            console.log('User updated successfully with new password and buyer role.');
        } else {
            console.log('User not found. Creating new buyer...');

            user = new User({
                firstName,
                lastName,
                email,
                password,
                roles: ['buyer', 'farmer'], // Give both for flexibility
                activeRole: 'buyer',
                phone: '9999999999', // Mock phone
                isEmailVerified: true
            });

            await user.save();
            console.log('New buyer created successfully.');
        }

    } catch (error) {
        console.error('Error setting up buyer:', error);
    } finally {
        mongoose.connection.close();
        process.exit();
    }
};

setupBuyer();
