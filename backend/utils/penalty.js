/**
 * Calculate penalty for late book return
 * @param {Date} dueDate - Due date of the book
 * @param {Date} returnDate - Actual return date
 * @param {number} penaltyPerDay - Penalty per day (default: ₹20)
 * @returns {Object} - Contains daysLate and penaltyAmount
 */
const calculatePenalty = (dueDate, returnDate, penaltyPerDay = 20) => {
    if (!dueDate || !returnDate) {
        throw new Error('Both dueDate and returnDate are required');
    }

    const due = new Date(dueDate);
    const returned = new Date(returnDate);

    // If returned on or before due date, no penalty
    if (returned <= due) {
        return {
            daysLate: 0,
            penaltyAmount: 0
        };
    }

    // Calculate days late (rounded up)
    const timeDiff = returned - due;
    const daysLate = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    // Calculate penalty
    const penaltyAmount = daysLate * penaltyPerDay;

    return {
        daysLate,
        penaltyAmount
    };
};

/**
 * Calculate penalty for lost book
 * @param {number} bookPrice - Price of the book
 * @param {Date} dueDate - Due date of the book
 * @param {Date} reportDate - Date when book was reported lost
 * @param {number} penaltyPerDay - Penalty per day (default: ₹20)
 * @returns {Object} - Contains total penalty including book price
 */
const calculateLostBookPenalty = (bookPrice, dueDate, reportDate, penaltyPerDay = 20) => {
    if (!bookPrice || bookPrice <= 0) {
        throw new Error('Valid book price is required');
    }

    let penaltyAmount = bookPrice;

    if (dueDate && reportDate) {
        const due = new Date(dueDate);
        const reported = new Date(reportDate);

        // Add penalty for days late if reported after due date
        if (reported > due) {
            const timeDiff = reported - due;
            const daysLate = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
            penaltyAmount += daysLate * penaltyPerDay;
        }
    }

    return {
        totalAmount: penaltyAmount,
        bookPrice,
        latePenalty: penaltyAmount - bookPrice
    };
};

/**
 * Check if a book is overdue
 * @param {Date} dueDate - Due date of the book
 * @returns {boolean} - True if overdue, false otherwise
 */
const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date() > new Date(dueDate);
};

/**
 * Calculate days remaining until due date
 * @param {Date} dueDate - Due date of the book
 * @returns {number} - Days remaining (negative if overdue)
 */
const daysRemaining = (dueDate) => {
    if (!dueDate) return 0;
    
    const now = new Date();
    const due = new Date(dueDate);
    const timeDiff = due - now;
    
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
};

module.exports = {
    calculatePenalty,
    calculateLostBookPenalty,
    isOverdue,
    daysRemaining
};