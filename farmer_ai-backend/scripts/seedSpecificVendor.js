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

const createVendorUser = async () => {
    try {
        await connectDB();

        const vendorEmail = 'abhijithmnair2002@gmail.com';
        const vendorPassword = 'Abhi@1234';

        // Check if user already exists
        let user = await User.findOne({ email: vendorEmail });

        if (user) {
            console.log(`\nUser ${vendorEmail} already exists. Updating to approved vendor...`);

            // Update roles if needed
            if (!user.roles.includes('vendor')) {
                user.roles.push('vendor');
            }
            user.activeRole = 'vendor'; // Set active role to vendor

            // Update/Set Vendor Profile
            user.vendorProfile = {
                status: 'approved',
                businessName: 'Abhi Agro Services',
                vendorType: 'individual',
                approvalDate: new Date(),
                approvalRemarks: 'Manually seeded'
            };

            await user.save();
            console.log('✅ User updated to Approved Vendor.');

        } else {
            console.log(`\nCreating new vendor user ${vendorEmail}...`);

            user = new User({
                firstName: 'Abhijith',
                lastName: 'Nair',
                email: vendorEmail,
                phone: '9876543210',
                password: vendorPassword, // Password will be hashed by pre-save hook
                roles: ['vendor', 'farmer'], // Give both roles
                activeRole: 'vendor',
                role: 'vendor', // Fallback
                isActive: true,
                isEmailVerified: true,
                emailVerifiedAt: new Date(),
                provider: 'local',
                vendorProfile: {
                    status: 'approved', // Auto-approve
                    businessName: 'Abhi Agro Services',
                    vendorType: 'individual',
                    yearsOperation: 2,
                    productCategories: ['Tools & Equipment', 'Fertilizers'],
                    expectedSellingMethod: 'both',
                    deliverySupport: 'both',
                    addressLine: '123 Farm Road',
                    city: 'Kochi',
                    state: 'Kerala',
                    pinCode: '682001',
                    bankDetails: {
                        bankName: 'SBI',
                        accountNumber: '1234567890',
                        ifscCode: 'SBIN0001234',
                        upiId: 'abhi@sbi'
                    },
                    approvalDate: new Date(),
                    approvalRemarks: 'Seeded via script'
                }
            });

            await user.save();
            console.log('✅ New Vendor account created successfully!');
        }

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`📧 Email: ${vendorEmail}`);
        console.log(`🔑 Password: ${vendorPassword}`);
        console.log('✅ Status: Approved (Ready to Login)');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        await mongoose.connection.close();
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Error creating vendor user:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
};

createVendorUser();
