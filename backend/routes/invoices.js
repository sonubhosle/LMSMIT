const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Invoice = require('../models/Invoice');
const Student = require('../models/Student');
const Book = require('../models/Book');

// JWT Secret
const JWT_SECRET = 'library_management_secret_key_2023';

// Verify Token Middleware
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access denied. No token provided.'
        });
    }

    try {
        const verified = jwt.verify(token, JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Invalid token'
        });
    }
};

// Apply authentication middleware to all routes
router.use(verifyToken);

// Get all invoices
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, status, type } = req.query;
        const skip = (page - 1) * limit;

        // Build query
        const query = {};
        if (status) query.status = status;
        if (type) query.invoiceType = type;

        const invoices = await Invoice.find(query)
            .populate('student', 'name studentId email className mobile')
            .populate('book', 'title author')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Invoice.countDocuments(query);

        res.json({
            success: true,
            invoices,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('Error fetching invoices:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Get single invoice
router.get('/:id', async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id)
            .populate('student', 'name studentId email className mobile')
            .populate('book', 'title author isbn');

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
        }

        res.json({
            success: true,
            invoice
        });
    } catch (error) {
        console.error('Error fetching invoice:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Get invoice statistics
router.get('/stats/summary', async (req, res) => {
    try {
        const totalInvoices = await Invoice.countDocuments();
        const pendingInvoices = await Invoice.countDocuments({ status: 'pending' });
        const paidInvoices = await Invoice.countDocuments({ status: 'paid' });
        
        const totalRevenueResult = await Invoice.aggregate([
            { $match: { status: 'paid' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        
        const totalRevenue = totalRevenueResult[0]?.total || 0;

        // Monthly revenue (current month)
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const monthlyRevenueResult = await Invoice.aggregate([
            { 
                $match: { 
                    status: 'paid',
                    createdAt: { $gte: startOfMonth }
                } 
            },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        const monthlyRevenue = monthlyRevenueResult[0]?.total || 0;

        // Revenue by type
        const revenueByType = await Invoice.aggregate([
            { $match: { status: 'paid' } },
            { 
                $group: { 
                    _id: '$invoiceType',
                    total: { $sum: '$totalAmount' },
                    count: { $sum: 1 }
                } 
            },
            { $sort: { total: -1 } }
        ]);

        res.json({
            success: true,
            stats: {
                totalInvoices,
                pendingInvoices,
                paidInvoices,
                totalRevenue,
                monthlyRevenue,
                revenueByType
            }
        });
    } catch (error) {
        console.error('Error fetching invoice stats:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Create invoice - FIXED
// Create invoice - FIXED VERSION
router.post('/', async (req, res) => {
    try {
        const { studentId, invoiceType, daysLate, bookPrice, totalAmount, remarks, bookId } = req.body;

        // Validate required fields
        if (!studentId || !invoiceType) {
            return res.status(400).json({
                success: false,
                message: 'Student ID and invoice type are required'
            });
        }

        // Check if student exists
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Prepare invoice data
        const invoiceData = {
            student: studentId,
            invoiceType,
            remarks: remarks || '',
            status: 'pending'
        };

        let calculatedTotalAmount = 0;

        // Add type-specific data and calculate total
        switch (invoiceType) {
            case 'late_return':
                if (!daysLate || daysLate <= 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'Days late is required for late return invoices'
                    });
                }
                const penaltyPerDay = 20; // Default penalty
                calculatedTotalAmount = daysLate * penaltyPerDay;
                
                invoiceData.daysLate = daysLate;
                invoiceData.penaltyPerDay = penaltyPerDay;
                invoiceData.totalPenalty = calculatedTotalAmount;
                invoiceData.totalAmount = calculatedTotalAmount;
                break;

            case 'lost_book':
                if (!bookPrice || bookPrice <= 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'Book price is required for lost book invoices'
                    });
                }
                const latePenalty = (daysLate || 0) * 20;
                calculatedTotalAmount = bookPrice + latePenalty;
                
                invoiceData.bookPrice = bookPrice;
                invoiceData.daysLate = daysLate || 0;
                invoiceData.penaltyPerDay = 20;
                invoiceData.totalPenalty = latePenalty;
                invoiceData.totalAmount = calculatedTotalAmount;
                
                // Mark book as lost if bookId is provided
                if (bookId) {
                    await Book.findByIdAndUpdate(bookId, { status: 'lost' });
                    invoiceData.book = bookId;
                }
                break;

            case 'other':
                if (!totalAmount || totalAmount <= 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'Total amount is required for other invoices'
                    });
                }
                invoiceData.totalAmount = totalAmount;
                calculatedTotalAmount = totalAmount;
                break;

            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid invoice type'
                });
        }

        // Create invoice (invoiceId will be auto-generated by pre-save hook)
        const invoice = new Invoice(invoiceData);
        await invoice.save();

        // Populate and return
        const populatedInvoice = await Invoice.findById(invoice._id)
            .populate('student', 'name studentId email className mobile')
            .populate('book', 'title author');

        res.status(201).json({
            success: true,
            message: 'Invoice created successfully',
            invoice: populatedInvoice
        });

    } catch (error) {
        console.error('Error creating invoice:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
});
// Update invoice status
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!['pending', 'paid', 'cancelled'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const updateData = { status };
        if (status === 'paid') {
            updateData.paymentDate = new Date();
        }

        const invoice = await Invoice.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).populate('student', 'name studentId email className mobile')
         .populate('book', 'title author');

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
        }

        res.json({
            success: true,
            message: 'Invoice status updated successfully',
            invoice
        });

    } catch (error) {
        console.error('Error updating invoice status:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
});

module.exports = router;