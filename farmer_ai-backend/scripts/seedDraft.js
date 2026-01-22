const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Loan = require('../src/models/Loan'); // Verify this path

const loanSchemes = [
    {
        title: "Kisan Credit Card (KCC)",
        provider: "SBI",
        type: "Operating Loan",
        interestRate: 7.0,
        maxAmount: 300000,
        tenureMonths: 12,
        description: "Short term credit for crops and maintenance.",
        eligibility: ["Land owner", "Active farmer"],
        documents: ["Land Tax Receipt", "Aadhar"]
    },
    {
        title: "Agri Gold Loan",
        provider: "HDFC Bank",
        type: "Gold Loan",
        interestRate: 8.5,
        maxAmount: 1000000,
        tenureMonths: 24,
        description: "Instant loan against gold ornaments for agri purposes.",
        eligibility: ["Indian Citizen", "Age > 18"],
        documents: ["Aadhar", "PAN"]
    },
    {
        title: "Farm Mechanization Loan",
        provider: "Nabard",
        type: "Equipment Loan",
        interestRate: 9.0,
        maxAmount: 5000000,
        tenureMonths: 60,
        description: "For purchasing tractors, harvesters etc.",
        eligibility: ["Min 2 acres land"],
        documents: ["Land Tax", "Quotations"]
    }
];

const seedFinancial = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // This is tricky because Loan model usually represents an *Application*, not a Scheme.
        // If there is no "Scheme" model, I cannot seed "Available Loans".
        // Checking Loan.js to see if it holds scheme definitions or user applications.
        console.log('Checking Loan Schema...');
    } catch (error) {
        console.error(error);
    }
};
// Not running yet, need to check Loan.js first.
