// Students management functionality
class StudentsManager {
    constructor() {
        this.baseURL = 'http://localhost:5000/api/students';
        this.currentPage = 1;
        this.limit = 10;
        this.searchQuery = '';
        this.totalPages = 1;
        this.selectedStudent = null;
    }

    // Load students page
    async loadStudentsPage() {
        const content = document.getElementById('pageContent');
        content.innerHTML = `
            <div class="animate-fade-in">
                <!-- Header -->
                <div class="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0">
                    <div>
                        <h2 class="text-2xl font-bold text-slate-800">Students Management</h2>
                        <p class="text-slate-600">Manage student records and track issued books</p>
                    </div>
                    <div class="flex space-x-3">
                        <button id="exportStudentsBtn" class="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition duration-200 flex items-center space-x-2">
                            <i class="fas fa-download"></i>
                            <span>Export Excel</span>
                        </button>
                        <button id="addStudentBtn" class="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition duration-200 flex items-center space-x-2">
                            <i class="fas fa-plus"></i>
                            <span>Add Student</span>
                        </button>
                    </div>
                </div>

                <!-- Search and Filters -->
                <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
                    <div class="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
                        <div class="flex-1">
                            <div class="relative">
                                <input 
                                    type="text" 
                                    id="studentSearch"
                                    placeholder="Search students by name, email, mobile, or class..."
                                    class="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    value="${this.searchQuery}"
                                >
                                <i class="fas fa-search absolute left-3 top-3 text-slate-400"></i>
                            </div>
                        </div>
                        <div class="flex space-x-2">
                            <button id="clearSearchBtn" class="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition duration-200">
                                Clear
                            </button>
                            <button id="searchStudentsBtn" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-200">
                                Search
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Students Table -->
                <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-slate-200">
                            <thead class="bg-slate-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Student ID
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Contact
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Class
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Issued Books
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Joined Date
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody id="studentsTableBody" class="bg-white divide-y divide-slate-200">
                                <!-- Students will be loaded here -->
                                <tr>
                                    <td colspan="7" class="px-6 py-12 text-center">
                                        <div class="flex flex-col items-center justify-center">
                                            <div class="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                            <p class="text-slate-600">Loading students...</p>
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
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    <div class="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-blue-100">Total Students</p>
                                <h3 id="totalStudentsCount" class="text-3xl font-bold mt-2">0</h3>
                            </div>
                            <div class="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                <i class="fas fa-users text-xl"></i>
                            </div>
                        </div>
                    </div>
                    <div class="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-green-100">Active Students</p>
                                <h3 id="activeStudentsCount" class="text-3xl font-bold mt-2">0</h3>
                            </div>
                            <div class="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                <i class="fas fa-book-reader text-xl"></i>
                            </div>
                        </div>
                    </div>
                    <div class="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-purple-100">Overdue Books</p>
                                <h3 id="studentOverdueCount" class="text-3xl font-bold mt-2">0</h3>
                            </div>
                            <div class="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                <i class="fas fa-exclamation-triangle text-xl"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Load students data
        await this.loadStudents();
        
        // Setup event listeners
        this.setupEventListeners();
    }

    // Load students data - FIXED VERSION
    async loadStudents() {
        try {
            const tbody = document.getElementById('studentsTableBody');
            
            // Show loading state
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="px-6 py-12 text-center">
                        <div class="flex flex-col items-center justify-center">
                            <div class="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p class="text-slate-600">Loading students...</p>
                        </div>
                    </td>
                </tr>
            `;

            const url = `${this.baseURL}?page=${this.currentPage}&limit=${this.limit}&search=${encodeURIComponent(this.searchQuery)}`;
            console.log('Fetching students from:', url); // Debug log
            
            const response = await api.fetch(url);
            
            if (!response.ok) {
                throw new Error(`Failed to load students: ${response.status}`);
            }

            const data = await response.json();
            console.log('Students data received:', data); // Debug log
            
            if (!data.success) {
                throw new Error(data.message || 'Failed to load students');
            }

            this.totalPages = data.pages || 1;
            
            // Update stats
            document.getElementById('totalStudentsCount').textContent = data.total?.toLocaleString() || '0';
            document.getElementById('activeStudentsCount').textContent = data.total?.toLocaleString() || '0';
            
            // Render table
            this.renderStudentsTable(data.students || []);
            
            // Render pagination
            this.renderPagination();
            
        } catch (error) {
            console.error('Error loading students:', error);
            
            // Show error in table
            const tbody = document.getElementById('studentsTableBody');
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="px-6 py-12 text-center">
                        <div class="flex flex-col items-center justify-center">
                            <i class="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
                            <p class="text-slate-700 text-lg font-medium mb-2">Failed to load students</p>
                            <p class="text-slate-600 mb-4">${error.message || 'Please try again'}</p>
                            <button onclick="studentsManager.loadStudents()" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-200">
                                <i class="fas fa-redo mr-2"></i>Retry
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            
            this.showError('Failed to load students. Please try again.');
        }
    }

    // Render students table - FIXED VERSION
    renderStudentsTable(students) {
        const tbody = document.getElementById('studentsTableBody');
        
        if (!students || students.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="px-6 py-12 text-center">
                        <div class="flex flex-col items-center justify-center">
                            <i class="fas fa-users text-4xl text-slate-400 mb-4"></i>
                            <p class="text-slate-600 text-lg font-medium mb-2">No students found</p>
                            <p class="text-slate-500">${this.searchQuery ? 'Try a different search term' : 'Add your first student to get started'}</p>
                            ${!this.searchQuery ? `
                                <button id="addFirstStudentBtn" class="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-200">
                                    <i class="fas fa-plus mr-2"></i>Add Student
                                </button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `;
            
            if (!this.searchQuery) {
                setTimeout(() => {
                    document.getElementById('addFirstStudentBtn')?.addEventListener('click', () => this.showAddStudentModal());
                }, 100);
            }
            
            return;
        }

        let html = '';
        students.forEach(student => {
            const issuedCount = student.issuedBooks?.length || 0;
            const hasOverdue = student.issuedBooks?.some(issue => 
                issue.status === 'overdue' || (new Date(issue.dueDate) < new Date() && issue.status === 'issued')
            );
            
            html += `
                <tr class="hover:bg-slate-50 transition duration-150" data-student-id="${student._id}">
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-slate-900">${student.studentId || student._id?.slice(-6) || 'N/A'}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                            <div class="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center mr-3">
                                <i class="fas fa-user text-white text-xs"></i>
                            </div>
                            <div>
                                <div class="text-sm font-medium text-slate-900">${student.name || 'Unknown'}</div>
                                <div class="text-sm text-slate-500">${student.email || 'No email'}</div>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-slate-900">${student.mobile || 'N/A'}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            ${student.className || 'General'}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${issuedCount > 0 ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}">
                                ${issuedCount} book${issuedCount !== 1 ? 's' : ''}
                            </span>
                            ${hasOverdue ? `
                                <span class="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    <i class="fas fa-exclamation-triangle mr-1"></i> Overdue
                                </span>
                            ` : ''}
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        ${student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div class="flex items-center space-x-2">
                            <button class="view-student-btn text-blue-600 hover:text-blue-900" data-id="${student._id}" title="View Details">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="edit-student-btn text-green-600 hover:text-green-900" data-id="${student._id}" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="delete-student-btn text-red-600 hover:text-red-900" data-id="${student._id}" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                            <button class="issue-book-btn text-purple-600 hover:text-purple-900" data-id="${student._id}" title="Issue Book">
                                <i class="fas fa-book"></i>
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

    // Render pagination - FIXED VERSION
    renderPagination() {
        const container = document.getElementById('paginationContainer');
        if (!container || this.totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        let html = `
            <div class="flex items-center justify-between">
                <div class="flex-1 flex justify-between sm:hidden">
                    <button onclick="studentsManager.previousPage()" ${this.currentPage === 1 ? 'disabled' : ''} 
                        class="relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md ${this.currentPage === 1 ? 'text-slate-400 bg-slate-50' : 'text-slate-700 bg-white hover:bg-slate-50'}">
                        Previous
                    </button>
                    <button onclick="studentsManager.nextPage()" ${this.currentPage === this.totalPages ? 'disabled' : ''}
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
            <button onclick="studentsManager.previousPage()" ${this.currentPage === 1 ? 'disabled' : ''}
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
                <button onclick="studentsManager.goToPage(${i})"
                    class="relative inline-flex items-center px-4 py-2 border border-slate-300 bg-white text-sm font-medium ${i === this.currentPage ? 'z-10 bg-purple-50 border-purple-500 text-purple-600' : 'text-slate-500 hover:bg-slate-50'}">
                    ${i}
                </button>
            `;
        }

        // Next button
        html += `
            <button onclick="studentsManager.nextPage()" ${this.currentPage === this.totalPages ? 'disabled' : ''}
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
        document.getElementById('searchStudentsBtn')?.addEventListener('click', () => {
            this.searchQuery = document.getElementById('studentSearch').value;
            this.currentPage = 1;
            this.loadStudents();
        });

        // Clear search
        document.getElementById('clearSearchBtn')?.addEventListener('click', () => {
            this.searchQuery = '';
            document.getElementById('studentSearch').value = '';
            this.currentPage = 1;
            this.loadStudents();
        });

        // Enter key in search
        document.getElementById('studentSearch')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchQuery = e.target.value;
                this.currentPage = 1;
                this.loadStudents();
            }
        });

        // Add student button
        document.getElementById('addStudentBtn')?.addEventListener('click', () => {
            this.showAddStudentModal();
        });

        // Export students button
        document.getElementById('exportStudentsBtn')?.addEventListener('click', () => {
            this.exportStudentsToExcel();
        });
    }

    // Setup table event listeners
    setupTableEventListeners() {
        // View student details
        document.querySelectorAll('.view-student-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const studentId = e.currentTarget.dataset.id;
                this.viewStudentDetails(studentId);
            });
        });

        // Edit student
        document.querySelectorAll('.edit-student-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const studentId = e.currentTarget.dataset.id;
                this.showEditStudentModal(studentId);
            });
        });

        // Delete student
        document.querySelectorAll('.delete-student-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const studentId = e.currentTarget.dataset.id;
                this.showDeleteConfirmation(studentId);
            });
        });

        // Issue book to student
        document.querySelectorAll('.issue-book-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const studentId = e.currentTarget.dataset.id;
                if (typeof showIssueBookModal === 'function') {
                    showIssueBookModal(studentId);
                }
            });
        });
    }

    // Pagination methods
    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.loadStudents();
        }
    }

    nextPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.loadStudents();
        }
    }

    goToPage(page) {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            this.loadStudents();
        }
    }

    // Show add student modal - FIXED VERSION
    showAddStudentModal() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-xl shadow-2xl max-w-md w-full animate-fade-in">
                <div class="p-6">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-xl font-bold text-slate-800">Add New Student</h3>
                        <button onclick="this.closest('.fixed').remove()" class="text-slate-400 hover:text-slate-600">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    
                    <form id="addStudentForm" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-2">Full Name *</label>
                            <input type="text" id="studentName" required
                                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="John Doe">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-2">Email Address *</label>
                            <input type="email" id="studentEmail" required
                                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="student@example.com">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-2">Mobile Number *</label>
                            <input type="tel" id="studentMobile" required pattern="[0-9]{10}"
                                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="9876543210">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-2">Class *</label>
                            <input type="text" id="studentClass" required
                                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Class 10, B.Tech CSE, etc.">
                        </div>
                        
                        <div class="flex space-x-3 pt-4">
                            <button type="button" onclick="this.closest('.fixed').remove()"
                                class="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition duration-200">
                                Cancel
                            </button>
                            <button type="submit" id="submitAddStudentBtn"
                                class="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition duration-200">
                                Add Student
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Handle form submission
        modal.querySelector('#addStudentForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.addStudent();
        });
    }

    // Add new student - FIXED VERSION
    async addStudent() {
        const submitBtn = document.getElementById('submitAddStudentBtn');
        const originalText = submitBtn.innerHTML;
        
        try {
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
            submitBtn.disabled = true;

            const formData = {
                name: document.getElementById('studentName').value.trim(),
                email: document.getElementById('studentEmail').value.trim(),
                mobile: document.getElementById('studentMobile').value.trim(),
                className: document.getElementById('studentClass').value.trim()
            };

            // Basic validation
            if (!formData.name || !formData.email || !formData.mobile || !formData.className) {
                this.showError('All fields are required');
                return;
            }

            console.log('Adding student:', formData); // Debug log

            const response = await api.fetch(this.baseURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            console.log('Add student response:', data); // Debug log

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to add student');
            }

            this.showSuccess('Student added successfully!');
            
            // Close modal
            document.querySelector('.fixed.bg-black')?.remove();
            
            // Reset to first page and refresh students list
            this.currentPage = 1;
            await this.loadStudents();
            
        } catch (error) {
            console.error('Error adding student:', error);
            this.showError(error.message || 'Failed to add student. Please try again.');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    // View student details
    async viewStudentDetails(studentId) {
        try {
            const response = await api.fetch(`${this.baseURL}/${studentId}`);
            const data = await response.json();
            
            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to load student details');
            }

            this.selectedStudent = data.student;
            this.showStudentDetailsModal();
            
        } catch (error) {
            console.error('Error viewing student details:', error);
            this.showError('Failed to load student details. Please try again.');
        }
    }

    // Show student details modal - FIXED VERSION
    showStudentDetailsModal() {
        if (!this.selectedStudent) return;

        const student = this.selectedStudent;
        const issuedCount = student.issuedBooks?.length || 0;
        
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-fade-in">
                <div class="p-6 overflow-y-auto max-h-[85vh]">
                    <div class="flex items-center justify-between mb-6">
                        <div class="flex items-center space-x-3">
                            <div class="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                                <i class="fas fa-user text-white text-lg"></i>
                            </div>
                            <div>
                                <h3 class="text-xl font-bold text-slate-800">${student.name || 'Unknown'}</h3>
                                <p class="text-slate-600">Student ID: ${student.studentId || student._id?.slice(-6) || 'N/A'}</p>
                            </div>
                        </div>
                        <button onclick="this.closest('.fixed').remove()" class="text-slate-400 hover:text-slate-600">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-slate-500 mb-1">Email Address</label>
                                <p class="text-slate-900">${student.email || 'N/A'}</p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-500 mb-1">Mobile Number</label>
                                <p class="text-slate-900">${student.mobile || 'N/A'}</p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-500 mb-1">Class</label>
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                    ${student.className || 'General'}
                                </span>
                            </div>
                        </div>
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-slate-500 mb-1">Joined Date</label>
                                <p class="text-slate-900">${student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'N/A'}</p>
                            </div>
                            ${student.updatedAt ? `
                            <div>
                                <label class="block text-sm font-medium text-slate-500 mb-1">Last Updated</label>
                                <p class="text-slate-900">${new Date(student.updatedAt).toLocaleDateString()}</p>
                            </div>
                            ` : ''}
                            <div>
                                <label class="block text-sm font-medium text-slate-500 mb-1">Status</label>
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${issuedCount > 0 ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}">
                                    ${issuedCount > 0 ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mb-6">
                        <h4 class="text-lg font-semibold text-slate-800 mb-4">Issued Books (${issuedCount})</h4>
                        ${issuedCount > 0 ? this.renderStudentIssuedBooks(student.issuedBooks) : `
                            <div class="text-center py-8 bg-slate-50 rounded-lg">
                                <i class="fas fa-book text-4xl text-slate-400 mb-4"></i>
                                <p class="text-slate-600">No books issued to this student</p>
                            </div>
                        `}
                    </div>
                    
                    <div class="flex space-x-3">
                        <button onclick="studentsManager.showEditStudentModal('${student._id}'); this.closest('.fixed').remove()"
                            class="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:opacity-90 transition duration-200 flex items-center justify-center space-x-2">
                            <i class="fas fa-edit"></i>
                            <span>Edit Student</span>
                        </button>
                        <button onclick="if (typeof showIssueBookModal === 'function') showIssueBookModal('${student._id}'); this.closest('.fixed').remove()"
                            class="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition duration-200 flex items-center justify-center space-x-2">
                            <i class="fas fa-book"></i>
                            <span>Issue Book</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    // Render student's issued books
    renderStudentIssuedBooks(issues) {
        if (!issues || issues.length === 0) return '';
        
        let html = '<div class="space-y-3">';
        
        issues.forEach(issue => {
            const dueDate = new Date(issue.dueDate);
            const today = new Date();
            const isOverdue = issue.status === 'overdue' || (dueDate < today && issue.status === 'issued');
            
            html += `
                <div class="flex items-center justify-between p-3 ${isOverdue ? 'bg-red-50 border border-red-200' : 'bg-slate-50'} rounded-lg">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 ${isOverdue ? 'bg-red-100' : 'bg-blue-100'} rounded-lg flex items-center justify-center">
                            <i class="fas fa-book ${isOverdue ? 'text-red-600' : 'text-blue-600'}"></i>
                        </div>
                        <div>
                            <p class="font-medium text-slate-800">${issue.book?.title || 'Unknown Book'}</p>
                            <p class="text-sm text-slate-500">${issue.book?.author || 'Unknown Author'}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="text-sm font-medium ${isOverdue ? 'text-red-600' : 'text-slate-600'}">
                            ${issue.status === 'returned' ? 'Returned' : isOverdue ? 'Overdue' : 'Issued'}
                        </p>
                        <p class="text-xs text-slate-500">Due: ${dueDate.toLocaleDateString()}</p>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    }

    // Show edit student modal
    async showEditStudentModal(studentId) {
        try {
            const response = await api.fetch(`${this.baseURL}/${studentId}`);
            const data = await response.json();
            
            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to load student details');
            }

            const student = data.student;
            
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
            modal.innerHTML = `
                <div class="bg-white rounded-xl shadow-2xl max-w-md w-full animate-fade-in">
                    <div class="p-6">
                        <div class="flex items-center justify-between mb-6">
                            <h3 class="text-xl font-bold text-slate-800">Edit Student</h3>
                            <button onclick="this.closest('.fixed').remove()" class="text-slate-400 hover:text-slate-600">
                                <i class="fas fa-times text-xl"></i>
                            </button>
                        </div>
                        
                        <form id="editStudentForm" class="space-y-4">
                            <input type="hidden" id="editStudentId" value="${student._id}">
                            
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-2">Full Name *</label>
                                <input type="text" id="editStudentName" required value="${student.name || ''}"
                                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-2">Email Address *</label>
                                <input type="email" id="editStudentEmail" required value="${student.email || ''}"
                                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-2">Mobile Number *</label>
                                <input type="tel" id="editStudentMobile" required pattern="[0-9]{10}" value="${student.mobile || ''}"
                                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-2">Class *</label>
                                <input type="text" id="editStudentClass" required value="${student.className || ''}"
                                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                            </div>
                            
                            <div class="flex space-x-3 pt-4">
                                <button type="button" onclick="this.closest('.fixed').remove()"
                                    class="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition duration-200">
                                    Cancel
                                </button>
                                <button type="submit" id="submitEditStudentBtn"
                                    class="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition duration-200">
                                    Update Student
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            // Handle form submission
            modal.querySelector('#editStudentForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.updateStudent(student._id);
            });
            
        } catch (error) {
            console.error('Error loading edit student modal:', error);
            this.showError('Failed to load student details. Please try again.');
        }
    }

    // Update student - FIXED VERSION
    async updateStudent(studentId) {
        const submitBtn = document.getElementById('submitEditStudentBtn');
        const originalText = submitBtn.innerHTML;
        
        try {
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
            submitBtn.disabled = true;

            const formData = {
                name: document.getElementById('editStudentName').value.trim(),
                email: document.getElementById('editStudentEmail').value.trim(),
                mobile: document.getElementById('editStudentMobile').value.trim(),
                className: document.getElementById('editStudentClass').value.trim()
            };

            // Basic validation
            if (!formData.name || !formData.email || !formData.mobile || !formData.className) {
                this.showError('All fields are required');
                return;
            }

            console.log('Updating student:', studentId, formData); // Debug log

            const response = await api.fetch(`${this.baseURL}/${studentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            console.log('Update student response:', data); // Debug log

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to update student');
            }

            this.showSuccess('Student updated successfully!');
            
            // Close modal
            document.querySelector('.fixed.bg-black')?.remove();
            
            // Refresh students list
            this.loadStudents();
            
        } catch (error) {
            console.error('Error updating student:', error);
            this.showError(error.message || 'Failed to update student. Please try again.');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    // Show delete confirmation
    showDeleteConfirmation(studentId) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-xl shadow-2xl max-w-md w-full animate-fade-in">
                <div class="p-6">
                    <div class="text-center">
                        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-exclamation-triangle text-red-600 text-2xl"></i>
                        </div>
                        <h3 class="text-xl font-bold text-slate-800 mb-2">Delete Student</h3>
                        <p class="text-slate-600 mb-6">Are you sure you want to delete this student? This action cannot be undone.</p>
                    </div>
                    
                    <div class="flex space-x-3">
                        <button onclick="this.closest('.fixed').remove()"
                            class="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition duration-200">
                            Cancel
                        </button>
                        <button id="confirmDeleteBtn" data-id="${studentId}"
                            class="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:opacity-90 transition duration-200">
                            Delete Student
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Handle delete confirmation
        modal.querySelector('#confirmDeleteBtn').addEventListener('click', async (e) => {
            const studentId = e.currentTarget.dataset.id;
            await this.deleteStudent(studentId);
        });
    }

    // Delete student - FIXED VERSION
    async deleteStudent(studentId) {
        const deleteBtn = document.getElementById('confirmDeleteBtn');
        const originalText = deleteBtn.innerHTML;
        
        try {
            deleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';
            deleteBtn.disabled = true;

            console.log('Deleting student:', studentId); // Debug log

            const response = await api.fetch(`${this.baseURL}/${studentId}`, {
                method: 'DELETE'
            });

            const data = await response.json();
            console.log('Delete student response:', data); // Debug log

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to delete student');
            }

            this.showSuccess('Student deleted successfully!');
            
            // Close modal
            document.querySelector('.fixed.bg-black')?.remove();
            
            // Refresh students list
            this.loadStudents();
            
        } catch (error) {
            console.error('Error deleting student:', error);
            this.showError(error.message || 'Failed to delete student. Please try again.');
        } finally {
            deleteBtn.innerHTML = originalText;
            deleteBtn.disabled = false;
        }
    }

    // Export students to Excel - FIXED VERSION
    async exportStudentsToExcel() {
        const exportBtn = document.getElementById('exportStudentsBtn');
        const originalText = exportBtn.innerHTML;
        
        try {
            // Show loading
            exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Exporting...';
            exportBtn.disabled = true;

            // Get all students
            const response = await api.fetch(`${this.baseURL}?limit=1000`);
            const data = await response.json();
            
            if (!response.ok || !data.success) {
                throw new Error('Failed to fetch students for export');
            }

            // Generate CSV content
            let csvContent = 'Student ID,Name,Email,Mobile,Class,Issued Books,Joined Date\n';
            
            data.students.forEach(student => {
                const issuedCount = student.issuedBooks?.length || 0;
                const row = [
                    student.studentId || '',
                    `"${student.name || ''}"`,
                    student.email || '',
                    student.mobile || '',
                    student.className || '',
                    issuedCount,
                    student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'N/A'
                ];
                csvContent += row.join(',') + '\n';
            });

            // Create blob and download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            link.setAttribute('href', url);
            link.setAttribute('download', `students_export_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.showSuccess('Students exported successfully!');
            
        } catch (error) {
            console.error('Error exporting students:', error);
            this.showError('Failed to export students. Please try again.');
        } finally {
            // Restore button state
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

// Load students page when function is called
function loadStudentsPage() {
    if (!window.studentsManager) {
        window.studentsManager = new StudentsManager();
    }
    window.studentsManager.loadStudentsPage();
}

// Export for use in other files
window.StudentsManager = StudentsManager;