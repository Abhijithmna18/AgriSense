const SavedSupplier = require('../models/SavedSupplier');
const User = require('../models/User');
const Order = require('../models/Order');
const MarketplaceListing = require('../models/MarketplaceListing');

// @desc    Save a supplier
// @route   POST /api/marketplace/saved-suppliers
// @access  Private (Buyer)
exports.saveSupplier = async (req, res) => {
    try {
        const { supplierId, notes } = req.body;

        if (!supplierId) {
            return res.status(400).json({ message: 'Supplier ID is required' });
        }

        // Check if trying to save themselves
        if (req.user._id.toString() === supplierId) {
            return res.status(403).json({ message: 'You cannot save yourself as a supplier' });
        }

        // Check if supplier exists
        const supplier = await User.findById(supplierId);
        if (!supplier) {
            return res.status(404).json({ message: 'Supplier not found' });
        }

        // Validate supplier has farmer or vendor role
        const isValidSupplier = supplier.roles.includes('farmer') || supplier.roles.includes('vendor');
        if (!isValidSupplier) {
            return res.status(403).json({ message: 'User is not a valid supplier (must be farmer or vendor)' });
        }

        // Check if already saved
        const existingSave = await SavedSupplier.findOne({
            buyer: req.user._id,
            supplier: supplierId
        });

        if (existingSave) {
            return res.status(409).json({ message: 'Supplier already saved' });
        }

        // Create saved supplier
        const savedSupplier = new SavedSupplier({
            buyer: req.user._id,
            supplier: supplierId,
            notes: notes || ''
        });

        await savedSupplier.save();

        res.status(201).json({
            success: true,
            savedSupplier
        });

    } catch (error) {
        console.error('Save supplier error:', error);
        res.status(500).json({ message: 'Server error saving supplier' });
    }
};

// @desc    Get saved suppliers with filters
// @route   GET /api/marketplace/saved-suppliers
// @access  Private (Buyer)
exports.getSavedSuppliers = async (req, res) => {
    try {
        const { search, location, supplierType, minRating, sortBy = 'savedAt' } = req.query;

        // Build query
        const query = {
            buyer: req.user._id,
            isActive: true
        };

        // Fetch saved suppliers
        let savedSuppliers = await SavedSupplier.find(query)
            .populate({
                path: 'supplier',
                select: 'firstName lastName email roles farmerProfile vendorProfile'
            })
            .sort({ [sortBy]: -1 });

        // Filter out suppliers with inactive accounts
        savedSuppliers = savedSuppliers.filter(saved => saved.supplier && saved.supplier.email);

        // Enrich with additional data
        const enrichedSuppliers = await Promise.all(savedSuppliers.map(async (saved) => {
            const supplier = saved.supplier;

            // Get supplier location
            let supplierLocation = '';
            if (supplier.roles.includes('farmer') && supplier.farmerProfile) {
                supplierLocation = `${supplier.farmerProfile.district || ''}, ${supplier.farmerProfile.state || ''}`.trim();
            } else if (supplier.roles.includes('vendor') && supplier.vendorProfile) {
                supplierLocation = `${supplier.vendorProfile.pickupAddress?.city || ''}, ${supplier.vendorProfile.pickupAddress?.state || ''}`.trim();
            }

            // Apply location filter
            if (location && !supplierLocation.toLowerCase().includes(location.toLowerCase())) {
                return null;
            }

            // Apply supplier type filter
            if (supplierType) {
                if (!supplier.roles.includes(supplierType)) {
                    return null;
                }
            }

            // Apply search filter
            if (search) {
                const searchLower = search.toLowerCase();
                const fullName = `${supplier.firstName} ${supplier.lastName}`.toLowerCase();
                if (!fullName.includes(searchLower)) {
                    return null;
                }
            }

            // Get top 3 products from this supplier
            const topProducts = await MarketplaceListing.find({
                seller: supplier._id,
                status: 'active'
            })
                .select('name productType')
                .limit(3)
                .lean();

            // Get last order date and total orders
            const orders = await Order.find({
                buyer: req.user._id,
                seller: supplier._id
            })
                .select('createdAt')
                .sort({ createdAt: -1 })
                .lean();

            const lastOrderDate = orders.length > 0 ? orders[0].createdAt : null;
            const totalOrders = orders.length;

            // Calculate average rating from completed orders
            const completedOrders = await Order.find({
                seller: supplier._id,
                deliveryStatus: { $in: ['delivered', 'completed'] }
            }).select('rating');

            const ratingsArray = completedOrders.filter(o => o.rating).map(o => o.rating);
            const averageRating = ratingsArray.length > 0
                ? ratingsArray.reduce((sum, r) => sum + r, 0) / ratingsArray.length
                : 0;

            // Apply rating filter
            if (minRating && averageRating < parseFloat(minRating)) {
                return null;
            }

            // Determine supplier status (active if has listings in last 90 days)
            const recentListings = await MarketplaceListing.countDocuments({
                seller: supplier._id,
                status: 'active',
                updatedAt: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
            });

            const supplierStatus = recentListings > 0 ? 'active' : 'inactive';

            return {
                _id: saved._id,
                supplier: {
                    _id: supplier._id,
                    firstName: supplier.firstName,
                    lastName: supplier.lastName,
                    roles: supplier.roles,
                    location: supplierLocation,
                    averageRating: parseFloat(averageRating.toFixed(1))
                },
                topProducts: topProducts.map(p => p.name || p.productType),
                lastOrderDate,
                totalOrders,
                supplierStatus,
                notes: saved.notes,
                savedAt: saved.savedAt
            };
        }));

        // Filter out nulls (filtered items)
        const filteredSuppliers = enrichedSuppliers.filter(s => s !== null);

        res.json({
            success: true,
            suppliers: filteredSuppliers,
            count: filteredSuppliers.length
        });

    } catch (error) {
        console.error('Get saved suppliers error:', error);
        res.status(500).json({ message: 'Server error fetching saved suppliers' });
    }
};

// @desc    Check if supplier is saved
// @route   GET /api/marketplace/saved-suppliers/check/:supplierId
// @access  Private (Buyer)
exports.checkSavedSupplier = async (req, res) => {
    try {
        const { supplierId } = req.params;

        const savedSupplier = await SavedSupplier.findOne({
            buyer: req.user._id,
            supplier: supplierId,
            isActive: true
        });

        res.json({
            success: true,
            isSaved: !!savedSupplier,
            savedSupplierId: savedSupplier?._id || null
        });

    } catch (error) {
        console.error('Check saved supplier error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Remove saved supplier
// @route   DELETE /api/marketplace/saved-suppliers/:supplierId
// @access  Private (Buyer)
exports.removeSavedSupplier = async (req, res) => {
    try {
        const { supplierId } = req.params;

        const savedSupplier = await SavedSupplier.findOneAndDelete({
            buyer: req.user._id,
            supplier: supplierId
        });

        if (!savedSupplier) {
            return res.status(404).json({ message: 'Saved supplier not found' });
        }

        res.json({
            success: true,
            message: 'Supplier removed from saved list'
        });

    } catch (error) {
        console.error('Remove saved supplier error:', error);
        res.status(500).json({ message: 'Server error removing supplier' });
    }
};

module.exports = exports;
