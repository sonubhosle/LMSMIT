// Invoices management functionality
class InvoicesManager {
    constructor() {
        this.baseURL = 'http://localhost:5000/api/invoices';
        this.currentPage = 1;
        this.limit = 10;
        this.statusFilter = '';
        this.typeFilter = '';
        this.totalPages = 1;
        this.totalRecords = 0;
        this.selectedInvoice = null;
        
        // College details
        this.collegeDetails = {
            name: 'MIT COLLEGE OF COMPUTER SCI. & I.T',
            address: 'Socity Market, Basmath - 431512',
            phone: '919309147752',
            email: 'mitcollege.basmath@gmail.com',
            website: 'www.mitbasmath.com'
        };
    }

    // Custom fetch method with JWT token
    async fetch(url, options = {}) {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : ''
            }
        };

        const mergedOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        };

        const response = await fetch(url, mergedOptions);
        
        // Handle unauthorized
        if (response.status === 401) {
            localStorage.removeItem('token');
            sessionStorage.removeItem('token');
            window.location.href = '/login.html';
            throw new Error('Unauthorized');
        }

        return response;
    }

    // Load invoices page
    async loadInvoicesPage() {
        const content = document.getElementById('pageContent');
        content.innerHTML = `
            <div class="animate-fade-in">
                <!-- Header -->
                <div class="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0">
                    <div>
                        <h2 class="text-2xl font-bold text-slate-800">Invoices Management</h2>
                        <p class="text-slate-600">Track and manage financial transactions</p>
                    </div>
                    <div class="flex space-x-3">
                        <button id="exportInvoicesBtn" class="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition duration-200 flex items-center space-x-2">
                            <i class="fas fa-download"></i>
                            <span>Export Excel</span>
                        </button>
                        <button id="printInvoiceBtn" class="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition duration-200 flex items-center space-x-2">
                            <i class="fas fa-print"></i>
                            <span>Print Invoice</span>
                        </button>
                        <button id="generateInvoiceBtn" class="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition duration-200 flex items-center space-x-2">
                            <i class="fas fa-plus"></i>
                            <span>Generate Invoice</span>
                        </button>
                    </div>
                </div>

                <!-- Filters -->
                <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <select id="statusFilter" class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                                <option value="">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="paid">Paid</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                        <div>
                            <select id="typeFilter" class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                                <option value="">All Types</option>
                                <option value="late_return">Late Return</option>
                                <option value="lost_book">Lost Book</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div class="flex space-x-2">
                            <button id="clearFiltersBtn" class="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition duration-200">
                                Clear
                            </button>
                            <button id="applyFiltersBtn" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-200 flex-1">
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Invoices Table -->
                <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-slate-200">
                            <thead class="bg-slate-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Invoice ID
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Student
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody id="invoicesTableBody" class="bg-white divide-y divide-slate-200">
                                <!-- Invoices will be loaded here -->
                                <tr>
                                    <td colspan="7" class="px-6 py-12 text-center">
                                        <div class="flex flex-col items-center justify-center">
                                            <div class="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                            <p class="text-slate-600">Loading invoices...</p>
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
                                <p class="text-blue-100">Total Invoices</p>
                                <h3 id="totalInvoicesCount" class="text-3xl font-bold mt-2">0</h3>
                            </div>
                            <div class="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                <i class="fas fa-file-invoice text-xl"></i>
                            </div>
                        </div>
                    </div>
                    <div class="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-green-100">Total Revenue</p>
                                <h3 id="totalRevenueCount" class="text-3xl font-bold mt-2">₹0</h3>
                            </div>
                            <div class="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                <i class="fas fa-rupee-sign text-xl"></i>
                            </div>
                        </div>
                    </div>
                    <div class="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-yellow-100">Pending Invoices</p>
                                <h3 id="pendingInvoicesCount" class="text-3xl font-bold mt-2">0</h3>
                            </div>
                            <div class="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                <i class="fas fa-clock text-xl"></i>
                            </div>
                        </div>
                    </div>
                    <div class="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-purple-100">This Month</p>
                                <h3 id="monthlyRevenueCount" class="text-3xl font-bold mt-2">₹0</h3>
                            </div>
                            <div class="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                <i class="fas fa-calendar-alt text-xl"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Load invoices data
        await this.loadInvoices();
        
        // Setup event listeners
        this.setupEventListeners();
    }

    // Load invoices data
    async loadInvoices() {
        try {
            let url = `${this.baseURL}?page=${this.currentPage}&limit=${this.limit}`;
            
            if (this.statusFilter) {
                url += `&status=${this.statusFilter}`;
            }
            
            if (this.typeFilter) {
                url += `&invoiceType=${this.typeFilter}`;
            }
            
            const response = await this.fetch(url);
            
            if (!response.ok) {
                throw new Error('Failed to load invoices');
            }

            const data = await response.json();
            this.totalPages = data.pages;
            this.totalRecords = data.total;
            
            // Update stats
            await this.updateInvoicesStats();
            
            // Render table
            this.renderInvoicesTable(data.invoices);
            
            // Render pagination
            this.renderPagination();
            
        } catch (error) {
            console.error('Error loading invoices:', error);
            
            // Show error in table
            const tbody = document.getElementById('invoicesTableBody');
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="px-6 py-12 text-center">
                        <div class="flex flex-col items-center justify-center">
                            <i class="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
                            <p class="text-slate-700 text-lg font-medium mb-2">Failed to load invoices</p>
                            <p class="text-slate-600 mb-4">${error.message || 'Please try again'}</p>
                            <button onclick="invoicesManager.loadInvoices()" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-200">
                                <i class="fas fa-redo mr-2"></i>Retry
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            
            this.showError('Failed to load invoices. Please try again.');
        }
    }

    // Update invoices statistics
    async updateInvoicesStats() {
        try {
            const response = await this.fetch(`${this.baseURL}/stats/summary`);
            if (response.ok) {
                const data = await response.json();
                
                document.getElementById('totalInvoicesCount').textContent = data.stats.totalInvoices.toLocaleString();
                document.getElementById('totalRevenueCount').textContent = `₹${data.stats.totalRevenue.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })}`;
                document.getElementById('pendingInvoicesCount').textContent = data.stats.pendingInvoices.toLocaleString();
                document.getElementById('monthlyRevenueCount').textContent = `₹${data.stats.monthlyRevenue.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })}`;
            }
        } catch (error) {
            console.error('Error updating invoices stats:', error);
        }
    }

    // Render invoices table
    renderInvoicesTable(invoices) {
        const tbody = document.getElementById('invoicesTableBody');
        
        if (!invoices || invoices.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="px-6 py-12 text-center">
                        <div class="flex flex-col items-center justify-center">
                            <i class="fas fa-file-invoice-dollar text-4xl text-slate-400 mb-4"></i>
                            <p class="text-slate-600 text-lg font-medium mb-2">No invoices found</p>
                            <p class="text-slate-500">${this.statusFilter || this.typeFilter ? 'Try different filters' : 'Generate your first invoice'}</p>
                            ${!this.statusFilter && !this.typeFilter ? `
                                <button id="generateFirstInvoiceBtn" class="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-200">
                                    <i class="fas fa-plus mr-2"></i>Generate Invoice
                                </button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `;
            
            if (!this.statusFilter && !this.typeFilter) {
                setTimeout(() => {
                    document.getElementById('generateFirstInvoiceBtn')?.addEventListener('click', () => this.showGenerateInvoiceModal());
                }, 100);
            }
            
            return;
        }

        let html = '';
        invoices.forEach(invoice => {
            const statusColors = {
                'pending': 'bg-yellow-100 text-yellow-800',
                'paid': 'bg-green-100 text-green-800',
                'cancelled': 'bg-red-100 text-red-800'
            };
            
            const typeColors = {
                'late_return': 'bg-blue-100 text-blue-800',
                'lost_book': 'bg-red-100 text-red-800',
                'other': 'bg-slate-100 text-slate-800'
            };
            
            // Format amount safely
            const totalAmount = invoice.totalAmount || 0;
            const daysLate = invoice.daysLate || 0;
            const paymentDate = invoice.paymentDate ? new Date(invoice.paymentDate).toLocaleDateString() : '';
            const createdAt = invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : '';
            
            html += `
                <tr class="hover:bg-slate-50 transition duration-150" data-invoice-id="${invoice._id}">
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-slate-900">#${invoice.invoiceId || invoice._id}</div>
                    </td>
                    <td class="px-6 py-4">
                        <div class="flex items-center">
                            <div class="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center mr-3">
                                <i class="fas fa-user text-white text-xs"></i>
                            </div>
                            <div>
                                <div class="text-sm font-medium text-slate-900">${invoice.student?.name || 'Unknown Student'}</div>
                                <div class="text-sm text-slate-500">ID: ${invoice.student?.studentId || 'N/A'}</div>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColors[invoice.invoiceType] || 'bg-slate-100 text-slate-800'}">
                            ${(invoice.invoiceType || '').replace('_', ' ').toUpperCase()}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-slate-900">₹${totalAmount.toFixed(2)}</div>
                        ${daysLate > 0 ? `
                            <div class="text-xs text-slate-500">${daysLate} day${daysLate !== 1 ? 's' : ''} late</div>
                        ` : ''}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[invoice.status] || 'bg-slate-100 text-slate-800'}">
                            ${(invoice.status || '').charAt(0).toUpperCase() + (invoice.status || '').slice(1)}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-slate-900">${createdAt}</div>
                        ${paymentDate ? `
                            <div class="text-xs text-slate-500">Paid: ${paymentDate}</div>
                        ` : ''}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div class="flex items-center space-x-2">
                            <button class="view-invoice-btn text-blue-600 hover:text-blue-900" data-id="${invoice._id}" title="View Invoice">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="print-invoice-btn text-purple-600 hover:text-purple-900" data-id="${invoice._id}" title="Print">
                                <i class="fas fa-print"></i>
                            </button>
                            ${invoice.status === 'pending' ? `
                                <button class="mark-paid-btn text-green-600 hover:text-green-900" data-id="${invoice._id}" title="Mark as Paid">
                                    <i class="fas fa-check-circle"></i>
                                </button>
                            ` : ''}
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
        if (!container) return;

        const startItem = ((this.currentPage - 1) * this.limit) + 1;
        const endItem = Math.min(this.currentPage * this.limit, this.totalRecords);
        
        let html = `
            <div class="flex items-center justify-between">
                <div class="flex-1 flex justify-between sm:hidden">
                    <button onclick="invoicesManager.previousPage()" ${this.currentPage === 1 ? 'disabled' : ''} 
                        class="relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md ${this.currentPage === 1 ? 'text-slate-400 bg-slate-50' : 'text-slate-700 bg-white hover:bg-slate-50'}">
                        Previous
                    </button>
                    <button onclick="invoicesManager.nextPage()" ${this.currentPage === this.totalPages ? 'disabled' : ''}
                        class="ml-3 relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md ${this.currentPage === this.totalPages ? 'text-slate-400 bg-slate-50' : 'text-slate-700 bg-white hover:bg-slate-50'}">
                        Next
                    </button>
                </div>
                <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                        <p class="text-sm text-slate-700">
                            Showing <span class="font-medium">${startItem}</span> to 
                            <span class="font-medium">${endItem}</span> of
                            <span class="font-medium">${this.totalRecords}</span> invoices
                        </p>
                    </div>
                    <div>
                        <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
        `;

        // Previous button
        html += `
            <button onclick="invoicesManager.previousPage()" ${this.currentPage === 1 ? 'disabled' : ''}
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
                <button onclick="invoicesManager.goToPage(${i})"
                    class="relative inline-flex items-center px-4 py-2 border border-slate-300 bg-white text-sm font-medium ${i === this.currentPage ? 'z-10 bg-purple-50 border-purple-500 text-purple-600' : 'text-slate-500 hover:bg-slate-50'}">
                    ${i}
                </button>
            `;
        }

        // Next button
        html += `
            <button onclick="invoicesManager.nextPage()" ${this.currentPage === this.totalPages ? 'disabled' : ''}
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
        // Apply filters button
        document.getElementById('applyFiltersBtn')?.addEventListener('click', () => {
            this.statusFilter = document.getElementById('statusFilter').value;
            this.typeFilter = document.getElementById('typeFilter').value;
            this.currentPage = 1;
            this.loadInvoices();
        });

        // Clear filters button
        document.getElementById('clearFiltersBtn')?.addEventListener('click', () => {
            this.statusFilter = '';
            this.typeFilter = '';
            document.getElementById('statusFilter').value = '';
            document.getElementById('typeFilter').value = '';
            this.currentPage = 1;
            this.loadInvoices();
        });

        // Generate invoice button
        document.getElementById('generateInvoiceBtn')?.addEventListener('click', () => {
            this.showGenerateInvoiceModal();
        });

        // Export invoices button
        document.getElementById('exportInvoicesBtn')?.addEventListener('click', () => {
            this.exportInvoicesToExcel();
        });

        // Print invoice button
        document.getElementById('printInvoiceBtn')?.addEventListener('click', () => {
            this.printAllInvoices();
        });
    }

    // Setup table event listeners
    setupTableEventListeners() {
        // View invoice details
        document.querySelectorAll('.view-invoice-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const invoiceId = e.currentTarget.dataset.id;
                this.viewInvoiceDetails(invoiceId);
            });
        });

        // Print invoice
        document.querySelectorAll('.print-invoice-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const invoiceId = e.currentTarget.dataset.id;
                this.printSingleInvoice(invoiceId);
            });
        });

        // Mark as paid
        document.querySelectorAll('.mark-paid-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const invoiceId = e.currentTarget.dataset.id;
                this.showMarkAsPaidModal(invoiceId);
            });
        });
    }

    // Pagination methods
    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.loadInvoices();
        }
    }

    nextPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.loadInvoices();
        }
    }

    goToPage(page) {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            this.loadInvoices();
        }
    }

    // Show generate invoice modal
    showGenerateInvoiceModal() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-fade-in">
                <div class="p-6 overflow-y-auto max-h-[85vh]">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-xl font-bold text-slate-800">Generate New Invoice</h3>
                        <button onclick="this.closest('.fixed').remove()" class="text-slate-400 hover:text-slate-600">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    
                    <form id="generateInvoiceForm" class="space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <!-- Student Selection -->
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-2">Select Student *</label>
                                <div class="relative">
                                    <select id="invoiceStudentId" required
                                        class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none">
                                        <option value="">Select a student</option>
                                        <!-- Options will be loaded dynamically -->
                                    </select>
                                    <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                        <i class="fas fa-chevron-down text-slate-400"></i>
                                    </div>
                                </div>
                                <div id="invoiceStudentInfo" class="mt-3 p-3 bg-slate-50 rounded-lg hidden">
                                    <!-- Student info will be shown here -->
                                </div>
                            </div>
                            
                            <!-- Invoice Type -->
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-2">Invoice Type *</label>
                                <select id="invoiceType" required
                                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                                    <option value="">Select type</option>
                                    <option value="late_return">Late Return Penalty</option>
                                    <option value="lost_book">Lost Book</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>
                        
                        <!-- Dynamic Fields Based on Type -->
                        <div id="invoiceFields">
                            <p class="text-slate-500 text-center py-4">Select an invoice type to continue</p>
                        </div>
                        
                        <!-- Remarks -->
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-2">Remarks</label>
                            <textarea id="invoiceRemarks" rows="2"
                                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Additional notes or description..."></textarea>
                        </div>
                        
                        <!-- Invoice Summary -->
                        <div class="p-4 bg-blue-50 rounded-lg">
                            <h4 class="font-medium text-blue-800 mb-3">Invoice Summary</h4>
                            <div class="space-y-2">
                                <div class="flex justify-between">
                                    <span class="text-blue-700">Student:</span>
                                    <span id="summaryInvoiceStudent" class="font-medium">Not selected</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-blue-700">Type:</span>
                                    <span id="summaryInvoiceType" class="font-medium">Not selected</span>
                                </div>
                                <div id="summaryDetails" class="space-y-1">
                                    <!-- Dynamic details will be shown here -->
                                </div>
                                <div class="flex justify-between border-t border-blue-200 pt-2 mt-2">
                                    <span class="font-medium text-blue-800">Total Amount:</span>
                                    <span id="summaryTotalAmount" class="font-bold text-blue-800">₹0.00</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="flex space-x-3 pt-4">
                            <button type="button" onclick="this.closest('.fixed').remove()"
                                class="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition duration-200">
                                Cancel
                            </button>
                            <button type="submit" id="generateInvoiceSubmitBtn"
                                class="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition duration-200">
                                Generate Invoice
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Load students
        this.loadStudentsForInvoice();
        
        // Handle type change
        document.getElementById('invoiceType')?.addEventListener('change', (e) => {
            this.loadInvoiceFields(e.target.value);
        });

        // Handle student change
        document.getElementById('invoiceStudentId')?.addEventListener('change', (e) => {
            if (e.target.value) {
                this.loadInvoiceStudentInfo(e.target.value);
            } else {
                const infoDiv = document.getElementById('invoiceStudentInfo');
                if (infoDiv) infoDiv.classList.add('hidden');
                const summaryStudent = document.getElementById('summaryInvoiceStudent');
                if (summaryStudent) summaryStudent.textContent = 'Not selected';
            }
        });

        // Handle form submission
        modal.querySelector('#generateInvoiceForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.generateInvoice();
        });
    }

    // Load students for invoice dropdown
    async loadStudentsForInvoice() {
        try {
            const response = await this.fetch('http://localhost:5000/api/students?limit=100');
            if (response.ok) {
                const data = await response.json();
                const select = document.getElementById('invoiceStudentId');
                if (!select) return;
                
                select.innerHTML = '<option value="">Select a student</option>';
                data.students.forEach(student => {
                    const option = document.createElement('option');
                    option.value = student._id;
                    option.textContent = `${student.name} (ID: ${student.studentId}) - ${student.className}`;
                    select.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error loading students:', error);
        }
    }

    // Load invoice student info
    async loadInvoiceStudentInfo(studentId) {
        try {
            const response = await this.fetch(`http://localhost:5000/api/students/${studentId}`);
            if (response.ok) {
                const data = await response.json();
                const student = data.student;
                
                const infoDiv = document.getElementById('invoiceStudentInfo');
                const summaryStudent = document.getElementById('summaryInvoiceStudent');
                
                if (infoDiv) {
                    infoDiv.innerHTML = `
                        <div class="flex items-center space-x-3">
                            <div class="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                                <i class="fas fa-user text-white text-xs"></i>
                            </div>
                            <div>
                                <p class="font-medium text-slate-800">${student.name}</p>
                                <p class="text-xs text-slate-600">${student.className} • ${student.email}</p>
                            </div>
                        </div>
                    `;
                    infoDiv.classList.remove('hidden');
                }
                
                if (summaryStudent) {
                    summaryStudent.textContent = `${student.name} (ID: ${student.studentId})`;
                }
            }
        } catch (error) {
            console.error('Error loading student info:', error);
        }
    }

    // Load invoice fields based on type
    loadInvoiceFields(type) {
        const fieldsDiv = document.getElementById('invoiceFields');
        const summaryDiv = document.getElementById('summaryDetails');
        const summaryType = document.getElementById('summaryInvoiceType');
        
        if (!fieldsDiv || !summaryDiv || !summaryType) return;
        
        let fieldsHTML = '';
        
        switch(type) {
            case 'late_return':
                summaryType.textContent = 'Late Return Penalty';
                fieldsHTML = `
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-2">Days Late *</label>
                            <input type="number" id="daysLate" required min="1"
                                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Number of days late">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-2">Penalty per Day (₹)</label>
                            <div class="flex items-center">
                                <span class="text-slate-500 mr-2">₹</span>
                                <input type="number" id="penaltyPerDay" value="20" min="0" step="0.01"
                                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                            </div>
                        </div>
                    </div>
                `;
                break;
                
            case 'lost_book':
                summaryType.textContent = 'Lost Book';
                fieldsHTML = `
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-2">Book Price (₹) *</label>
                            <input type="number" id="bookPrice" required min="0" step="0.01"
                                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Price of the lost book">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-2">Days Late (Optional)</label>
                            <input type="number" id="lostDaysLate" min="0"
                                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Days late before reported lost">
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-2">Penalty per Day (₹)</label>
                        <div class="flex items-center">
                            <span class="text-slate-500 mr-2">₹</span>
                            <input type="number" id="lostPenaltyPerDay" value="20" min="0" step="0.01"
                                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                        </div>
                    </div>
                `;
                break;
                
            case 'other':
                summaryType.textContent = 'Other';
                fieldsHTML = `
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-2">Amount (₹) *</label>
                        <input type="number" id="otherAmount" required min="0" step="0.01"
                            class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Total amount">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-2">Description</label>
                        <input type="text" id="otherDescription"
                            class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Description of the charge">
                    </div>
                `;
                break;
                
            default:
                summaryType.textContent = 'Not selected';
                fieldsHTML = '<p class="text-slate-500 text-center py-4">Select an invoice type to continue</p>';
                break;
        }
        
        fieldsDiv.innerHTML = fieldsHTML;
        summaryDiv.innerHTML = '';
        
        // Add event listeners to calculate total
        this.addInvoiceCalculationListeners(type);
    }

    // Add calculation listeners for invoice fields
    addInvoiceCalculationListeners(type) {
        const calculateTotal = () => {
            let total = 0;
            let summaryHTML = '';
            
            switch(type) {
                case 'late_return':
                    const daysLate = parseInt(document.getElementById('daysLate')?.value) || 0;
                    const penaltyPerDay = parseFloat(document.getElementById('penaltyPerDay')?.value) || 20;
                    total = daysLate * penaltyPerDay;
                    
                    summaryHTML = `
                        <div class="flex justify-between">
                            <span class="text-blue-700">Days Late:</span>
                            <span class="font-medium">${daysLate}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-blue-700">Penalty per Day:</span>
                            <span class="font-medium">₹${penaltyPerDay.toFixed(2)}</span>
                        </div>
                    `;
                    break;
                    
                case 'lost_book':
                    const bookPrice = parseFloat(document.getElementById('bookPrice')?.value) || 0;
                    const lostDaysLate = parseInt(document.getElementById('lostDaysLate')?.value) || 0;
                    const lostPenaltyPerDay = parseFloat(document.getElementById('lostPenaltyPerDay')?.value) || 20;
                    total = bookPrice + (lostDaysLate * lostPenaltyPerDay);
                    
                    summaryHTML = `
                        <div class="flex justify-between">
                            <span class="text-blue-700">Book Price:</span>
                            <span class="font-medium">₹${bookPrice.toFixed(2)}</span>
                        </div>
                        ${lostDaysLate > 0 ? `
                            <div class="flex justify-between">
                                <span class="text-blue-700">Late Penalty (${lostDaysLate} × ₹${lostPenaltyPerDay}):</span>
                                <span class="font-medium">₹${(lostDaysLate * lostPenaltyPerDay).toFixed(2)}</span>
                            </div>
                        ` : ''}
                    `;
                    break;
                    
                case 'other':
                    const otherAmount = parseFloat(document.getElementById('otherAmount')?.value) || 0;
                    const description = document.getElementById('otherDescription')?.value || '';
                    total = otherAmount;
                    
                    if (description) {
                        summaryHTML = `
                            <div class="flex justify-between">
                                <span class="text-blue-700">Description:</span>
                                <span class="font-medium">${description}</span>
                            </div>
                        `;
                    }
                    break;
            }
            
            const summaryDetails = document.getElementById('summaryDetails');
            const summaryTotalAmount = document.getElementById('summaryTotalAmount');
            
            if (summaryDetails) summaryDetails.innerHTML = summaryHTML;
            if (summaryTotalAmount) summaryTotalAmount.textContent = `₹${total.toFixed(2)}`;
        };
        
        // Add listeners to all relevant inputs
        const inputIds = type === 'late_return' ? ['daysLate', 'penaltyPerDay'] :
                        type === 'lost_book' ? ['bookPrice', 'lostDaysLate', 'lostPenaltyPerDay'] :
                        type === 'other' ? ['otherAmount', 'otherDescription'] : [];
        
        inputIds.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('input', calculateTotal);
                input.addEventListener('change', calculateTotal);
            }
        });
        
        // Initial calculation
        setTimeout(calculateTotal, 100);
    }

    // Generate invoice
  // Generate invoice - FIXED VERSION
async generateInvoice() {
    const studentId = document.getElementById('invoiceStudentId')?.value;
    const invoiceType = document.getElementById('invoiceType')?.value;
    const remarks = document.getElementById('invoiceRemarks')?.value;

    if (!studentId || !invoiceType) {
        this.showError('Please fill all required fields');
        return;
    }

    let invoiceData = {
        studentId,
        invoiceType,
        remarks: remarks || ''
    };

    // Add type-specific data
    switch(invoiceType) {
        case 'late_return':
            const daysLate = parseInt(document.getElementById('daysLate')?.value);
            const penaltyPerDay = parseFloat(document.getElementById('penaltyPerDay')?.value) || 20;
            if (!daysLate || daysLate < 1) {
                this.showError('Please enter valid number of days late');
                return;
            }
            invoiceData.daysLate = daysLate;
            invoiceData.penaltyPerDay = penaltyPerDay;
            break;
            
        case 'lost_book':
            const bookPrice = parseFloat(document.getElementById('bookPrice')?.value);
            const lostDaysLate = parseInt(document.getElementById('lostDaysLate')?.value) || 0;
            const lostPenaltyPerDay = parseFloat(document.getElementById('lostPenaltyPerDay')?.value) || 20;
            if (!bookPrice || bookPrice <= 0) {
                this.showError('Please enter valid book price');
                return;
            }
            invoiceData.bookPrice = bookPrice;
            invoiceData.daysLate = lostDaysLate;
            invoiceData.penaltyPerDay = lostPenaltyPerDay;
            break;
            
        case 'other':
            const otherAmount = parseFloat(document.getElementById('otherAmount')?.value);
            const description = document.getElementById('otherDescription')?.value;
            if (!otherAmount || otherAmount <= 0) {
                this.showError('Please enter valid amount');
                return;
            }
            invoiceData.totalAmount = otherAmount;
            // Add description to remarks if provided
            if (description) {
                invoiceData.remarks = (invoiceData.remarks ? invoiceData.remarks + ' | ' : '') + description;
            }
            break;
    }

    const submitBtn = document.getElementById('generateInvoiceSubmitBtn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    submitBtn.disabled = true;

    try {
        const response = await this.fetch(this.baseURL, {
            method: 'POST',
            body: JSON.stringify(invoiceData)
        });

        const data = await response.json();
        
        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Failed to generate invoice');
        }

        this.showSuccess(`Invoice #${data.invoice?.invoiceId || data.invoice?._id} generated successfully!`);
        
        // Close modal
        document.querySelector('.fixed.bg-black')?.remove();
        
        // Refresh invoices list
        this.loadInvoices();
        
    } catch (error) {
        this.showError(error.message || 'Failed to generate invoice. Please try again.');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

    // View invoice details
    async viewInvoiceDetails(invoiceId) {
        try {
            const response = await this.fetch(`${this.baseURL}/${invoiceId}`);
            
            if (!response.ok) {
                throw new Error('Failed to load invoice details');
            }

            const data = await response.json();
            this.selectedInvoice = data.invoice;
            
            this.showInvoiceDetailsModal();
            
        } catch (error) {
            this.showError('Failed to load invoice details. Please try again.');
        }
    }

    // Show invoice details modal
    showInvoiceDetailsModal() {
        if (!this.selectedInvoice) return;

        const invoice = this.selectedInvoice;
        
        const statusColors = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'paid': 'bg-green-100 text-green-800',
            'cancelled': 'bg-red-100 text-red-800'
        };
        
        const typeColors = {
            'late_return': 'bg-blue-100 text-blue-800',
            'lost_book': 'bg-red-100 text-red-800',
            'other': 'bg-slate-100 text-slate-800'
        };

        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-fade-in">
                <div class="p-6 overflow-y-auto max-h-[85vh]">
                    <div class="flex items-center justify-between mb-6">
                        <div class="flex items-center space-x-3">
                            <div class="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                                <i class="fas fa-file-invoice-dollar text-white text-lg"></i>
                            </div>
                            <div>
                                <h3 class="text-xl font-bold text-slate-800">Invoice Details</h3>
                                <p class="text-slate-600">Invoice #${invoice.invoiceId || invoice._id}</p>
                            </div>
                        </div>
                        <button onclick="this.closest('.fixed').remove()" class="text-slate-400 hover:text-slate-600">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    
                    <!-- Invoice Header -->
                    <div class="mb-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                        <div class="flex justify-between items-start">
                            <div>
                                <h4 class="font-bold text-slate-800">${this.collegeDetails.name}</h4>
                                <p class="text-sm text-slate-600">${this.collegeDetails.address}</p>
                                <p class="text-sm text-slate-600">Phone: ${this.collegeDetails.phone} | Email: ${this.collegeDetails.email}</p>
                            </div>
                            <div class="text-right">
                                <p class="text-sm text-slate-600">Invoice #${invoice.invoiceId || invoice._id}</p>
                                <p class="text-sm text-slate-600">Date: ${invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : 'N/A'}</p>
                                <p class="text-sm text-slate-600">Status: 
                                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[invoice.status] || 'bg-slate-100 text-slate-800'}">
                                        ${(invoice.status || '').charAt(0).toUpperCase() + (invoice.status || '').slice(1)}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Student Information -->
                    <div class="mb-6">
                        <h4 class="font-semibold text-slate-800 mb-3">Bill To:</h4>
                        <div class="bg-slate-50 rounded-lg p-4">
                            <div class="flex items-center space-x-3">
                                <div class="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                                    <i class="fas fa-user text-white"></i>
                                </div>
                                <div>
                                    <p class="font-medium text-slate-800">${invoice.student?.name || 'Unknown Student'}</p>
                                    <p class="text-sm text-slate-600">ID: ${invoice.student?.studentId || 'N/A'} | Class: ${invoice.student?.className || 'N/A'}</p>
                                    <p class="text-sm text-slate-600">Email: ${invoice.student?.email || 'N/A'} | Mobile: ${invoice.student?.mobile || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Invoice Details -->
                    <div class="mb-6">
                        <h4 class="font-semibold text-slate-800 mb-3">Invoice Details</h4>
                        <div class="overflow-hidden border border-slate-200 rounded-lg">
                            <table class="min-w-full divide-y divide-slate-200">
                                <thead class="bg-slate-50">
                                    <tr>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Description</th>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Type</th>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Quantity</th>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Rate</th>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Amount</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white divide-y divide-slate-200">
                                    ${this.renderInvoiceItems(invoice)}
                                </tbody>
                                <tfoot class="bg-slate-50">
                                    <tr>
                                        <td colspan="4" class="px-4 py-3 text-right text-sm font-medium text-slate-900">Total Amount:</td>
                                        <td class="px-4 py-3 text-sm font-bold text-slate-900">₹${invoice.totalAmount?.toFixed(2) || '0.00'}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                    
                    <!-- Additional Information -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div class="bg-slate-50 rounded-lg p-4">
                            <h4 class="font-semibold text-slate-800 mb-2">Payment Information</h4>
                            <div class="space-y-1 text-sm">
                                <p><span class="text-slate-600">Payment Status:</span> 
                                    <span class="font-medium ${invoice.status === 'paid' ? 'text-green-600' : 'text-yellow-600'}">
                                        ${(invoice.status || '').charAt(0).toUpperCase() + (invoice.status || '').slice(1)}
                                    </span>
                                </p>
                                ${invoice.paymentDate ? `
                                    <p><span class="text-slate-600">Payment Date:</span> ${new Date(invoice.paymentDate).toLocaleDateString()}</p>
                                ` : ''}
                                <p><span class="text-slate-600">Invoice Type:</span> 
                                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[invoice.invoiceType] || 'bg-slate-100 text-slate-800'}">
                                        ${(invoice.invoiceType || '').replace('_', ' ').toUpperCase()}
                                    </span>
                                </p>
                            </div>
                        </div>
                        <div class="bg-slate-50 rounded-lg p-4">
                            <h4 class="font-semibold text-slate-800 mb-2">Additional Notes</h4>
                            <p class="text-sm text-slate-600">${invoice.remarks || 'No additional remarks'}</p>
                            ${invoice.book ? `
                                <div class="mt-2 text-sm">
                                    <p class="text-slate-600">Related Book: ${invoice.book.title} by ${invoice.book.author}</p>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    
                    <!-- Actions -->
                    <div class="flex space-x-3">
                        <button onclick="invoicesManager.printSingleInvoice('${invoice._id}'); this.closest('.fixed').remove()"
                            class="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition duration-200 flex items-center justify-center space-x-2">
                            <i class="fas fa-print"></i>
                            <span>Print Invoice</span>
                        </button>
                        ${invoice.status === 'pending' ? `
                            <button onclick="invoicesManager.showMarkAsPaidModal('${invoice._id}'); this.closest('.fixed').remove()"
                                class="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:opacity-90 transition duration-200 flex items-center justify-center space-x-2">
                                <i class="fas fa-check-circle"></i>
                                <span>Mark as Paid</span>
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    // Render invoice items
    renderInvoiceItems(invoice) {
        let html = '';
        
        switch(invoice.invoiceType) {
            case 'late_return':
                const lateDays = invoice.daysLate || 0;
                const latePenalty = invoice.penaltyPerDay || 20;
                const lateTotal = lateDays * latePenalty;
                html = `
                    <tr>
                        <td class="px-4 py-3 text-sm text-slate-900">Late Return Penalty</td>
                        <td class="px-4 py-3 text-sm text-slate-900">Late Fee</td>
                        <td class="px-4 py-3 text-sm text-slate-900">${lateDays} days</td>
                        <td class="px-4 py-3 text-sm text-slate-900">₹${latePenalty}/day</td>
                        <td class="px-4 py-3 text-sm text-slate-900">₹${lateTotal.toFixed(2)}</td>
                    </tr>
                `;
                break;
                
            case 'lost_book':
                const bookPrice = invoice.bookPrice || 0;
                const lostDays = invoice.daysLate || 0;
                const lostPenalty = invoice.penaltyPerDay || 20;
                const lostTotal = lostDays * lostPenalty;
                html = `
                    <tr>
                        <td class="px-4 py-3 text-sm text-slate-900">Lost Book: ${invoice.book?.title || 'Unknown Book'}</td>
                        <td class="px-4 py-3 text-sm text-slate-900">Book Replacement</td>
                        <td class="px-4 py-3 text-sm text-slate-900">1</td>
                        <td class="px-4 py-3 text-sm text-slate-900">₹${bookPrice.toFixed(2)}</td>
                        <td class="px-4 py-3 text-sm text-slate-900">₹${bookPrice.toFixed(2)}</td>
                    </tr>
                `;
                if (lostDays > 0) {
                    html += `
                    <tr>
                        <td class="px-4 py-3 text-sm text-slate-900">Late Penalty (${lostDays} days)</td>
                        <td class="px-4 py-3 text-sm text-slate-900">Late Fee</td>
                        <td class="px-4 py-3 text-sm text-slate-900">${lostDays} days</td>
                        <td class="px-4 py-3 text-sm text-slate-900">₹${lostPenalty}/day</td>
                        <td class="px-4 py-3 text-sm text-slate-900">₹${lostTotal.toFixed(2)}</td>
                    </tr>
                    `;
                }
                break;
                
            case 'other':
                html = `
                    <tr>
                        <td class="px-4 py-3 text-sm text-slate-900">${invoice.remarks || 'Other Charges'}</td>
                        <td class="px-4 py-3 text-sm text-slate-900">Miscellaneous</td>
                        <td class="px-4 py-3 text-sm text-slate-900">1</td>
                        <td class="px-4 py-3 text-sm text-slate-900">₹${invoice.totalAmount?.toFixed(2) || '0.00'}</td>
                        <td class="px-4 py-3 text-sm text-slate-900">₹${invoice.totalAmount?.toFixed(2) || '0.00'}</td>
                    </tr>
                `;
                break;
        }
        
        return html;
    }

    // Show mark as paid modal
    async showMarkAsPaidModal(invoiceId) {
        try {
            const response = await this.fetch(`${this.baseURL}/${invoiceId}`);
            
            if (!response.ok) {
                throw new Error('Failed to load invoice details');
            }

            const data = await response.json();
            const invoice = data.invoice;
            
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
            modal.innerHTML = `
                <div class="bg-white rounded-xl shadow-2xl max-w-md w-full animate-fade-in">
                    <div class="p-6">
                        <div class="text-center mb-6">
                            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i class="fas fa-check-circle text-green-600 text-2xl"></i>
                            </div>
                            <h3 class="text-xl font-bold text-slate-800 mb-2">Mark Invoice as Paid</h3>
                            <p class="text-slate-600">Are you sure you want to mark this invoice as paid?</p>
                        </div>
                        
                        <div class="mb-6 p-4 bg-slate-50 rounded-lg">
                            <div class="flex justify-between mb-2">
                                <span class="text-slate-600">Invoice #:</span>
                                <span class="font-medium">${invoice.invoiceId || invoice._id}</span>
                            </div>
                            <div class="flex justify-between mb-2">
                                <span class="text-slate-600">Student:</span>
                                <span class="font-medium">${invoice.student?.name || 'Unknown Student'}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-slate-600">Amount:</span>
                                <span class="font-bold text-green-600">₹${invoice.totalAmount?.toFixed(2) || '0.00'}</span>
                            </div>
                        </div>
                        
                        <div class="flex space-x-3">
                            <button type="button" onclick="this.closest('.fixed').remove()"
                                class="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition duration-200">
                                Cancel
                            </button>
                            <button id="confirmMarkPaidBtn" data-id="${invoiceId}"
                                class="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:opacity-90 transition duration-200">
                                Mark as Paid
                            </button>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            // Handle confirmation
            modal.querySelector('#confirmMarkPaidBtn').addEventListener('click', async (e) => {
                const invoiceId = e.currentTarget.dataset.id;
                await this.markInvoiceAsPaid(invoiceId);
            });
            
        } catch (error) {
            this.showError('Failed to load invoice details. Please try again.');
        }
    }

    // Mark invoice as paid
    async markInvoiceAsPaid(invoiceId) {
        try {
            const response = await this.fetch(`${this.baseURL}/${invoiceId}/status`, {
                method: 'PUT',
                body: JSON.stringify({ status: 'paid' })
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: 'Failed to mark invoice as paid' }));
                throw new Error(error.message || 'Failed to mark invoice as paid');
            }

            this.showSuccess('Invoice marked as paid successfully!');
            
            // Close modal
            document.querySelector('.fixed.bg-black')?.remove();
            
            // Refresh invoices list
            this.loadInvoices();
            
        } catch (error) {
            this.showError(error.message || 'Failed to mark invoice as paid. Please try again.');
        }
    }

    // Print single invoice
    async printSingleInvoice(invoiceId) {
        try {
            const response = await this.fetch(`${this.baseURL}/${invoiceId}`);
            
            if (!response.ok) {
                throw new Error('Failed to load invoice for printing');
            }

            const data = await response.json();
            const invoice = data.invoice;
            
            this.printInvoiceHTML(invoice);
            
        } catch (error) {
            this.showError('Failed to load invoice for printing. Please try again.');
        }
    }

    // Print invoice HTML - UPDATED WITH COLLEGE NAME AND SIGNATURES
    printInvoiceHTML(invoice) {
        const printWindow = window.open('', '_blank');
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Invoice #${invoice.invoiceId || invoice._id} - ${this.collegeDetails.name}</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
                    
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                        font-family: 'Inter', sans-serif;
                    }
                    
                    body {
                        padding: 40px;
                        color: #333;
                        background: #fff;
                    }
                    
                    .invoice-container {
                        max-width: 800px;
                        margin: 0 auto;
                        border: 1px solid #e5e7eb;
                        border-radius: 12px;
                        overflow: hidden;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                    }
                    
                    .invoice-header {
                        background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
                        color: white;
                        padding: 30px;
                        text-align: center;
                    }
                    
                    .college-name {
                        font-size: 28px;
                        font-weight: 700;
                        margin-bottom: 5px;
                        letter-spacing: 0.5px;
                    }
                    
                    .college-address {
                        font-size: 14px;
                        opacity: 0.9;
                        margin-bottom: 10px;
                    }
                    
                    .college-contact {
                        font-size: 13px;
                        opacity: 0.8;
                        margin-bottom: 20px;
                    }
                    
                    .invoice-title {
                        font-size: 24px;
                        font-weight: 600;
                        margin-top: 20px;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                    }
                    
                    .invoice-meta {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-top: 25px;
                        padding-top: 15px;
                        border-top: 1px solid rgba(255,255,255,0.2);
                    }
                    
                    .invoice-number {
                        font-size: 18px;
                        font-weight: 600;
                    }
                    
                    .invoice-date {
                        font-size: 14px;
                    }
                    
                    .invoice-content {
                        padding: 30px;
                    }
                    
                    .section-title {
                        font-size: 18px;
                        font-weight: 600;
                        color: #1e3a8a;
                        margin-bottom: 15px;
                        padding-bottom: 8px;
                        border-bottom: 2px solid #1e40af;
                    }
                    
                    .customer-info {
                        background: #f8fafc;
                        padding: 20px;
                        border-radius: 8px;
                        margin-bottom: 30px;
                        border-left: 4px solid #1e40af;
                    }
                    
                    .customer-name {
                        font-size: 20px;
                        font-weight: 600;
                        color: #1e293b;
                        margin-bottom: 5px;
                    }
                    
                    .customer-details {
                        color: #475569;
                        font-size: 14px;
                        line-height: 1.5;
                    }
                    
                    .items-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 30px 0;
                    }
                    
                    .items-table th {
                        background: #f1f5f9;
                        padding: 12px 15px;
                        text-align: left;
                        font-weight: 600;
                        color: #334155;
                        border-bottom: 2px solid #cbd5e1;
                    }
                    
                    .items-table td {
                        padding: 12px 15px;
                        border-bottom: 1px solid #e2e8f0;
                    }
                    
                    .items-table tr:last-child td {
                        border-bottom: none;
                    }
                    
                    .total-section {
                        margin-top: 30px;
                        text-align: right;
                    }
                    
                    .total-row {
                        display: inline-flex;
                        justify-content: space-between;
                        min-width: 300px;
                        margin-bottom: 8px;
                        font-size: 16px;
                    }
                    
                    .total-amount {
                        font-size: 24px;
                        font-weight: 700;
                        color: #059669;
                        margin-top: 10px;
                        padding-top: 10px;
                        border-top: 2px solid #e5e7eb;
                    }
                    
                    .signature-section {
                        margin-top: 60px;
                        padding-top: 30px;
                        border-top: 1px solid #e5e7eb;
                        display: flex;
                        justify-content: space-between;
                    }
                    
                    .signature-box {
                        text-align: center;
                        width: 45%;
                    }
                    
                    .signature-line {
                        width: 200px;
                        height: 1px;
                        background: #1e3a8a;
                        margin: 40px auto 10px;
                    }
                    
                    .signature-name {
                        font-weight: 600;
                        color: #1e3a8a;
                        margin-bottom: 5px;
                    }
                    
                    .signature-title {
                        font-size: 14px;
                        color: #64748b;
                    }
                    
                    .footer {
                        margin-top: 40px;
                        padding-top: 20px;
                        border-top: 1px solid #e5e7eb;
                        text-align: center;
                        color: #64748b;
                        font-size: 14px;
                    }
                    
                    .status-badge {
                        display: inline-block;
                        padding: 4px 12px;
                        border-radius: 20px;
                        font-size: 12px;
                        font-weight: 600;
                        text-transform: uppercase;
                    }
                    
                    .status-pending { background: #fef3c7; color: #92400e; }
                    .status-paid { background: #d1fae5; color: #065f46; }
                    .status-cancelled { background: #fee2e2; color: #991b1b; }
                    
                    .print-button {
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        padding: 10px 20px;
                        background: #1e40af;
                        color: white;
                        border: none;
                        border-radius: 6px;
                        cursor: pointer;
                        font-weight: 500;
                        z-index: 1000;
                    }
                    
                    @media print {
                        .print-button {
                            display: none;
                        }
                        
                        body {
                            padding: 0;
                        }
                        
                        .invoice-container {
                            box-shadow: none;
                            border: none;
                        }
                    }
                </style>
            </head>
            <body>
                <button class="print-button" onclick="window.print()">Print Invoice</button>
                
                <div class="invoice-container">
                    <div class="invoice-header">
                        <div class="college-name">${this.collegeDetails.name}</div>
                        <div class="college-address">${this.collegeDetails.address}</div>
                        <div class="college-contact">
                            Phone: ${this.collegeDetails.phone} | Email: ${this.collegeDetails.email} | Website: ${this.collegeDetails.website}
                        </div>
                        <div class="invoice-title">Library Invoice</div>
                        
                        <div class="invoice-meta">
                            <div>
                                <div class="invoice-number">INVOICE #${invoice.invoiceId || invoice._id}</div>
                                <div class="invoice-date">Date: ${invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : 'N/A'}</div>
                            </div>
                            <div>
                                <span class="status-badge status-${invoice.status || 'pending'}">${(invoice.status || '').toUpperCase()}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="invoice-content">
                        <div class="section-title">Bill To</div>
                        <div class="customer-info">
                            <div class="customer-name">${invoice.student?.name || 'Unknown Student'}</div>
                            <div class="customer-details">
                                Student ID: ${invoice.student?.studentId || 'N/A'}<br>
                                Class: ${invoice.student?.className || 'N/A'}<br>
                                Email: ${invoice.student?.email || 'N/A'}<br>
                                Mobile: ${invoice.student?.mobile || 'N/A'}
                            </div>
                        </div>
                        
                        <div class="section-title">Invoice Details</div>
                        <table class="items-table">
                            <thead>
                                <tr>
                                    <th>Description</th>
                                    <th>Type</th>
                                    <th>Quantity</th>
                                    <th>Rate</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.generateInvoiceItemsHTML(invoice)}
                            </tbody>
                        </table>
                        
                        <div class="total-section">
                            ${this.generateInvoiceTotalHTML(invoice)}
                        </div>
                        
                        <!-- Signature Section -->
                        <div class="signature-section">
                            <div class="signature-box">
                                <div class="signature-line"></div>
                                <div class="signature-title">Librarian</div>
                            </div>
                            
                            <div class="signature-box">
                                <div class="signature-line"></div>
                                <div class="signature-title">Principal</div>
                            </div>
                        </div>
                        
                       
                    </div>
                </div>
                
                <script>
                    // Auto print when page loads
                    window.onload = function() {
                        setTimeout(function() {
                            window.print();
                        }, 500);
                    };
                </script>
            </body>
            </html>
        `);
        
        printWindow.document.close();
    }

    // Generate invoice items HTML for printing
    generateInvoiceItemsHTML(invoice) {
        let html = '';
        
        switch(invoice.invoiceType) {
            case 'late_return':
                const lateDays = invoice.daysLate || 0;
                const latePenalty = invoice.penaltyPerDay || 20;
                const lateTotal = lateDays * latePenalty;
                html = `
                    <tr>
                        <td>Late Return Penalty</td>
                        <td>Late Fee</td>
                        <td>${lateDays} days</td>
                        <td>₹${latePenalty}/day</td>
                        <td>₹${lateTotal.toFixed(2)}</td>
                    </tr>
                `;
                break;
                
            case 'lost_book':
                const bookPrice = invoice.bookPrice || 0;
                const lostDays = invoice.daysLate || 0;
                const lostPenalty = invoice.penaltyPerDay || 20;
                const lostTotal = lostDays * lostPenalty;
                html = `
                    <tr>
                        <td>Lost Book: ${invoice.book?.title || 'Unknown Book'}</td>
                        <td>Book Replacement</td>
                        <td>1</td>
                        <td>₹${bookPrice.toFixed(2)}</td>
                        <td>₹${bookPrice.toFixed(2)}</td>
                    </tr>
                `;
                if (lostDays > 0) {
                    html += `
                        <tr>
                            <td>Late Penalty (${lostDays} days)</td>
                            <td>Late Fee</td>
                            <td>${lostDays} days</td>
                            <td>₹${lostPenalty}/day</td>
                            <td>₹${lostTotal.toFixed(2)}</td>
                        </tr>
                    `;
                }
                break;
                
            case 'other':
                html = `
                    <tr>
                        <td>${invoice.remarks || 'Other Charges'}</td>
                        <td>Miscellaneous</td>
                        <td>1</td>
                        <td>₹${invoice.totalAmount?.toFixed(2) || '0.00'}</td>
                        <td>₹${invoice.totalAmount?.toFixed(2) || '0.00'}</td>
                    </tr>
                `;
                break;
        }
        
        return html;
    }

    // Generate invoice total HTML for printing
    generateInvoiceTotalHTML(invoice) {
        const totalAmount = invoice.totalAmount || 0;
        return `
            <div class="total-row">
                <span>Subtotal:</span>
                <span>₹${totalAmount.toFixed(2)}</span>
            </div>
            <div class="total-row">
                <span>Tax (0%):</span>
                <span>₹0.00</span>
            </div>
            <div class="total-row total-amount">
                <span>Total Amount:</span>
                <span>₹${totalAmount.toFixed(2)}</span>
            </div>
        `;
    }

    // Print all invoices
    printAllInvoices() {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Invoices List - ${this.collegeDetails.name}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { color: #1e3a8a; border-bottom: 2px solid #1e40af; padding-bottom: 10px; }
                    .college-header { text-align: center; margin-bottom: 30px; }
                    .college-header h2 { color: #1e3a8a; margin-bottom: 5px; }
                    .college-header p { color: #64748b; margin-bottom: 5px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th { background-color: #f1f5f9; border: 1px solid #cbd5e1; padding: 10px; text-align: left; color: #334155; }
                    td { border: 1px solid #e2e8f0; padding: 10px; }
                    .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
                    .status-pending { color: #d97706; }
                    .status-paid { color: #059669; }
                    .status-cancelled { color: #dc2626; }
                    @media print {
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="college-header">
                        <h2>${this.collegeDetails.name}</h2>
                        <p>${this.collegeDetails.address}</p>
                        <p>Phone: ${this.collegeDetails.phone} | Email: ${this.collegeDetails.email}</p>
                    </div>
                    <button class="no-print" onclick="window.print()" style="padding: 10px 20px; background: #1e40af; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        Print
                    </button>
                </div>
                
                <h1>Invoices List</h1>
                <p>Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
                
                <table>
                    <thead>
                        <tr>
                            <th>Invoice ID</th>
                            <th>Student</th>
                            <th>Type</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody id="invoicesTable">
                        <!-- Invoices will be loaded here -->
                        <tr>
                            <td colspan="6" style="text-align: center; padding: 20px;">
                                Loading invoices...
                            </td>
                        </tr>
                    </tbody>
                </table>
                <script>
                    // Load invoices data
                    fetch('${this.baseURL}?limit=1000', {
                        headers: {
                            'Authorization': 'Bearer ${localStorage.getItem('token') || ''}'
                        }
                    })
                        .then(response => {
                            if (!response.ok) throw new Error('Failed to load invoices');
                            return response.json();
                        })
                        .then(data => {
                            const tbody = document.getElementById('invoicesTable');
                            tbody.innerHTML = '';
                            data.invoices.forEach(invoice => {
                                const statusClass = 'status-' + invoice.status;
                                const row = document.createElement('tr');
                                row.innerHTML = \`
                                    <td>#\${invoice.invoiceId || invoice._id}</td>
                                    <td>\${invoice.student?.name || 'Unknown Student'}</td>
                                    <td>\${(invoice.invoiceType || '').replace('_', ' ').toUpperCase()}</td>
                                    <td>₹\${(invoice.totalAmount || 0).toFixed(2)}</td>
                                    <td class="\${statusClass}">\${(invoice.status || '').charAt(0).toUpperCase() + (invoice.status || '').slice(1)}</td>
                                    <td>\${invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : 'N/A'}</td>
                                \`;
                                tbody.appendChild(row);
                            });
                        })
                        .catch(error => {
                            document.getElementById('invoicesTable').innerHTML = \`
                                <tr>
                                    <td colspan="6" style="text-align: center; color: #dc2626; padding: 20px;">
                                        Failed to load invoices data: \${error.message}
                                    </td>
                                </tr>
                            \`;
                        });
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    }

    // Export invoices to Excel
    async exportInvoicesToExcel() {
        try {
            // Show loading
            const exportBtn = document.getElementById('exportInvoicesBtn');
            const originalText = exportBtn.innerHTML;
            exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Exporting...';
            exportBtn.disabled = true;

            // Get all invoices
            const response = await this.fetch(`${this.baseURL}?limit=1000`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch invoices for export');
            }

            const data = await response.json();
            
            // Generate CSV content
            let csvContent = 'Invoice ID,Student Name,Student ID,Type,Amount,Status,Days Late,Penalty,Book Price,Total Amount,Date,Payment Date,Remarks\n';
            
            data.invoices.forEach(invoice => {
                const row = [
                    invoice.invoiceId || invoice._id,
                    `"${invoice.student?.name || 'Unknown Student'}"`,
                    invoice.student?.studentId || '',
                    invoice.invoiceType || '',
                    invoice.totalAmount || 0,
                    invoice.status || '',
                    invoice.daysLate || 0,
                    invoice.totalPenalty || 0,
                    invoice.bookPrice || 0,
                    invoice.totalAmount || 0,
                    invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : '',
                    invoice.paymentDate ? new Date(invoice.paymentDate).toLocaleDateString() : '',
                    `"${invoice.remarks || ''}"`
                ];
                csvContent += row.join(',') + '\n';
            });

            // Create blob and download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            link.setAttribute('href', url);
            link.setAttribute('download', `invoices_export_${this.collegeDetails.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.showSuccess('Invoices exported successfully!');
            
        } catch (error) {
            console.error('Error exporting invoices:', error);
            this.showError('Failed to export invoices. Please try again.');
        } finally {
            // Restore button state
            const exportBtn = document.getElementById('exportInvoicesBtn');
            if (exportBtn) {
                exportBtn.innerHTML = originalText;
                exportBtn.disabled = false;
            }
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

// Load invoices page when function is called
function loadInvoicesPage() {
    if (!window.invoicesManager) {
        window.invoicesManager = new InvoicesManager();
    }
    window.invoicesManager.loadInvoicesPage();
}

// Global function to show generate invoice modal
function showGenerateInvoiceModal() {
    if (window.invoicesManager) {
        window.invoicesManager.showGenerateInvoiceModal();
    } else {
        const invoicesManager = new InvoicesManager();
        invoicesManager.showGenerateInvoiceModal();
    }
}

// Export for use in other files
window.InvoicesManager = InvoicesManager;
window.showGenerateInvoiceModal = showGenerateInvoiceModal;