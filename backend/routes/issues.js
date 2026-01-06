const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Issue = require('../models/Issue');
const Book = require('../models/Book');
const Student = require('../models/Student');

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

// Get all issues with pagination and filtering
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, status, search } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Build query
        let query = {};
        
        // Status filter
        if (status && status.trim() !== '') {
            query.status = status;
        }
        
        // Search query (search by student name or book title)
        if (search && search.trim() !== '') {
            // We'll handle this after getting the issues
        }

        // Get total count
        const totalIssues = await Issue.countDocuments(query);
        const totalPages = Math.ceil(totalIssues / limitNum);

        // Get issues with pagination and populate student and book
        let issues = await Issue.find(query)
            .populate('student', 'name email mobile className studentId')
            .populate('book', 'title author price bookId availableQuantity quantity category')
            .sort({ issueDate: -1 })
            .skip(skip)
            .limit(limitNum);

        // Handle search after getting issues
        if (search && search.trim() !== '') {
            const searchLower = search.toLowerCase();
            issues = issues.filter(issue => {
                const studentName = issue.student?.name?.toLowerCase() || '';
                const bookTitle = issue.book?.title?.toLowerCase() || '';
                const bookAuthor = issue.book?.author?.toLowerCase() || '';
                const issueId = issue.issueId?.toString() || '';
                
                return studentName.includes(searchLower) ||
                       bookTitle.includes(searchLower) ||
                       bookAuthor.includes(searchLower) ||
                       issueId.includes(searchLower);
            });
            
            // Recalculate total after search
            const totalIssuesAfterSearch = issues.length;
            const totalPagesAfterSearch = Math.ceil(totalIssuesAfterSearch / limitNum);
            
            // Apply pagination to filtered results
            issues = issues.slice(skip, skip + limitNum);
            
            res.json({
                success: true,
                issues,
                total: totalIssuesAfterSearch,
                page: pageNum,
                pages: totalPagesAfterSearch || 1,
                limit: limitNum
            });
        } else {
            res.json({
                success: true,
                issues,
                total: totalIssues,
                page: pageNum,
                pages: totalPages,
                limit: limitNum
            });
        }
    } catch (error) {
        console.error('Error fetching issues:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
});

// Get overdue issues
router.get('/overdue', async (req, res) => {
    try {
        const today = new Date();
        
        const issues = await Issue.find({
            status: 'issued',
            dueDate: { $lt: today }
        })
        .populate('student', 'name email mobile className studentId')
        .populate('book', 'title author price bookId')
        .sort({ dueDate: 1 });

        res.json({
            success: true,
            issues,
            total: issues.length
        });
    } catch (error) {
        console.error('Error fetching overdue issues:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
});

// Get issue statistics
router.get('/stats/summary', async (req, res) => {
    try {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        
        // Get all counts
        const totalIssued = await Issue.countDocuments();
        const totalOverdue = await Issue.countDocuments({ 
            status: 'issued', 
            dueDate: { $lt: today } 
        });
        const totalReturned = await Issue.countDocuments({ status: 'returned' });
        const totalLost = await Issue.countDocuments({ status: 'lost' });
        
        // Monthly statistics
        const monthlyIssued = await Issue.countDocuments({
            issueDate: { $gte: startOfMonth, $lte: today }
        });
        
        const monthlyReturned = await Issue.countDocuments({
            status: 'returned',
            returnDate: { $gte: startOfMonth, $lte: today }
        });
        
        const lastMonthIssued = await Issue.countDocuments({
            issueDate: { $gte: startOfLastMonth, $lte: endOfLastMonth }
        });

        res.json({
            success: true,
            stats: {
                totalIssued,
                totalOverdue,
                totalReturned,
                totalLost,
                monthlyIssued,
                monthlyReturned,
                lastMonthIssued,
                // Calculate percentage change
                monthlyChange: lastMonthIssued > 0 
                    ? ((monthlyIssued - lastMonthIssued) / lastMonthIssued * 100).toFixed(1)
                    : 0
            }
        });
    } catch (error) {
        console.error('Error fetching issue stats:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
});

// Get single issue
router.get('/:id', async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id)
            .populate('student', 'name email mobile className studentId')
            .populate('book', 'title author price bookId availableQuantity quantity category');

        if (!issue) {
            return res.status(404).json({
                success: false,
                message: 'Issue not found'
            });
        }

        res.json({
            success: true,
            issue
        });
    } catch (error) {
        console.error('Error fetching issue:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
});

// Issue a new book
router.post('/issue', async (req, res) => {
    try {
        const { studentId, bookId, daysIssued, remarks } = req.body;

        // Validation
        if (!studentId || !bookId || !daysIssued) {
            return res.status(400).json({
                success: false,
                message: 'Please provide student, book, and days issued'
            });
        }

        if (daysIssued < 1 || daysIssued > 30) {
            return res.status(400).json({
                success: false,
                message: 'Days issued must be between 1 and 30'
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

        // Check if book exists and is available
        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        if (book.availableQuantity < 1) {
            return res.status(400).json({
                success: false,
                message: 'Book is not available'
            });
        }

        // Calculate dates
        const issueDate = new Date();
        const dueDate = new Date(issueDate);
        dueDate.setDate(dueDate.getDate() + parseInt(daysIssued));

        // Create issue
        const issue = new Issue({
            student: studentId,
            book: bookId,
            issueDate,
            dueDate,
            daysIssued: parseInt(daysIssued),
            remarks: remarks || '',
            status: 'issued'
        });

        // Update book quantity
        book.availableQuantity -= 1;
        
        // Save both issue and book updates in transaction
        await Promise.all([
            issue.save(),
            book.save()
        ]);

        // Populate the saved issue with student and book data
        const populatedIssue = await Issue.findById(issue._id)
            .populate('student', 'name email mobile className studentId')
            .populate('book', 'title author price bookId');

        res.status(201).json({
            success: true,
            message: 'Book issued successfully',
            issue: populatedIssue
        });
    } catch (error) {
        console.error('Error issuing book:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
});

// Return a book
router.put('/return/:id', async (req, res) => {
    try {
        const { lost = false, remarks = '' } = req.body;
        const issueId = req.params.id;

        // Find the issue
        const issue = await Issue.findById(issueId)
            .populate('student', 'name email mobile className studentId')
            .populate('book', 'title author price bookId availableQuantity quantity');

        if (!issue) {
            return res.status(404).json({
                success: false,
                message: 'Issue not found'
            });
        }

        // Check if already returned or lost
        if (issue.status === 'returned' || issue.status === 'lost') {
            return res.status(400).json({
                success: false,
                message: `Book is already ${issue.status}`
            });
        }

        const returnDate = new Date();
        const dueDate = new Date(issue.dueDate);
        let penaltyAmount = 0;

        // Calculate penalty if overdue and not lost
        if (!lost && returnDate > dueDate) {
            const daysLate = Math.ceil((returnDate - dueDate) / (1000 * 60 * 60 * 24));
            penaltyAmount = daysLate * 20; // ₹20 per day penalty
        }

        // Update issue
        issue.status = lost ? 'lost' : 'returned';
        issue.returnDate = returnDate;
        issue.penaltyAmount = penaltyAmount;
        issue.remarks = issue.remarks ? `${issue.remarks} | ${remarks}` : remarks;

        // If not lost, return book to inventory
        if (!lost && issue.book) {
            issue.book.availableQuantity += 1;
            await issue.book.save();
        }

        // Save the issue
        await issue.save();

        // Create invoice data
        const invoice = {
            invoiceId: `INV${Date.now().toString().slice(-8)}`,
            student: issue.student,
            book: issue.book,
            issueDate: issue.issueDate,
            returnDate: issue.returnDate,
            daysIssued: issue.daysIssued,
            status: issue.status,
            penaltyAmount: issue.penaltyAmount,
            bookPrice: issue.book?.price || 0,
            totalAmount: issue.penaltyAmount + (lost ? (issue.book?.price || 0) : 0),
            remarks: issue.remarks
        };

        res.json({
            success: true,
            message: lost ? 'Book marked as lost successfully' : 'Book returned successfully',
            issue,
            invoice,
            penaltyAmount
        });
    } catch (error) {
        console.error('Error returning book:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
});

// Delete an issue (admin only)
router.delete('/:id', async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id);

        if (!issue) {
            return res.status(404).json({
                success: false,
                message: 'Issue not found'
            });
        }

        // If book is issued, return it to inventory
        if (issue.status === 'issued' || issue.status === 'overdue') {
            const book = await Book.findById(issue.book);
            if (book) {
                book.availableQuantity += 1;
                await book.save();
            }
        }

        await Issue.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Issue deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting issue:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
});

module.exports = router;