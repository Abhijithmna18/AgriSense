const Bill = require('../models/Bill');
const FixedDeposit = require('../models/FixedDeposit');
const VirtualCard = require('../models/VirtualCard');
const Notification = require('../models/Notification');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const Ledger = require('../models/Ledger');

// Check for upcoming bill reminders
exports.checkBillReminders = async () => {
    try {
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

        const upcomingBills = await Bill.find({
            isPaid: false,
            dueDate: { $lte: threeDaysFromNow, $gte: new Date() },
            reminderSent: false
        }).populate('user');

        for (const bill of upcomingBills) {
            await Notification.createNotification({
                userId: bill.user._id,
                type: 'bill_due',
                title: 'Bill Due Soon',
                message: `Your ${bill.billType} bill of ₹${bill.amount} is due on ${bill.dueDate.toLocaleDateString()}`,
                priority: 'high',
                actionUrl: `/bills/${bill._id}`,
                actionLabel: 'Pay Now',
                metadata: { billId: bill._id, amount: bill.amount }
            });

            bill.reminderSent = true;
            bill.reminderDate = new Date();
            await bill.save();
        }

        console.log(`✅ Sent ${upcomingBills.length} bill reminders`);
    } catch (error) {
        console.error('❌ Error checking bill reminders:', error);
    }
};

// Reset daily transaction limits
exports.resetDailyLimits = async () => {
    try {
        await VirtualCard.resetDailyUsage();
        console.log('✅ Daily card limits reset');
    } catch (error) {
        console.error('❌ Error resetting daily limits:', error);
    }
};

// Check for FD maturity
exports.checkFDMaturity = async () => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const maturingFDs = await FixedDeposit.find({
            status: 'active',
            maturityDate: { $lte: today }
        }).populate('user');

        for (const fd of maturingFDs) {
            // Auto-credit maturity amount if not auto-renew
            if (!fd.autoRenew) {
                const wallet = await Wallet.findOne({ user: fd.user._id });

                // Create transaction
                const transaction = await Transaction.create({
                    transactionId: Transaction.generateTransactionId(),
                    type: 'deposit',
                    category: 'fd_maturity',
                    to: {
                        user: fd.user._id,
                        accountNumber: fd.user.accountNumber,
                        name: fd.user.name
                    },
                    amount: fd.maturityAmount,
                    status: 'completed',
                    description: `FD maturity - ${fd.fdNumber}`,
                    metadata: { fdId: fd._id },
                    completedAt: new Date()
                });

                // Update wallet
                await wallet.updateBalance(fd.maturityAmount, 'credit');

                // Update FD
                fd.status = 'matured';
                fd.maturityTransaction = transaction._id;
                await fd.save();

                // Create ledger entry
                await Ledger.createDoubleEntry({
                    toUser: fd.user._id,
                    amount: fd.maturityAmount,
                    transaction: transaction._id,
                    category: 'fd_maturity',
                    description: `FD maturity - ${fd.fdNumber}`,
                    reference: transaction.transactionId
                });

                // Send notification
                await Notification.createNotification({
                    userId: fd.user._id,
                    type: 'fd_maturity',
                    title: 'FD Matured',
                    message: `Your FD of ₹${fd.principalAmount} has matured. ₹${fd.maturityAmount} credited to wallet`,
                    priority: 'high',
                    metadata: { fdId: fd._id, amount: fd.maturityAmount }
                });
            }
        }

        console.log(`✅ Processed ${maturingFDs.length} maturing FDs`);
    } catch (error) {
        console.error('❌ Error checking FD maturity:', error);
    }
};

// Check for low balance
exports.checkLowBalance = async () => {
    try {
        const LOW_BALANCE_THRESHOLD = 1000;

        const lowBalanceWallets = await Wallet.find({
            balance: { $lt: LOW_BALANCE_THRESHOLD, $gt: 0 }
        }).populate('user');

        for (const wallet of lowBalanceWallets) {
            // Check if notification already sent today
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const existingNotification = await Notification.findOne({
                user: wallet.user._id,
                type: 'low_balance',
                createdAt: { $gte: today }
            });

            if (!existingNotification) {
                await Notification.createNotification({
                    userId: wallet.user._id,
                    type: 'low_balance',
                    title: 'Low Balance Alert',
                    message: `Your wallet balance is low: ₹${wallet.balance}`,
                    priority: 'medium',
                    actionUrl: '/wallet',
                    actionLabel: 'Add Money'
                });
            }
        }

        console.log(`✅ Sent ${lowBalanceWallets.length} low balance alerts`);
    } catch (error) {
        console.error('❌ Error checking low balance:', error);
    }
};
