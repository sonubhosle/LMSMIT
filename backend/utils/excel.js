const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

/**
 * Generate Excel file for books
 * @param {Array} books - Array of book objects
 * @param {string} filePath - Path to save the Excel file
 */
const generateBooksExcel = async (books, filePath) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Books');

    // Define columns
    worksheet.columns = [
        { header: 'Book ID', key: 'bookId', width: 10 },
        { header: 'Title', key: 'title', width: 30 },
        { header: 'Author', key: 'author', width: 25 },
        { header: 'ISBN', key: 'isbn', width: 15 },
        { header: 'Year', key: 'publicationYear', width: 10 },
        { header: 'Category', key: 'category', width: 15 },
        { header: 'Price (₹)', key: 'price', width: 12 },
        { header: 'Quantity', key: 'quantity', width: 10 },
        { header: 'Available', key: 'availableQuantity', width: 10 },
        { header: 'Added Date', key: 'createdAt', width: 15 }
    ];

    // Style the header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
    };

    // Add data
    books.forEach(book => {
        worksheet.addRow({
            bookId: book.bookId,
            title: book.title,
            author: book.author,
            isbn: book.isbn || 'N/A',
            publicationYear: book.publicationYear,
            category: book.category || 'General',
            price: book.price.toFixed(2),
            quantity: book.quantity,
            availableQuantity: book.availableQuantity,
            createdAt: new Date(book.createdAt).toLocaleDateString()
        });
    });

    // Add totals row
    const totalRow = worksheet.rowCount + 2;
    worksheet.getCell(`G${totalRow}`).value = 'Total Value:';
    worksheet.getCell(`G${totalRow}`).font = { bold: true };
    
    const totalValue = books.reduce((sum, book) => sum + (book.price * book.quantity), 0);
    worksheet.getCell(`H${totalRow}`).value = `₹${totalValue.toFixed(2)}`;
    worksheet.getCell(`H${totalRow}`).font = { bold: true };

    // Auto filter
    worksheet.autoFilter = {
        from: 'A1',
        to: `J${worksheet.rowCount}`
    };

    // Save the workbook
    await workbook.xlsx.writeFile(filePath);
};

/**
 * Generate Excel file for students
 * @param {Array} students - Array of student objects
 * @param {string} filePath - Path to save the Excel file
 */
const generateStudentsExcel = async (students, filePath) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Students');

    // Define columns
    worksheet.columns = [
        { header: 'Student ID', key: 'studentId', width: 10 },
        { header: 'Name', key: 'name', width: 25 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Mobile', key: 'mobile', width: 15 },
        { header: 'Class', key: 'className', width: 15 },
        { header: 'Issued Books', key: 'issuedBooksCount', width: 12 },
        { header: 'Joined Date', key: 'createdAt', width: 15 }
    ];

    // Style the header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
    };

    // Add data
    students.forEach(student => {
        worksheet.addRow({
            studentId: student.studentId,
            name: student.name,
            email: student.email,
            mobile: student.mobile,
            className: student.className,
            issuedBooksCount: student.issuedBooks?.length || 0,
            createdAt: new Date(student.createdAt).toLocaleDateString()
        });
    });

    // Add totals row
    const totalRow = worksheet.rowCount + 2;
    worksheet.getCell(`A${totalRow}`).value = `Total Students: ${students.length}`;
    worksheet.getCell(`A${totalRow}`).font = { bold: true };

    // Auto filter
    worksheet.autoFilter = {
        from: 'A1',
        to: `G${worksheet.rowCount}`
    };

    // Save the workbook
    await workbook.xlsx.writeFile(filePath);
};

/**
 * Generate Excel file for issued books
 * @param {Array} issues - Array of issue objects
 * @param {string} filePath - Path to save the Excel file
 */
const generateIssuesExcel = async (issues, filePath) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Issued Books');

    // Define columns
    worksheet.columns = [
        { header: 'Issue ID', key: 'issueId', width: 10 },
        { header: 'Student Name', key: 'studentName', width: 25 },
        { header: 'Student Email', key: 'studentEmail', width: 30 },
        { header: 'Book Title', key: 'bookTitle', width: 30 },
        { header: 'Author', key: 'author', width: 25 },
        { header: 'Issue Date', key: 'issueDate', width: 15 },
        { header: 'Due Date', key: 'dueDate', width: 15 },
        { header: 'Days Issued', key: 'daysIssued', width: 12 },
        { header: 'Status', key: 'status', width: 12 },
        { header: 'Return Date', key: 'returnDate', width: 15 },
        { header: 'Penalty (₹)', key: 'penaltyAmount', width: 12 }
    ];

    // Style the header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
    };

    // Add data
    issues.forEach(issue => {
        const studentName = issue.student ? `${issue.student.name} (ID: ${issue.student.studentId})` : 'N/A';
        const studentEmail = issue.student ? issue.student.email : 'N/A';
        const bookTitle = issue.book ? issue.book.title : 'N/A';
        const author = issue.book ? issue.book.author : 'N/A';

        worksheet.addRow({
            issueId: issue.issueId,
            studentName,
            studentEmail,
            bookTitle,
            author,
            issueDate: new Date(issue.issueDate).toLocaleDateString(),
            dueDate: new Date(issue.dueDate).toLocaleDateString(),
            daysIssued: issue.daysIssued,
            status: issue.status.charAt(0).toUpperCase() + issue.status.slice(1),
            returnDate: issue.returnDate ? new Date(issue.returnDate).toLocaleDateString() : 'Not Returned',
            penaltyAmount: issue.penaltyAmount || 0
        });

        // Highlight overdue rows
        if (issue.status === 'overdue') {
            const row = worksheet.lastRow;
            row.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFCCCC' }
            };
        }
    });

    // Add summary
    const totalIssued = issues.filter(i => i.status === 'issued' || i.status === 'overdue').length;
    const totalOverdue = issues.filter(i => i.status === 'overdue').length;
    const totalReturned = issues.filter(i => i.status === 'returned').length;
    
    const summaryRow = worksheet.rowCount + 2;
    worksheet.getCell(`A${summaryRow}`).value = 'Summary:';
    worksheet.getCell(`A${summaryRow}`).font = { bold: true };
    
    worksheet.getCell(`B${summaryRow}`).value = `Issued: ${totalIssued}`;
    worksheet.getCell(`C${summaryRow}`).value = `Overdue: ${totalOverdue}`;
    worksheet.getCell(`D${summaryRow}`).value = `Returned: ${totalReturned}`;

    // Auto filter
    worksheet.autoFilter = {
        from: 'A1',
        to: `K${worksheet.rowCount - 3}`
    };

    // Save the workbook
    await workbook.xlsx.writeFile(filePath);
};

/**
 * Generate Excel file for invoices
 * @param {Array} invoices - Array of invoice objects
 * @param {string} filePath - Path to save the Excel file
 */
const generateInvoicesExcel = async (invoices, filePath) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Invoices');

    // Define columns
    worksheet.columns = [
        { header: 'Invoice ID', key: 'invoiceId', width: 10 },
        { header: 'Student Name', key: 'studentName', width: 25 },
        { header: 'Book Title', key: 'bookTitle', width: 25 },
        { header: 'Type', key: 'type', width: 15 },
        { header: 'Status', key: 'status', width: 12 },
        { header: 'Days Late', key: 'daysLate', width: 10 },
        { header: 'Book Price (₹)', key: 'bookPrice', width: 15 },
        { header: 'Penalty (₹)', key: 'totalPenalty', width: 15 },
        { header: 'Total Amount (₹)', key: 'totalAmount', width: 15 },
        { header: 'Created Date', key: 'createdAt', width: 15 },
        { header: 'Payment Date', key: 'paymentDate', width: 15 },
        { header: 'Remarks', key: 'remarks', width: 30 }
    ];

    // Style the header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
    };

    // Add data
    invoices.forEach(invoice => {
        const studentName = invoice.student ? `${invoice.student.name} (ID: ${invoice.student.studentId})` : 'N/A';
        const bookTitle = invoice.book ? invoice.book.title : 'N/A';

        worksheet.addRow({
            invoiceId: invoice.invoiceId,
            studentName,
            bookTitle,
            type: invoice.invoiceType.replace('_', ' ').toUpperCase(),
            status: invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1),
            daysLate: invoice.daysLate || 0,
            bookPrice: invoice.bookPrice || 0,
            totalPenalty: invoice.totalPenalty || 0,
            totalAmount: invoice.totalAmount,
            createdAt: new Date(invoice.createdAt).toLocaleDateString(),
            paymentDate: invoice.paymentDate ? new Date(invoice.paymentDate).toLocaleDateString() : 'Not Paid',
            remarks: invoice.remarks || ''
        });
    });

    // Add totals
    const totalAmount = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const paidAmount = invoices
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + inv.totalAmount, 0);
    
    const totalsRow = worksheet.rowCount + 2;
    worksheet.getCell(`H${totalsRow}`).value = 'Total Amount:';
    worksheet.getCell(`H${totalsRow}`).font = { bold: true };
    worksheet.getCell(`I${totalsRow}`).value = `₹${totalAmount.toFixed(2)}`;
    worksheet.getCell(`I${totalsRow}`).font = { bold: true };
    
    worksheet.getCell(`H${totalsRow + 1}`).value = 'Paid Amount:';
    worksheet.getCell(`H${totalsRow + 1}`).font = { bold: true };
    worksheet.getCell(`I${totalsRow + 1}`).value = `₹${paidAmount.toFixed(2)}`;
    worksheet.getCell(`I${totalsRow + 1}`).font = { bold: true };
    
    worksheet.getCell(`H${totalsRow + 2}`).value = 'Pending Amount:';
    worksheet.getCell(`H${totalsRow + 2}`).font = { bold: true };
    worksheet.getCell(`I${totalsRow + 2}`).value = `₹${(totalAmount - paidAmount).toFixed(2)}`;
    worksheet.getCell(`I${totalsRow + 2}`).font = { bold: true };

    // Auto filter
    worksheet.autoFilter = {
        from: 'A1',
        to: `L${worksheet.rowCount - 5}`
    };

    // Save the workbook
    await workbook.xlsx.writeFile(filePath);
};

module.exports = {
    generateBooksExcel,
    generateStudentsExcel,
    generateIssuesExcel,
    generateInvoicesExcel
};