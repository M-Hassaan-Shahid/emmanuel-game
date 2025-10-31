const Broadcast = require('../Models/Broadcast');

// Get active broadcasts
const getActiveBroadcasts = async (req, res) => {
    try {
        const now = new Date();
        const broadcasts = await Broadcast.find({
            isActive: true,
            deleted_at: null,
            $or: [
                { expiresAt: null },
                { expiresAt: { $gt: now } }
            ]
        })
            .sort({ createdAt: -1 })
            .limit(5);

        res.status(200).json({
            success: true,
            broadcasts,
        });
    } catch (error) {
        console.error('Error fetching broadcasts:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch broadcasts',
        });
    }
};

// Create broadcast (Admin only)
const createBroadcast = async (req, res) => {
    try {
        const { message, type, expiresAt } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'Message is required',
            });
        }

        const broadcast = new Broadcast({
            message,
            type: type || 'info',
            expiresAt: expiresAt || null,
            // createdBy removed since authentication is disabled
        });

        await broadcast.save();

        res.status(201).json({
            success: true,
            message: 'Broadcast created successfully',
            broadcast,
        });
    } catch (error) {
        console.error('Error creating broadcast:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create broadcast',
        });
    }
};

// Get all broadcasts (Admin only)
const getAllBroadcasts = async (req, res) => {
    try {
        const broadcasts = await Broadcast.find({ deleted_at: null })
            .sort({ createdAt: -1 })
            .populate('createdBy', 'email');

        res.status(200).json({
            success: true,
            broadcasts,
        });
    } catch (error) {
        console.error('Error fetching all broadcasts:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch broadcasts',
        });
    }
};

// Update broadcast (Admin only)
const updateBroadcast = async (req, res) => {
    try {
        const { id } = req.params;
        const { message, type, isActive, expiresAt } = req.body;

        const broadcast = await Broadcast.findByIdAndUpdate(
            id,
            { message, type, isActive, expiresAt },
            { new: true }
        );

        if (!broadcast) {
            return res.status(404).json({
                success: false,
                message: 'Broadcast not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Broadcast updated successfully',
            broadcast,
        });
    } catch (error) {
        console.error('Error updating broadcast:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update broadcast',
        });
    }
};

// Delete broadcast (Admin only)
const deleteBroadcast = async (req, res) => {
    try {
        const { id } = req.params;

        const broadcast = await Broadcast.findByIdAndUpdate(
            id,
            { deleted_at: new Date() },
            { new: true }
        );

        if (!broadcast) {
            return res.status(404).json({
                success: false,
                message: 'Broadcast not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Broadcast deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting broadcast:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete broadcast',
        });
    }
};

module.exports = {
    getActiveBroadcasts,
    createBroadcast,
    getAllBroadcasts,
    updateBroadcast,
    deleteBroadcast,
};
