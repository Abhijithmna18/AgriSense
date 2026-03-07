const VirtualCard = require('../models/VirtualCard');
const Notification = require('../models/Notification');

// @desc    Get user cards
// @route   GET /api/cards
// @access  Private
exports.getCards = async (req, res) => {
    try {
        const cards = await VirtualCard.find({ user: req.user._id });
        res.json({ success: true, data: cards });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create virtual card
// @route   POST /api/cards
// @access  Private
exports.createCard = async (req, res) => {
    try {
        const { network = 'rupay' } = req.body;
        const expiry = VirtualCard.generateExpiry();

        const card = await VirtualCard.create({
            user: req.user._id,
            cardNumber: VirtualCard.generateCardNumber(network),
            cardHolderName: req.user.name.toUpperCase(),
            expiryMonth: expiry.month,
            expiryYear: expiry.year,
            cvv: VirtualCard.generateCVV(),
            network
        });

        await Notification.createNotification({
            userId: req.user._id,
            type: 'system',
            title: 'Virtual Card Created',
            message: 'Your new virtual card is ready to use',
            priority: 'medium'
        });

        res.status(201).json({ success: true, data: card });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Toggle card freeze
// @route   PUT /api/cards/:id/freeze
// @access  Private
exports.toggleFreeze = async (req, res) => {
    try {
        const { reason } = req.body;
        let card = await VirtualCard.findById(req.params.id);

        if (!card || card.user.toString() !== req.user._id.toString()) {
            return res.status(404).json({ success: false, message: 'Card not found' });
        }

        card = await card.toggleFreeze(reason);

        await Notification.createNotification({
            userId: req.user._id,
            type: 'security_alert',
            title: card.isFrozen ? 'Card Frozen' : 'Card Unfrozen',
            message: `Your card ending in ${card.cardNumber.slice(-4)} has been ${card.isFrozen ? 'frozen' : 'unfrozen'}`,
            priority: 'high'
        });

        res.json({ success: true, data: card });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update card limits
// @route   PUT /api/cards/:id/limits
// @access  Private
exports.updateLimits = async (req, res) => {
    try {
        const { daily, monthly, perTransaction } = req.body;
        const card = await VirtualCard.findById(req.params.id);

        if (!card || card.user.toString() !== req.user._id.toString()) {
            return res.status(404).json({ success: false, message: 'Card not found' });
        }

        if (daily) card.limits.daily = daily;
        if (monthly) card.limits.monthly = monthly;
        if (perTransaction) card.limits.perTransaction = perTransaction;

        await card.save();
        res.json({ success: true, data: card });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get card with CVV
// @route   GET /api/cards/:id/details
// @access  Private
exports.getCardDetails = async (req, res) => {
    try {
        const card = await VirtualCard.findById(req.params.id).select('+cvv');

        if (!card || card.user.toString() !== req.user._id.toString()) {
            return res.status(404).json({ success: false, message: 'Card not found' });
        }

        res.json({ success: true, data: card });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
