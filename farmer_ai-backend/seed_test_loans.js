/**
 * Seed Test Loans for Admin Loan Approval Queue
 * Run this script to create sample loan applications
 */

const mongoose = require('mongoose');
const Loan = require('./src/models/Loan');
const User = require('./src/models/User');
require('dotenv').config();

const seedLoans = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://abhijithmnair119:abhijithmnair119@cluster0.yqnezs2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
        console.log('✓ Connected to MongoDB');

        // Find a farmer user (or create one if needed)
        let farmer = await User.findOne({ role: 'farmer' });
        
        if (!farmer) {
            console.log('No farmer found, creating test farmer...');
            farmer = await User.create({
                name: 'Test Farmer',
                email: 'farmer@test.com',
                password: '$2a$10$YourHashedPasswordHere', // Pre-hashed password
                phone: '+919876543210',
                role: 'farmer',
                activeRole: 'farmer',
                roles: ['farmer'],
                isEmailVerified: true
            });
            console.log('✓ Test farmer created');
        }

        console.log(`Using farmer: ${farmer.name} (${farmer._id})`);

        // Clear existing test loans (optional)
        await Loan.deleteMany({ farmer: farmer._id });
        console.log('✓ Cleared existing test loans');

        // Create sample loan applications
        const sampleLoans = [
            {
                farmer: farmer._id,
                amount: 50000,
                purpose: 'Seeds & Fertilizers',
                tenureMonths: 12,
                interestRate: 10.5,
                emiAmount: 4400,
                status: 'applied',
                notes: 'Need funds for upcoming planting season'
            },
            {
                farmer: farmer._id,
                amount: 150000,
                purpose: 'Farm Equipment',
                tenureMonths: 24,
                interestRate: 11.0,
                emiAmount: 6950,
                status: 'applied',
                notes: 'Purchase new tractor for farm operations'
            },
            {
                farmer: farmer._id,
                amount: 75000,
                purpose: 'Irrigation Setup',
                tenureMonths: 18,
                interestRate: 10.0,
                emiAmount: 4500,
                status: 'review_pending',
                notes: 'Install drip irrigation system',
                riskAssessment: {
                    overallRiskScore: 35,
                    riskLevel: 'Low',
                    confidenceScore: 0.85
                }
            },
            {
                farmer: farmer._id,
                amount: 100000,
                purpose: 'Labor Payments',
                tenureMonths: 6,
                interestRate: 12.0,
                emiAmount: 17250,
                status: 'applied',
                notes: 'Seasonal labor costs for harvest'
            },
            {
                farmer: farmer._id,
                amount: 200000,
                purpose: 'Irrigation Infrastructure',
                tenureMonths: 36,
                interestRate: 9.5,
                emiAmount: 6400,
                status: 'applied',
                notes: 'Major irrigation infrastructure upgrade'
            }
        ];

        const createdLoans = await Loan.insertMany(sampleLoans);
        console.log(`✓ Created ${createdLoans.length} test loan applications`);

        // Display summary
        console.log('\n=== Test Loans Created ===');
        createdLoans.forEach((loan, index) => {
            console.log(`${index + 1}. ₹${loan.amount.toLocaleString()} - ${loan.purpose} (${loan.status})`);
        });

        console.log('\n✓ Seed completed successfully!');
        console.log('\nYou can now:');
        console.log('1. Login as admin');
        console.log('2. Navigate to /admin/loans');
        console.log('3. Review and approve/reject loan applications');

    } catch (error) {
        console.error('✗ Seed failed:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n✓ Database connection closed');
        process.exit(0);
    }
};

// Run the seed
seedLoans();
