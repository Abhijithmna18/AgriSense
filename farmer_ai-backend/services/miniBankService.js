/**
 * Mini Bank Service
 * Business logic for mini banking operations
 */

// Mock data for demonstration
const mockWallets = new Map();
const mockTransactions = [];
const mockBills = [];
const mockSavingsGoals = [];
const mockFixedDeposits = [];
const mockCards = new Map();

// ==================== WALLET SERVICES ====================

exports.getWalletBalance = async (userId) => {
    if (!mockWallets.has(userId.toString())) {
        mockWallets.set(userId.toString(), {
            userId,
            balance: 0,
            accountNumber: `ACC${Math.floor(Math.random() * 1000000000)}`,
            ifscCode: 'AGRI0001234'
        });
    }
    return mockWallets.get(userId.toString());
};

exports.updateWalletBalance = async (userId, amount, type) => {
    const wallet = await exports.getWalletBalance(userId);
    
    if (type === 'credit') {
        wallet.balance += parseFloat(amount);
    } else if (type === 'debit') {
        if (wallet.balance < parseFloat(amount)) {
            throw new Error('Insufficient balance');
        }
        wallet.balance -= parseFloat(amount);
    }
    
    mockWallets.set(userId.toString(), wallet);
    return wallet;
};

// ==================== TRANSACTION SERVICES ====================

exports.sendMoney = async (senderId, receiverId, amount, description) => {
    const senderWallet = await exports.getWalletBalance(senderId);
    
    if (senderWallet.balance < parseFloat(amount)) {
        throw new Error('Insufficient balance');
    }
    
    // Deduct from sender
    await exports.updateWalletBalance(senderId, amount, 'debit');
    
    // Add to receiver
    await exports.updateWalletBalance(receiverId, amount, 'credit');
    
    const transaction = {
        id: Date.now(),
        senderId,
        receiverId,
        amount: parseFloat(amount),
        description,
        type: 'transfer',
        status: 'completed',
        date: new Date().toISOString()
    };
    
    mockTransactions.push(transaction);
    return transaction;
};

exports.requestPayment = async (fromUserId, toUserId, amount, description) => {
    const request = {
        id: Date.now(),
        fromUserId,
        toUserId,
        amount: parseFloat(amount),
        description,
        status: 'pending',
        date: new Date().toISOString()
    };
    
    return request;
};

exports.processQRPayment = async (userId, qrData) => {
    // Parse QR data and process payment
    const transaction = {
        id: Date.now(),
        userId,
        qrData,
        status: 'completed',
        date: new Date().toISOString()
    };
    
    mockTransactions.push(transaction);
    return transaction;
};

exports.getRecentTransactions = async (userId, limit = 5) => {
    return mockTransactions
        .filter(tx => tx.senderId?.toString() === userId.toString() || tx.receiverId?.toString() === userId.toString())
        .slice(-limit)
        .reverse();
};

// ==================== BILL SERVICES ====================

exports.getUpcomingBills = async (userId) => {
    return mockBills.filter(bill => bill.userId?.toString() === userId.toString() && bill.status === 'pending');
};

exports.payBill = async (userId, billId) => {
    const bill = mockBills.find(b => b.id === billId && b.userId?.toString() === userId.toString());
    
    if (!bill) {
        throw new Error('Bill not found');
    }
    
    await exports.updateWalletBalance(userId, bill.amount, 'debit');
    
    bill.status = 'paid';
    bill.paidDate = new Date().toISOString();
    
    return bill;
};

// ==================== SAVINGS GOAL SERVICES ====================

exports.getSavingsGoals = async (userId) => {
    return mockSavingsGoals.filter(goal => goal.userId?.toString() === userId.toString());
};

exports.createSavingsGoal = async (userId, goalData) => {
    const goal = {
        id: Date.now(),
        userId,
        name: goalData.name,
        targetAmount: goalData.targetAmount,
        currentAmount: goalData.currentAmount || 0,
        deadline: goalData.deadline,
        category: goalData.category || 'general',
        createdAt: new Date().toISOString()
    };
    
    mockSavingsGoals.push(goal);
    return goal;
};

exports.updateSavingsGoal = async (userId, goalId, contribution) => {
    console.log('=== Service: updateSavingsGoal ===');
    console.log('Input:', { userId, goalId, contribution, goalIdType: typeof goalId });
    
    // Convert goalId to number if it's a string
    const numericGoalId = typeof goalId === 'string' ? parseInt(goalId) : goalId;
    console.log('Numeric Goal ID:', numericGoalId);
    
    console.log('Available goals:', mockSavingsGoals.map(g => ({ id: g.id, userId: g.userId, name: g.name })));
    
    const goal = mockSavingsGoals.find(g => g.id === numericGoalId && g.userId?.toString() === userId.toString());
    
    if (!goal) {
        console.log('Goal not found! Looking for:', { numericGoalId, userId: userId.toString() });
        throw new Error('Savings goal not found');
    }
    
    console.log('Goal found:', goal);
    
    // Validate contribution
    if (!contribution || contribution <= 0) {
        console.log('Invalid contribution amount');
        throw new Error('Invalid contribution amount');
    }
    
    // Deduct from wallet
    console.log('Deducting from wallet:', contribution);
    await exports.updateWalletBalance(userId, contribution, 'debit');
    
    // Add to goal
    const oldAmount = goal.currentAmount;
    goal.currentAmount += parseFloat(contribution);
    goal.updatedAt = new Date().toISOString();
    
    console.log('Goal updated:', { oldAmount, newAmount: goal.currentAmount });
    
    return goal;
};

// ==================== FIXED DEPOSIT SERVICES ====================

exports.getActiveFDs = async (userId) => {
    return mockFixedDeposits.filter(fd => fd.userId?.toString() === userId.toString() && fd.status === 'active');
};

exports.createFixedDeposit = async (userId, fdData) => {
    await exports.updateWalletBalance(userId, fdData.amount, 'debit');
    
    const fd = {
        id: Date.now(),
        userId,
        ...fdData,
        status: 'active',
        createdAt: new Date().toISOString(),
        maturityDate: new Date(Date.now() + fdData.duration * 30 * 24 * 60 * 60 * 1000).toISOString()
    };
    
    mockFixedDeposits.push(fd);
    return fd;
};

exports.calculateFDInterest = async (principal, rate, duration) => {
    const interest = (principal * rate * duration) / (12 * 100);
    const maturityAmount = principal + interest;
    
    return {
        principal,
        rate,
        duration,
        interest,
        maturityAmount
    };
};

// ==================== VIRTUAL CARD SERVICES ====================

exports.getVirtualCard = async (userId) => {
    const card = mockCards.get(userId.toString());
    return card || null;
};

exports.generateVirtualCard = async (userId) => {
    // Check if card already exists
    if (mockCards.has(userId.toString())) {
        throw new Error('Virtual card already exists for this user');
    }
    
    const card = {
        id: Date.now(),
        userId,
        cardNumber: `${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
        holderName: 'AGRISENSE USER',
        expiryDate: (() => {
            const date = new Date();
            date.setFullYear(date.getFullYear() + 3);
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = String(date.getFullYear()).slice(-2);
            return `${month}/${year}`;
        })(),
        cvv: Math.floor(100 + Math.random() * 900),
        status: 'active',
        limit: 50000,
        createdAt: new Date().toISOString()
    };
    
    mockCards.set(userId.toString(), card);
    return card;
};

exports.freezeCard = async (userId, cardId) => {
    const card = mockCards.get(userId.toString());
    
    if (!card || card.id !== cardId) {
        throw new Error('Card not found');
    }
    
    card.status = card.status === 'frozen' ? 'active' : 'frozen';
    card.updatedAt = new Date().toISOString();
    
    mockCards.set(userId.toString(), card);
    return card;
};

exports.setCardLimit = async (userId, cardId, limit) => {
    const card = mockCards.get(userId.toString());
    
    if (!card || card.id !== cardId) {
        throw new Error('Card not found');
    }
    
    card.limit = parseFloat(limit);
    card.updatedAt = new Date().toISOString();
    
    mockCards.set(userId.toString(), card);
    return card;
};
