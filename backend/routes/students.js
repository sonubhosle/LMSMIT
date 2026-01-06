const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');

// JWT Secret (same as in auth.js)
const JWT_SECRET = 'library_management_secret_key_2023';

// Verify Token Middleware (same as in auth.js)
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

// Get all students with pagination and search
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, search, className, isActive } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Build query
        let query = {};
        
        // Search query
        if (search && search.trim() !== '') {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { mobile: { $regex: search, $options: 'i' } },
                { className: { $regex: search, $options: 'i' } }
            ];
        }

        // Filter by class
        if (className && className.trim() !== '') {
            query.className = className;
        }

        // Filter by active status
        if (isActive !== undefined && isActive !== '') {
            query.isActive = isActive === 'true';
        }

        // Get total count
        const totalStudents = await Student.countDocuments(query);
        const totalPages = Math.ceil(totalStudents / limitNum);

        // Get students with pagination
        const students = await Student.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        res.json({
            success: true,
            students,
            total: totalStudents,
            page: pageNum,
            pages: totalPages,
            limit: limitNum
        });
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
});

// Get student statistics
router.get('/stats/summary', async (req, res) => {
    try {
        const totalStudents = await Student.countDocuments();
        const activeStudents = await Student.countDocuments({ isActive: true });
        const inactiveStudents = await Student.countDocuments({ isActive: false });
        const studentsWithBooks = await Student.countDocuments({ totalBooksIssued: { $gt: 0 } });
        
        // Students by class
        const studentsByClass = await Student.aggregate([
            { $group: { _id: '$className', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // Recent students (last 7 days)
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        const recentStudents = await Student.countDocuments({
            createdAt: { $gte: oneWeekAgo }
        });

        res.json({
            success: true,
            stats: {
                totalStudents,
                activeStudents,
                inactiveStudents,
                studentsWithBooks,
                recentStudents,
                studentsByClass
            }
        });
    } catch (error) {
        console.error('Error fetching student stats:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
});

// Get single student
router.get('/:id', async (req, res) => {
    try {
        const student = await Student.findById(req.params.id)
            .populate('issuedBooks')
            .populate({
                path: 'issuedBooks',
                populate: {
                    path: 'book',
                    select: 'title author isbn'
                }
            });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        res.json({
            success: true,
            student
        });
    } catch (error) {
        console.error('Error fetching student:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
});

// Create new student
router.post('/', async (req, res) => {
    try {
        const { name, email, mobile, className, semester, admissionYear, isActive } = req.body;

        // Validation
        if (!name || !email || !mobile || !className) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields: name, email, mobile, className'
            });
        }

        // Validate email format
        const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid email address'
            });
        }

        // Validate mobile format
        const mobileRegex = /^[0-9]{10}$/;
        if (!mobileRegex.test(mobile)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid 10-digit mobile number'
            });
        }

        // Check if email already exists
        const existingStudent = await Student.findOne({ email });
        if (existingStudent) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists'
            });
        }

        // Create student without studentId (it will be auto-generated)
        const student = new Student({
            name,
            email,
            mobile,
            className,
            semester: semester || null,
            admissionYear: admissionYear || null,
            isActive: isActive !== undefined ? isActive : true
        });

        await student.save();

        // Get the saved student with auto-generated studentId
        const savedStudent = await Student.findById(student._id);

        res.status(201).json({
            success: true,
            message: 'Student created successfully',
            student: savedStudent
        });
    } catch (error) {
        console.error('Error creating student:', error);
        
        // Handle specific Mongoose validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }
        
        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists'
            });
        }
        
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
});

// Update student
router.put('/:id', async (req, res) => {
    try {
        const { name, email, mobile, className, semester, admissionYear, isActive } = req.body;
        const studentId = req.params.id;

        // Check if student exists
        const existingStudent = await Student.findById(studentId);
        if (!existingStudent) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Check if email is being changed and if it already exists for another student
        if (email && email !== existingStudent.email) {
            const emailExists = await Student.findOne({ email, _id: { $ne: studentId } });
            if (emailExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already exists'
                });
            }
        }

        // Validate email if provided
        if (email) {
            const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    message: 'Please enter a valid email address'
                });
            }
        }

        // Validate mobile if provided
        if (mobile) {
            const mobileRegex = /^[0-9]{10}$/;
            if (!mobileRegex.test(mobile)) {
                return res.status(400).json({
                    success: false,
                    message: 'Please enter a valid 10-digit mobile number'
                });
            }
        }

        // Validate admission year if provided
        if (admissionYear) {
            const currentYear = new Date().getFullYear();
            if (admissionYear < 2000 || admissionYear > currentYear) {
                return res.status(400).json({
                    success: false,
                    message: `Admission year must be between 2000 and ${currentYear}`
                });
            }
        }

        // Validate semester if provided
        if (semester && (semester < 1 || semester > 8)) {
            return res.status(400).json({
                success: false,
                message: 'Semester must be between 1 and 8'
            });
        }

        // Prepare update object
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (email !== undefined) updateData.email = email;
        if (mobile !== undefined) updateData.mobile = mobile;
        if (className !== undefined) updateData.className = className;
        if (semester !== undefined) updateData.semester = semester;
        if (admissionYear !== undefined) updateData.admissionYear = admissionYear;
        if (isActive !== undefined) updateData.isActive = isActive;

        const student = await Student.findByIdAndUpdate(
            studentId,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Student updated successfully',
            student
        });
    } catch (error) {
        console.error('Error updating student:', error);
        
        // Handle specific Mongoose validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }
        
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
});

// Update student status
router.put('/:id/status', async (req, res) => {
    try {
        const { isActive, accountStatus } = req.body;
        const studentId = req.params.id;

        // Check if student exists
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Prepare update data
        const updateData = {};
        if (isActive !== undefined) updateData.isActive = isActive;
        if (accountStatus !== undefined) updateData.accountStatus = accountStatus;

        // Cannot deactivate student with issued books
        if (isActive === false && student.totalBooksIssued > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot deactivate student with issued books. Please return all books first.'
            });
        }

        const updatedStudent = await Student.findByIdAndUpdate(
            studentId,
            { $set: updateData },
            { new: true }
        );

        res.json({
            success: true,
            message: 'Student status updated successfully',
            student: updatedStudent
        });
    } catch (error) {
        console.error('Error updating student status:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
});

// Delete student
router.delete('/:id', async (req, res) => {
    try {
        const studentId = req.params.id;

        // Check if student exists
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Check if student has issued books
        if (student.totalBooksIssued > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete student with issued books. Please return all books first.'
            });
        }

        await Student.findByIdAndDelete(studentId);

        res.json({
            success: true,
            message: 'Student deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
});

module.exports = router;