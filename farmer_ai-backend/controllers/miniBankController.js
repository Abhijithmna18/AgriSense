const miniBankService = require('../services/miniBankService');

/**
 * Mini Bank Controller
 * Handles all Mini Bank API requests within Financial Suite
 */

// ==================== WALLET ENDPOINTS ====================

exports.getWalletBalance = async (req, res) => {
    try {
        const userId = req.user._id;
        const walletData = await miniBankService.getWalletBalance(userId);
        res.json({ success: true, data: walletData });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateWalletBalance = async (req, res) => {
    try {
        const userId = req.user._id;
        const { amount, type } = req.body;
        
        const wallet = await miniBankService.updateWalletBalance(userId, amount, type);
        res.json({ success: true, data: wallet });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==================== TRANSACTION ENDPOINTS ====================

exports.sendMoney = async (req, res) => {
    try {
        const senderId = req.user._id;
        const { receiverId, amount, description } = req.body;
        
        const transaction = await miniBankService.sendMoney(senderId, receiverId, amount, description);
        res.json({ success: true, data: transaction });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.requestPayment = async (req, res) => {
    try {
        const fromUserId = req.user._id;
        const { toUserId, amount, description } = req.body;
        
        const result = await miniBankService.requestPayment(fromUserId, toUserId, amount, description);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.processQRPayment = async (req, res) => {
    try {
        const userId = req.user._id;
        const { qrData } = req.body;
        
        const transaction = await miniBankService.processQRPayment(userId, qrData);
        res.json({ success: true, data: transaction });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.getRecentTransactions = async (req, res) => {
    try {
        const userId = req.user._id;
        const limit = parseInt(req.query.limit) || 5;
        
        const transactions = await miniBankService.getRecentTransactions(userId, limit);
        res.json({ success: true, data: transactions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==================== BILL ENDPOINTS ====================

exports.getUpcomingBills = async (req, res) => {
    try {
        const userId = req.user._id;
        const bills = await miniBankService.getUpcomingBills(userId);
        res.json({ success: true, data: bills });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.payBill = async (req, res) => {
    try {
        const userId = req.user._id;
        const { billId } = req.body;
        
        const result = await miniBankService.payBill(userId, billId);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// ==================== SAVINGS GOAL ENDPOINTS ====================

exports.getSavingsGoals = async (req, res) => {
    try {
        const userId = req.user._id;
        const goals = await miniBankService.getSavingsGoals(userId);
        res.json({ success: true, data: goals });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createSavingsGoal = async (req, res) => {
    try {
        const userId = req.user._id;
        const goalData = req.body;
        
        const goal = await miniBankService.createSavingsGoal(userId, goalData);
        res.json({ success: true, data: goal });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.updateSavingsGoal = async (req, res) => {
    try {
        console.log('=== Savings Contribution Request ===');
        console.log('User ID:', req.user?._id);
        console.log('Request body:', req.body);
        
        const userId = req.user._id;
        const { goalId, contribution } = req.body;
        
        // Validate input
        if (!goalId) {
            console.log('Error: Goal ID is missing');
            return res.status(400).json({ success: false, message: 'Goal ID is required' });
        }
        
        if (!contribution || contribution <= 0) {
            console.log('Error: Invalid contribution amount:', contribution);
            return res.status(400).json({ success: false, message: 'Valid contribution amount is required' });
        }
        
        console.log('Calling service with:', { userId, goalId, contribution });
        const goal = await miniBankService.updateSavingsGoal(userId, goalId, contribution);
        console.log('Goal updated successfully:', goal);
        
        res.json({ success: true, data: goal });
    } catch (error) {
        console.error('Update savings goal error:', error.message);
        res.status(400).json({ success: false, message: error.message });
    }
};

// ==================== FIXED DEPOSIT ENDPOINTS ====================

exports.getActiveFDs = async (req, res) => {
    try {
        const userId = req.user._id;
        const fds = await miniBankService.getActiveFDs(userId);
        res.json({ success: true, data: fds });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createFixedDeposit = async (req, res) => {
    try {
        const userId = req.user._id;
        const fdData = req.body;
        
        const fd = await miniBankService.createFixedDeposit(userId, fdData);
        res.json({ success: true, data: fd });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.calculateFDInterest = async (req, res) => {
    try {
        const { principal, rate, duration } = req.query;
        
        const result = await miniBankService.calculateFDInterest(
            parseFloat(principal),
            parseFloat(rate),
            parseInt(duration)
        );
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// ==================== VIRTUAL CARD ENDPOINTS ====================

exports.getVirtualCard = async (req, res) => {
    try {
        const userId = req.user._id;
        const card = await miniBankService.getVirtualCard(userId);
        res.json({ success: true, data: card });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.generateVirtualCard = async (req, res) => {
    try {
        const userId = req.user._id;
        const card = await miniBankService.generateVirtualCard(userId);
        res.json({ success: true, data: card });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.freezeCard = async (req, res) => {
    try {
        const userId = req.user._id;
        const { cardId } = req.body;
        
        const card = await miniBankService.freezeCard(userId, cardId);
        res.json({ success: true, data: card });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.setCardLimit = async (req, res) => {
    try {
        const userId = req.user._id;
        const { cardId, limit } = req.body;
        
        const card = await miniBankService.setCardLimit(userId, cardId, limit);
        res.json({ success: true, data: card });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// ==================== AI RECOMMENDATIONS ====================

exports.getFDRecommendations = async (req, res) => {
    try {
        console.log('FD AI Recommendations requested by user:', req.user?._id);
        const userId = req.user._id;
        
        // Get user's financial data
        const [wallet, transactions, existingFDs] = await Promise.all([
            miniBankService.getWalletBalance(userId),
            miniBankService.getRecentTransactions(userId, 20),
            miniBankService.getActiveFDs(userId)
        ]);

        console.log('Financial data loaded:', {
            balance: wallet.balance,
            transactionCount: transactions.length,
            existingFDsCount: existingFDs.length
        });

        // Calculate financial metrics
        const totalIncome = transactions
            .filter(t => t.type === 'credit')
            .reduce((sum, t) => sum + (t.amount || 0), 0);
        
        const totalExpenses = transactions
            .filter(t => t.type === 'debit')
            .reduce((sum, t) => sum + (t.amount || 0), 0);
        
        const avgMonthlyIncome = totalIncome / 3;
        const avgMonthlyExpenses = totalExpenses / 3;
        const surplusAmount = Math.max(0, wallet.balance - (avgMonthlyExpenses * 3)); // Keep 3 months emergency

        console.log('Calculated metrics:', {
            surplusAmount,
            avgMonthlyIncome,
            avgMonthlyExpenses
        });

        // Generate AI recommendations using Ollama
        const aiRecommendations = await generateFDRecommendations({
            balance: wallet.balance,
            surplusAmount,
            monthlyIncome: avgMonthlyIncome,
            monthlyExpenses: avgMonthlyExpenses,
            existingFDs: existingFDs.length
        });

        const responseData = {
            recommendedAmount: aiRecommendations.amount || Math.round(surplusAmount * 0.5),
            recommendedDuration: aiRecommendations.duration || 12,
            projectedReturns: aiRecommendations.returns || Math.round(surplusAmount * 0.5 * 0.075),
            reasoning: aiRecommendations.reasoning || `Based on your balance of ₹${wallet.balance.toLocaleString('en-IN')}, investing ₹${Math.round(surplusAmount * 0.5).toLocaleString('en-IN')} in FD is recommended while maintaining emergency funds.`
        };

        console.log('Sending FD AI recommendations:', responseData);

        res.json({
            success: true,
            data: responseData
        });
    } catch (error) {
        console.error('FD AI Recommendations Error:', error);
        // Fallback recommendations
        const fallbackData = {
            recommendedAmount: 50000,
            recommendedDuration: 12,
            projectedReturns: 3750,
            reasoning: 'Based on typical farming income patterns, a 1-year FD of ₹50,000 provides good returns while maintaining liquidity.'
        };
        console.log('Sending fallback FD recommendations:', fallbackData);
        res.json({
            success: true,
            data: fallbackData
        });
    }
};

exports.getSavingsAIRecommendations = async (req, res) => {
    try {
        console.log('AI Recommendations requested by user:', req.user?._id);
        const userId = req.user._id;
        
        // Get user's financial data
        const [wallet, transactions, goals] = await Promise.all([
            miniBankService.getWalletBalance(userId),
            miniBankService.getRecentTransactions(userId, 20),
            miniBankService.getSavingsGoals(userId)
        ]);

        console.log('Financial data loaded:', {
            balance: wallet.balance,
            transactionCount: transactions.length,
            goalsCount: goals.length
        });

        // Calculate financial metrics
        const totalIncome = transactions
            .filter(t => t.type === 'credit')
            .reduce((sum, t) => sum + (t.amount || 0), 0);
        
        const totalExpenses = transactions
            .filter(t => t.type === 'debit')
            .reduce((sum, t) => sum + (t.amount || 0), 0);
        
        const avgMonthlyIncome = totalIncome / 3; // Assuming last 3 months
        const avgMonthlyExpenses = totalExpenses / 3;
        const monthlySavingCapacity = Math.max(0, avgMonthlyIncome - avgMonthlyExpenses);

        console.log('Calculated metrics:', {
            monthlySavingCapacity,
            avgMonthlyIncome,
            avgMonthlyExpenses
        });

        // Generate AI recommendations using Ollama
        const aiRecommendations = await generateSavingsRecommendations({
            balance: wallet.balance,
            monthlyIncome: avgMonthlyIncome,
            monthlyExpenses: avgMonthlyExpenses,
            savingCapacity: monthlySavingCapacity,
            existingGoals: goals.length
        });

        const responseData = {
            monthlySavingCapacity: Math.round(monthlySavingCapacity),
            recommendedTimeline: aiRecommendations.timeline || '12 months',
            suggestedGoals: aiRecommendations.goals || [
                { name: 'EmergencyFund', amount: Math.round(avgMonthlyExpenses * 6), reason: 'Build 6-month emergency fund' },
                { name: 'FarmEquipment', amount: 100000, reason: 'Upgrade farming equipment' }
            ]
        };

        console.log('Sending AI recommendations:', responseData);

        res.json({
            success: true,
            data: responseData
        });
    } catch (error) {
        console.error('AI Recommendations Error:', error);
        // Fallback recommendations
        const fallbackData = {
            monthlySavingCapacity: 5000,
            recommendedTimeline: '12 months',
            suggestedGoals: [
                { name: 'EmergencyFund', amount: 50000, reason: 'Build financial safety net' },
                { name: 'FarmEquipment', amount: 100000, reason: 'Upgrade farming tools' },
                { name: 'SeedStock', amount: 30000, reason: 'Quality seeds for next season' }
            ]
        };
        console.log('Sending fallback recommendations:', fallbackData);
        res.json({
            success: true,
            data: fallbackData
        });
    }
};

// Helper function for FD AI recommendations
async function generateFDRecommendations(financialData) {
    try {
        const axios = require('axios');
        const OLLAMA_API_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434/api/chat';

        const prompt = `Based on the following financial data, recommend a Fixed Deposit investment for a farmer:

Balance: ₹${financialData.balance}
Surplus Amount (after emergency fund): ₹${financialData.surplusAmount}
Monthly Income: ₹${financialData.monthlyIncome.toFixed(2)}
Monthly Expenses: ₹${financialData.monthlyExpenses.toFixed(2)}
Existing FDs: ${financialData.existingFDs}

Provide recommendation in this exact JSON format:
{
  "amount": 50000,
  "duration": 12,
  "returns": 3750,
  "reasoning": "Brief explanation under 100 characters"
}

Rules:
- Amount should be realistic (minimum ₹1000, maximum 70% of surplus)
- Duration in months: 6, 12, 24, 36, or 60
- Calculate returns using simple interest (6.5% for 6mo, 7.5% for 12mo, 8% for 24mo, 8.5% for 36mo, 9% for 60mo)
- Keep reasoning concise and practical`;

        const response = await axios.post(OLLAMA_API_URL, {
            model: 'llama3.1:8b',
            messages: [
                { role: 'system', content: 'You are a financial advisor for farmers. Provide practical FD investment recommendations.' },
                { role: 'user', content: prompt }
            ],
            stream: false
        }, { timeout: 10000 });

        const aiResponse = response.data?.message?.content || response.data?.response;
        
        // Try to parse JSON from response
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        
        throw new Error('Invalid AI response format');
    } catch (error) {
        console.error('Ollama AI Error:', error.message);
        // Return fallback
        const recommendedAmount = Math.min(Math.round(financialData.surplusAmount * 0.5), 100000);
        const duration = 12;
        const rate = 7.5;
        const returns = Math.round((recommendedAmount * rate * duration) / (12 * 100));
        
        return {
            amount: recommendedAmount,
            duration: duration,
            returns: returns,
            reasoning: `Invest ${Math.round(financialData.surplusAmount * 0.5 / financialData.surplusAmount * 100)}% of surplus for balanced growth and liquidity`
        };
    }
}

// Helper function for AI recommendations
async function generateSavingsRecommendations(financialData) {
    try {
        const axios = require('axios');
        const OLLAMA_API_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434/api/chat';

        const prompt = `Based on the following financial data, suggest 3 realistic savings goals for a farmer:

Balance: ₹${financialData.balance}
Monthly Income: ₹${financialData.monthlyIncome.toFixed(2)}
Monthly Expenses: ₹${financialData.monthlyExpenses.toFixed(2)}
Monthly Saving Capacity: ₹${financialData.savingCapacity.toFixed(2)}
Existing Goals: ${financialData.existingGoals}

Provide recommendations in this exact JSON format:
{
  "timeline": "X months",
  "goals": [
    {"name": "GoalName", "amount": 50000, "reason": "Brief reason"},
    {"name": "GoalName2", "amount": 100000, "reason": "Brief reason"}
  ]
}

Rules:
- Goal names must be single words or camelCase (no spaces)
- Amounts should be realistic based on saving capacity
- Focus on agricultural/farming needs
- Keep reasons under 50 characters`;

        const response = await axios.post(OLLAMA_API_URL, {
            model: 'llama3.1:8b',
            messages: [
                { role: 'system', content: 'You are a financial advisor for farmers. Provide practical savings recommendations.' },
                { role: 'user', content: prompt }
            ],
            stream: false
        }, { timeout: 10000 });

        const aiResponse = response.data?.message?.content || response.data?.response;
        
        // Try to parse JSON from response
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        
        throw new Error('Invalid AI response format');
    } catch (error) {
        console.error('Ollama AI Error:', error.message);
        // Return fallback
        return {
            timeline: '12 months',
            goals: [
                { name: 'EmergencyFund', amount: Math.round(financialData.savingCapacity * 10), reason: 'Build emergency fund' },
                { name: 'FarmEquipment', amount: Math.round(financialData.savingCapacity * 20), reason: 'Upgrade equipment' },
                { name: 'SeedStock', amount: Math.round(financialData.savingCapacity * 8), reason: 'Quality seeds for next season' }
            ]
        };
    }
}
