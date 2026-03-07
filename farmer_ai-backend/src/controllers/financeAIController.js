const axios = require('axios');
const User = require('../models/User');
const Loan = require('../models/Loan');
const Transaction = require('../models/Transaction');
const Farm = require('../models/Farm');

const OLLAMA_API_URL = 'http://localhost:11434/api/chat';

// Strict System Prompt provided by the user (UPDATED V3 - Execution Engine)
const FINANCIAL_ENGINE_CONTROLLER_PROMPT = `
You are an AI Farm Financial Execution Engine.

Your task is to EXECUTE financial modules using user-provided data.
You are not allowed to display “Under Construction” if sufficient data exists.

“Under Construction” may ONLY be shown if:
- A required dataset is missing
- Or a computation is mathematically impossible with provided inputs

If data exists, you MUST compute results.

ACTIVE MODULES (EXECUTION REQUIRED)

Farm Finance:
- Revenue Tracking
- Expense Manager
- Profitability Analysis

Insurance & Risk:
- Crop Insurance
- Premium Calculator
- Claim Assistance

Financial Health:
- Health Assessment
- Credit & Eligibility (LIMITED EXECUTION)

GLOBAL EXECUTION RULES
1. If relevant data is present → RUN the module.
2. Do NOT label a module as under construction if calculations can be performed.
3. Do NOT refuse execution due to feature completeness.
4. Missing OPTIONAL data does NOT block execution.
5. Missing REQUIRED data must be listed explicitly.

MODULE-SPECIFIC EXECUTION LOGIC

REVENUE TRACKING
Required:
- At least one revenue entry (amount + date)

Execute:
- Total revenue
- Revenue by crop (if available)
- Revenue trend based on available dates

EXPENSE MANAGER
Required:
- At least one expense entry (amount + category)

Execute:
- Total expenses
- Category-wise breakdown
- Highest cost category

PROFITABILITY ANALYSIS
Required:
- Revenue data
- Expense data

Execute:
- Net profit or loss
- Profit margin
- Identify profit or loss state

INSURANCE & RISK

CROP INSURANCE
Required:
- Crop name
- Location
- Season
- Acreage

Execute:
- Eligibility determination
- Coverage type identification

PREMIUM CALCULATOR
Required:
- Acreage
- Coverage amount OR sum insured

Execute:
- Premium calculation
- Cost comparison (if multiple options exist)

CLAIM ASSISTANCE
Required:
- Active insurance policy
- Loss report

Execute:
- Claim eligibility
- Required documents
- Next steps

FINANCIAL HEALTH ASSESSMENT
Required:
- Revenue OR expense data

Execute:
- Cashflow status
- Debt impact (if loans exist)
- Financial health score (0–100)

CREDIT & ELIGIBILITY (LIMITED MODE)
Required:
- Revenue history (any length)

Execute:
- Revenue consistency check
- Expense discipline indicators

Restrictions:
- Do NOT approve or reject loans
- Do NOT estimate credit limits
- Clearly label output as “Monitoring Mode”

MANDATORY OUTPUT FORMAT (NO EXCEPTIONS)

Module:
Execution Status: Executed | Blocked
Data Used:
Calculations Performed:
Results:
Risks or Flags:
Missing Required Data (if any):
Next Recommended Action:

PROHIBITED BEHAVIOR
- Do NOT show “Under Construction” banners
- Do NOT defer execution when math is possible
- Do NOT output placeholders or demo text
- Do NOT explain system limitations unless execution is blocked

Your job is to turn available data into results.
If the math can be done, it must be done.
`;

// @desc    Get AI Financial Insight
// @route   POST /api/finance/ai-insight
// @access  Private
exports.getFinancialInsights = async (req, res) => {
    try {
        const userId = req.user._id;
        const { query, taskType } = req.body; // taskType: 'execution' (default) | 'pmfby_profile'

        // 1. Fetch Real Context Data
        const [user, farm, activeLoans, recentTransactions] = await Promise.all([
            User.findById(userId).select('name email location'),
            Farm.findOne({ user: userId }), // Assuming one farm per user for now
            Loan.find({ farmer: userId, status: 'active' }),
            Transaction.find({ user: userId }).sort({ date: -1 }).limit(20) // Last 20 txns
        ]);

        // 2. Prepare Data Context string
        const financialContext = {
            FarmerProfile: {
                Name: user.name,
                Location: user.location || "Not specified",
                LandSize: farm ? `${farm.totalArea} acres` : "Unknown",
                Crops: farm ? farm.crops : []
            },
            Loans: activeLoans.map(l => ({
                ID: l._id,
                Purpose: l.purpose,
                Amount: l.amount,
                Outstanding: l.amount - (l.repaidAmount || 0),
                InterestRate: `${l.interestRate}%`,
                EMI: l.emiAmount
            })),
            RecentTransactions: recentTransactions.map(t => ({
                Type: t.type,
                Amount: t.amount,
                Category: t.category,
                Date: t.date.toISOString().split('T')[0]
            })),
            // Mock Insurance Data (Since we don't have a model yet, we provide empty to test "Missing Data" behavior)
            InsuranceData: "No active insurance policies found in record.",
            LossReports: "No recent loss or damage reports found."
        };

        const contextString = JSON.stringify(financialContext, null, 2);

        // 3. Select Prompt & Construct Payload based on taskType
        let systemPrompt = FINANCIAL_ENGINE_CONTROLLER_PROMPT;
        let finalPrompt = "";

        if (taskType === 'pmfby_profile') {
            systemPrompt = `
You are filling a PMFBY Farmer Profile.

Rules you must follow strictly:

Do NOT invent or assume any data.

If a required field is missing, clearly mark it as “REQUIRED – NOT PROVIDED”.

Keep spelling exactly as given, especially names and bank details.

Output data in the same structure as the PMFBY registration form.

Use the following structure and fill only from the information I provide:

Scheme Context
State:
Scheme:
Season:
Year:

Farmer Personal Details
Full Name:
Passbook Name:
Relationship:
Relative Name:
Mobile Number:
Age:
Caste Category:
Gender:
Farmer Type:
Farmer Category:

Residential Details
State:
District:
Sub-District:
Village/Town:
Address:
PIN Code:

Farmer ID Details
ID Type:
ID Number:

Bank Account Details
IFSC Available (Yes/No):
IFSC Code:
Bank State:
Bank District:
Bank Name:
Branch Name:
Savings Account Number:
Confirm Account Number:

for the profile page registration of the farmer details
`;
            finalPrompt = `
USER_PROVIDED_DATA (Context):
${contextString}

USER_REQUEST (Specifics):
${query || "Fill the profile based on the available data."}

Fill the PMFBY Profile structure strictly.
`;
        } else {
            // Default Execution Engine
            const userQuery = query || "Perform an overall financial health assessment based on my current data.";
            finalPrompt = `
USER_REQUEST: ${userQuery}

AVAILABLE DATASETS:
${contextString}

Generate the response strictly following the MANDATORY OUTPUT FORMAT.
`;
        }

        // 4. Call Ollama
        const payload = {
            model: "llama3.1:8b", // Or the one available
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: finalPrompt }
            ],
            stream: false
        };

        // console.log("Sending to Ollama:", payload); // Debug

        const response = await axios.post(OLLAMA_API_URL, payload);
        let aiResponse = response.data?.message?.content || response.data?.response;

        if (!aiResponse) {
            throw new Error("Empty response from AI");
        }

        // 5. Send Response
        res.json({
            insight: aiResponse,
            contextUsed: true,
            taskType: taskType || 'execution'
        });

    } catch (error) {
        console.error("AI Finance Engine Error:", error.message);

        // Fallback with meaningful insights when AI is unavailable
        if (error.code === 'ECONNREFUSED' || error.response?.status === 503) {
            // Generate fallback insights based on available data
            const fallbackInsight = await generateFallbackInsight(userId);
            return res.json({
                insight: fallbackInsight,
                contextUsed: true,
                taskType: taskType || 'execution',
                fallback: true
            });
        }
        
        // For other errors, still provide basic insight
        const basicInsight = "Financial Health Assessment: Your financial data is being processed. Please ensure all your farm and loan information is up to date for accurate insights.";
        res.json({
            insight: basicInsight,
            contextUsed: false,
            taskType: taskType || 'execution',
            fallback: true
        });
    }
};

// Helper function to generate fallback insights
async function generateFallbackInsight(userId) {
    try {
        const [activeLoans, recentTransactions, farm] = await Promise.all([
            Loan.find({ farmer: userId, status: 'active' }),
            Transaction.find({ user: userId }).sort({ date: -1 }).limit(10),
            Farm.findOne({ user: userId })
        ]);

        const totalDebt = activeLoans.reduce((sum, loan) => sum + (loan.amount - (loan.repaidAmount || 0)), 0);
        const monthlyIncome = recentTransactions
            .filter(t => t.type === 'credit')
            .reduce((sum, t) => sum + t.amount, 0) / 3; // Average over 3 months
        const monthlyExpenses = recentTransactions
            .filter(t => t.type === 'debit')
            .reduce((sum, t) => sum + t.amount, 0) / 3;

        let insight = "📊 Financial Health Assessment\n\n";
        
        if (activeLoans.length > 0) {
            insight += `💰 Active Loans: ${activeLoans.length} loan(s) with total outstanding of ₹${totalDebt.toLocaleString('en-IN')}\n`;
            insight += `📈 Monthly EMI: ₹${activeLoans.reduce((sum, l) => sum + (l.emiAmount || 0), 0).toLocaleString('en-IN')}\n\n`;
        } else {
            insight += "✅ No active loans - Excellent debt-free status!\n\n";
        }

        if (farm) {
            insight += `🌾 Farm Size: ${farm.totalArea} acres\n`;
            insight += `🌱 Crops: ${farm.crops?.join(', ') || 'Not specified'}\n\n`;
        }

        if (monthlyIncome > 0) {
            const savingsRate = ((monthlyIncome - monthlyExpenses) / monthlyIncome * 100).toFixed(1);
            insight += `💵 Monthly Cash Flow:\n`;
            insight += `  Income: ₹${monthlyIncome.toLocaleString('en-IN')}\n`;
            insight += `  Expenses: ₹${monthlyExpenses.toLocaleString('en-IN')}\n`;
            insight += `  Savings Rate: ${savingsRate}%\n\n`;
        }

        // Recommendations
        insight += "💡 Recommendations:\n";
        if (totalDebt > monthlyIncome * 6) {
            insight += "• Consider debt consolidation to reduce interest burden\n";
        }
        if (!farm) {
            insight += "• Add your farm details for personalized crop recommendations\n";
        }
        if (activeLoans.length === 0 && monthlyIncome > 50000) {
            insight += "• Explore investment opportunities in agricultural equipment\n";
        }
        insight += "• Maintain emergency fund of 3-6 months expenses\n";

        return insight;
    } catch (err) {
        return "Financial Health Assessment: Your financial profile is being analyzed. Please ensure your farm and transaction data is up to date for detailed insights.";
    }
}
