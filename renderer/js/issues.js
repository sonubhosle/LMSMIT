// Issued books management functionality

class IssuesManager {
    constructor() {
        this.baseURL = 'http://localhost:5000/api/issues';
        this.currentPage = 1;
        this.limit = 10;
        this.statusFilter = '';
        this.totalPages = 1;
        this.selectedIssue = null;
        this.isLoading = false;
    }

    // Load issues page
    async loadIssuesPage() {
        const content = document.getElementById('pageContent');
        content.innerHTML = `
            <div class="animate-fade-in">
                <!-- Header -->
                <div class="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0">
                    <div>
                        <h2 class="text-2xl font-bold text-slate-800">Issued Books Management</h2>
                        <p class="text-slate-600">Track and manage book issuance and returns</p>
                    </div>
                    <div class="flex space-x-3">
                        <button id="exportIssuesBtn" class="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition duration-200 flex items-center space-x-2">
                            <i class="fas fa-download"></i>
                            <span>Export Excel</span>
                        </button>
                        <button id="refreshIssuesBtn" class="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition duration-200 flex items-center space-x-2">
                            <i class="fas fa-redo"></i>
                            <span>Refresh</span>
                        </button>
                        <button id="issueBookBtn" class="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition duration-200 flex items-center space-x-2">
                            <i class="fas fa-exchange-alt"></i>
                            <span>Issue Book</span>
                        </button>
                    </div>
                </div>

                <!-- Search and Filters -->
                <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
                    <div class="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
                        <div class="flex-1">
                            <div class="relative">
                                <input type="text" id="searchIssues" placeholder="Search by student, book, or issue ID..."
                                    class="w-full px-4 py-2 pl-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                                <i class="fas fa-search absolute left-3 top-3 text-slate-400"></i>
                            </div>
                        </div>
                        <div class="flex-1">
                            <select id="statusFilter" class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                                <option value="">All Status</option>
                                <option value="issued">Currently Issued</option>
                                <option value="overdue">Overdue</option>
                                <option value="returned">Returned</option>
                                <option value="lost">Lost</option>
                            </select>
                        </div>
                        <div class="flex space-x-2">
                            <button id="clearFiltersBtn" class="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition duration-200">
                                Clear
                            </button>
                            <button id="viewOverdueBtn" class="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition duration-200 flex items-center space-x-2">
                                <i class="fas fa-exclamation-triangle"></i>
                                <span>Overdue</span>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Issues Table -->
                <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-slate-200">
                            <thead class="bg-slate-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Issue ID
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Student
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Book
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Issue Date
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Due Date
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody id="issuesTableBody" class="bg-white divide-y divide-slate-200">
                                <!-- Issues will be loaded here -->
                                <tr>
                                    <td colspan="7" class="px-6 py-12 text-center">
                                        <div class="flex flex-col items-center justify-center">
                                            <div class="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                            <p class="text-slate-600">Loading issued books...</p>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- Pagination -->
                    <div id="paginationContainer" class="px-6 py-4 border-t border-slate-200">
                        <!-- Pagination will be loaded here -->
                    </div>
                </div>

                <!-- Stats Summary -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
                    <div class="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-blue-100">Total Issued</p>
                                <h3 id="totalIssuedCount" class="text-3xl font-bold mt-2">0</h3>
                            </div>
                            <div class="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                <i class="fas fa-exchange-alt text-xl"></i>
                            </div>
                        </div>
                    </div>
                    <div class="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-red-100">Overdue Books</p>
                                <h3 id="overdueIssuedCount" class="text-3xl font-bold mt-2">0</h3>
                            </div>
                            <div class="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                <i class="fas fa-exclamation-triangle text-xl"></i>
                            </div>
                        </div>
                    </div>
                    <div class="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-green-100">Returned Books</p>
                                <h3 id="returnedIssuedCount" class="text-3xl font-bold mt-2">0</h3>
                            </div>
                            <div class="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                <i class="fas fa-check-circle text-xl"></i>
                            </div>
                        </div>
                    </div>
                    <div class="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-orange-100">Lost Books</p>
                                <h3 id="lostIssuedCount" class="text-3xl font-bold mt-2">0</h3>
                            </div>
                            <div class="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                <i class="fas fa-times-circle text-xl"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Load issues data
        await this.loadIssues();
        
        // Setup event listeners
        this.setupEventListeners();
    }

    // Load issues data
    async loadIssues() {
        if (this.isLoading) return;
        
        try {
            this.isLoading = true;
            const tbody = document.getElementById('issuesTableBody');
            
            // Show loading state
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="px-6 py-12 text-center">
                        <div class="flex flex-col items-center justify-center">
                            <div class="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p class="text-slate-600">Loading issued books...</p>
                        </div>
                    </td>
                </tr>
            `;

            let url = `${this.baseURL}?page=${this.currentPage}&limit=${this.limit}`;
            
            if (this.statusFilter) {
                url += `&status=${this.statusFilter}`;
            }
            
            const searchTerm = document.getElementById('searchIssues')?.value;
            if (searchTerm && searchTerm.trim() !== '') {
                url += `&search=${encodeURIComponent(searchTerm.trim())}`;
            }
            
            const response = await api.fetch(url);
            
            if (!response.ok) {
                throw new Error(`Failed to load issued books: ${response.status}`);
            }

            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Failed to load issued books');
            }

            this.totalPages = data.pages || 1;
            
            // Update stats
            await this.updateIssuesStats();
            
            // Render table
            this.renderIssuesTable(data.issues || []);
            
            // Render pagination
            this.renderPagination();
            
        } catch (error) {
            console.error('Error loading issues:', error);
            
            const tbody = document.getElementById('issuesTableBody');
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="px-6 py-12 text-center">
                        <div class="flex flex-col items-center justify-center">
                            <i class="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
                            <p class="text-slate-700 text-lg font-medium mb-2">Failed to load issued books</p>
                            <p class="text-slate-600 mb-4">${error.message || 'Please try again'}</p>
                            <button onclick="issuesManager.loadIssues()" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-200">
                                <i class="fas fa-redo mr-2"></i>Retry
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            
            this.showError('Failed to load issued books. Please try again.');
        } finally {
            this.isLoading = false;
        }
    }

    // Update issues statistics
    async updateIssuesStats() {
        try {
            const response = await api.fetch(`${this.baseURL}/stats/summary`);
            if (response.ok) {
                const data = await response.json();
                
                if (data.success && data.stats) {
                    document.getElementById('totalIssuedCount').textContent = data.stats.totalIssued?.toLocaleString() || '0';
                    document.getElementById('overdueIssuedCount').textContent = data.stats.totalOverdue?.toLocaleString() || '0';
                    document.getElementById('returnedIssuedCount').textContent = data.stats.totalReturned?.toLocaleString() || '0';
                    document.getElementById('lostIssuedCount').textContent = data.stats.totalLost?.toLocaleString() || '0';
                }
            }
        } catch (error) {
            console.error('Error updating issues stats:', error);
        }
    }

    // Render issues table
    renderIssuesTable(issues) {
        const tbody = document.getElementById('issuesTableBody');
        
        if (!issues || issues.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="px-6 py-12 text-center">
                        <div class="flex flex-col items-center justify-center">
                            <i class="fas fa-exchange-alt text-4xl text-slate-400 mb-4"></i>
                            <p class="text-slate-600 text-lg font-medium mb-2">No issued books found</p>
                            <p class="text-slate-500">${this.statusFilter ? 'Try a different filter' : 'Issue your first book to get started'}</p>
                            ${!this.statusFilter ? `
                                <button id="issueFirstBookBtn" class="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-200">
                                    <i class="fas fa-exchange-alt mr-2"></i>Issue Book
                                </button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `;
            
            if (!this.statusFilter) {
                setTimeout(() => {
                    document.getElementById('issueFirstBookBtn')?.addEventListener('click', () => this.showIssueBookModal());
                }, 100);
            }
            
            return;
        }

        let html = '';
        issues.forEach(issue => {
            const dueDate = new Date(issue.dueDate);
            const today = new Date();
            const isOverdue = issue.status === 'overdue' || (dueDate < today && issue.status === 'issued');
            
            const statusColors = {
                'issued': 'bg-blue-100 text-blue-800',
                'overdue': 'bg-red-100 text-red-800',
                'returned': 'bg-green-100 text-green-800',
                'lost': 'bg-orange-100 text-orange-800'
            };
            
            html += `
                <tr class="hover:bg-slate-50 transition duration-150 ${isOverdue ? 'bg-red-50' : ''}" data-issue-id="${issue._id}">
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-slate-900">${issue.issueId || issue._id?.slice(-6) || 'N/A'}</div>
                    </td>
                    <td class="px-6 py-4">
                        <div class="flex items-center">
                            <div class="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center mr-3">
                                <i class="fas fa-user text-white text-xs"></i>
                            </div>
                            <div>
                                <div class="text-sm font-medium text-slate-900">${issue.student?.name || 'Unknown Student'}</div>
                                <div class="text-sm text-slate-500">ID: ${issue.student?.studentId || 'N/A'}</div>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4">
                        <div class="flex items-center">
                            <div class="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-400 rounded-lg flex items-center justify-center mr-3">
                                <i class="fas fa-book text-white text-xs"></i>
                            </div>
                            <div>
                                <div class="text-sm font-medium text-slate-900 truncate max-w-xs">${issue.book?.title || 'Unknown Book'}</div>
                                <div class="text-sm text-slate-500">by ${issue.book?.author || 'Unknown Author'}</div>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-slate-900">${issue.issueDate ? new Date(issue.issueDate).toLocaleDateString() : 'N/A'}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm ${isOverdue ? 'font-medium text-red-600' : 'text-slate-900'}">
                            ${dueDate.toLocaleDateString()}
                            ${isOverdue ? '<i class="fas fa-exclamation-triangle ml-1"></i>' : ''}
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[issue.status] || 'bg-slate-100 text-slate-800'}">
                            ${issue.status ? issue.status.charAt(0).toUpperCase() + issue.status.slice(1) : 'Unknown'}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div class="flex items-center space-x-2">
                            <button class="view-issue-btn text-blue-600 hover:text-blue-900" data-id="${issue._id}" title="View Details">
                                <i class="fas fa-eye"></i>
                            </button>
                            ${(issue.status === 'issued' || issue.status === 'overdue') ? `
                                <button class="return-book-btn text-green-600 hover:text-green-900" data-id="${issue._id}" title="Return Book">
                                    <i class="fas fa-undo"></i>
                                </button>
                                <button class="mark-lost-btn text-red-600 hover:text-red-900" data-id="${issue._id}" title="Mark as Lost">
                                    <i class="fas fa-times"></i>
                                </button>
                            ` : ''}
                            <button class="delete-issue-btn text-gray-400 hover:text-red-600" data-id="${issue._id}" title="Delete Issue">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
        
        // Add event listeners to action buttons
        this.setupTableEventListeners();
    }

    // Render pagination
    renderPagination() {
        const container = document.getElementById('paginationContainer');
        if (!container || this.totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        let html = `
            <div class="flex items-center justify-between">
                <div class="flex-1 flex justify-between sm:hidden">
                    <button onclick="issuesManager.previousPage()" ${this.currentPage === 1 ? 'disabled' : ''} 
                        class="relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md ${this.currentPage === 1 ? 'text-slate-400 bg-slate-50' : 'text-slate-700 bg-white hover:bg-slate-50'}">
                        Previous
                    </button>
                    <button onclick="issuesManager.nextPage()" ${this.currentPage === this.totalPages ? 'disabled' : ''}
                        class="ml-3 relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md ${this.currentPage === this.totalPages ? 'text-slate-400 bg-slate-50' : 'text-slate-700 bg-white hover:bg-slate-50'}">
                        Next
                    </button>
                </div>
                <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                        <p class="text-sm text-slate-700">
                            Page <span class="font-medium">${this.currentPage}</span> of 
                            <span class="font-medium">${this.totalPages}</span>
                        </p>
                    </div>
                    <div>
                        <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
        `;

        // Previous button
        html += `
            <button onclick="issuesManager.previousPage()" ${this.currentPage === 1 ? 'disabled' : ''}
                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-300 bg-white text-sm font-medium ${this.currentPage === 1 ? 'text-slate-300' : 'text-slate-500 hover:bg-slate-50'}">
                <span class="sr-only">Previous</span>
                <i class="fas fa-chevron-left"></i>
            </button>
        `;

        // Page numbers
        const maxVisiblePages = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            html += `
                <button onclick="issuesManager.goToPage(${i})"
                    class="relative inline-flex items-center px-4 py-2 border border-slate-300 bg-white text-sm font-medium ${i === this.currentPage ? 'z-10 bg-purple-50 border-purple-500 text-purple-600' : 'text-slate-500 hover:bg-slate-50'}">
                    ${i}
                </button>
            `;
        }

        // Next button
        html += `
            <button onclick="issuesManager.nextPage()" ${this.currentPage === this.totalPages ? 'disabled' : ''}
                class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-300 bg-white text-sm font-medium ${this.currentPage === this.totalPages ? 'text-slate-300' : 'text-slate-500 hover:bg-slate-50'}">
                <span class="sr-only">Next</span>
                <i class="fas fa-chevron-right"></i>
            </button>
        `;

        html += `
                        </nav>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;
    }

    // Setup event listeners
    setupEventListeners() {
        // Status filter change
        document.getElementById('statusFilter')?.addEventListener('change', (e) => {
            this.statusFilter = e.target.value;
            this.currentPage = 1;
            this.loadIssues();
        });

        // Search input
        let searchTimeout;
        document.getElementById('searchIssues')?.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.currentPage = 1;
                this.loadIssues();
            }, 500);
        });

        // View overdue button
        document.getElementById('viewOverdueBtn')?.addEventListener('click', () => {
            this.statusFilter = 'overdue';
            document.getElementById('statusFilter').value = 'overdue';
            this.currentPage = 1;
            this.loadIssues();
        });

        // Clear filters button
        document.getElementById('clearFiltersBtn')?.addEventListener('click', () => {
            this.statusFilter = '';
            document.getElementById('statusFilter').value = '';
            document.getElementById('searchIssues').value = '';
            this.currentPage = 1;
            this.loadIssues();
        });

        // Issue book button
        document.getElementById('issueBookBtn')?.addEventListener('click', () => {
            this.showIssueBookModal();
        });

        // Refresh button
        document.getElementById('refreshIssuesBtn')?.addEventListener('click', () => {
            this.loadIssues();
        });

        // Export issues button
        document.getElementById('exportIssuesBtn')?.addEventListener('click', () => {
            this.exportIssuesToExcel();
        });
    }

    // Setup table event listeners
    setupTableEventListeners() {
        // View issue details
        document.querySelectorAll('.view-issue-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const issueId = e.currentTarget.dataset.id;
                this.viewIssueDetails(issueId);
            });
        });

        // Return book
        document.querySelectorAll('.return-book-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const issueId = e.currentTarget.dataset.id;
                this.showReturnBookModal(issueId);
            });
        });

        // Mark as lost
        document.querySelectorAll('.mark-lost-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const issueId = e.currentTarget.dataset.id;
                this.showMarkLostModal(issueId);
            });
        });

        // Delete issue
        document.querySelectorAll('.delete-issue-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const issueId = e.currentTarget.dataset.id;
                this.showDeleteIssueModal(issueId);
            });
        });
    }

    // Pagination methods
    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.loadIssues();
        }
    }

    nextPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.loadIssues();
        }
    }

    goToPage(page) {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            this.loadIssues();
        }
    }

    // Show issue book modal
    showIssueBookModal(studentId = null, bookId = null) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-fade-in">
                <div class="p-6 overflow-y-auto max-h-[85vh]">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-xl font-bold text-slate-800">Issue New Book</h3>
                        <button onclick="this.closest('.fixed').remove()" class="text-slate-400 hover:text-slate-600">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    
                    <form id="issueBookForm" class="space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <!-- Student Selection -->
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-2">Select Student *</label>
                                <div class="relative">
                                    <select id="issueStudentId" required
                                        class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none">
                                        <option value="">Select a student</option>
                                    </select>
                                    <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                        <i class="fas fa-chevron-down text-slate-400"></i>
                                    </div>
                                </div>
                                <div id="studentInfo" class="mt-3 p-3 bg-slate-50 rounded-lg hidden">
                                    <!-- Student info will be shown here -->
                                </div>
                            </div>
                            
                            <!-- Book Selection -->
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-2">Select Book *</label>
                                <div class="relative">
                                    <select id="issueBookId" required
                                        class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none">
                                        <option value="">Select a book</option>
                                    </select>
                                    <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                        <i class="fas fa-chevron-down text-slate-400"></i>
                                    </div>
                                </div>
                                <div id="bookInfo" class="mt-3 p-3 bg-slate-50 rounded-lg hidden">
                                    <!-- Book info will be shown here -->
                                </div>
                            </div>
                        </div>
                        
                        <!-- Days Issued -->
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-2">Days Issued *</label>
                            <div class="flex items-center space-x-4">
                                <input type="number" id="issueDays" required min="1" max="30" value="7"
                                    class="w-32 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                                <div class="text-sm text-slate-600">
                                    <p>Due Date: <span id="dueDateDisplay" class="font-medium"></span></p>
                                    <p class="text-xs text-slate-500">Calculated from today</p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Remarks -->
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-2">Remarks (Optional)</label>
                            <textarea id="issueRemarks" rows="2"
                                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Any additional notes..."></textarea>
                        </div>
                        
                        <!-- Summary -->
                        <div class="p-4 bg-blue-50 rounded-lg">
                            <h4 class="font-medium text-blue-800 mb-2">Issue Summary</h4>
                            <div class="grid grid-cols-2 gap-2 text-sm">
                                <div class="text-blue-700">Student:</div>
                                <div id="summaryStudent" class="font-medium">Not selected</div>
                                <div class="text-blue-700">Book:</div>
                                <div id="summaryBook" class="font-medium">Not selected</div>
                                <div class="text-blue-700">Due Date:</div>
                                <div id="summaryDueDate" class="font-medium">Not calculated</div>
                                <div class="text-blue-700">Penalty per day:</div>
                                <div class="font-medium">₹20</div>
                            </div>
                        </div>
                        
                        <div class="flex space-x-3 pt-4">
                            <button type="button" onclick="this.closest('.fixed').remove()"
                                class="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition duration-200">
                                Cancel
                            </button>
                            <button type="submit" id="issueBookSubmitBtn"
                                class="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition duration-200">
                                Issue Book
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Load students and books
        this.loadStudentsForIssue();
        this.loadBooksForIssue();
        
        // Calculate and update due date
        this.updateDueDateDisplay();
        
        // Set initial values if provided
        if (studentId) {
            setTimeout(() => {
                const studentSelect = document.getElementById('issueStudentId');
                if (studentSelect) {
                    studentSelect.value = studentId;
                    this.loadStudentInfo(studentId);
                }
            }, 500);
        }
        
        if (bookId) {
            setTimeout(() => {
                const bookSelect = document.getElementById('issueBookId');
                if (bookSelect) {
                    bookSelect.value = bookId;
                    this.loadBookInfo(bookId);
                }
            }, 500);
        }

        // Handle form submission
        modal.querySelector('#issueBookForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.issueBook();
        });

        // Event listeners for changes
        document.getElementById('issueStudentId')?.addEventListener('change', (e) => {
            if (e.target.value) {
                this.loadStudentInfo(e.target.value);
            } else {
                const infoDiv = document.getElementById('studentInfo');
                if (infoDiv) infoDiv.classList.add('hidden');
                const summaryStudent = document.getElementById('summaryStudent');
                if (summaryStudent) summaryStudent.textContent = 'Not selected';
            }
        });

        document.getElementById('issueBookId')?.addEventListener('change', (e) => {
            if (e.target.value) {
                this.loadBookInfo(e.target.value);
            } else {
                const infoDiv = document.getElementById('bookInfo');
                if (infoDiv) infoDiv.classList.add('hidden');
                const summaryBook = document.getElementById('summaryBook');
                if (summaryBook) summaryBook.textContent = 'Not selected';
            }
        });

        document.getElementById('issueDays')?.addEventListener('input', () => {
            this.updateDueDateDisplay();
        });
    }

    // Load students for issue dropdown
    async loadStudentsForIssue() {
        try {
            const response = await api.fetch('http://localhost:5000/api/students?limit=100');
            if (response.ok) {
                const data = await response.json();
                const select = document.getElementById('issueStudentId');
                
                if (select && data.students) {
                    select.innerHTML = '<option value="">Select a student</option>';
                    data.students.forEach(student => {
                        const option = document.createElement('option');
                        option.value = student._id;
                        option.textContent = `${student.name} (ID: ${student.studentId}) - ${student.className}`;
                        select.appendChild(option);
                    });
                }
            }
        } catch (error) {
            console.error('Error loading students:', error);
        }
    }

    // Load books for issue dropdown
    async loadBooksForIssue() {
        try {
            const response = await api.fetch('http://localhost:5000/api/books?limit=100');
            if (response.ok) {
                const data = await response.json();
                const select = document.getElementById('issueBookId');
                
                if (select && data.books) {
                    select.innerHTML = '<option value="">Select a book</option>';
                    data.books.forEach(book => {
                        if (book.availableQuantity > 0) {
                            const option = document.createElement('option');
                            option.value = book._id;
                            option.textContent = `${book.title} by ${book.author} (Available: ${book.availableQuantity})`;
                            select.appendChild(option);
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Error loading books:', error);
        }
    }

    // Load student info
    async loadStudentInfo(studentId) {
        try {
            const response = await api.fetch(`http://localhost:5000/api/students/${studentId}`);
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.student) {
                    const student = data.student;
                    const infoDiv = document.getElementById('studentInfo');
                    
                    if (infoDiv) {
                        infoDiv.innerHTML = `
                            <div class="flex items-center space-x-3">
                                <div class="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                                    <i class="fas fa-user text-white text-xs"></i>
                                </div>
                                <div>
                                    <p class="font-medium text-slate-800">${student.name || 'Unknown'}</p>
                                    <p class="text-xs text-slate-600">${student.className || ''} • ${student.email || ''}</p>
                                </div>
                            </div>
                            <div class="mt-2 text-xs text-slate-500">
                                Currently has ${student.issuedBooks?.length || 0} issued book${student.issuedBooks?.length !== 1 ? 's' : ''}
                            </div>
                        `;
                        infoDiv.classList.remove('hidden');
                    }
                    
                    const summaryStudent = document.getElementById('summaryStudent');
                    if (summaryStudent) {
                        summaryStudent.textContent = `${student.name || 'Unknown'} (ID: ${student.studentId || 'N/A'})`;
                    }
                }
            }
        } catch (error) {
            console.error('Error loading student info:', error);
        }
    }

    // Load book info
    async loadBookInfo(bookId) {
        try {
            const response = await api.fetch(`http://localhost:5000/api/books/${bookId}`);
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.book) {
                    const book = data.book;
                    const infoDiv = document.getElementById('bookInfo');
                    
                    if (infoDiv) {
                        infoDiv.innerHTML = `
                            <div class="flex items-center space-x-3">
                                <div class="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-400 rounded-lg flex items-center justify-center">
                                    <i class="fas fa-book text-white text-xs"></i>
                                </div>
                                <div>
                                    <p class="font-medium text-slate-800">${book.title || 'Unknown Book'}</p>
                                    <p class="text-xs text-slate-600">by ${book.author || 'Unknown Author'} • ₹${(book.price || 0).toFixed(2)}</p>
                                </div>
                            </div>
                            <div class="mt-2 text-xs text-slate-500">
                                Available: ${book.availableQuantity || 0}/${book.quantity || 0} • ${book.category || 'General'}
                            </div>
                        `;
                        infoDiv.classList.remove('hidden');
                    }
                    
                    const summaryBook = document.getElementById('summaryBook');
                    if (summaryBook) {
                        summaryBook.textContent = `${book.title || 'Unknown'} by ${book.author || 'Unknown'}`;
                    }
                }
            }
        } catch (error) {
            console.error('Error loading book info:', error);
        }
    }

    // Update due date display
    updateDueDateDisplay() {
        const daysInput = document.getElementById('issueDays');
        if (!daysInput) return;
        
        const days = parseInt(daysInput.value) || 7;
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + days);
        
        const dueDateDisplay = document.getElementById('dueDateDisplay');
        const summaryDueDate = document.getElementById('summaryDueDate');
        
        if (dueDateDisplay) {
            dueDateDisplay.textContent = dueDate.toLocaleDateString();
        }
        
        if (summaryDueDate) {
            summaryDueDate.textContent = dueDate.toLocaleDateString();
        }
    }

    // Issue a new book
    async issueBook() {
        const studentId = document.getElementById('issueStudentId')?.value;
        const bookId = document.getElementById('issueBookId')?.value;
        const daysInput = document.getElementById('issueDays')?.value;
        const remarks = document.getElementById('issueRemarks')?.value;

        if (!studentId || !bookId || !daysInput) {
            this.showError('Please fill all required fields');
            return;
        }

        const daysIssued = parseInt(daysInput);
        if (daysIssued < 1 || daysIssued > 30) {
            this.showError('Days issued must be between 1 and 30');
            return;
        }

        const submitBtn = document.getElementById('issueBookSubmitBtn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Issuing...';
        submitBtn.disabled = true;

        try {
            const response = await api.fetch(`${this.baseURL}/issue`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    studentId,
                    bookId,
                    daysIssued,
                    remarks: remarks || ''
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to issue book');
            }

            this.showSuccess('Book issued successfully!');
            
            // Close modal
            document.querySelector('.fixed.bg-black')?.remove();
            
            // Refresh data without reloading page
            this.currentPage = 1;
            await this.loadIssues();
            
        } catch (error) {
            console.error('Error issuing book:', error);
            this.showError(error.message || 'Failed to issue book. Please try again.');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    // View issue details
    async viewIssueDetails(issueId) {
        try {
            const response = await api.fetch(`${this.baseURL}/${issueId}`);
            const data = await response.json();
            
            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to load issue details');
            }

            this.selectedIssue = data.issue;
            this.showIssueDetailsModal();
            
        } catch (error) {
            console.error('Error viewing issue details:', error);
            this.showError('Failed to load issue details. Please try again.');
        }
    }

    // Show issue details modal
    showIssueDetailsModal() {
        if (!this.selectedIssue) return;

        const issue = this.selectedIssue;
        const dueDate = new Date(issue.dueDate);
        const today = new Date();
        const isOverdue = issue.status === 'overdue' || (dueDate < today && issue.status === 'issued');
        const daysOverdue = isOverdue ? Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24)) : 0;
        
        const statusColors = {
            'issued': 'bg-blue-100 text-blue-800',
            'overdue': 'bg-red-100 text-red-800',
            'returned': 'bg-green-100 text-green-800',
            'lost': 'bg-orange-100 text-orange-800'
        };

        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-fade-in">
                <div class="p-6 overflow-y-auto max-h-[85vh]">
                    <div class="flex items-center justify-between mb-6">
                        <div class="flex items-center space-x-3">
                            <div class="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                                <i class="fas fa-exchange-alt text-white text-lg"></i>
                            </div>
                            <div>
                                <h3 class="text-xl font-bold text-slate-800">Issue Details</h3>
                                <p class="text-slate-600">Issue ID: ${issue.issueId || issue._id?.slice(-6) || 'N/A'}</p>
                            </div>
                        </div>
                        <button onclick="this.closest('.fixed').remove()" class="text-slate-400 hover:text-slate-600">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <!-- Student Info -->
                        <div class="bg-slate-50 rounded-lg p-4">
                            <h4 class="font-semibold text-slate-800 mb-3">Student Information</h4>
                            <div class="space-y-2">
                                <div class="flex items-center space-x-3">
                                    <div class="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                                        <i class="fas fa-user text-white"></i>
                                    </div>
                                    <div>
                                        <p class="font-medium text-slate-800">${issue.student?.name || 'Unknown Student'}</p>
                                        <p class="text-sm text-slate-600">ID: ${issue.student?.studentId || 'N/A'}</p>
                                    </div>
                                </div>
                                <div class="text-sm">
                                    <p><span class="text-slate-500">Class:</span> ${issue.student?.className || 'N/A'}</p>
                                    <p><span class="text-slate-500">Email:</span> ${issue.student?.email || 'N/A'}</p>
                                    <p><span class="text-slate-500">Mobile:</span> ${issue.student?.mobile || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Book Info -->
                        <div class="bg-slate-50 rounded-lg p-4">
                            <h4 class="font-semibold text-slate-800 mb-3">Book Information</h4>
                            <div class="space-y-2">
                                <div class="flex items-center space-x-3">
                                    <div class="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-400 rounded-lg flex items-center justify-center">
                                        <i class="fas fa-book text-white"></i>
                                    </div>
                                    <div>
                                        <p class="font-medium text-slate-800">${issue.book?.title || 'Unknown Book'}</p>
                                        <p class="text-sm text-slate-600">by ${issue.book?.author || 'Unknown Author'}</p>
                                    </div>
                                </div>
                                <div class="text-sm">
                                    <p><span class="text-slate-500">Price:</span> ₹${(issue.book?.price || 0).toFixed(2)}</p>
                                    <p><span class="text-slate-500">Book ID:</span> ${issue.book?.bookId || 'N/A'}</p>
                                    <p><span class="text-slate-500">Category:</span> ${issue.book?.category || 'General'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Issue Details -->
                    <div class="mb-6">
                        <h4 class="font-semibold text-slate-800 mb-4">Issue Information</h4>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div class="bg-white border border-slate-200 rounded-lg p-3">
                                <p class="text-xs text-slate-500 mb-1">Issue Date</p>
                                <p class="font-medium">${issue.issueDate ? new Date(issue.issueDate).toLocaleDateString() : 'N/A'}</p>
                            </div>
                            <div class="bg-white border border-slate-200 rounded-lg p-3 ${isOverdue ? 'border-red-200 bg-red-50' : ''}">
                                <p class="text-xs text-slate-500 mb-1">Due Date</p>
                                <p class="font-medium ${isOverdue ? 'text-red-600' : ''}">${dueDate.toLocaleDateString()}</p>
                            </div>
                            <div class="bg-white border border-slate-200 rounded-lg p-3">
                                <p class="text-xs text-slate-500 mb-1">Days Issued</p>
                                <p class="font-medium">${issue.daysIssued || 0}</p>
                            </div>
                            <div class="bg-white border border-slate-200 rounded-lg p-3">
                                <p class="text-xs text-slate-500 mb-1">Status</p>
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[issue.status] || 'bg-slate-100 text-slate-800'}">
                                    ${issue.status ? issue.status.charAt(0).toUpperCase() + issue.status.slice(1) : 'Unknown'}
                                </span>
                            </div>
                        </div>
                        
                        ${isOverdue ? `
                            <div class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <div class="flex items-center space-x-3">
                                    <i class="fas fa-exclamation-triangle text-red-600"></i>
                                    <div>
                                        <p class="font-medium text-red-800">This book is overdue!</p>
                                        <p class="text-sm text-red-700">Overdue by ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} • Penalty: ₹${daysOverdue * 20}</p>
                                    </div>
                                </div>
                            </div>
                        ` : ''}
                        
                        ${issue.returnDate ? `
                            <div class="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                                <div class="flex items-center space-x-3">
                                    <i class="fas fa-check-circle text-green-600"></i>
                                    <div>
                                        <p class="font-medium text-green-800">Book returned on ${new Date(issue.returnDate).toLocaleDateString()}</p>
                                        ${issue.penaltyAmount > 0 ? `
                                            <p class="text-sm text-green-700">Penalty paid: ₹${issue.penaltyAmount}</p>
                                        ` : ''}
                                    </div>
                                </div>
                            </div>
                        ` : ''}
                        
                        ${issue.remarks ? `
                            <div class="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <p class="text-sm text-blue-800">
                                    <span class="font-medium">Remarks:</span> ${issue.remarks}
                                </p>
                            </div>
                        ` : ''}
                    </div>
                    
                    ${(issue.status === 'issued' || issue.status === 'overdue') ? `
                        <div class="flex space-x-3">
                            <button onclick="issuesManager.handleReturnBook('${issue._id}')"
                                class="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:opacity-90 transition duration-200 flex items-center justify-center space-x-2">
                                <i class="fas fa-undo"></i>
                                <span>Return Book</span>
                            </button>
                            <button onclick="issuesManager.handleMarkLost('${issue._id}')"
                                class="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:opacity-90 transition duration-200 flex items-center justify-center space-x-2">
                                <i class="fas fa-times"></i>
                                <span>Mark as Lost</span>
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    // Handle return book directly (no modal)
    async handleReturnBook(issueId) {
        try {
            if (!confirm('Are you sure you want to return this book?')) return;

            const response = await api.fetch(`${this.baseURL}/return/${issueId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    lost: false,
                    remarks: 'Returned via quick action'
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to return book');
            }

            this.showSuccess(`Book returned successfully! ${data.penaltyAmount > 0 ? `Penalty of ₹${data.penaltyAmount} applied.` : ''}`);
            
            // Close any open modals
            document.querySelector('.fixed.bg-black')?.remove();
            
            // Update the table row directly
            this.updateIssueRow(issueId, data.issue);
            
            // Refresh stats
            await this.updateIssuesStats();
            
        } catch (error) {
            console.error('Error returning book:', error);
            this.showError(error.message || 'Failed to return book. Please try again.');
        }
    }

    // Handle mark as lost directly (no modal)
    async handleMarkLost(issueId) {
        try {
            if (!confirm('Are you sure you want to mark this book as lost? This will generate an invoice.')) return;

            const response = await api.fetch(`${this.baseURL}/return/${issueId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    lost: true,
                    remarks: 'Marked as lost via quick action'
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to mark book as lost');
            }

            this.showSuccess(`Book marked as lost! ${data.invoice ? `Invoice generated for ₹${data.invoice?.totalAmount || 0}.` : ''}`);
            
            // Close any open modals
            document.querySelector('.fixed.bg-black')?.remove();
            
            // Update the table row directly
            this.updateIssueRow(issueId, data.issue);
            
            // Refresh stats
            await this.updateIssuesStats();
            
        } catch (error) {
            console.error('Error marking book as lost:', error);
            this.showError(error.message || 'Failed to mark book as lost. Please try again.');
        }
    }

    // Delete issue directly
    async handleDeleteIssue(issueId) {
        try {
            if (!confirm('Are you sure you want to delete this issue record? This action cannot be undone.')) return;

            const response = await api.fetch(`${this.baseURL}/${issueId}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to delete issue');
            }

            this.showSuccess('Issue deleted successfully!');
            
            // Remove the row from the table directly
            this.removeIssueRow(issueId);
            
            // Refresh stats
            await this.updateIssuesStats();
            
        } catch (error) {
            console.error('Error deleting issue:', error);
            this.showError(error.message || 'Failed to delete issue. Please try again.');
        }
    }

    // Show delete issue modal
    showDeleteIssueModal(issueId) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-xl shadow-2xl max-w-md w-full animate-fade-in">
                <div class="p-6">
                    <div class="text-center mb-6">
                        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-trash text-red-600 text-2xl"></i>
                        </div>
                        <h3 class="text-xl font-bold text-slate-800 mb-2">Delete Issue Record</h3>
                        <p class="text-slate-600">Are you sure you want to delete this issue record? This action cannot be undone.</p>
                    </div>
                    
                    <div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div class="flex items-center space-x-3">
                            <i class="fas fa-exclamation-triangle text-red-600"></i>
                            <div>
                                <p class="font-medium text-red-800">Warning</p>
                                <p class="text-sm text-red-700">If the book is currently issued, it will be returned to inventory.</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex space-x-3">
                        <button type="button" onclick="this.closest('.fixed').remove()"
                            class="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition duration-200">
                            Cancel
                        </button>
                        <button onclick="issuesManager.handleDeleteIssue('${issueId}'); this.closest('.fixed').remove()"
                            class="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:opacity-90 transition duration-200">
                            Delete Issue
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    // Update a single row in the table
    updateIssueRow(issueId, updatedIssue) {
        const row = document.querySelector(`tr[data-issue-id="${issueId}"]`);
        if (!row) return;

        const dueDate = new Date(updatedIssue.dueDate);
        const today = new Date();
        const isOverdue = updatedIssue.status === 'overdue' || (dueDate < today && updatedIssue.status === 'issued');
        
        const statusColors = {
            'issued': 'bg-blue-100 text-blue-800',
            'overdue': 'bg-red-100 text-red-800',
            'returned': 'bg-green-100 text-green-800',
            'lost': 'bg-orange-100 text-orange-800'
        };

        // Update status cell
        const statusCell = row.querySelector('.px-6.py-4:nth-child(6)');
        if (statusCell) {
            statusCell.innerHTML = `
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[updatedIssue.status] || 'bg-slate-100 text-slate-800'}">
                    ${updatedIssue.status ? updatedIssue.status.charAt(0).toUpperCase() + updatedIssue.status.slice(1) : 'Unknown'}
                </span>
            `;
        }

        // Update due date cell
        const dueDateCell = row.querySelector('.px-6.py-4:nth-child(5)');
        if (dueDateCell) {
            dueDateCell.innerHTML = `
                <div class="text-sm ${isOverdue ? 'font-medium text-red-600' : 'text-slate-900'}">
                    ${dueDate.toLocaleDateString()}
                    ${isOverdue ? '<i class="fas fa-exclamation-triangle ml-1"></i>' : ''}
                </div>
            `;
        }

        // Update actions cell
        const actionsCell = row.querySelector('.px-6.py-4:nth-child(7)');
        if (actionsCell) {
            actionsCell.innerHTML = `
                <div class="flex items-center space-x-2">
                    <button class="view-issue-btn text-blue-600 hover:text-blue-900" data-id="${updatedIssue._id}" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${(updatedIssue.status === 'issued' || updatedIssue.status === 'overdue') ? `
                        <button class="return-book-btn text-green-600 hover:text-green-900" data-id="${updatedIssue._id}" title="Return Book">
                            <i class="fas fa-undo"></i>
                        </button>
                        <button class="mark-lost-btn text-red-600 hover:text-red-900" data-id="${updatedIssue._id}" title="Mark as Lost">
                            <i class="fas fa-times"></i>
                        </button>
                    ` : ''}
                    <button class="delete-issue-btn text-gray-400 hover:text-red-600" data-id="${updatedIssue._id}" title="Delete Issue">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
        }

        // Update row background
        if (isOverdue) {
            row.classList.add('bg-red-50');
        } else {
            row.classList.remove('bg-red-50');
        }

        // Reattach event listeners to the updated buttons
        this.setupRowEventListeners(row);
    }

    // Remove a row from the table
    removeIssueRow(issueId) {
        const row = document.querySelector(`tr[data-issue-id="${issueId}"]`);
        if (row) {
            row.style.opacity = '0.5';
            row.style.transition = 'opacity 0.3s ease';
            
            setTimeout(() => {
                row.style.transform = 'translateX(-100%)';
                row.style.transition = 'transform 0.3s ease';
                
                setTimeout(() => {
                    row.remove();
                    
                    // Check if table is now empty
                    const tbody = document.getElementById('issuesTableBody');
                    if (tbody.children.length === 0) {
                        this.renderIssuesTable([]);
                    }
                }, 300);
            }, 100);
        }
    }

    // Setup event listeners for a single row
    setupRowEventListeners(row) {
        const issueId = row.dataset.issueId;
        
        // View issue details
        const viewBtn = row.querySelector('.view-issue-btn');
        if (viewBtn) {
            viewBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.viewIssueDetails(issueId);
            });
        }

        // Return book
        const returnBtn = row.querySelector('.return-book-btn');
        if (returnBtn) {
            returnBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleReturnBook(issueId);
            });
        }

        // Mark as lost
        const lostBtn = row.querySelector('.mark-lost-btn');
        if (lostBtn) {
            lostBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleMarkLost(issueId);
            });
        }

        // Delete issue
        const deleteBtn = row.querySelector('.delete-issue-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showDeleteIssueModal(issueId);
            });
        }
    }

    // Export issues to Excel
    async exportIssuesToExcel() {
        const exportBtn = document.getElementById('exportIssuesBtn');
        const originalText = exportBtn.innerHTML;
        
        try {
            exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Exporting...';
            exportBtn.disabled = true;

            // Get all issues
            const response = await api.fetch(`${this.baseURL}?limit=1000`);
            const data = await response.json();
            
            if (!response.ok || !data.success) {
                throw new Error('Failed to fetch issues for export');
            }

            // Generate CSV content
            let csvContent = 'Issue ID,Student Name,Student Email,Student Class,Book Title,Author,Issue Date,Due Date,Days Issued,Return Date,Status,Penalty\n';
            
            data.issues.forEach(issue => {
                const row = [
                    issue.issueId || '',
                    `"${issue.student?.name || 'Unknown Student'}"`,
                    issue.student?.email || '',
                    issue.student?.className || '',
                    `"${issue.book?.title || 'Unknown Book'}"`,
                    `"${issue.book?.author || 'Unknown Author'}"`,
                    issue.issueDate ? new Date(issue.issueDate).toLocaleDateString() : '',
                    issue.dueDate ? new Date(issue.dueDate).toLocaleDateString() : '',
                    issue.daysIssued || 0,
                    issue.returnDate ? new Date(issue.returnDate).toLocaleDateString() : '',
                    issue.status || '',
                    issue.penaltyAmount || 0
                ];
                csvContent += row.join(',') + '\n';
            });

            // Create blob and download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            link.setAttribute('href', url);
            link.setAttribute('download', `issued_books_export_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.showSuccess('Issued books exported successfully!');
            
        } catch (error) {
            console.error('Error exporting issues:', error);
            this.showError('Failed to export issued books. Please try again.');
        } finally {
            exportBtn.innerHTML = originalText;
            exportBtn.disabled = false;
        }
    }

    // Show success message
    showSuccess(message) {
        const toast = document.createElement('div');
        toast.className = 'animate-fade-in bg-white border-l-4 border-green-500 p-4 rounded-r-lg shadow-lg max-w-md';
        toast.innerHTML = `
            <div class="flex items-center">
                <div class="flex-shrink-0">
                    <i class="fas fa-check-circle text-green-500 text-lg"></i>
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

// Load issues page when function is called
function loadIssuesPage() {
    if (!window.issuesManager) {
        window.issuesManager = new IssuesManager();
    }
    window.issuesManager.loadIssuesPage();
}

// Global function to show issue book modal
function showIssueBookModal(studentId = null, bookId = null) {
    if (window.issuesManager) {
        window.issuesManager.showIssueBookModal(studentId, bookId);
    } else {
        const issuesManager = new IssuesManager();
        issuesManager.showIssueBookModal(studentId, bookId);
    }
}

// Export for use in other files
window.IssuesManager = IssuesManager;
window.showIssueBookModal = showIssueBookModal;