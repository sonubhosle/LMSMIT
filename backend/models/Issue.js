const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const issueSchema = new mongoose.Schema({
    issueId: {
        type: Number,
        unique: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: [true, 'Student is required']
    },
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: [true, 'Book is required']
    },
    issueDate: {
        type: Date,
        default: Date.now,
        required: [true, 'Issue date is required']
    },
    dueDate: {
        type: Date,
        required: [true, 'Due date is required']
    },
    returnDate: {
        type: Date
    },
    daysIssued: {
        type: Number,
        required: [true, 'Days issued is required'],
        min: [1, 'Must issue for at least 1 day']
    },
    status: {
        type: String,
        enum: ['issued', 'returned', 'overdue', 'lost'],
        default: 'issued'
    },
    penaltyAmount: {
        type: Number,
        default: 0
    },
    remarks: {
        type: String,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Auto increment issue ID
issueSchema.plugin(AutoIncrement, { inc_field: 'issueId' });

// Update timestamp on save
issueSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    
    // Check if book is overdue
    if (this.status === 'issued' && new Date() > this.dueDate) {
        this.status = 'overdue';
    }
    
    next();
});

// Indexes for better query performance
issueSchema.index({ student: 1, status: 1 });
issueSchema.index({ book: 1, status: 1 });
issueSchema.index({ dueDate: 1, status: 1 });

module.exports = mongoose.model('Issue', issueSchema);