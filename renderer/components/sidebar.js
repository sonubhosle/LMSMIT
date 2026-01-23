// Sidebar component functionality

class Sidebar {
    constructor() {
        this.sidebar = document.getElementById('sidebar');
        this.sidebarToggle = document.getElementById('sidebarToggle');
        this.init();
    }

    init() {
        // Toggle sidebar on button click
        if (this.sidebarToggle) {
            this.sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        }

        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());

        // Initialize sidebar state
        this.handleResize();

        // Initialize active menu item
        this.setActiveMenuItem();
    }



    handleResize() {
        const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        const isMobile = window.innerWidth < 768;

        if (isMobile) {
            this.sidebar.classList.remove('sidebar-expanded', 'sidebar-collapsed');
            this.sidebar.classList.add('sidebar-collapsed');
        } else {
            if (isCollapsed) {
                this.sidebar.classList.remove('sidebar-expanded');
                this.sidebar.classList.add('sidebar-collapsed');
            } else {
                this.sidebar.classList.remove('sidebar-collapsed');
                this.sidebar.classList.add('sidebar-expanded');
            }
        }
    }



    // Update user info in sidebar
    updateUserInfo(name, email) {
        const userName = document.getElementById('userName');
        const userEmail = document.getElementById('userEmail');
        
        if (userName) userName.textContent = name || 'Librarian';
        if (userEmail) userEmail.textContent = email || 'librarian@library.com';
    }

    // Add notification badge
    addNotificationBadge(count) {
        const badge = document.getElementById('notificationBadge');
        if (badge) {
            if (count > 0) {
                badge.classList.remove('hidden');
                badge.textContent = count > 9 ? '9+' : count;
            } else {
                badge.classList.add('hidden');
            }
        }
    }
}

// Initialize sidebar when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const sidebar = new Sidebar();
    
    // Update user info if available
    const token = localStorage.getItem('token');
    if (token) {
        // Fetch user info from API
        fetch('http://localhost:5000/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                sidebar.updateUserInfo(data.librarian.name, data.librarian.email);
            }
        })
        .catch(error => {
            console.error('Failed to fetch user info:', error);
        });
    }
    
    // Check for overdue books for notification
    fetch('http://localhost:5000/api/issues/overdue')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.issues.length > 0) {
                sidebar.addNotificationBadge(data.issues.length);
            }
        })
        .catch(error => {
            console.error('Failed to check overdue books:', error);
        });
});

// Export for use in other files
window.Sidebar = Sidebar;