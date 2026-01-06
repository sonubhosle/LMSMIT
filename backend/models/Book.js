const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const bookSchema = new mongoose.Schema({
    bookId: {
        type: String, 
        unique: true
    },
    title: {
        type: String,
        required: [true, 'Book title is required'],
        trim: true,
        index: true
    },
    author: {
        type: String,
        required: [true, 'Author name is required'],
        trim: true
    },
    isbn: {
        type: String,
        trim: true
    },
    publicationYear: {
        type: Number,
        required: [true, 'Publication year is required'],
        min: [1000, 'Invalid year'],
        max: [new Date().getFullYear(), 'Year cannot be in the future']
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [0, 'Quantity cannot be negative'],
        default: 1
    },
    availableQuantity: {
        type: Number,
        default: function() {
            return this.quantity;
        }
    },
    category: {
        type: String,
        trim: true,
        default: 'General'
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

// Auto increment book ID - MODIFIED FOR STRING
bookSchema.plugin(AutoIncrement, { 
    inc_field: 'bookCounter',
    id: 'book_seq'
});

// Generate custom book ID before save
bookSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    
    // Generate BOOK-prefixed ID if not already set
    if (!this.bookId) {
        const counter = this.bookCounter || 1;
        this.bookId = `BOOK${counter.toString().padStart(6, '0')}`;
    }
    
    // Ensure availableQuantity is never more than quantity
    if (this.availableQuantity > this.quantity) {
        this.availableQuantity = this.quantity;
    }
    
    next();
});

module.exports = mongoose.model('Book', bookSchema);