const jwt = require('jsonwebtoken');
const User = require('../Models/User');
const Admin = require('../Models/Admin');

// Middleware to verify JWT token
const verifyToken = async (req, res, next) => {
    try {
        // Get token from header or cookies
        let token = null;

        if (req.headers.authorization) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if it's an admin or regular user
        let user;
        if (decoded.role === 'admin') {
            user = await Admin.findById(decoded.id).select('-password');
        } else {
            user = await User.findById(decoded.id).select('-password');
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. User not found.'
            });
        }

        // Attach user and role to request
        req.user = user;
        req.user.role = decoded.role || 'user';
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token.'
        });
    }
};

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.'
            });
        }

        // Check if user has admin role (you may need to add role field to User model)
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        next();
    } catch (error) {
        console.error('Admin middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error.'
        });
    }
};

module.exports = { verifyToken, isAdmin };
