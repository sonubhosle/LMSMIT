const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    bookId: {
        type: String, 
        unique: true,
        index: true
    },
    bookCounter: {  // ADD THIS FIELD FOR SORTING
        type: Number,
        unique: true,
        index: true
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

// Manual sequence implementation with automatic reset
bookSchema.pre('save', async function(next) {
    try {
        this.updatedAt = Date.now();
        
        // Only process for new documents
        if (this.isNew) {
            const Book = mongoose.model('Book');
            
            // ALWAYS check if collection is empty when creating new book
            const bookCount = await Book.countDocuments();
            
            if (bookCount === 0) {
                // COLLECTION IS EMPTY - Start fresh from BOOK000001
                // Delete any existing sequence counter
                try {
                    await mongoose.connection.db.collection('counters').deleteOne({ _id: 'book_seq' });
                } catch (err) {
                    // Counter might not exist, that's fine
                }
                
                // Create new sequence starting at 1
                await mongoose.connection.db.collection('counters').insertOne({
                    _id: 'book_seq',
                    seq: 0  // Will be incremented to 1
                });
                
                console.log('🔄 Auto-reset: Collection empty, starting fresh from BOOK000001');
                
                // Set bookCounter to 1 and bookId to BOOK000001
                this.bookCounter = 1;
                this.bookId = 'BOOK000001';
            } else {
                // Collection has books, use normal sequence
                // Get or create sequence
                const sequenceDoc = await mongoose.connection.db.collection('counters').findOne({ 
                    _id: 'book_seq' 
                });
                
                let nextSeq;
                if (!sequenceDoc) {
                    // Sequence doesn't exist, create it based on max bookCounter
                    const maxBook = await Book.findOne().sort({ bookCounter: -1 });
                    nextSeq = maxBook ? maxBook.bookCounter + 1 : 1;
                    
                    await mongoose.connection.db.collection('counters').insertOne({
                        _id: 'book_seq',
                        seq: nextSeq
                    });
                } else {
                    // Increment existing sequence
                    nextSeq = sequenceDoc.seq + 1;
                    await mongoose.connection.db.collection('counters').updateOne(
                        { _id: 'book_seq' },
                        { $set: { seq: nextSeq } }
                    );
                }
                
                // Set the bookCounter and generate bookId
                this.bookCounter = nextSeq;
                this.bookId = `BOOK${nextSeq.toString().padStart(6, '0')}`;
            }
        }
        
        // Ensure bookCounter exists (for existing documents that might not have it)
        if (!this.bookCounter && this.bookId) {
            // Extract counter from bookId (e.g., BOOK000001 -> 1)
            const match = this.bookId.match(/BOOK(\d+)/);
            if (match) {
                this.bookCounter = parseInt(match[1]);
                console.log(`🔧 Fixed missing bookCounter for ${this.bookId}: ${this.bookCounter}`);
            }
        }
        
        // Ensure availableQuantity is never more than quantity
        if (this.availableQuantity > this.quantity) {
            this.availableQuantity = this.quantity;
        }
        
        // Ensure availableQuantity is not negative
        if (this.availableQuantity < 0) {
            this.availableQuantity = 0;
        }
        
        next();
    } catch (error) {
        console.error('Error in pre-save hook:', error);
        next(error);
    }
});

// Post-save hook to ensure consistency
bookSchema.post('save', async function(doc, next) {
    try {
        // Ensure bookCounter and bookId are in sync
        if (doc.bookCounter && !doc.bookId) {
            // If bookCounter exists but bookId doesn't, generate it
            doc.bookId = `BOOK${doc.bookCounter.toString().padStart(6, '0')}`;
            await doc.save({ validateBeforeSave: false });
        } else if (doc.bookId && !doc.bookCounter) {
            // If bookId exists but bookCounter doesn't, extract it
            const match = doc.bookId.match(/BOOK(\d+)/);
            if (match) {
                doc.bookCounter = parseInt(match[1]);
                await doc.save({ validateBeforeSave: false });
            }
        }
        next();
    } catch (error) {
        console.error('Error in post-save hook:', error);
        next();
    }
});

// Static method to fix all existing documents
bookSchema.statics.fixMissingCounters = async function() {
    try {
        const books = await this.find({ bookCounter: { $exists: false } });
        let fixedCount = 0;
        
        for (const book of books) {
            if (book.bookId) {
                const match = book.bookId.match(/BOOK(\d+)/);
                if (match) {
                    book.bookCounter = parseInt(match[1]);
                    await book.save({ validateBeforeSave: false });
                    fixedCount++;
                    console.log(`🔧 Fixed missing counter for ${book.bookId}: ${book.bookCounter}`);
                }
            }
        }
        
        console.log(`✅ Fixed ${fixedCount} books with missing bookCounter`);
        return fixedCount;
    } catch (error) {
        console.error('Error fixing missing counters:', error);
        throw error;
    }
};

// Index for sorting
bookSchema.index({ bookCounter: 1 });

// Virtual for issued books count
bookSchema.virtual('issuedCount').get(function() {
    return this.quantity - this.availableQuantity;
});

// Static method to get next book ID
bookSchema.statics.getNextBookId = async function() {
    try {
        const Book = mongoose.model('Book');
        const bookCount = await Book.countDocuments();
        
        if (bookCount === 0) {
            return 'BOOK000001';
        }
        
        const sequenceDoc = await mongoose.connection.db.collection('counters').findOne({ 
            _id: 'book_seq' 
        });
        
        if (!sequenceDoc) {
            const maxBook = await Book.findOne().sort({ bookCounter: -1 });
            const nextCounter = maxBook ? maxBook.bookCounter + 1 : 1;
            return `BOOK${nextCounter.toString().padStart(6, '0')}`;
        }
        
        const nextCounter = sequenceDoc.seq + 1;
        return `BOOK${nextCounter.toString().padStart(6, '0')}`;
    } catch (error) {
        console.error('Error getting next book ID:', error);
        return `BOOK${Date.now().toString().slice(-6)}`;
    }
};

module.exports = mongoose.model('Book', bookSchema);