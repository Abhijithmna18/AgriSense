const mongoose = require('mongoose');
const User = require('./src/models/User');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('Connection Error:', error);
        process.exit(1);
    }
};

const debugUser = async () => {
    await connectDB();

    try {
        const userId = '692f02f5792d8a93d156d81b'; // ID from user report
        const user = await User.findById(userId);

        if (!user) {
            console.log('User not found!');
        } else {
            console.log('User Data:', JSON.stringify(user.toJSON(), null, 2));
            console.log('Provider:', user.provider);
            console.log('Phone:', user.phone);
            console.log('Is phone required?', user.provider === 'local');

            if (!user.phone && user.provider === 'local') {
                console.log('Fixing missing phone for local user...');
                user.phone = '0000000000';
                await user.save();
                console.log('User updated with dummy phone.');
            }

            // Try to validate without saving
            try {
                await user.validate();
                console.log('Validation successful!');
            } catch (valError) {
                console.error('Validation Failed:', JSON.stringify(valError.errors, null, 2));
            }
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.disconnect();
    }
};

debugUser();
