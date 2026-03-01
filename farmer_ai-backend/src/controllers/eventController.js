const Event = require('../models/Event');

// @desc    Get all events
// @route   GET /api/events
// @access  Public/Private
exports.getEvents = async (req, res) => {
    try {
        const events = await Event.find()
            .populate('organizer', 'name role')
            .sort({ date: 1 }); // Chronological order

        res.json({ success: true, count: events.length, data: events });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public/Private
exports.getEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('organizer', 'name role')
            .populate('registeredUsers', 'name');

        if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

        res.json({ success: true, data: event });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Register for an event (User action)
// @route   POST /api/events/:id/register
// @access  Private
exports.registerForEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

        if (event.status !== 'Upcoming') {
            return res.status(400).json({ success: false, message: 'Registration is close. Event is not Upcoming.' });
        }

        if (event.registeredUsers.length >= event.capacity) {
            return res.status(400).json({ success: false, message: 'Event is at full capacity.' });
        }

        // Check if already registered
        if (event.registeredUsers.includes(req.user.id)) {
            return res.status(400).json({ success: false, message: 'You are already registered for this event.' });
        }

        event.registeredUsers.push(req.user.id);
        await event.save();

        res.json({ success: true, message: 'Successfully registered for event', data: event });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
