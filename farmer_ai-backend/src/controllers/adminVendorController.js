const User = require('../models/User');

/**
 * @route   GET /api/admin/vendors/pending
 * @desc    Get all pending vendor applications
 * @access  Private (Admin only)
 */
exports.getPendingVendors = async (req, res) => {
    try {
        const pendingVendors = await User.find({
            'vendorProfile.status': 'pending'
        }).select('firstName lastName email phone vendorProfile createdAt');

        res.status(200).json({
            success: true,
            data: pendingVendors
        });
    } catch (error) {
        console.error('Get pending vendors error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * @route   POST /api/admin/vendors/:id/approve
 * @desc    Approve a vendor application
 * @access  Private (Admin only)
 */
exports.approveVendor = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (!user.vendorProfile || user.vendorProfile.status !== 'pending') {
            return res.status(400).json({ success: false, message: 'User does not have a pending vendor application' });
        }

        // Prepare update object
        const updateData = {
            'vendorProfile.status': 'approved',
            'vendorProfile.approvalRemarks': req.body?.remarks || 'Approved by admin'
        };

        // Prepare $addToSet for vendor role if not present
        const addToSet = {};
        if (!user.roles || !user.roles.includes('vendor')) {
            addToSet.roles = 'vendor';
        }

        // Build the final update query
        const updateQuery = {
            $set: updateData
        };

        if (Object.keys(addToSet).length > 0) {
            updateQuery.$addToSet = addToSet;
        }

        // Use findByIdAndUpdate to avoid password hashing issues
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            updateQuery,
            { new: true, runValidators: true }
        ).select('-password');

        res.status(200).json({
            success: true,
            message: 'Vendor approved successfully',
            user: updatedUser
        });

    } catch (error) {
        console.error('Approve vendor error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

/**
 * @route   POST /api/admin/vendors/:id/reject
 * @desc    Reject a vendor application
 * @access  Private (Admin only)
 */
exports.rejectVendor = async (req, res) => {
    try {
        const { remarks } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (!user.vendorProfile) {
            return res.status(400).json({ success: false, message: 'User is not an applicant' });
        }

        // Prepare update object
        const updateData = {
            'vendorProfile.status': 'rejected',
            'vendorProfile.approvalRemarks': remarks || 'Rejected by admin'
        };

        // Reset activeRole if it's vendor
        if (user.activeRole === 'vendor') {
            updateData.activeRole = 'farmer'; // Fallback
        }

        // Build the final update query
        const updateQuery = {
            $set: updateData,
            $pull: { roles: 'vendor' }
        };

        // Use findByIdAndUpdate to avoid password hashing issues
        await User.findByIdAndUpdate(
            req.params.id,
            updateQuery,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Vendor application rejected'
        });

    } catch (error) {
        console.error('Reject vendor error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
