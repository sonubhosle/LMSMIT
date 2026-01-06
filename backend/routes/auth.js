const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Librarian = require('../models/Librarian');

// JWT Secret
const JWT_SECRET = 'library_management_secret_key_2023';

// Add a default librarian for testing



// Register Librarian
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Create new librarian
        const librarian = new Librarian({
            name,
            email,
            password
        });

        await librarian.save();

        // Create JWT token
        const token = jwt.sign(
            { id: librarian.id, email: librarian.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            token,
            librarian: {
                id: librarian.id,
                name: librarian.name,
                email: librarian.email
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
});

// Login Librarian
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find librarian (FIXED)
        const librarian = await Librarian.findOne({ email });
        if (!librarian) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isPasswordValid = await librarian.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Create JWT token
        const token = jwt.sign(
            { id: librarian._id, email: librarian.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            token,
            librarian: {
                id: librarian._id,
                name: librarian.name,
                email: librarian.email
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
});


// Verify Token Middleware
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'No token provided'
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
};


// Get current user
router.get('/me', verifyToken, async (req, res) => {
    try {
        const librarian = await Librarian.findById(req.user.id).select('-password');

        if (!librarian) {
            return res.status(404).json({
                success: false,
                message: 'Librarian not found'
            });
        }

        res.json({
            success: true,
            librarian
        });

    } catch (error) {
        console.error('ME ERROR:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});



// Export verifyToken separately
module.exports = router;
module.exports.verifyToken = verifyToken;