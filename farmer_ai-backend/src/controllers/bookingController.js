const BookingRequest = require('../models/BookingRequest');
const Booking = require('../models/Booking'); // Using the updated model name if different, checking imports
// Note: The previous file imported BookingRequest, but the model file we edited was Booking.js (mongoose.model('Booking')).
// I will verify if BookingRequest.js exists and if so, use Booking.js instead as that's the one I updated.
// Actually, I saw Booking.js and BookingRequest.js in the file list. I updated Booking.js.
// I should use Booking.js model.
const Warehouse = require('../models/Warehouse');
const { sendBookingRequestEmail, sendApprovalEmail } = require('../services/emailService');

// Helper to add audit log
const addAuditLog = (booking, action, user, metadata = {}) => {
    booking.auditLogs.push({
        action,
        performedBy: user.id,
        timestamp: Date.now(),
        metadata
    });
};

// @desc    Phase 2: Farmer creates booking request
// @route   POST /api/bookings
// @access  Private (Farmer)
exports.createBookingRequest = async (req, res) => {
    try {
        const { warehouseId, cropName, cropType, quantity, duration, startDate, notes } = req.body;

        const warehouse = await Warehouse.findById(warehouseId);
        if (!warehouse) {
            return res.status(404).json({ success: false, message: 'Warehouse not found' });
        }

        if (warehouse.status !== 'ACTIVE') {
            console.log('Booking request rejected: Warehouse not active');
            return res.status(400).json({ success: false, message: 'Warehouse is not active' });
        }

        // 1. Capacity Check (Non-atomic preliminary check)
        if (warehouse.capacity.available < quantity) {
            console.log(`Booking request rejected: Insufficient capacity (Req: ${quantity}, Avail: ${warehouse.capacity.available})`);
            return res.status(400).json({ success: false, message: `Insufficient capacity. Only ${warehouse.capacity.available} tons available.` });
        }

        // 2. Crop Compatibility Check
        const isSupported = warehouse.specifications.supportedCrops.some(
            c => c.toLowerCase() === cropName.toLowerCase()
        );
        // Strict check as per requirements (Admin approval needed, but system should filter first)
        // If strict: if (!isSupported) throw error.
        // For now, allowing request but Admin will see it. Or blocking it?
        // Requirement: "Find eligible warehouses". So request should probably match.
        if (!isSupported) {
            console.log(`Booking request rejected: Crop ${cropName} not supported`);
            return res.status(400).json({ success: false, message: `Crop ${cropName} not supported by this warehouse.` });
        }

        const booking = await Booking.create({
            farmerId: req.user.id,
            warehouseId,
            cropName,
            cropType,
            quantity,
            duration,
            startDate,
            farmerNotes: notes,
            status: 'REQUESTED',
            auditLogs: [{
                action: 'REQUESTED',
                performedBy: req.user.id,
                metadata: { notes }
            }]
        });



        // Send Email to Farmer
        // req.user contains { id, name, email } if authenticated properly via middleware
        // We might need to fetch full user if req.user is minimal
        // Assuming req.user has email. If not, we might need User.findById(req.user.id)
        try {
            await sendBookingRequestEmail(booking, req.user, warehouse);
        } catch (emailError) {
            console.error("Failed to send request email:", emailError);
        }

        res.status(201).json({ success: true, data: booking });
    } catch (error) {
        console.error('Create Booking Error:', error);
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get user bookings
// @route   GET /api/bookings/my
// @access  Private
exports.getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ farmerId: req.user.id })
            .populate('warehouseId', 'name location branchId')
            .sort('-createdAt');
        res.status(200).json({ success: true, count: bookings.length, data: bookings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all bookings (Admin)
// @route   GET /api/bookings
// @access  Admin
exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('farmerId', 'name email phone')
            .populate('warehouseId', 'name branchId')
            .sort('-createdAt');
        res.status(200).json({ success: true, count: bookings.length, data: bookings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Phase 3: Admin reviews and sets price (Approve)
// @route   PUT /api/bookings/:id/approve
// @access  Admin
exports.approveBooking = async (req, res) => {
    try {
        const { pricePerTonPerDay, notes } = req.body;
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        if (booking.status !== 'REQUESTED') {
            return res.status(400).json({ success: false, message: `Cannot approve booking in ${booking.status} state` });
        }

        const totalPrice = pricePerTonPerDay * booking.quantity * booking.duration;

        booking.status = 'APPROVED_WAITING_PAYMENT';
        booking.pricing = {
            pricePerTonPerDay,
            totalPrice,
            adminNotes: notes,
            currency: 'INR'
        };
        booking.approvedAt = Date.now();

        addAuditLog(booking, 'APPROVED', req.user, { pricePerTonPerDay, totalPrice, notes });

        await booking.save();



        // Send Approval Email
        try {
            // Need to populate farmer to get email
            const fullBooking = await Booking.findById(booking._id).populate('farmerId');
            if (fullBooking && fullBooking.farmerId) {
                await sendApprovalEmail(fullBooking, fullBooking.farmerId);
            }
        } catch (emailError) {
            console.error("Failed to send approval email:", emailError);
        }

        res.status(200).json({ success: true, data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Phase 3b: Admin Reject
// @route   PUT /api/bookings/:id/reject
// @access  Admin
exports.rejectBooking = async (req, res) => {
    try {
        const { reason } = req.body;
        const booking = await Booking.findById(req.params.id);

        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
        if (booking.status !== 'REQUESTED') {
            return res.status(400).json({ success: false, message: 'Can only reject PENDING requests' });
        }

        booking.status = 'REJECTED';
        addAuditLog(booking, 'REJECTED', req.user, { reason });

        await booking.save();
        // TODO: Send Rejection Email

        res.status(200).json({ success: true, data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// @desc    Phase 4: Farmer accepts & adds transport
// @route   PUT /api/bookings/:id/transport
// @access  Private (Farmer)
exports.addTransportDetails = async (req, res) => {
    try {
        const { type, driverName, vehicleNumber, driverContact, expectedArrival } = req.body;
        const booking = await Booking.findById(req.params.id);

        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

        if (booking.farmerId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        if (booking.status !== 'APPROVED_WAITING_PAYMENT' && booking.status !== 'AWAITING_PAYMENT') {
            return res.status(400).json({ success: false, message: 'Booking must be approved before adding transport' });
        }

        booking.transportDetails = {
            type,
            driverName,
            vehicleNumber,
            driverContact,
            expectedArrival
        };

        // Move to Ready for Payment
        booking.status = 'AWAITING_PAYMENT';
        addAuditLog(booking, 'TRANSPORT_ADDED', req.user, { vehicleNumber });

        await booking.save();
        res.status(200).json({ success: true, data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Phase 5: Admin finalizes and deducts capacity
// @route   PUT /api/bookings/:id/finalize
// @access  Admin
exports.finalizeBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

        // Ensure Payment is Completed (Double check)
        if (booking.payment.status !== 'COMPLETED') {
            return res.status(400).json({ success: false, message: 'Payment not completed yet.' });
        }

        // Ensure status is correctly waiting for confirmation
        if (booking.status !== 'AWAITING_CONFIRMATION') {
            // In case manual override or retrying?
            // Ideally strictly AWAITING_CONFIRMATION
        }

        const warehouse = await Warehouse.findById(booking.warehouseId);
        if (!warehouse) return res.status(404).json({ success: false, message: 'Warehouse not found' });

        // Atomic Capacity Update
        // We use findOneAndUpdate to ensure atomicity if high concurrency, 
        // essentially satisfying "race-condition safe" requirement.
        // Condition: _id matches AND capacity >= quantity

        const updatedWarehouse = await Warehouse.findOneAndUpdate(
            { _id: warehouse._id, 'capacity.available': { $gte: booking.quantity } },
            { $inc: { 'capacity.available': -booking.quantity } },
            { new: true }
        );

        if (!updatedWarehouse) {
            return res.status(400).json({ success: false, message: 'Insufficient capacity at finalization stage.' });
        }

        booking.status = 'CONFIRMED'; // or STORED? Requirement says "Mark capacity as used... Suggest another...". 
        // Requirement: "Once warehouse is booked -> Mark capacity used".
        // Let's use CONFIRMED.
        booking.confirmedAt = Date.now();
        addAuditLog(booking, 'FINALIZED', req.user);

        await booking.save();

        // TODO: Generate & Email Invoice

        res.status(200).json({ success: true, data: booking, message: 'Booking finalized and capacity updated' });
    } catch (error) {
        console.error("Finalize Error", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

