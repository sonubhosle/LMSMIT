// Books management functionality
class BooksManager {
    constructor() {
        this.baseURL = 'http://localhost:5000/api/books';
        this.currentPage = 1;
        this.limit = 10;
        this.searchQuery = '';
        this.totalPages = 1;
        this.selectedBook = null;
        this.bookIdMap = new Map();
        this.activeDropdown = null;
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
                        
                        <!-- Custom Category Filter Dropdown -->
                        <div class="relative">
                            <button 
                                type="button"
                                id="categoryFilterTrigger"
                                class="custom-dropdown-trigger w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-left flex items-center justify-between transition-all duration-200 hover:border-slate-400"
                            >
                                <span id="categoryFilterValue">All Categories</span>
                                <i class="fas fa-chevron-down text-slate-400 transition-transform duration-300"></i>
                            </button>
                            
                            <div 
                                id="categoryFilterDropdown"
                                class="custom-dropdown-menu hidden absolute z-50 w-full bg-white rounded-lg shadow-2xl border border-slate-200 overflow-hidden transition-all duration-300 transform origin-top scale-y-0 opacity-0 max-h-0"
                            >
                                <div class="p-3 border-b border-slate-100">
                                    <div class="relative">
                                        <input 
                                            type="text" 
                                            class="dropdown-search w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="Search category..."
                                        >
                                        <i class="fas fa-search absolute left-3 top-3 text-slate-400 text-sm"></i>
                                    </div>
                                </div>
                                
                                <div class="overflow-y-auto max-h-60">
                                    <div class="py-1">
                                        <div class="dropdown-option px-4 py-3 hover:bg-purple-50 cursor-pointer transition-colors duration-150 flex items-center justify-between" data-value="">
                                            <span>All Categories</span>
                                            <i class="fas fa-check text-purple-600 opacity-0"></i>
                                        </div>
                                        <div class="dropdown-option px-4 py-3 hover:bg-purple-50 cursor-pointer transition-colors duration-150 flex items-center justify-between" data-value="Fiction">
                                            <span>Fiction</span>
                                            <i class="fas fa-check text-purple-600 opacity-0"></i>
                                        </div>
                                        <div class="dropdown-option px-4 py-3 hover:bg-purple-50 cursor-pointer transition-colors duration-150 flex items-center justify-between" data-value="Non-Fiction">
                                            <span>Non-Fiction</span>
                                            <i class="fas fa-check text-purple-600 opacity-0"></i>
                                        </div>
                                        <div class="dropdown-option px-4 py-3 hover:bg-purple-50 cursor-pointer transition-colors duration-150 flex items-center justify-between" data-value="Science">
                                            <span>Science</span>
                                            <i class="fas fa-check text-purple-600 opacity-0"></i>
                                        </div>
                                        <div class="dropdown-option px-4 py-3 hover:bg-purple-50 cursor-pointer transition-colors duration-150 flex items-center justify-between" data-value="Technology">
                                            <span>Technology</span>
                                            <i class="fas fa-check text-purple-600 opacity-0"></i>
                                        </div>
                                        <div class="dropdown-option px-4 py-3 hover:bg-purple-50 cursor-pointer transition-colors duration-150 flex items-center justify-between" data-value="Literature">
                                            <span>Literature</span>
                                            <i class="fas fa-check text-purple-600 opacity-0"></i>
                                        </div>
                                        <div class="dropdown-option px-4 py-3 hover:bg-purple-50 cursor-pointer transition-colors duration-150 flex items-center justify-between" data-value="History">
                                            <span>History</span>
                                            <i class="fas fa-check text-purple-600 opacity-0"></i>
                                        </div>
                                        <div class="dropdown-option px-4 py-3 hover:bg-purple-50 cursor-pointer transition-colors duration-150 flex items-center justify-between" data-value="Biography">
                                            <span>Biography</span>
                                            <i class="fas fa-check text-purple-600 opacity-0"></i>
                                        </div>
                                        <div class="dropdown-option px-4 py-3 hover:bg-purple-50 cursor-pointer transition-colors duration-150 flex items-center justify-between" data-value="Educational">
                                            <span>Educational</span>
                                            <i class="fas fa-check text-purple-600 opacity-0"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <input type="hidden" id="categoryFilter" name="categoryFilter" value="">
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
                    <div id="paginationContainer" class="px-6 py-4 border-t border-slate-200"></div>
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

                <!-- Custom Dropdown for Book Actions -->
                <div id="customBookDropdown" class="hidden fixed z-50 bg-white rounded-xl shadow-2xl border border-slate-200 max-h-96 w-96 overflow-hidden" style="top: 0; left: 0;"></div>
            </div>
        `;

        // Add CSS for custom dropdowns
        this.addCustomDropdownStyles();
        
        // Load books data
        await this.loadBooks();
        
        // Setup event listeners
        this.setupEventListeners();
        this.initializeCustomDropdowns();
    }

    // Add CSS for custom dropdowns
    addCustomDropdownStyles() {
        if (!document.getElementById('custom-dropdown-styles')) {
            const style = document.createElement('style');
            style.id = 'custom-dropdown-styles';
            style.textContent = `
                /* Custom Dropdown Styles - FIXED POSITIONING */
                .custom-dropdown-menu {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    width: 100%;
                    background-color: white;
                    border-radius: 0.5rem;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                    border: 1px solid #e2e8f0;
                    overflow: hidden;
                    transform-origin: top;
                    transform: scaleY(0);
                    opacity: 0;
                    max-height: 0;
                    margin-top: 0.25rem;
                    z-index: 50;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                .custom-dropdown-menu.open {
                    transform: scaleY(1);
                    opacity: 1;
                    max-height: 300px;
                }
                
                .custom-dropdown-menu.closing {
                    transform: scaleY(0);
                    opacity: 0;
                    max-height: 0;
                }
                
                .custom-dropdown-trigger.active {
                    border-color: #8b5cf6;
                    box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.1);
                }
                
                .custom-dropdown-trigger.active i {
                    transform: rotate(180deg);
                }
                
                .dropdown-option.selected {
                    background-color: #f5f3ff;
                    font-weight: 500;
                }
                
                .dropdown-option.selected i {
                    opacity: 1 !important;
                }
                
                .dropdown-option:hover i {
                    opacity: 0.5;
                }
                
                /* Animation for dropdown items */
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(-5px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .dropdown-option {
                    animation: fadeInUp 0.2s ease-out forwards;
                    opacity: 0;
                    animation-delay: calc(var(--index, 0) * 0.05s);
                }
                
                .dropdown-option:nth-child(1) { --index: 1; }
                .dropdown-option:nth-child(2) { --index: 2; }
                .dropdown-option:nth-child(3) { --index: 3; }
                .dropdown-option:nth-child(4) { --index: 4; }
                .dropdown-option:nth-child(5) { --index: 5; }
                .dropdown-option:nth-child(6) { --index: 6; }
                .dropdown-option:nth-child(7) { --index: 7; }
                .dropdown-option:nth-child(8) { --index: 8; }
                .dropdown-option:nth-child(9) { --index: 9; }
                .dropdown-option:nth-child(10) { --index: 10; }
            `;
            document.head.appendChild(style);
        }
    }

    // Initialize custom dropdowns
    initializeCustomDropdowns() {
        // Initialize category filter dropdown
        this.initializeCustomDropdown(
            'categoryFilterTrigger',
            'categoryFilterDropdown',
            'categoryFilter',
            'categoryFilterValue'
        );

        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (this.activeDropdown && 
                !e.target.closest('.custom-dropdown-trigger') && 
                !e.target.closest('.custom-dropdown-menu')) {
                this.closeDropdown(this.activeDropdown);
                this.activeDropdown = null;
                
                // Remove active class from all triggers
                document.querySelectorAll('.custom-dropdown-trigger.active').forEach(trigger => {
                    trigger.classList.remove('active');
                });
            }
        });

        // Close dropdowns on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activeDropdown) {
                this.closeDropdown(this.activeDropdown);
                this.activeDropdown = null;
                
                document.querySelectorAll('.custom-dropdown-trigger.active').forEach(trigger => {
                    trigger.classList.remove('active');
                });
            }
        });
    }

    // Initialize a single custom dropdown
    initializeCustomDropdown(triggerId, dropdownId, hiddenInputId, valueDisplayId) {
        const trigger = document.getElementById(triggerId);
        const dropdown = document.getElementById(dropdownId);
        const hiddenInput = document.getElementById(hiddenInputId);
        const valueDisplay = document.getElementById(valueDisplayId);

        if (!trigger || !dropdown) return;

        // Toggle dropdown on trigger click
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            
            if (dropdown.classList.contains('open')) {
                this.closeDropdown(dropdown);
                this.activeDropdown = null;
                trigger.classList.remove('active');
            } else {
                // Close any other open dropdown
                if (this.activeDropdown && this.activeDropdown !== dropdown) {
                    this.closeDropdown(this.activeDropdown);
                    document.querySelectorAll('.custom-dropdown-trigger.active').forEach(t => {
                        t.classList.remove('active');
                    });
                }
                
                // Open this dropdown
                this.openDropdown(dropdown);
                this.activeDropdown = dropdown;
                trigger.classList.add('active');
            }
        });

        // Handle option selection
        dropdown.querySelectorAll('.dropdown-option').forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const value = e.currentTarget.dataset.value;
                const text = e.currentTarget.querySelector('span').textContent;
                
                // Update display
                if (valueDisplay) {
                    valueDisplay.textContent = text;
                }
                
                // Update hidden input
                if (hiddenInput) {
                    hiddenInput.value = value;
                }
                
                // Mark as selected
                dropdown.querySelectorAll('.dropdown-option').forEach(opt => {
                    opt.classList.remove('selected');
                    opt.querySelector('i').style.opacity = '0';
                });
                e.currentTarget.classList.add('selected');
                e.currentTarget.querySelector('i').style.opacity = '1';
                
                // Close dropdown
                this.closeDropdown(dropdown);
                this.activeDropdown = null;
                trigger.classList.remove('active');
                
                // Trigger change event for filters
                if (hiddenInputId === 'categoryFilter') {
                    setTimeout(() => {
                        this.currentPage = 1;
                        this.loadBooks();
                    }, 100);
                }
            });
        });

        // Handle search in dropdown
        const searchInput = dropdown.querySelector('.dropdown-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const options = dropdown.querySelectorAll('.dropdown-option');
                
                options.forEach(option => {
                    const text = option.querySelector('span').textContent.toLowerCase();
                    if (text.includes(searchTerm)) {
                        option.style.display = 'flex';
                    } else {
                        option.style.display = 'none';
                    }
                });
            });
            
            // Clear search when dropdown closes
            dropdown.addEventListener('transitionend', () => {
                if (!dropdown.classList.contains('open')) {
                    searchInput.value = '';
                    dropdown.querySelectorAll('.dropdown-option').forEach(opt => {
                        opt.style.display = 'flex';
                    });
                }
            });
        }
    }

    // Open dropdown
    openDropdown(dropdown) {
        dropdown.classList.remove('hidden');
        // Force reflow for animation
        dropdown.offsetHeight;
        dropdown.classList.add('open');
    }

    // Close dropdown
    closeDropdown(dropdown) {
        if (!dropdown.classList.contains('open')) return;
        
        dropdown.classList.remove('open');
        dropdown.classList.add('closing');
        
        setTimeout(() => {
            dropdown.classList.add('hidden');
            dropdown.classList.remove('closing');
        }, 300);
    }

    // Load books data
    async loadBooks() {
        try {
            const tbody = document.getElementById('booksTableBody');
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
            
            const response = await this.fetch(url);
            
            if (!response.ok) {
                throw new Error(`Failed to load books: ${response.status}`);
            }

            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Failed to load books');
            }

            this.totalPages = data.pages || 1;
            
            await this.updateBooksStats();
            
            const processedBooks = this.processBooksForDuplicates(data.books || []);
            
            this.renderBooksTable(processedBooks);
            this.renderPagination();
            
        } catch (error) {
            console.error('Error loading books:', error);
            
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

    // Process books to handle duplicate IDs
    processBooksForDuplicates(books) {
        const idCount = new Map();
        const processedBooks = [];
        
        books.forEach(book => {
            const bookId = book.bookId || book._id?.slice(-6) || 'N/A';
            idCount.set(bookId, (idCount.get(bookId) || 0) + 1);
        });
        
        const idUsedCount = new Map();
        books.forEach(book => {
            const originalId = book.bookId || book._id?.slice(-6) || 'N/A';
            const count = idCount.get(originalId);
            
            if (count > 1) {
                const usedCount = (idUsedCount.get(originalId) || 0) + 1;
                idUsedCount.set(originalId, usedCount);
                book.displayId = `${originalId}-D${usedCount}`;
                book.isDuplicate = true;
            } else {
                book.displayId = originalId;
                book.isDuplicate = false;
            }
            
            processedBooks.push(book);
        });
        
        return processedBooks;
    }

    // Update books statistics
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
                    
                    const issuedBooks = data.stats.totalBooks - data.stats.availableBooks;
                    document.getElementById('issuedBooksCount').textContent = issuedBooks.toLocaleString();
                }
            }
        } catch (error) {
            console.error('Error updating books stats:', error);
        }
    }

    // Render books table
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
            
            let availabilityIcon = 'fa-check-circle text-green-600';
            if (book.availableQuantity < book.quantity) {
                availabilityIcon = 'fa-exclamation-circle text-yellow-600';
            } else if (book.availableQuantity === 0) {
                availabilityIcon = 'fa-times-circle text-red-600';
            }
            
            const displayId = book.displayId || book.bookId || book._id?.slice(-6) || 'N/A';
            
            html += `
                <tr class="hover:bg-slate-50 transition duration-150" data-book-id="${book._id}">
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-slate-900 relative">
                            ${displayId}
                            ${book.isDuplicate ? `
                                <span class="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" title="Duplicate ID"></span>
                            ` : ''}
                        </div>
                        ${book.isDuplicate ? `
                            <div class="text-xs text-red-500 mt-1">
                                <i class="fas fa-exclamation-triangle mr-1"></i>Duplicate
                            </div>
                        ` : ''}
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
                            <button class="select-book-btn bg-slate-100 border border-slate-200 text-slate-700 px-3 py-2 rounded-xl" data-id="${book._id}" title="Select for Action">
                                Actions 
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
        this.setupTableEventListeners();
    }

    // Setup table event listeners
    setupTableEventListeners() {
        // Select book (custom dropdown)
        document.querySelectorAll('.select-book-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const bookId = e.currentTarget.dataset.id;
                const buttonRect = e.currentTarget.getBoundingClientRect();
                this.showCustomDropdown(bookId, buttonRect);
            });
        });
    }

    // Show custom dropdown
    showCustomDropdown(bookId, buttonRect) {
        this.hideCustomDropdown();
        
        const bookRow = document.querySelector(`tr[data-book-id="${bookId}"]`);
        if (!bookRow) return;
        
        const dropdown = document.getElementById('customBookDropdown');
        dropdown.innerHTML = `
            <div class="p-4 border-b border-slate-200">
                <div class="flex items-center justify-between">
                    <h4 class="font-semibold text-slate-800">Book Actions</h4>
                    <button id="closeDropdownBtn" class="text-slate-400 hover:text-slate-600">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <p class="text-sm text-slate-500 mt-1">Select an action for this book</p>
            </div>
            <div class="overflow-y-auto max-h-80">
                <div class="divide-y divide-slate-100">
                    <button class="dropdown-option w-full p-4 text-left hover:bg-slate-50 transition duration-150 flex items-center space-x-3" data-action="view">
                        <div class="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                            <i class="fas fa-eye text-blue-600"></i>
                        </div>
                        <div>
                            <p class="font-medium text-slate-800">View Details</p>
                            <p class="text-sm text-slate-500">See complete book information</p>
                        </div>
                    </button>
                    <button class="dropdown-option w-full p-4 text-left hover:bg-slate-50 transition duration-150 flex items-center space-x-3" data-action="edit">
                        <div class="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                            <i class="fas fa-edit text-green-600"></i>
                        </div>
                        <div>
                            <p class="font-medium text-slate-800">Edit Book</p>
                            <p class="text-sm text-slate-500">Modify book details</p>
                        </div>
                    </button>
                    <button class="dropdown-option w-full p-4 text-left hover:bg-slate-50 transition duration-150 flex items-center space-x-3" data-action="delete">
                        <div class="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                            <i class="fas fa-trash text-red-600"></i>
                        </div>
                        <div>
                            <p class="font-medium text-slate-800">Delete Book</p>
                            <p class="text-sm text-slate-500">Remove from library</p>
                        </div>
                    </button>
                    <button class="dropdown-option w-full p-4 text-left hover:bg-slate-50 transition duration-150 flex items-center space-x-3" data-action="issue">
                        <div class="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                            <i class="fas fa-share-square text-purple-600"></i>
                        </div>
                        <div>
                            <p class="font-medium text-slate-800">Issue Book</p>
                            <p class="text-sm text-slate-500">Assign to a member</p>
                        </div>
                    </button>
                    <button class="dropdown-option w-full p-4 text-left hover:bg-slate-50 transition duration-150 flex items-center space-x-3" data-action="duplicate">
                        <div class="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center">
                            <i class="fas fa-copy text-yellow-600"></i>
                        </div>
                        <div>
                            <p class="font-medium text-slate-800">Clone Book</p>
                            <p class="text-sm text-slate-500">Create a copy with new ID</p>
                        </div>
                    </button>
                    <button class="dropdown-option w-full p-4 text-left hover:bg-slate-50 transition duration-150 flex items-center space-x-3" data-action="report">
                        <div class="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                            <i class="fas fa-chart-bar text-indigo-600"></i>
                        </div>
                        <div>
                            <p class="font-medium text-slate-800">Generate Report</p>
                            <p class="text-sm text-slate-500">Create usage report</p>
                        </div>
                    </button>
                </div>
            </div>
            <div class="p-4 border-t border-slate-200 bg-slate-50">
                <div class="flex items-center justify-between">
                    <div class="text-sm text-slate-600">
                        Book ID: <span class="font-mono">${bookId.slice(-8)}</span>
                    </div>
                    <div class="text-xs text-slate-500">
                        <i class="fas fa-clock mr-1"></i>Just now
                    </div>
                </div>
            </div>
        `;
        
        // Position dropdown below the button
        dropdown.style.top = `${buttonRect.bottom + window.scrollY + 5}px`;
        dropdown.style.left = `${buttonRect.left + window.scrollX}px`;
        
        dropdown.classList.remove('hidden');
        dropdown.classList.add('animate-slide-down');
        
        dropdown.querySelector('#closeDropdownBtn').addEventListener('click', () => {
            this.hideCustomDropdown();
        });
        
        dropdown.querySelectorAll('.dropdown-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.handleDropdownAction(action, bookId);
                this.hideCustomDropdown();
            });
        });
        
        setTimeout(() => {
            const clickHandler = (e) => {
                if (!dropdown.contains(e.target) && !e.target.closest('.select-book-btn')) {
                    this.hideCustomDropdown();
                    document.removeEventListener('click', clickHandler);
                }
            };
            document.addEventListener('click', clickHandler);
        }, 100);
    }
    
    // Hide custom dropdown
    hideCustomDropdown() {
        const dropdown = document.getElementById('customBookDropdown');
        dropdown.classList.add('hidden');
        dropdown.classList.remove('animate-slide-down');
    }
    
    // Handle dropdown actions
    handleDropdownAction(action, bookId) {
        switch(action) {
            case 'view':
                this.viewBookDetails(bookId);
                break;
            case 'edit':
                this.showEditBookModal(bookId);
                break;
            case 'delete':
                this.showDeleteConfirmation(bookId);
                break;
            case 'issue':
                this.showIssueBookModal(bookId);
                break;
            case 'duplicate':
                this.cloneBook(bookId);
                break;
            case 'report':
                this.generateBookReport(bookId);
                break;
        }
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
            
            // Reset category filter
            const valueDisplay = document.getElementById('categoryFilterValue');
            const hiddenInput = document.getElementById('categoryFilter');
            if (valueDisplay) valueDisplay.textContent = 'All Categories';
            if (hiddenInput) hiddenInput.value = '';
            
            // Reset dropdown selection
            const dropdown = document.getElementById('categoryFilterDropdown');
            if (dropdown) {
                dropdown.querySelectorAll('.dropdown-option').forEach(opt => {
                    opt.classList.remove('selected');
                    opt.querySelector('i').style.opacity = '0';
                    if (opt.dataset.value === '') {
                        opt.classList.add('selected');
                        opt.querySelector('i').style.opacity = '1';
                    }
                });
            }
            
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

    // Show add book modal with custom dropdown
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
                        
                        <!-- Custom Category Dropdown -->
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-2">Category</label>
                            <div class="relative">
                                <button 
                                    type="button"
                                    id="addBookCategoryTrigger"
                                    class="custom-dropdown-trigger w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-left flex items-center justify-between transition-all duration-200 hover:border-slate-400"
                                >
                                    <span id="addBookCategoryValue">General</span>
                                    <i class="fas fa-chevron-down text-slate-400 transition-transform duration-300"></i>
                                </button>
                                
                                <div 
                                    id="addBookCategoryDropdown"
                                    class="custom-dropdown-menu hidden absolute z-50 w-full bg-white rounded-lg shadow-2xl border border-slate-200 overflow-hidden transition-all duration-300 transform origin-top scale-y-0 opacity-0 max-h-0"
                                >
                                    <div class="p-3 border-b border-slate-100">
                                        <div class="relative">
                                            <input 
                                                type="text" 
                                                class="dropdown-search w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                placeholder="Search category..."
                                            >
                                            <i class="fas fa-search absolute left-3 top-3 text-slate-400 text-sm"></i>
                                        </div>
                                    </div>
                                    
                                    <div class="overflow-y-auto max-h-60">
                                        <div class="py-1">
                                            <div class="dropdown-option px-4 py-3 hover:bg-purple-50 cursor-pointer transition-colors duration-150 flex items-center justify-between" data-value="General">
                                                <span>General</span>
                                                <i class="fas fa-check text-purple-600 opacity-0"></i>
                                            </div>
                                            <div class="dropdown-option px-4 py-3 hover:bg-purple-50 cursor-pointer transition-colors duration-150 flex items-center justify-between" data-value="Fiction">
                                                <span>Fiction</span>
                                                <i class="fas fa-check text-purple-600 opacity-0"></i>
                                            </div>
                                            <div class="dropdown-option px-4 py-3 hover:bg-purple-50 cursor-pointer transition-colors duration-150 flex items-center justify-between" data-value="Non-Fiction">
                                                <span>Non-Fiction</span>
                                                <i class="fas fa-check text-purple-600 opacity-0"></i>
                                            </div>
                                            <div class="dropdown-option px-4 py-3 hover:bg-purple-50 cursor-pointer transition-colors duration-150 flex items-center justify-between" data-value="Science">
                                                <span>Science</span>
                                                <i class="fas fa-check text-purple-600 opacity-0"></i>
                                            </div>
                                            <div class="dropdown-option px-4 py-3 hover:bg-purple-50 cursor-pointer transition-colors duration-150 flex items-center justify-between" data-value="Technology">
                                                <span>Technology</span>
                                                <i class="fas fa-check text-purple-600 opacity-0"></i>
                                            </div>
                                            <div class="dropdown-option px-4 py-3 hover:bg-purple-50 cursor-pointer transition-colors duration-150 flex items-center justify-between" data-value="Literature">
                                                <span>Literature</span>
                                                <i class="fas fa-check text-purple-600 opacity-0"></i>
                                            </div>
                                            <div class="dropdown-option px-4 py-3 hover:bg-purple-50 cursor-pointer transition-colors duration-150 flex items-center justify-between" data-value="History">
                                                <span>History</span>
                                                <i class="fas fa-check text-purple-600 opacity-0"></i>
                                            </div>
                                            <div class="dropdown-option px-4 py-3 hover:bg-purple-50 cursor-pointer transition-colors duration-150 flex items-center justify-between" data-value="Biography">
                                                <span>Biography</span>
                                                <i class="fas fa-check text-purple-600 opacity-0"></i>
                                            </div>
                                            <div class="dropdown-option px-4 py-3 hover:bg-purple-50 cursor-pointer transition-colors duration-150 flex items-center justify-between" data-value="Educational">
                                                <span>Educational</span>
                                                <i class="fas fa-check text-purple-600 opacity-0"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <input type="hidden" id="bookCategory" name="category" value="General">
                            </div>
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

        // Initialize custom dropdown for add book modal
        setTimeout(() => {
            if (document.getElementById('addBookCategoryTrigger')) {
                this.initializeCustomDropdown(
                    'addBookCategoryTrigger',
                    'addBookCategoryDropdown',
                    'bookCategory',
                    'addBookCategoryValue'
                );
            }
        }, 10);

        modal.querySelector('#addBookForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.addBook();
        });
    }

    // Add new book
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

            const response = await this.fetch(this.baseURL, {
                method: 'POST',
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to add book');
            }

            this.showSuccess('Book added successfully!');
            
            document.querySelector('.fixed.bg-black')?.remove();
            
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

    // Show edit book modal with custom dropdown
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
                            
                            <!-- Custom Category Dropdown for Edit Book -->
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-2">Category</label>
                                <div class="relative">
                                    <button 
                                        type="button"
                                        id="editBookCategoryTrigger"
                                        class="custom-dropdown-trigger w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-left flex items-center justify-between transition-all duration-200 hover:border-slate-400"
                                    >
                                        <span id="editBookCategoryValue">${book.category || 'General'}</span>
                                        <i class="fas fa-chevron-down text-slate-400 transition-transform duration-300"></i>
                                    </button>
                                    
                                    <div 
                                        id="editBookCategoryDropdown"
                                        class="custom-dropdown-menu hidden absolute z-50 w-full bg-white rounded-lg shadow-2xl border border-slate-200 overflow-hidden transition-all duration-300 transform origin-top scale-y-0 opacity-0 max-h-0"
                                    >
                                        <div class="p-3 border-b border-slate-100">
                                            <div class="relative">
                                                <input 
                                                    type="text" 
                                                    class="dropdown-search w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                    placeholder="Search category..."
                                                >
                                                <i class="fas fa-search absolute left-3 top-3 text-slate-400 text-sm"></i>
                                            </div>
                                        </div>
                                        
                                        <div class="overflow-y-auto max-h-60">
                                            <div class="py-1">
                                                <div class="dropdown-option px-4 py-3 hover:bg-purple-50 cursor-pointer transition-colors duration-150 flex items-center justify-between" data-value="General">
                                                    <span>General</span>
                                                    <i class="fas fa-check text-purple-600 opacity-0"></i>
                                                </div>
                                                <div class="dropdown-option px-4 py-3 hover:bg-purple-50 cursor-pointer transition-colors duration-150 flex items-center justify-between" data-value="Fiction">
                                                    <span>Fiction</span>
                                                    <i class="fas fa-check text-purple-600 opacity-0"></i>
                                                </div>
                                                <div class="dropdown-option px-4 py-3 hover:bg-purple-50 cursor-pointer transition-colors duration-150 flex items-center justify-between" data-value="Non-Fiction">
                                                    <span>Non-Fiction</span>
                                                    <i class="fas fa-check text-purple-600 opacity-0"></i>
                                                </div>
                                                <div class="dropdown-option px-4 py-3 hover:bg-purple-50 cursor-pointer transition-colors duration-150 flex items-center justify-between" data-value="Science">
                                                    <span>Science</span>
                                                    <i class="fas fa-check text-purple-600 opacity-0"></i>
                                                </div>
                                                <div class="dropdown-option px-4 py-3 hover:bg-purple-50 cursor-pointer transition-colors duration-150 flex items-center justify-between" data-value="Technology">
                                                    <span>Technology</span>
                                                    <i class="fas fa-check text-purple-600 opacity-0"></i>
                                                </div>
                                                <div class="dropdown-option px-4 py-3 hover:bg-purple-50 cursor-pointer transition-colors duration-150 flex items-center justify-between" data-value="Literature">
                                                    <span>Literature</span>
                                                    <i class="fas fa-check text-purple-600 opacity-0"></i>
                                                </div>
                                                <div class="dropdown-option px-4 py-3 hover:bg-purple-50 cursor-pointer transition-colors duration-150 flex items-center justify-between" data-value="History">
                                                    <span>History</span>
                                                    <i class="fas fa-check text-purple-600 opacity-0"></i>
                                                </div>
                                                <div class="dropdown-option px-4 py-3 hover:bg-purple-50 cursor-pointer transition-colors duration-150 flex items-center justify-between" data-value="Biography">
                                                    <span>Biography</span>
                                                    <i class="fas fa-check text-purple-600 opacity-0"></i>
                                                </div>
                                                <div class="dropdown-option px-4 py-3 hover:bg-purple-50 cursor-pointer transition-colors duration-150 flex items-center justify-between" data-value="Educational">
                                                    <span>Educational</span>
                                                    <i class="fas fa-check text-purple-600 opacity-0"></i>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <input type="hidden" id="editBookCategory" name="category" value="${book.category || 'General'}">
                                </div>
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

            // Initialize custom dropdown for edit book modal
            setTimeout(() => {
                if (document.getElementById('editBookCategoryTrigger')) {
                    this.initializeCustomDropdown(
                        'editBookCategoryTrigger',
                        'editBookCategoryDropdown',
                        'editBookCategory',
                        'editBookCategoryValue'
                    );
                    
                    // Mark the current category as selected
                    const dropdown = document.getElementById('editBookCategoryDropdown');
                    if (dropdown) {
                        dropdown.querySelectorAll('.dropdown-option').forEach(opt => {
                            opt.classList.remove('selected');
                            opt.querySelector('i').style.opacity = '0';
                            if (opt.dataset.value === (book.category || 'General')) {
                                opt.classList.add('selected');
                                opt.querySelector('i').style.opacity = '1';
                            }
                        });
                    }
                }
            }, 10);

            modal.querySelector('#editBookForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.updateBook(book._id);
            });
            
        } catch (error) {
            console.error('Error loading edit book modal:', error);
            this.showError('Failed to load book details. Please try again.');
        }
    }

    // Update book
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

            const response = await this.fetch(`${this.baseURL}/${bookId}`, {
                method: 'PUT',
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to update book');
            }

            this.showSuccess('Book updated successfully!');
            
            document.querySelector('.fixed.bg-black')?.remove();
            this.loadBooks();
            
        } catch (error) {
            console.error('Error updating book:', error);
            this.showError(error.message || 'Failed to update book. Please try again.');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    // View book details
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

    // Show book details modal
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

    // Show delete confirmation
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

        modal.querySelector('#confirmDeleteBtn').addEventListener('click', async (e) => {
            const bookId = e.currentTarget.dataset.id;
            await this.deleteBook(bookId);
        });
    }

    // Delete book
    async deleteBook(bookId) {
        const deleteBtn = document.getElementById('confirmDeleteBtn');
        const originalText = deleteBtn.innerHTML;
        
        try {
            deleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';
            deleteBtn.disabled = true;

            const response = await this.fetch(`${this.baseURL}/${bookId}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to delete book');
            }

            this.showSuccess('Book deleted successfully!');
            
            document.querySelector('.fixed.bg-black')?.remove();
            this.loadBooks();
            
        } catch (error) {
            console.error('Error deleting book:', error);
            this.showError(error.message || 'Failed to delete book. Please try again.');
        } finally {
            deleteBtn.innerHTML = originalText;
            deleteBtn.disabled = false;
        }
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

    // Clone book
    async cloneBook(bookId) {
        try {
            const response = await this.fetch(`${this.baseURL}/${bookId}`);
            const data = await response.json();
            
            if (!response.ok || !data.success) {
                throw new Error('Failed to get book details');
            }
            
            const originalBook = data.book;
            this.showCloneBookModal(originalBook);
            
        } catch (error) {
            console.error('Error cloning book:', error);
            this.showError('Failed to clone book. Please try again.');
        }
    }

    // Show clone book modal
    showCloneBookModal(originalBook) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-xl shadow-2xl max-w-md w-full animate-fade-in">
                <div class="p-6">
                    <div class="flex items-center justify-between mb-6">
                        <div class="flex items-center space-x-3">
                            <div class="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg flex items-center justify-center">
                                <i class="fas fa-copy text-white"></i>
                            </div>
                            <div>
                                <h3 class="text-xl font-bold text-slate-800">Clone Book</h3>
                                <p class="text-slate-600">Create a copy with new ID</p>
                            </div>
                        </div>
                        <button onclick="this.closest('.fixed').remove()" class="text-slate-400 hover:text-slate-600">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    
                    <div class="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <p class="text-sm text-yellow-800">
                            <i class="fas fa-exclamation-triangle mr-2"></i>
                            This will create a new book with the same details but a new unique Book ID.
                            The original book (ID: ${originalBook.bookId || 'N/A'}) will remain unchanged.
                        </p>
                    </div>
                    
                    <div class="space-y-4">
                        <div class="grid grid-cols-2 gap-4">
                            <div class="p-3 bg-slate-50 rounded-lg">
                                <p class="text-xs text-slate-500">Original Title</p>
                                <p class="font-medium text-slate-800 truncate">${originalBook.title || 'Untitled'}</p>
                            </div>
                            <div class="p-3 bg-slate-50 rounded-lg">
                                <p class="text-xs text-slate-500">Original Author</p>
                                <p class="font-medium text-slate-800 truncate">${originalBook.author || 'Unknown'}</p>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-4">
                            <div class="p-3 bg-slate-50 rounded-lg">
                                <p class="text-xs text-slate-500">Original Category</p>
                                <p class="font-medium text-slate-800">${originalBook.category || 'General'}</p>
                            </div>
                            <div class="p-3 bg-slate-50 rounded-lg">
                                <p class="text-xs text-slate-500">Original Price</p>
                                <p class="font-medium text-slate-800">₹${(originalBook.price || 0).toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex space-x-3 mt-6">
                        <button type="button" onclick="this.closest('.fixed').remove()"
                            class="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition duration-200">
                            Cancel
                        </button>
                        <button id="confirmCloneBtn"
                            class="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:opacity-90 transition duration-200">
                            Clone Book
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('#confirmCloneBtn').addEventListener('click', async () => {
            await this.createClone(originalBook);
            modal.remove();
        });
    }

    // Create clone of book
    async createClone(originalBook) {
        try {
            const submitBtn = document.querySelector('#confirmCloneBtn');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cloning...';
            submitBtn.disabled = true;

            const newBook = {
                title: `${originalBook.title} (Copy)`,
                author: originalBook.author,
                isbn: originalBook.isbn || '',
                publicationYear: originalBook.publicationYear,
                category: originalBook.category,
                price: originalBook.price,
                quantity: originalBook.quantity,
                availableQuantity: originalBook.quantity
            };

            const response = await this.fetch(this.baseURL, {
                method: 'POST',
                body: JSON.stringify(newBook)
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to clone book');
            }

            this.showSuccess('Book cloned successfully! New ID: ' + (data.book?.bookId || 'Generated'));
            this.loadBooks();
            
        } catch (error) {
            console.error('Error creating clone:', error);
            this.showError(error.message || 'Failed to clone book. Please try again.');
        }
    }

    // Generate book report
    async generateBookReport(bookId) {
        try {
            const response = await this.fetch(`${this.baseURL}/${bookId}`);
            const data = await response.json();
            
            if (!response.ok || !data.success) {
                throw new Error('Failed to get book details');
            }
            
            const book = data.book;
            this.showBookReportModal(book);
            
        } catch (error) {
            console.error('Error generating report:', error);
            this.showError('Failed to generate report. Please try again.');
        }
    }

    // Show book report modal
    showBookReportModal(book) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-fade-in">
                <div class="p-6 overflow-y-auto max-h-[85vh]">
                    <div class="flex items-center justify-between mb-6">
                        <div class="flex items-center space-x-3">
                            <div class="w-12 h-12 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-lg flex items-center justify-center">
                                <i class="fas fa-chart-bar text-white"></i>
                            </div>
                            <div>
                                <h3 class="text-xl font-bold text-slate-800">Book Report</h3>
                                <p class="text-slate-600">${book.title || 'Untitled'}</p>
                            </div>
                        </div>
                        <button onclick="this.closest('.fixed').remove()" class="text-slate-400 hover:text-slate-600">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div class="bg-slate-50 rounded-xl p-5">
                            <h4 class="font-semibold text-slate-800 mb-4">Inventory Status</h4>
                            <div class="space-y-4">
                                <div class="flex justify-between items-center">
                                    <span class="text-slate-600">Total Quantity</span>
                                    <span class="font-semibold text-slate-800">${book.quantity || 0}</span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="text-slate-600">Available</span>
                                    <span class="font-semibold ${book.availableQuantity > 0 ? 'text-green-600' : 'text-red-600'}">
                                        ${book.availableQuantity || 0}
                                    </span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="text-slate-600">Issued</span>
                                    <span class="font-semibold text-blue-600">
                                        ${(book.quantity || 0) - (book.availableQuantity || 0)}
                                    </span>
                                </div>
                                <div class="pt-4 border-t border-slate-200">
                                    <div class="flex justify-between items-center">
                                        <span class="text-slate-600">Availability Rate</span>
                                        <span class="font-semibold ${(book.availableQuantity / book.quantity * 100) > 50 ? 'text-green-600' : 'text-yellow-600'}">
                                            ${book.quantity > 0 ? ((book.availableQuantity / book.quantity * 100).toFixed(1)) : 0}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-slate-50 rounded-xl p-5">
                            <h4 class="font-semibold text-slate-800 mb-4">Financial Summary</h4>
                            <div class="space-y-4">
                                <div class="flex justify-between items-center">
                                    <span class="text-slate-600">Unit Price</span>
                                    <span class="font-semibold text-slate-800">₹${(book.price || 0).toFixed(2)}</span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="text-slate-600">Total Value</span>
                                    <span class="font-semibold text-slate-800">
                                        ₹${((book.price || 0) * (book.quantity || 0)).toFixed(2)}
                                    </span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="text-slate-600">Available Value</span>
                                    <span class="font-semibold text-slate-800">
                                        ₹${((book.price || 0) * (book.availableQuantity || 0)).toFixed(2)}
                                    </span>
                                </div>
                                <div class="pt-4 border-t border-slate-200">
                                    <div class="flex justify-between items-center">
                                        <span class="text-slate-600">Issued Value</span>
                                        <span class="font-semibold text-slate-800">
                                            ₹${((book.price || 0) * ((book.quantity || 0) - (book.availableQuantity || 0))).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex space-x-3 mt-6">
                        <button onclick="window.print()"
                            class="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition duration-200 flex items-center justify-center space-x-2">
                            <i class="fas fa-print"></i>
                            <span>Print Report</span>
                        </button>
                        <button onclick="booksManager.exportBookReport('${book._id}')"
                            class="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition duration-200 flex items-center justify-center space-x-2">
                            <i class="fas fa-download"></i>
                            <span>Export PDF</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    // Show issue book modal
    showIssueBookModal(bookId) {
        this.showError('Issue book functionality needs to be implemented');
    }

    // Export book report
    exportBookReport(bookId) {
        this.showSuccess('Report export functionality will be implemented');
    }

    // Export books to Excel
    async exportBooksToExcel() {
        try {
            const exportBtn = document.getElementById('exportBooksBtn');
            const originalText = exportBtn.innerHTML;
            exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Exporting...';
            exportBtn.disabled = true;

            const response = await this.fetch(`${this.baseURL}?limit=1000`);
            const data = await response.json();
            
            if (!response.ok || !data.success) {
                throw new Error('Failed to fetch books for export');
            }

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
            const exportBtn = document.getElementById('exportBooksBtn');
            if (exportBtn) {
                exportBtn.innerHTML = originalText;
                exportBtn.disabled = false;
            }
        }
    }

    // Print books list
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
                                \`;
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