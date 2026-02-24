const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const auth = require('../middleware/auth').protect;
const { body, validationResult, param } = require('express-validator');
const Negotiation = require('../models/Negotiation');
const Offer = require('../models/Offer');
const Message = require('../models/Message');
const Product = require('../models/MarketplaceListing');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const llmService = require('../utils/llmService');
const aiProcurementController = require('../controllers/aiProcurementController');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../uploads/negotiations');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images, PDFs, and documents are allowed.'));
        }
    }
});

// Business rules configuration
const BUSINESS_RULES = {
    MAX_PRICE_REDUCTION: 50, // 50% max reduction
    MAX_QUANTITY_INCREASE: 500, // 500% max increase
    MAX_NEGOTIATION_ROUNDS: 5,
    OFFER_EXPIRY_DAYS: 7,
    AUTO_EXPIRE_HOURS: 24 * 7 // 7 days
};

// @route   POST /api/negotiations/auto-rfq/preview
// @desc    Preview Auto-generated Bulk RFQs via AI
// @access  Private (Buyer)
router.post('/auto-rfq/preview', auth, aiProcurementController.previewAutoRFQ);

// @route   POST /api/negotiations/auto-rfq/confirm
// @desc    Confirm and dispatch Auto-generated Bulk RFQs
// @access  Private (Buyer)
router.post('/auto-rfq/confirm', auth, aiProcurementController.confirmAutoRFQ);

// @route   POST /api/negotiations
// @desc    Create new negotiation
// @access  Private (Buyer)
router.post('/', [
    auth,
    body('productId').notEmpty().withMessage('Product ID is required'),
    body('vendorId').notEmpty().withMessage('Vendor ID is required'),
    body('initialTerms.price').isFloat({ min: 0 }).withMessage('Valid price is required'),
    body('initialTerms.quantity').isInt({ min: 1 }).withMessage('Valid quantity is required')
], async (req, res) => {
    console.log('[CREATE NEGOTIATION] Route hit');
    console.log('[CREATE NEGOTIATION] User:', req.user ? req.user._id : 'No user');
    console.log('[CREATE NEGOTIATION] Body:', req.body);

    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('[CREATE NEGOTIATION] Validation errors:', errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        const { productId, vendorId, initialTerms, type = 'buyer_initiated' } = req.body;

        // Extract vendor ID if it's an object
        const actualVendorId = typeof vendorId === 'object' ? vendorId._id : vendorId;
        console.log('[CREATE NEGOTIATION] Actual vendor ID:', actualVendorId);

        // Verify product exists
        console.log('[CREATE NEGOTIATION] Looking for product:', productId);
        const product = await Product.findById(productId);
        if (!product) {
            console.log('[CREATE NEGOTIATION] Product not found');
            return res.status(404).json({ message: 'Product not found' });
        }
        console.log('[CREATE NEGOTIATION] Product found:', product.name);

        // Verify vendor exists
        console.log('[CREATE NEGOTIATION] Looking for vendor:', actualVendorId);
        const vendor = await User.findById(actualVendorId);
        if (!vendor || !vendor.roles.includes('vendor')) {
            console.log('[CREATE NEGOTIATION] Vendor not found or not a vendor');
            return res.status(404).json({ message: 'Vendor not found' });
        }
        console.log('[CREATE NEGOTIATION] Vendor found:', vendor.firstName);

        // Check for existing active negotiation
        const existingNegotiation = await Negotiation.findOne({
            buyerId: req.user._id || req.user.id,
            vendorId: actualVendorId,
            productId,
            status: 'pending'
        });

        if (existingNegotiation) {
            return res.status(400).json({
                message: 'Active negotiation already exists for this product with this vendor'
            });
        }

        // Create negotiation
        const negotiation = new Negotiation({
            buyerId: req.user._id || req.user.id,
            vendorId: actualVendorId,
            productId,
            type,
            baseline: {
                price: product.pricePerUnit,
                quantity: product.originalQuantity || 1,
                deliveryDays: 7, // Default delivery days
                qualityGrade: 'Standard',
                paymentTerms: 'Net 30',
                incoterms: null
            },
            status: 'pending',
            currentRound: 1,
            maxRounds: BUSINESS_RULES.MAX_NEGOTIATION_ROUNDS,
            expiresAt: new Date(Date.now() + BUSINESS_RULES.AUTO_EXPIRE_HOURS * 60 * 60 * 1000),
            createdAt: new Date(),
            updatedAt: new Date()
        });

        await negotiation.save();

        // Create initial offer if provided
        if (initialTerms) {
            const offer = new Offer({
                negotiationId: negotiation._id,
                type: 'buyer_offer',
                price: initialTerms.price,
                quantity: initialTerms.quantity,
                deliveryDate: initialTerms.deliveryDate,
                qualityRequirements: initialTerms.qualityRequirements,
                packaging: initialTerms.packaging,
                customization: initialTerms.customization,
                message: initialTerms.message,
                status: 'pending',
                submittedBy: req.user._id || req.user.id,
                timestamp: new Date()
            });

            await offer.save();
            negotiation.currentRound = 2; // Next round for vendor response
            await negotiation.save();
        }

        // Populate response
        const populatedNegotiation = await Negotiation.findById(negotiation._id)
            .populate('productId', 'name variety pricePerUnit originalQuantity quantity unit images')
            .populate('vendorId', 'name email businessName')
            .populate('buyerId', 'name email');

        res.status(201).json({
            message: 'Negotiation created successfully',
            negotiation: populatedNegotiation
        });

    } catch (error) {
        console.error('Error creating negotiation:', error);
        console.error('Error stack:', error.stack);
        console.error('Request body:', req.body);
        console.error('User:', req.user);
        res.status(500).json({
            message: 'Server error creating negotiation',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// @route   GET /api/negotiations/buyer
// @desc    Get buyer's negotiations  
// @access  Private (Buyer)
router.get('/buyer', auth, async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        let query = { buyerId: req.user.id };
        if (status) {
            query.status = status;
        }

        const negotiations = await Negotiation.find(query)
            .populate('productId', 'name variety pricePerUnit quantity unit images')
            .populate('vendorId', 'name email businessName')
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Negotiation.countDocuments(query);

        // Get offers for each negotiation
        const negotiationsWithOffers = await Promise.all(
            negotiations.map(async (neg) => {
                const offers = await Offer.find({ negotiationId: neg._id })
                    .sort({ timestamp: -1 });
                return {
                    ...neg.toObject(),
                    offers,
                    product: neg.productId,
                    vendor: neg.vendorId,
                    productName: neg.productId?.name,
                    vendorName: neg.vendorId?.name
                };
            })
        );

        res.json({
            negotiations: negotiationsWithOffers,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Error fetching buyer negotiations:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/negotiations/vendor
// @desc    Get vendor's negotiations  
// @access  Private (Vendor)
router.get('/vendor', auth, async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        let query = { vendorId: req.user.id };
        if (status) {
            query.status = status;
        }

        const negotiations = await Negotiation.find(query)
            .populate('productId', 'name variety pricePerUnit quantity unit images')
            .populate('buyerId', 'name email')
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Negotiation.countDocuments(query);

        // Get offers for each negotiation
        const negotiationsWithOffers = await Promise.all(
            negotiations.map(async (neg) => {
                const offers = await Offer.find({ negotiationId: neg._id })
                    .sort({ timestamp: -1 });
                return {
                    ...neg.toObject(),
                    offers,
                    product: neg.productId,
                    buyer: neg.buyerId,
                    productName: neg.productId?.name,
                    buyerName: neg.buyerId?.name
                };
            })
        );

        res.json({
            negotiations: negotiationsWithOffers,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Error fetching vendor negotiations:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/negotiations/:id
// @desc    Get negotiation details
// @access  Private (Buyer/Vendor)
router.get('/:id', [
    auth,
    param('id').isMongoId().withMessage('Invalid negotiation ID')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const negotiation = await Negotiation.findById(req.params.id)
            .populate('productId', 'name variety pricePerUnit originalQuantity quantity unit images description')
            .populate('vendorId', 'name email businessName')
            .populate('buyerId', 'name email');

        if (!negotiation) {
            return res.status(404).json({ message: 'Negotiation not found' });
        }

        // Check access permissions
        if (negotiation.buyerId._id.toString() !== req.user.id &&
            negotiation.vendorId._id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Get offers with messages
        const offers = await Offer.find({ negotiationId: req.params.id })
            .sort({ timestamp: -1 })
            .lean();

        // Get messages for each offer
        for (let offer of offers) {
            const messages = await Message.find({ offerId: offer._id })
                .populate('senderId', 'name')
                .sort({ timestamp: 1 });
            offer.messages = messages;
        }

        // Calculate time remaining
        const now = new Date();
        const expiry = new Date(negotiation.expiresAt);
        const timeRemaining = expiry > now ?
            Math.ceil((expiry - now) / (1000 * 60 * 60)) + ' hours' :
            'Expired';

        const response = {
            ...negotiation.toObject(),
            product: negotiation.productId,
            vendor: negotiation.vendorId,
            buyer: negotiation.buyerId,
            offers,
            timeRemaining
        };

        res.json(response);

    } catch (error) {
        console.error('Error fetching negotiation:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
// @desc    Submit new offer
// @access  Private (Buyer/Vendor)
router.post('/:id/offers', [
    auth,
    param('id').isMongoId().withMessage('Invalid negotiation ID'),
    body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
    body('quantity').isInt({ min: 1 }).withMessage('Valid quantity is required'),
    body('type').isIn(['buyer_offer', 'vendor_counteroffer']).withMessage('Invalid offer type')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const negotiation = await Negotiation.findById(req.params.id);
        if (!negotiation) {
            return res.status(404).json({ message: 'Negotiation not found' });
        }

        // Check access permissions
        if (negotiation.buyerId.toString() !== req.user.id &&
            negotiation.vendorId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Check if negotiation is still active
        if (negotiation.status !== 'pending') {
            return res.status(400).json({ message: 'Negotiation is no longer active' });
        }

        // Check round limits
        if (negotiation.currentRound > negotiation.maxRounds) {
            return res.status(400).json({ message: 'Maximum negotiation rounds exceeded' });
        }

        const { price, quantity, deliveryDate, qualityRequirements, packaging, customization, message, type } = req.body;

        // Validate business rules
        const priceChange = ((price - negotiation.baseline.price) / negotiation.baseline.price) * 100;
        const quantityChange = ((quantity - negotiation.baseline.quantity) / negotiation.baseline.quantity) * 100;

        if (priceChange < -BUSINESS_RULES.MAX_PRICE_REDUCTION) {
            return res.status(400).json({
                message: `Price reduction cannot exceed ${BUSINESS_RULES.MAX_PRICE_REDUCTION}%`
            });
        }

        if (quantityChange > BUSINESS_RULES.MAX_QUANTITY_INCREASE) {
            return res.status(400).json({
                message: `Quantity increase cannot exceed ${BUSINESS_RULES.MAX_QUANTITY_INCREASE}%`
            });
        }

        // Create offer
        const offer = new Offer({
            negotiationId: req.params.id,
            type,
            price,
            quantity,
            deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
            qualityRequirements,
            packaging,
            customization,
            message,
            status: 'pending',
            submittedBy: req.user.id,
            timestamp: new Date()
        });

        await offer.save();

        // Update negotiation
        negotiation.currentRound += 1;
        negotiation.updatedAt = new Date();
        await negotiation.save();

        res.status(201).json({
            message: 'Offer submitted successfully',
            offer
        });

    } catch (error) {
        console.error('Error submitting offer:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/negotiations/:id/offers/:offerId/accept
// @desc    Accept an offer
// @access  Private (Buyer/Vendor)
router.post('/:id/offers/:offerId/accept', [
    auth,
    param('id').isMongoId().withMessage('Invalid negotiation ID'),
    param('offerId').isMongoId().withMessage('Invalid offer ID')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const negotiation = await Negotiation.findById(req.params.id);
        if (!negotiation) {
            return res.status(404).json({ message: 'Negotiation not found' });
        }

        const offer = await Offer.findById(req.params.offerId);
        if (!offer || offer.negotiationId.toString() !== req.params.id) {
            return res.status(404).json({ message: 'Offer not found' });
        }

        // Check access permissions
        if (negotiation.buyerId.toString() !== req.user.id &&
            negotiation.vendorId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Check if offer is still pending
        if (offer.status !== 'pending') {
            return res.status(400).json({ message: 'Offer is no longer pending' });
        }

        // Accept the offer
        offer.status = 'accepted';
        offer.acceptedBy = req.user.id;
        offer.acceptedAt = new Date();
        await offer.save();

        // Update negotiation status
        negotiation.status = 'accepted';
        negotiation.finalTerms = {
            price: offer.price,
            quantity: offer.quantity,
            deliveryDate: offer.deliveryDate,
            qualityRequirements: offer.qualityRequirements,
            packaging: offer.packaging,
            customization: offer.customization
        };
        negotiation.acceptedAt = new Date();
        negotiation.updatedAt = new Date();
        await negotiation.save();

        // Reject all other pending offers
        await Offer.updateMany(
            {
                negotiationId: req.params.id,
                _id: { $ne: req.params.offerId },
                status: 'pending'
            },
            {
                status: 'rejected',
                rejectedBy: req.user.id,
                rejectedAt: new Date(),
                rejectionReason: 'Another offer was accepted'
            }
        );

        res.json({
            message: 'Offer accepted successfully',
            negotiation: {
                ...negotiation.toObject(),
                finalOffer: offer
            }
        });

    } catch (error) {
        console.error('Error accepting offer:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/negotiations/:id/offers/:offerId/reject
// @desc    Reject an offer
// @access  Private (Buyer/Vendor)
router.post('/:id/offers/:offerId/reject', [
    auth,
    param('id').isMongoId().withMessage('Invalid negotiation ID'),
    param('offerId').isMongoId().withMessage('Invalid offer ID'),
    body('reason').notEmpty().withMessage('Rejection reason is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const negotiation = await Negotiation.findById(req.params.id);
        if (!negotiation) {
            return res.status(404).json({ message: 'Negotiation not found' });
        }

        const offer = await Offer.findById(req.params.offerId);
        if (!offer || offer.negotiationId.toString() !== req.params.id) {
            return res.status(404).json({ message: 'Offer not found' });
        }

        // Check access permissions
        if (negotiation.buyerId.toString() !== req.user.id &&
            negotiation.vendorId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Check if offer is still pending
        if (offer.status !== 'pending') {
            return res.status(400).json({ message: 'Offer is no longer pending' });
        }

        // Reject the offer
        offer.status = 'rejected';
        offer.rejectedBy = req.user.id;
        offer.rejectedAt = new Date();
        offer.rejectionReason = req.body.reason;
        await offer.save();

        res.json({
            message: 'Offer rejected successfully',
            offer
        });

    } catch (error) {
        console.error('Error rejecting offer:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/negotiations/:id/offers/:offerId/messages
// @desc    Add message to offer
// @access  Private (Buyer/Vendor)
router.post('/:id/offers/:offerId/messages', [
    auth,
    upload.array('attachments', 5),
    param('id').isMongoId().withMessage('Invalid negotiation ID'),
    param('offerId').isMongoId().withMessage('Invalid offer ID')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { message } = req.body;

        if (!message && (!req.files || req.files.length === 0)) {
            return res.status(400).json({ message: 'Message or attachments required' });
        }

        const negotiation = await Negotiation.findById(req.params.id);
        if (!negotiation) {
            return res.status(404).json({ message: 'Negotiation not found' });
        }

        const offer = await Offer.findById(req.params.offerId);
        if (!offer || offer.negotiationId.toString() !== req.params.id) {
            return res.status(404).json({ message: 'Offer not found' });
        }

        // Check access permissions
        if (negotiation.buyerId.toString() !== req.user.id &&
            negotiation.vendorId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Process attachments
        const attachments = req.files ? req.files.map(file => ({
            filename: file.filename,
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            path: file.path
        })) : [];

        // Create message
        const messageDoc = new Message({
            negotiationId: req.params.id,
            offerId: req.params.offerId,
            senderId: req.user.id,
            message: message || '',
            attachments,
            timestamp: new Date()
        });

        await messageDoc.save();

        // Update negotiation timestamp
        negotiation.updatedAt = new Date();
        await negotiation.save();

        const populatedMessage = await Message.findById(messageDoc._id)
            .populate('senderId', 'name');

        res.status(201).json({
            message: 'Message added successfully',
            messageData: populatedMessage
        });

    } catch (error) {
        console.error('Error adding message:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/negotiations/stats
// @desc    Get negotiation statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
    try {
        const userId = req.user.id;

        const stats = await Negotiation.aggregate([
            {
                $match: {
                    $or: [
                        { buyerId: new mongoose.Types.ObjectId(userId) },
                        { vendorId: new mongoose.Types.ObjectId(userId) }
                    ]
                }
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const formattedStats = {
            total: 0,
            pending: 0,
            accepted: 0,
            rejected: 0,
            expired: 0
        };

        stats.forEach(stat => {
            formattedStats[stat._id] = stat.count;
            formattedStats.total += stat.count;
        });

        res.json(formattedStats);

    } catch (error) {
        console.error('Error fetching negotiation stats:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/negotiations/:id/suggest-reply
// @desc    Generate AI suggested replies and profit analysis for a vendor
// @access  Private (Vendor)
router.post('/:id/suggest-reply', [
    auth,
    param('id').isMongoId().withMessage('Invalid negotiation ID')
], async (req, res) => {
    try {
        const negotiationId = req.params.id;
        const vendorId = req.user.id;

        const negotiation = await Negotiation.findById(negotiationId)
            .populate('productId', 'name pricePerUnit');

        if (!negotiation) {
            return res.status(404).json({ message: 'Negotiation not found' });
        }

        if (negotiation.vendorId.toString() !== vendorId && !req.user.roles?.includes('admin')) {
            return res.status(403).json({ message: 'Only the vendor can request AI suggestions' });
        }

        // Gather context
        const offers = await Offer.find({ negotiationId }).sort({ timestamp: 1 }).lean();
        const messages = await Message.find({ negotiationId }).sort({ timestamp: 1 }).populate('senderId', 'roles').lean();

        const baselinePrice = negotiation.baseline.price;
        const productName = negotiation.productId?.name || 'Product';

        let conversationHistory = offers.map(o => {
            const role = o.submittedBy.toString() === vendorId ? 'Vendor' : 'Buyer';
            return `${role} offered ₹${o.price} for ${o.quantity} units.`;
        });

        messages.forEach(m => {
            const role = m.senderId?.roles?.includes('vendor') ? 'Vendor' : 'Buyer';
            conversationHistory.push(`${role} message: "${m.message}"`);
        });

        const latestOffer = offers.length > 0 ? offers[offers.length - 1] : null;
        let currentStatus = 'No offers yet.';
        if (latestOffer) {
            const margin = ((latestOffer.price - baselinePrice) / baselinePrice * 100).toFixed(1);
            currentStatus = `Latest offer is ₹${latestOffer.price}. Baseline price is ₹${baselinePrice}. Margin: ${margin}%.`;
        }

        const systemPrompt = `You are an expert AI negotiation assistant for an agricultural vendor. 
Your job is to analyze the ongoing negotiation for ${productName} and suggest the best quick replies for the vendor to send to the buyer.
Consider the vendor's baseline price vs the buyer's offers to calculate if it's a good deal.

You must reply strictly in the following JSON format:
{
  "profitAnalysis": "A short, 1-2 sentence analysis summarizing the profit margin or risk based on the latest offer compared to the baseline price of ₹${baselinePrice}.",
  "suggestedReplies": [
    "Accept this offer of ₹X",
    "Counter with ₹Y because [reason]",
    "Short message negotiating terms"
  ]
}
Maintain a professional and helpful tone. Provide exactly 2 to 3 suggestedReplies. Maximum 15 words per reply.`;

        const userPrompt = `Context:
Base Price: ₹${baselinePrice}
${currentStatus}

Conversation History (Oldest to Newest):
${conversationHistory.join('\n')}`;

        const aiResponse = await llmService.generateJSON(systemPrompt, userPrompt);

        res.json(aiResponse);

    } catch (error) {
        console.error('Error generating AI reply suggestion:', error);
        res.status(500).json({ message: 'Server error generating AI suggestion' });
    }
});

module.exports = router;