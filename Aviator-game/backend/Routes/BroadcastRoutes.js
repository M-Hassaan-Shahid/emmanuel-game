const express = require('express');
const router = express.Router();
const {
    getActiveBroadcasts,
    createBroadcast,
    getAllBroadcasts,
    updateBroadcast,
    deleteBroadcast,
} = require('../Controllers/BroadcastController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Public route - get active broadcasts
router.get('/broadcasts/active', getActiveBroadcasts);

// Admin routes (authentication removed)
router.post('/broadcasts', createBroadcast);
router.get('/broadcasts', getAllBroadcasts);
router.put('/broadcasts/:id', updateBroadcast);
router.delete('/broadcasts/:id', deleteBroadcast);

module.exports = router;
