const { insertuser, updateuser, userlogin, getAlluser, verifyotpreg, deleteuser, getSingleuser, userlogout, verifyOtp, sendotp, resetPassword, sendmailsms, addBalance } = require('../Controllers/UserController');
const express = require('express');
const router = express.Router();

router.post('/insertuser', insertuser);
router.put('/updateuser', updateuser,);
router.post('/userlogin', userlogin);
router.get('/getAlluser', getAlluser);
router.post('/getSingleuser', getSingleuser);
router.delete('/deleteuser', deleteuser);
router.post('/userlogout', userlogout);
router.post('/sendotp', sendotp);
router.post('/verifyOtp', verifyOtp);
router.post('/resetPassword', resetPassword);
router.post('/sendmailsms', sendmailsms);
router.post('/verifyotpreg', verifyotpreg);
router.post('/addBalance', addBalance);

// Get current user
router.get('/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }

        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const User = require('../Models/User');
        const user = await User.findById(decoded.id).select('-password -otp -resetOtp');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, user });
    } catch (error) {
        res.status(401).json({ success: false, message: 'Invalid token' });
    }
});






module.exports = router;
