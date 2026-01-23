const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const invoiceSchema = new mongoose.Schema({
    invoiceId: {
        type: String,  // CHANGED FROM Number to String
        unique: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: [true, 'Student is required']
    },
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book'
    },
    issue: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Issue'
    },
    invoiceType: {
        type: String,
        enum: ['late_return', 'lost_book', 'other'],
        required: [true, 'Invoice type is required']
    },
    daysLate: {
        type: Number,
        default: 0,
        min: [0, 'Days late cannot be negative']
    },
    penaltyPerDay: {
        type: Number,
        default: 20
    },
    bookPrice: {
        type: Number,
        default: 0
    },
    totalPenalty: {
        type: Number,
        default: 0
    },
    totalAmount: {
        type: Number,
        required: [true, 'Total amount is required'],
        min: [0, 'Total amount cannot be negative']
    },
    status: {
        type: String,
        enum: ['pending', 'paid', 'cancelled'],
        default: 'pending'
    },
    paymentDate: {
        type: Date
    },
    remarks: {
        type: String,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Auto increment invoice ID - MODIFIED
invoiceSchema.plugin(AutoIncrement, { 
    inc_field: 'invoiceCounter',
    id: 'invoice_seq'
});

// Generate custom invoice ID before save
// Calculate total amount before saving
invoiceSchema.pre('save', function(next) {
    // Generate INV-prefixed ID if not already set
    if (!this.invoiceId) {
        const counter = this.invoiceCounter || 1;
        this.invoiceId = `INV${counter.toString().padStart(6, '0')}`;
    }
    
    // Calculate totals based on invoice type
    if (this.invoiceType === 'late_return') {
        const daysLate = this.daysLate || 0;
        const penaltyPerDay = this.penaltyPerDay || 20;
        this.totalPenalty = daysLate * penaltyPerDay;
        this.totalAmount = this.totalPenalty;
    } else if (this.invoiceType === 'lost_book') {
        const bookPrice = this.bookPrice || 0;
        const daysLate = this.daysLate || 0;
        const penaltyPerDay = this.penaltyPerDay || 20;
        this.totalPenalty = daysLate * penaltyPerDay;
        this.totalAmount = bookPrice + this.totalPenalty;
    }
    // For 'other' type, totalAmount should be provided directly
    
    // Make sure totalAmount is set
    if (!this.totalAmount && this.totalAmount !== 0) {
        this.totalAmount = 0;
    }
    
    next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);