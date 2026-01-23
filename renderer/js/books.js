// Books management functionality
class BooksManager {
    constructor() {
        this.baseURL = 'http://localhost:5000/api/books';
        this.currentPage = 1;
        this.limit = 10;
        this.searchQuery = '';
        this.totalPages = 1;
        this.selectedBook = null;
    }

    // Custom fetch function with JWT token
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

    // Load books page
    async loadBooksPage() {
        const content = document.getElementById('pageContent');
        content.innerHTML = `
            <div class="animate-fade-in">
                <!-- Header -->
                <div class="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0">
                    <div>
                        <h2 class="text-2xl font-bold text-slate-800">Books Management</h2>
                        <p class="text-slate-600">Manage book inventory and track availability</p>
                    </div>
                    <div class="flex space-x-3">
                        <button id="exportBooksBtn" class="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition duration-200 flex items-center space-x-2">
                            <i class="fas fa-download"></i>
                            <span>Export Excel</span>
                        </button>
                        <button id="printBooksBtn" class="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition duration-200 flex items-center space-x-2">
                            <i class="fas fa-print"></i>
                            <span>Print List</span>
                        </button>
                        <button id="addBookBtn" class="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition duration-200 flex items-center space-x-2">
                            <i class="fas fa-plus"></i>
                            <span>Add Book</span>
                        </button>
                    </div>
                </div>

                <!-- Search and Filters -->
                <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div class="md:col-span-2">
                            <div class="relative">
                                <input 
                                    type="text" 
                                    id="bookSearch"
                                    placeholder="Search books by title, author, or ISBN..."
                                    class="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    value="${this.searchQuery}"
                                >
                                <i class="fas fa-search absolute left-3 top-3 text-slate-400"></i>
                            </div>
                        </div>
                        <div>
                            <select id="categoryFilter" class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                                <option value="">All Categories</option>
                                <option value="Fiction">Fiction</option>
                                <option value="Non-Fiction">Non-Fiction</option>
                                <option value="Science">Science</option>
                                <option value="Technology">Technology</option>
                                <option value="Literature">Literature</option>
                                <option value="History">History</option>
                                <option value="Biography">Biography</option>
                                <option value="Educational">Educational</option>
                            </select>
                        </div>
                        <div class="flex space-x-2">
                            <button id="clearFiltersBtn" class="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition duration-200">
                                Clear
                            </button>
                            <button id="searchBooksBtn" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-200 flex-1">
                                Search
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Books Table -->
                <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-slate-200">
                            <thead class="bg-slate-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Book ID
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Title & Author
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Category
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Year
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Price
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Quantity
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody id="booksTableBody" class="bg-white divide-y divide-slate-200">
                                <!-- Books will be loaded here -->
                                <tr>
                                    <td colspan="8" class="px-6 py-12 text-center">
                                        <div class="flex flex-col items-center justify-center">
                                            <div class="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                            <p class="text-slate-600">Loading books...</p>
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
                                <p class="text-blue-100">Total Books</p>
                                <h3 id="totalBooksCount" class="text-3xl font-bold mt-2">0</h3>
                            </div>
                            <div class="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                <i class="fas fa-book text-xl"></i>
                            </div>
                        </div>
                    </div>
                    <div class="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-green-100">Available Books</p>
                                <h3 id="availableBooksCount" class="text-3xl font-bold mt-2">0</h3>
                            </div>
                            <div class="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                <i class="fas fa-check-circle text-xl"></i>
                            </div>
                        </div>
                    </div>
                    <div class="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-purple-100">Issued Books</p>
                                <h3 id="issuedBooksCount" class="text-3xl font-bold mt-2">0</h3>
                            </div>
                            <div class="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                <i class="fas fa-exchange-alt text-xl"></i>
                            </div>
                        </div>
                    </div>
                    <div class="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-orange-100">Total Value</p>
                                <h3 id="totalValueCount" class="text-3xl font-bold mt-2">₹0</h3>
                            </div>
                            <div class="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                <i class="fas fa-rupee-sign text-xl"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Load books data
        await this.loadBooks();
        
        // Setup event listeners
        this.setupEventListeners();
    }

    // Load books data - FIXED
    async loadBooks() {
        try {
            const tbody = document.getElementById('booksTableBody');
            
            // Show loading state
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="px-6 py-12 text-center">
                        <div class="flex flex-col items-center justify-center">
                            <div class="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p class="text-slate-600">Loading books...</p>
                        </div>
                    </td>
                </tr>
            `;

            const categoryFilter = document.getElementById('categoryFilter')?.value || '';
            let url = `${this.baseURL}?page=${this.currentPage}&limit=${this.limit}&search=${encodeURIComponent(this.searchQuery)}`;
            
            if (categoryFilter) {
                url += `&category=${encodeURIComponent(categoryFilter)}`;
            }
            
            console.log('Fetching books from:', url);
            
            // Use the custom fetch method
            const response = await this.fetch(url);
            
            if (!response.ok) {
                throw new Error(`Failed to load books: ${response.status}`);
            }

            const data = await response.json();
            console.log('Books data received:', data);
            
            if (!data.success) {
                throw new Error(data.message || 'Failed to load books');
            }

            this.totalPages = data.pages || 1;
            
            // Update stats
            await this.updateBooksStats();
            
            // Render table
            this.renderBooksTable(data.books || []);
            
            // Render pagination
            this.renderPagination();
            
        } catch (error) {
            console.error('Error loading books:', error);
            
            // Show error in table
            const tbody = document.getElementById('booksTableBody');
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="px-6 py-12 text-center">
                        <div class="flex flex-col items-center justify-center">
                            <i class="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
                            <p class="text-slate-700 text-lg font-medium mb-2">Failed to load books</p>
                            <p class="text-slate-600 mb-4">${error.message || 'Please try again'}</p>
                            <button onclick="booksManager.loadBooks()" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-200">
                                <i class="fas fa-redo mr-2"></i>Retry
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            
            this.showError('Failed to load books. Please try again.');
        }
    }

    // Update books statistics - FIXED
    async updateBooksStats() {
        try {
            const response = await this.fetch(`${this.baseURL}/stats/summary`);
            if (response.ok) {
                const data = await response.json();
                
                if (data.success && data.stats) {
                    document.getElementById('totalBooksCount').textContent = data.stats.totalBooks.toLocaleString();
                    document.getElementById('availableBooksCount').textContent = data.stats.availableBooks.toLocaleString();
                    document.getElementById('totalValueCount').textContent = `₹${data.stats.totalValue.toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    })}`;
                    
                    // Calculate issued books
                    const issuedBooks = data.stats.totalBooks - data.stats.availableBooks;
                    document.getElementById('issuedBooksCount').textContent = issuedBooks.toLocaleString();
                }
            }
        } catch (error) {
            console.error('Error updating books stats:', error);
        }
    }

    // Render books table - FIXED
    renderBooksTable(books) {
        const tbody = document.getElementById('booksTableBody');
        
        if (!books || books.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="px-6 py-12 text-center">
                        <div class="flex flex-col items-center justify-center">
                            <i class="fas fa-book text-4xl text-slate-400 mb-4"></i>
                            <p class="text-slate-600 text-lg font-medium mb-2">No books found</p>
                            <p class="text-slate-500">${this.searchQuery ? 'Try a different search term' : 'Add your first book to get started'}</p>
                            ${!this.searchQuery ? `
                                <button id="addFirstBookBtn" class="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-200">
                                    <i class="fas fa-plus mr-2"></i>Add Book
                                </button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `;
            
            if (!this.searchQuery) {
                setTimeout(() => {
                    document.getElementById('addFirstBookBtn')?.addEventListener('click', () => this.showAddBookModal());
                }, 100);
            }
            
            return;
        }

        let html = '';
        books.forEach(book => {
            const availability = book.availableQuantity > 0 ? 'Available' : 'Out of Stock';
            const availabilityColor = book.availableQuantity > 0 ? 
                (book.availableQuantity < book.quantity ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800') : 
                'bg-red-100 text-red-800';
            
            // Generate availability icon
            let availabilityIcon = 'fa-check-circle text-green-600';
            if (book.availableQuantity < book.quantity) {
                availabilityIcon = 'fa-exclamation-circle text-yellow-600';
            } else if (book.availableQuantity === 0) {
                availabilityIcon = 'fa-times-circle text-red-600';
            }
            
            html += `
                <tr class="hover:bg-slate-50 transition duration-150" data-book-id="${book._id}">
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-slate-900">${book.bookId || book._id?.slice(-6) || 'N/A'}</div>
                    </td>
                    <td class="px-6 py-4">
                        <div class="flex items-center">
                            <div class="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg flex items-center justify-center mr-3">
                                <i class="fas fa-book text-white"></i>
                            </div>
                            <div>
                                <div class="text-sm font-medium text-slate-900 truncate max-w-xs">${book.title || 'Untitled'}</div>
                                <div class="text-sm text-slate-500">${book.author || 'Unknown Author'}</div>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            ${book.category || 'General'}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        ${book.publicationYear || 'N/A'}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-slate-900">₹${(book.price || 0).toFixed(2)}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                            <div class="text-sm text-slate-900">${book.availableQuantity || 0}/${book.quantity || 0}</div>
                            <div class="ml-2">
                                <i class="fas ${availabilityIcon}"></i>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${availabilityColor}">
                            ${availability}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div class="flex items-center space-x-2">
                            <button class="view-book-btn text-blue-600 hover:text-blue-900" data-id="${book._id}" title="View Details">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="edit-book-btn text-green-600 hover:text-green-900" data-id="${book._id}" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="delete-book-btn text-red-600 hover:text-red-900" data-id="${book._id}" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                            ${(book.availableQuantity || 0) > 0 ? `
                                <button class="issue-book-btn text-purple-600 hover:text-purple-900" data-id="${book._id}" title="Issue Book">
                                    <i class="fas fa-share-square"></i>
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

    // Render pagination - FIXED
    renderPagination() {
        const container = document.getElementById('paginationContainer');
        if (!container || this.totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        let html = `
            <div class="flex items-center justify-between">
                <div class="flex-1 flex justify-between sm:hidden">
                    <button onclick="booksManager.previousPage()" ${this.currentPage === 1 ? 'disabled' : ''} 
                        class="relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md ${this.currentPage === 1 ? 'text-slate-400 bg-slate-50' : 'text-slate-700 bg-white hover:bg-slate-50'}">
                        Previous
                    </button>
                    <button onclick="booksManager.nextPage()" ${this.currentPage === this.totalPages ? 'disabled' : ''}
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
            <button onclick="booksManager.previousPage()" ${this.currentPage === 1 ? 'disabled' : ''}
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
                <button onclick="booksManager.goToPage(${i})"
                    class="relative inline-flex items-center px-4 py-2 border border-slate-300 bg-white text-sm font-medium ${i === this.currentPage ? 'z-10 bg-purple-50 border-purple-500 text-purple-600' : 'text-slate-500 hover:bg-slate-50'}">
                    ${i}
                </button>
            `;
        }

        // Next button
        html += `
            <button onclick="booksManager.nextPage()" ${this.currentPage === this.totalPages ? 'disabled' : ''}
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
        // Search button
        document.getElementById('searchBooksBtn')?.addEventListener('click', () => {
            this.searchQuery = document.getElementById('bookSearch').value;
            this.currentPage = 1;
            this.loadBooks();
        });

        // Clear filters
        document.getElementById('clearFiltersBtn')?.addEventListener('click', () => {
            this.searchQuery = '';
            document.getElementById('bookSearch').value = '';
            document.getElementById('categoryFilter').value = '';
            this.currentPage = 1;
            this.loadBooks();
        });

        // Enter key in search
        document.getElementById('bookSearch')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchQuery = e.target.value;
                this.currentPage = 1;
                this.loadBooks();
            }
        });

        // Category filter change
        document.getElementById('categoryFilter')?.addEventListener('change', () => {
            this.currentPage = 1;
            this.loadBooks();
        });

        // Add book button
        document.getElementById('addBookBtn')?.addEventListener('click', () => {
            this.showAddBookModal();
        });

        // Export books button
        document.getElementById('exportBooksBtn')?.addEventListener('click', () => {
            this.exportBooksToExcel();
        });

        // Print books button
        document.getElementById('printBooksBtn')?.addEventListener('click', () => {
            this.printBooksList();
        });
    }

    // Setup table event listeners
    setupTableEventListeners() {
        // View book details
        document.querySelectorAll('.view-book-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const bookId = e.currentTarget.dataset.id;
                this.viewBookDetails(bookId);
            });
        });

        // Edit book
        document.querySelectorAll('.edit-book-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const bookId = e.currentTarget.dataset.id;
                this.showEditBookModal(bookId);
            });
        });

        // Delete book
        document.querySelectorAll('.delete-book-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const bookId = e.currentTarget.dataset.id;
                this.showDeleteConfirmation(bookId);
            });
        });

        // Issue book
        document.querySelectorAll('.issue-book-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const bookId = e.currentTarget.dataset.id;
                if (typeof showIssueBookModal === 'function') {
                    showIssueBookModal(null, bookId);
                } else {
                    this.showIssueBookModal(bookId);
                }
            });
        });
    }

    // Pagination methods
    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.loadBooks();
        }
    }

    nextPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.loadBooks();
        }
    }

    goToPage(page) {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            this.loadBooks();
        }
    }

    // Show add book modal - FIXED
    showAddBookModal() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-xl shadow-2xl max-w-md w-full animate-fade-in">
                <div class="p-6">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-xl font-bold text-slate-800">Add New Book</h3>
                        <button onclick="this.closest('.fixed').remove()" class="text-slate-400 hover:text-slate-600">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    
                    <form id="addBookForm" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-2">Title *</label>
                            <input type="text" id="bookTitle" required
                                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Book Title">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-2">Author *</label>
                            <input type="text" id="bookAuthor" required
                                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Author Name">
                        </div>
                        
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-2">ISBN</label>
                                <input type="text" id="bookIsbn"
                                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="Optional">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-2">Year *</label>
                                <input type="number" id="bookYear" required min="1000" max="${new Date().getFullYear()}"
                                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="${new Date().getFullYear()}" value="${new Date().getFullYear()}">
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-2">Category</label>
                            <select id="bookCategory" class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                                <option value="General">General</option>
                                <option value="Fiction">Fiction</option>
                                <option value="Non-Fiction">Non-Fiction</option>
                                <option value="Science">Science</option>
                                <option value="Technology">Technology</option>
                                <option value="Literature">Literature</option>
                                <option value="History">History</option>
                                <option value="Biography">Biography</option>
                                <option value="Educational">Educational</option>
                            </select>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-2">Price (₹) *</label>
                                <input type="number" id="bookPrice" required min="0" step="0.01"
                                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="0.00">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-2">Quantity *</label>
                                <input type="number" id="bookQuantity" required min="1"
                                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="1" value="1">
                            </div>
                        </div>
                        
                        <div class="flex space-x-3 pt-4">
                            <button type="button" onclick="this.closest('.fixed').remove()"
                                class="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition duration-200">
                                Cancel
                            </button>
                            <button type="submit" id="submitAddBookBtn"
                                class="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition duration-200">
                                Add Book
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Handle form submission
        modal.querySelector('#addBookForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.addBook();
        });
    }

    // Add new book - FIXED
    async addBook() {
        const submitBtn = document.getElementById('submitAddBookBtn');
        const originalText = submitBtn.innerHTML;
        
        try {
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
            submitBtn.disabled = true;

            const formData = {
                title: document.getElementById('bookTitle').value.trim(),
                author: document.getElementById('bookAuthor').value.trim(),
                isbn: document.getElementById('bookIsbn').value.trim(),
                publicationYear: parseInt(document.getElementById('bookYear').value),
                category: document.getElementById('bookCategory').value,
                price: parseFloat(document.getElementById('bookPrice').value),
                quantity: parseInt(document.getElementById('bookQuantity').value)
            };

            // Validation
            if (!formData.title || !formData.author) {
                this.showError('Title and Author are required');
                return;
            }

            if (formData.publicationYear > new Date().getFullYear()) {
                this.showError('Publication year cannot be in the future');
                return;
            }

            if (formData.price < 0) {
                this.showError('Price cannot be negative');
                return;
            }

            if (formData.quantity < 1) {
                this.showError('Quantity must be at least 1');
                return;
            }

            console.log('Adding book:', formData);

            const response = await this.fetch(this.baseURL, {
                method: 'POST',
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            console.log('Add book response:', data);

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to add book');
            }

            this.showSuccess('Book added successfully!');
            
            // Close modal
            document.querySelector('.fixed.bg-black')?.remove();
            
            // Reset to first page and refresh books list
            this.currentPage = 1;
            await this.loadBooks();
            
        } catch (error) {
            console.error('Error adding book:', error);
            this.showError(error.message || 'Failed to add book. Please try again.');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    // View book details - FIXED
    async viewBookDetails(bookId) {
        try {
            const response = await this.fetch(`${this.baseURL}/${bookId}`);
            const data = await response.json();
            
            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to load book details');
            }

            this.selectedBook = data.book;
            this.showBookDetailsModal();
            
        } catch (error) {
            console.error('Error viewing book details:', error);
            this.showError('Failed to load book details. Please try again.');
        }
    }

    // Show book details modal - FIXED
    showBookDetailsModal() {
        if (!this.selectedBook) return;

        const book = this.selectedBook;
        const availability = book.availableQuantity > 0 ? 'Available' : 'Out of Stock';
        const availabilityColor = book.availableQuantity > 0 ? 
            (book.availableQuantity < book.quantity ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800') : 
            'bg-red-100 text-red-800';
        
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-fade-in">
                <div class="p-6 overflow-y-auto max-h-[85vh]">
                    <div class="flex items-center justify-between mb-6">
                        <div class="flex items-center space-x-3">
                            <div class="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg flex items-center justify-center">
                                <i class="fas fa-book text-white text-lg"></i>
                            </div>
                            <div>
                                <h3 class="text-xl font-bold text-slate-800">${book.title || 'Untitled'}</h3>
                                <p class="text-slate-600">Book ID: ${book.bookId || book._id?.slice(-6) || 'N/A'}</p>
                            </div>
                        </div>
                        <button onclick="this.closest('.fixed').remove()" class="text-slate-400 hover:text-slate-600">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-slate-500 mb-1">Author</label>
                                <p class="text-slate-900 text-lg font-medium">${book.author || 'Unknown Author'}</p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-500 mb-1">ISBN</label>
                                <p class="text-slate-900">${book.isbn || 'Not specified'}</p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-500 mb-1">Category</label>
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                    ${book.category || 'General'}
                                </span>
                            </div>
                        </div>
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-slate-500 mb-1">Publication Year</label>
                                <p class="text-slate-900">${book.publicationYear || 'N/A'}</p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-500 mb-1">Price</label>
                                <p class="text-slate-900 text-lg font-medium">₹${(book.price || 0).toFixed(2)}</p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-500 mb-1">Status</label>
                                <div class="flex items-center space-x-4">
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${availabilityColor}">
                                        ${availability}
                                    </span>
                                    <span class="text-sm text-slate-500">
                                        ${book.availableQuantity || 0}/${book.quantity || 0} available
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    ${book.createdAt ? `
                    <div class="mb-6">
                        <h4 class="text-lg font-semibold text-slate-800 mb-4">Book Information</h4>
                        <div class="bg-slate-50 rounded-lg p-4">
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <p class="text-sm text-slate-500">Added Date</p>
                                    <p class="text-slate-900">${new Date(book.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p class="text-sm text-slate-500">Last Updated</p>
                                    <p class="text-slate-900">${new Date(book.updatedAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    ` : ''}
                    
                    <div class="flex space-x-3">
                        <button onclick="booksManager.showEditBookModal('${book._id}'); this.closest('.fixed').remove()"
                            class="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:opacity-90 transition duration-200 flex items-center justify-center space-x-2">
                            <i class="fas fa-edit"></i>
                            <span>Edit Book</span>
                        </button>
                        ${(book.availableQuantity || 0) > 0 ? `
                            <button onclick="booksManager.showIssueBookModal('${book._id}'); this.closest('.fixed').remove()"
                                class="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition duration-200 flex items-center justify-center space-x-2">
                                <i class="fas fa-share-square"></i>
                                <span>Issue Book</span>
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    // Show edit book modal - FIXED
    async showEditBookModal(bookId) {
        try {
            const response = await this.fetch(`${this.baseURL}/${bookId}`);
            const data = await response.json();
            
            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to load book details');
            }

            const book = data.book;
            
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
            modal.innerHTML = `
                <div class="bg-white rounded-xl shadow-2xl max-w-md w-full animate-fade-in">
                    <div class="p-6">
                        <div class="flex items-center justify-between mb-6">
                            <h3 class="text-xl font-bold text-slate-800">Edit Book</h3>
                            <button onclick="this.closest('.fixed').remove()" class="text-slate-400 hover:text-slate-600">
                                <i class="fas fa-times text-xl"></i>
                            </button>
                        </div>
                        
                        <form id="editBookForm" class="space-y-4">
                            <input type="hidden" id="editBookId" value="${book._id}">
                            
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-2">Title *</label>
                                <input type="text" id="editBookTitle" required value="${book.title || ''}"
                                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-2">Author *</label>
                                <input type="text" id="editBookAuthor" required value="${book.author || ''}"
                                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                            </div>
                            
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-slate-700 mb-2">ISBN</label>
                                    <input type="text" id="editBookIsbn" value="${book.isbn || ''}"
                                        class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-slate-700 mb-2">Year *</label>
                                    <input type="number" id="editBookYear" required min="1000" max="${new Date().getFullYear()}" value="${book.publicationYear || new Date().getFullYear()}"
                                        class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                                </div>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-2">Category</label>
                                <select id="editBookCategory" class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                                    <option value="General" ${book.category === 'General' ? 'selected' : ''}>General</option>
                                    <option value="Fiction" ${book.category === 'Fiction' ? 'selected' : ''}>Fiction</option>
                                    <option value="Non-Fiction" ${book.category === 'Non-Fiction' ? 'selected' : ''}>Non-Fiction</option>
                                    <option value="Science" ${book.category === 'Science' ? 'selected' : ''}>Science</option>
                                    <option value="Technology" ${book.category === 'Technology' ? 'selected' : ''}>Technology</option>
                                    <option value="Literature" ${book.category === 'Literature' ? 'selected' : ''}>Literature</option>
                                    <option value="History" ${book.category === 'History' ? 'selected' : ''}>History</option>
                                    <option value="Biography" ${book.category === 'Biography' ? 'selected' : ''}>Biography</option>
                                    <option value="Educational" ${book.category === 'Educational' ? 'selected' : ''}>Educational</option>
                                </select>
                            </div>
                            
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-slate-700 mb-2">Price (₹) *</label>
                                    <input type="number" id="editBookPrice" required min="0" step="0.01" value="${book.price || 0}"
                                        class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-slate-700 mb-2">Quantity *</label>
                                    <input type="number" id="editBookQuantity" required min="${book.availableQuantity || 0}" value="${book.quantity || 0}"
                                        class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                                    <p class="text-xs text-slate-500 mt-1">Minimum: ${book.availableQuantity || 0} (currently available)</p>
                                </div>
                            </div>
                            
                            <div class="flex space-x-3 pt-4">
                                <button type="button" onclick="this.closest('.fixed').remove()"
                                    class="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition duration-200">
                                    Cancel
                                </button>
                                <button type="submit" id="submitEditBookBtn"
                                    class="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition duration-200">
                                    Update Book
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            // Handle form submission
            modal.querySelector('#editBookForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.updateBook(book._id);
            });
            
        } catch (error) {
            console.error('Error loading edit book modal:', error);
            this.showError('Failed to load book details. Please try again.');
        }
    }

    // Update book - FIXED
    async updateBook(bookId) {
        const submitBtn = document.getElementById('submitEditBookBtn');
        const originalText = submitBtn.innerHTML;
        
        try {
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
            submitBtn.disabled = true;

            const formData = {
                title: document.getElementById('editBookTitle').value.trim(),
                author: document.getElementById('editBookAuthor').value.trim(),
                isbn: document.getElementById('editBookIsbn').value.trim(),
                publicationYear: parseInt(document.getElementById('editBookYear').value),
                category: document.getElementById('editBookCategory').value,
                price: parseFloat(document.getElementById('editBookPrice').value),
                quantity: parseInt(document.getElementById('editBookQuantity').value)
            };

            // Validation
            if (!formData.title || !formData.author) {
                this.showError('Title and Author are required');
                return;
            }

            if (formData.publicationYear > new Date().getFullYear()) {
                this.showError('Publication year cannot be in the future');
                return;
            }

            if (formData.price < 0) {
                this.showError('Price cannot be negative');
                return;
            }

            console.log('Updating book:', bookId, formData);

            const response = await this.fetch(`${this.baseURL}/${bookId}`, {
                method: 'PUT',
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            console.log('Update book response:', data);

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to update book');
            }

            this.showSuccess('Book updated successfully!');
            
            // Close modal
            document.querySelector('.fixed.bg-black')?.remove();
            
            // Refresh books list
            this.loadBooks();
            
        } catch (error) {
            console.error('Error updating book:', error);
            this.showError(error.message || 'Failed to update book. Please try again.');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    // Show delete confirmation - FIXED
    showDeleteConfirmation(bookId) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-xl shadow-2xl max-w-md w-full animate-fade-in">
                <div class="p-6">
                    <div class="text-center">
                        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-exclamation-triangle text-red-600 text-2xl"></i>
                        </div>
                        <h3 class="text-xl font-bold text-slate-800 mb-2">Delete Book</h3>
                        <p class="text-slate-600 mb-6">Are you sure you want to delete this book? This action cannot be undone.</p>
                        <p class="text-sm text-red-600 mb-4">Note: Books that are currently issued cannot be deleted.</p>
                    </div>
                    
                    <div class="flex space-x-3">
                        <button onclick="this.closest('.fixed').remove()"
                            class="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition duration-200">
                            Cancel
                        </button>
                        <button id="confirmDeleteBtn" data-id="${bookId}"
                            class="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:opacity-90 transition duration-200">
                            Delete Book
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Handle delete confirmation
        modal.querySelector('#confirmDeleteBtn').addEventListener('click', async (e) => {
            const bookId = e.currentTarget.dataset.id;
            await this.deleteBook(bookId);
        });
    }

    // Delete book - FIXED
    async deleteBook(bookId) {
        const deleteBtn = document.getElementById('confirmDeleteBtn');
        const originalText = deleteBtn.innerHTML;
        
        try {
            deleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';
            deleteBtn.disabled = true;

            console.log('Deleting book:', bookId);

            const response = await this.fetch(`${this.baseURL}/${bookId}`, {
                method: 'DELETE'
            });

            const data = await response.json();
            console.log('Delete book response:', data);

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to delete book');
            }

            this.showSuccess('Book deleted successfully!');
            
            // Close modal
            document.querySelector('.fixed.bg-black')?.remove();
            
            // Refresh books list
            this.loadBooks();
            
        } catch (error) {
            console.error('Error deleting book:', error);
            this.showError(error.message || 'Failed to delete book. Please try again.');
        } finally {
            deleteBtn.innerHTML = originalText;
            deleteBtn.disabled = false;
        }
    }

    // Show issue book modal - NEW
    showIssueBookModal(bookId) {
        // This should call your existing issue book modal function
        // or create one if it doesn't exist
        this.showError('Issue book functionality needs to be implemented');
    }

    // Export books to Excel - FIXED
    async exportBooksToExcel() {
        try {
            // Show loading
            const exportBtn = document.getElementById('exportBooksBtn');
            const originalText = exportBtn.innerHTML;
            exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Exporting...';
            exportBtn.disabled = true;

            // Get all books
            const response = await this.fetch(`${this.baseURL}?limit=1000`);
            const data = await response.json();
            
            if (!response.ok || !data.success) {
                throw new Error('Failed to fetch books for export');
            }

            // Generate CSV content
            let csvContent = 'Book ID,Title,Author,ISBN,Category,Year,Price,Quantity,Available,Status\n';
            
            data.books.forEach(book => {
                const status = book.availableQuantity > 0 ? 'Available' : 'Out of Stock';
                const row = [
                    book.bookId || '',
                    `"${book.title || ''}"`,
                    `"${book.author || ''}"`,
                    book.isbn || '',
                    book.category || 'General',
                    book.publicationYear || '',
                    (book.price || 0).toFixed(2),
                    book.quantity || 0,
                    book.availableQuantity || 0,
                    status
                ];
                csvContent += row.join(',') + '\n';
            });

            // Create blob and download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            link.setAttribute('href', url);
            link.setAttribute('download', `books_export_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.showSuccess('Books exported successfully!');
            
        } catch (error) {
            console.error('Error exporting books:', error);
            this.showError('Failed to export books. Please try again.');
        } finally {
            // Restore button state
            const exportBtn = document.getElementById('exportBooksBtn');
            if (exportBtn) {
                exportBtn.innerHTML = originalText;
                exportBtn.disabled = false;
            }
        }
    }

    // Print books list - FIXED
    printBooksList() {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Books List - Library Management System</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th { background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; text-align: left; }
                    td { border: 1px solid #e2e8f0; padding: 10px; }
                    .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
                    .status-available { color: #10b981; }
                    .status-out { color: #ef4444; }
                    @media print {
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <h1>Books Inventory</h1>
                        <p>Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
                    </div>
                    <button class="no-print" onclick="window.print()" style="padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        Print
                    </button>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Book ID</th>
                            <th>Title</th>
                            <th>Author</th>
                            <th>Category</th>
                            <th>Year</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Available</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody id="booksTable">
                        <!-- Books will be loaded here -->
                    </tbody>
                </table>
                <script>
                    // Load books data
                    fetch('http://localhost:5000/api/books?limit=1000', {
                        headers: {
                            'Authorization': 'Bearer ${localStorage.getItem('token') || ''}'
                        }
                    })
                        .then(response => response.json())
                        .then(data => {
                            const tbody = document.getElementById('booksTable');
                            if (data.success && data.books) {
                                data.books.forEach(book => {
                                    const status = book.availableQuantity > 0 ? 'Available' : 'Out of Stock';
                                    const statusClass = book.availableQuantity > 0 ? 'status-available' : 'status-out';
                                    
                                    const row = document.createElement('tr');
                                    row.innerHTML = \`
                                        <td>\${book.bookId || ''}</td>
                                        <td>\${book.title || ''}</td>
                                        <td>\${book.author || ''}</td>
                                        <td>\${book.category || 'General'}</td>
                                        <td>\${book.publicationYear || ''}</td>
                                        <td>₹\${(book.price || 0).toFixed(2)}</td>
                                        <td>\${book.quantity || 0}</td>
                                        <td>\${book.availableQuantity || 0}</td>
                                        <td class="\${statusClass}">\${status}</td>
                                    \`;
                                    tbody.appendChild(row);
                                });
                            } else {
                                document.getElementById('booksTable').innerHTML = \`
                                    <tr>
                                        <td colspan="9" style="text-align: center; color: #ef4444;">
                                            Failed to load books data
                                        </td>
                                    </tr>
                                \`;
                            }
                        })
                        .catch(error => {
                            document.getElementById('booksTable').innerHTML = \`
                                <tr>
                                    <td colspan="9" style="text-align: center; color: #ef4444;">
                                        Failed to load books data
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

// Load books page when function is called
function loadBooksPage() {
    if (!window.booksManager) {
        window.booksManager = new BooksManager();
    }
    window.booksManager.loadBooksPage();
}

// Export for use in other files
window.BooksManager = BooksManager;