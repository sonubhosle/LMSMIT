// Dashboard functionality

class Dashboard {
    constructor() {
        this.baseURL = 'http://localhost:5000/api';
        this.stats = {
            books: 0,
            students: 0,
            issuedBooks: 0,
            invoices: 0,
            overdueBooks: 0,
            totalRevenue: 0,
            pendingInvoices: 0
        };
    }

    // Initialize dashboard
    async initialize() {
        await this.loadRecentIssues();
        await this.loadOverdueBooks();
        await this.loadBookCategories();
        await this.loadRecentStudents();
        await this.loadRecentInvoices();
        this.setupAutoRefresh();
    }



    // Load recent issued books
// Load recent issued books - FIXED VERSION
async loadRecentIssues() {
    try {
        console.log('Loading recent issues...');
        
        // Use the correct API endpoint structure
        const response = await api.fetch(`${this.baseURL}/issues?page=1&limit=5&sort=desc`);
        const container = document.getElementById('recentIssues');
        
        if (!response.ok) {
            console.error('API Error:', response.status, response.statusText);
            container.innerHTML = `
                <div class="text-center py-8 text-red-500">
                    <i class="fas fa-exclamation-circle text-xl mb-2"></i>
                    <p>Failed to load recent issues</p>
                    <p class="text-sm">Status: ${response.status}</p>
                </div>
            `;
            return;
        }

        const data = await response.json();
        console.log('Recent issues data:', data);
        
        // Check if we have the expected structure
        const issues = data.issues || [];
        
        if (issues.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-slate-500">
                    <i class="fas fa-exchange-alt text-xl mb-2"></i>
                    <p>No books issued recently</p>
                </div>
            `;
            return;
        }

        let html = '';
        issues.forEach(issue => {
            // Handle missing dates safely
            const issueDate = issue.issueDate ? new Date(issue.issueDate) : new Date();
            const dueDate = issue.dueDate ? new Date(issue.dueDate) : null;
            const today = new Date();
            
            let statusText = 'Issued';
            let statusClass = 'text-blue-600';
            
            if (dueDate) {
                const timeDiff = dueDate.getTime() - today.getTime();
                const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
                
                if (timeDiff < 0) {
                    statusText = 'Overdue';
                    statusClass = 'text-red-600';
                } else {
                    statusText = `Due in ${daysRemaining} days`;
                    statusClass = 'text-green-600';
                }
            }
            
            // Safely get nested properties
            const bookTitle = issue.book?.title || 'Unknown Book';
            const studentName = issue.student?.name || 'Unknown Student';
            const dueDateString = dueDate ? dueDate.toLocaleDateString() : 'N/A';
            
            html += `
                <div class="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition duration-200 mb-2">
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center space-x-3">
                            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <i class="fas fa-book text-blue-600"></i>
                            </div>
                            <div class="min-w-0">
                                <p class="font-medium text-slate-800 truncate">${bookTitle}</p>
                                <p class="text-sm text-slate-500 truncate">Issued to: ${studentName}</p>
                            </div>
                        </div>
                    </div>
                    <div class="text-right ml-4 flex-shrink-0">
                        <p class="text-sm font-medium ${statusClass} whitespace-nowrap">
                            ${statusText}
                        </p>
                        <p class="text-xs text-slate-500 whitespace-nowrap">${dueDateString}</p>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
        console.log('Recent issues loaded successfully');
        
    } catch (error) {
        console.error('Error loading recent issues:', error);
        const container = document.getElementById('recentIssues');
        container.innerHTML = `
            <div class="text-center py-8">
                <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-exclamation-triangle text-red-600"></i>
                </div>
                <p class="text-red-500 mb-2">Failed to load recent issues</p>
                <p class="text-sm text-slate-500 mb-4">${error.message}</p>
                <button onclick="dashboard.loadRecentIssues()" class="px-3 py-1 bg-slate-200 rounded hover:bg-slate-300 text-sm">
                    Retry
                </button>
            </div>
        `;
    }
}
    // Load overdue books
 // Load overdue books - FIXED VERSION
async loadOverdueBooks() {
    try {
        console.log('Loading overdue books...');
        
        // Use the correct endpoint for overdue books
        const response = await api.fetch(`${this.baseURL}/issues/overdue`);
        const container = document.getElementById('overdueList');
        
        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Overdue books data:', data);
        
        // Check if we have the expected structure
        const issues = data.issues || [];
        
        // Update count in header
        const overdueCountEl = document.getElementById('overdueCount');
        if (overdueCountEl) {
            overdueCountEl.textContent = issues.length;
        }

        if (issues.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-green-500">
                    <i class="fas fa-check-circle text-xl mb-2"></i>
                    <p>No overdue books! Great work!</p>
                </div>
            `;
            return;
        }

        let html = '';
        issues.slice(0, 5).forEach(issue => {
            const dueDate = new Date(issue.dueDate);
            const today = new Date();
            const daysOverdue = Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24));
            const penalty = daysOverdue * 20; // ₹20 per day penalty
            
            // Safely get nested properties
            const bookTitle = issue.book?.title || 'Unknown Book';
            const studentName = issue.student?.name || 'Unknown Student';
            
            html += `
                <div class="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg mb-2">
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center space-x-3">
                            <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <i class="fas fa-exclamation-triangle text-red-600"></i>
                            </div>
                            <div class="min-w-0">
                                <p class="font-medium text-slate-800 truncate">${bookTitle}</p>
                                <p class="text-sm text-slate-500 truncate">${studentName}</p>
                            </div>
                        </div>
                    </div>
                    <div class="text-right ml-4 flex-shrink-0">
                        <p class="text-sm font-medium text-red-600 whitespace-nowrap">
                            ${daysOverdue} days overdue
                        </p>
                        <p class="text-xs text-slate-500 whitespace-nowrap">₹${penalty} penalty</p>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
        console.log('Overdue books loaded successfully');
        
    } catch (error) {
        console.error('Error loading overdue books:', error);
        const container = document.getElementById('overdueList');
        container.innerHTML = `
            <div class="text-center py-8">
                <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-exclamation-triangle text-red-600"></i>
                </div>
                <p class="text-red-500 mb-2">Failed to load overdue books</p>
                <p class="text-sm text-slate-500 mb-4">${error.message}</p>
                <button onclick="dashboard.loadOverdueBooks()" class="px-3 py-1 bg-slate-200 rounded hover:bg-slate-300 text-sm">
                    Retry
                </button>
            </div>
        `;
    }
}

    // Load book categories
    async loadBookCategories() {
        try {
            const response = await api.fetch(`${this.baseURL}/books?limit=100`);
            const container = document.getElementById('bookCategories');
            
            if (!response.ok) {
                container.innerHTML = `
                    <div class="text-center py-8 text-red-500">
                        <i class="fas fa-exclamation-circle text-xl mb-2"></i>
                        <p>Failed to load categories</p>
                    </div>
                `;
                return;
            }

            const data = await response.json();
            
            if (data.books.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-8 text-slate-500">
                        <i class="fas fa-book text-xl mb-2"></i>
                        <p>No books found</p>
                    </div>
                `;
                return;
            }

            // Count books by category
            const categories = {};
            data.books.forEach(book => {
                const category = book.category || 'Uncategorized';
                categories[category] = (categories[category] || 0) + 1;
            });

            // Sort by count
            const sortedCategories = Object.entries(categories)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5); // Top 5 categories

            if (sortedCategories.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-8 text-slate-500">
                        <i class="fas fa-book text-xl mb-2"></i>
                        <p>No categories found</p>
                    </div>
                `;
                return;
            }

            let html = '';
            sortedCategories.forEach(([category, count]) => {
                const percentage = Math.round((count / data.total) * 100);
                
                html += `
                    <div class="space-y-2">
                        <div class="flex items-center justify-between">
                            <span class="text-sm font-medium text-slate-700">${category}</span>
                            <span class="text-sm text-slate-500">${count} books</span>
                        </div>
                        <div class="w-full bg-slate-200 rounded-full h-2">
                            <div class="bg-blue-600 h-2 rounded-full" style="width: ${percentage}%"></div>
                        </div>
                    </div>
                `;
            });

            container.innerHTML = html;
        } catch (error) {
            console.error('Error loading book categories:', error);
        }
    }

    // Load recent students
    async loadRecentStudents() {
        try {
            const response = await api.fetch(`${this.baseURL}/students?limit=5`);
            const container = document.getElementById('recentStudents');
            
            if (!response.ok) {
                container.innerHTML = `
                    <div class="text-center py-8 text-red-500">
                        <i class="fas fa-exclamation-circle text-xl mb-2"></i>
                        <p>Failed to load recent students</p>
                    </div>
                `;
                return;
            }

            const data = await response.json();
            
            if (data.students.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-8 text-slate-500">
                        <i class="fas fa-users text-xl mb-2"></i>
                        <p>No students found</p>
                    </div>
                `;
                return;
            }

            let html = '';
            data.students.forEach(student => {
                const issuedCount = student.issuedBooks?.length || 0;
                
                html += `
                    <div class="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition duration-200">
                        <div class="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                            <i class="fas fa-user text-white"></i>
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="font-medium text-slate-800 truncate">${student.name}</p>
                            <p class="text-sm text-slate-500 truncate">${student.className} • ${student.email}</p>
                        </div>
                        <div class="text-right">
                            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${issuedCount > 0 ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}">
                                ${issuedCount} book${issuedCount !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>
                `;
            });

            container.innerHTML = html;
        } catch (error) {
            console.error('Error loading recent students:', error);
        }
    }

    // Load recent invoices
    async loadRecentInvoices() {
        try {
            const response = await api.fetch(`${this.baseURL}/invoices?limit=5`);
            const container = document.getElementById('recentInvoices');
            
            if (!response.ok) {
                container.innerHTML = `
                    <div class="text-center py-8 text-red-500">
                        <i class="fas fa-exclamation-circle text-xl mb-2"></i>
                        <p>Failed to load recent invoices</p>
                    </div>
                `;
                return;
            }

            const data = await response.json();
            
            if (data.invoices.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-8 text-slate-500">
                        <i class="fas fa-file-invoice text-xl mb-2"></i>
                        <p>No invoices found</p>
                    </div>
                `;
                return;
            }

            let html = '';
            data.invoices.forEach(invoice => {
                const statusColor = {
                    'pending': 'bg-yellow-100 text-yellow-800',
                    'paid': 'bg-green-100 text-green-800',
                    'cancelled': 'bg-red-100 text-red-800'
                }[invoice.status] || 'bg-slate-100 text-slate-800';
                
                html += `
                    <div class="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition duration-200">
                        <div class="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center">
                            <i class="fas fa-file-invoice-dollar text-white"></i>
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="font-medium text-slate-800 truncate">Invoice #${invoice.invoiceId}</p>
                            <p class="text-sm text-slate-500 truncate">${invoice.student?.name || 'Unknown Student'}</p>
                        </div>
                        <div class="text-right">
                            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColor}">
                                ${invoice.status}
                            </span>
                            <p class="text-sm font-medium text-slate-800 mt-1">₹${invoice.totalAmount.toFixed(2)}</p>
                        </div>
                    </div>
                `;
            });

            container.innerHTML = html;
        } catch (error) {
            console.error('Error loading recent invoices:', error);
        }
    }

    // Setup auto-refresh
    setupAutoRefresh() {
        // Refresh stats every 30 seconds
        setInterval(() => {
            this.loadStats();
            this.loadRecentIssues();
            this.loadOverdueBooks();
        }, 30000);

        // Refresh other data every 2 minutes
        setInterval(() => {
            this.loadBookCategories();
            this.loadRecentStudents();
            this.loadRecentInvoices();
        }, 120000);
    }

    // Show error message
    showError(message) {
        const toast = document.createElement('div');
        toast.className = 'animate-fade-in bg-white border-l-4 border-red-500 p-4 rounded-r-lg shadow-lg max-w-md';
        toast.innerHTML = `
            <div class="flex items-center">
                <div class="flex-shrink-0">
                    <i class="fas fa-exclamation-circle text-red-500 text-lg"></i>
                </div>
                <div class="ml-3">
                    <p class="text-sm font-medium text-slate-900">${message}</p>
                </div>
                <div class="ml-auto pl-3">
                    <button onclick="this.parentElement.parentElement.remove()" class="text-slate-400 hover:text-slate-500">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;

        const container = document.getElementById('toastContainer') || document.body;
        container.appendChild(toast);

        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 5000);
    }
}

// Initialize dashboard when function is called
function initializeDashboard() {
    const dashboard = new Dashboard();
    dashboard.initialize();
}

// Export for use in other files
window.Dashboard = Dashboard;