// Authentication functions
class Auth {
    constructor() {
        this.baseURL = 'http://localhost:5000/api/auth';
    }

    /* =======================
       TOAST NOTIFICATION
    ======================= */
    showToast(message, type = 'success') {
        let toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toastContainer';
            toastContainer.className = 'fixed top-4 right-4 z-50 space-y-2';
            document.body.appendChild(toastContainer);
        }

        const toast = document.createElement('div');
        toast.className = `bg-white border-l-4 ${
            type === 'success' ? 'border-green-500' :
            type === 'error' ? 'border-red-500' :
            'border-yellow-500'
        } p-4 rounded shadow max-w-md`;

        toast.innerHTML = `<p class="text-sm">${message}</p>`;
        toastContainer.appendChild(toast);

        setTimeout(() => toast.remove(), 4000);
    }

    /* =======================
       HELPERS
    ======================= */
    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    async fetchWithAuth(url, options = {}) {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        if (token) headers.Authorization = `Bearer ${token}`;
        return fetch(url, { ...options, headers });
    }

    redirectToDashboard() {
        setTimeout(() => {
            if (window.electronAPI && window.electronAPI.navigateTo) {
                window.electronAPI.navigateTo('dashboard');
            } else {
                window.location.href = 'dashboard.html';
            }
        }, 500);
    }

    /* =======================
       LOGIN
    ======================= */
    async handleLogin(event) {
        event.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        if (!email || !this.validateEmail(email)) {
            return this.showToast('Enter valid email', 'error');
        }
        if (!password) {
            return this.showToast('Password required', 'error');
        }

        try {
            const res = await fetch(`${this.baseURL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            localStorage.setItem('token', data.token);
            localStorage.setItem('librarian', JSON.stringify(data.librarian));

            this.showToast('Login successful');
            this.redirectToDashboard();

        } catch (err) {
            this.showToast(err.message || 'Login failed', 'error');
        }
    }

    /* =======================
       REGISTER
    ======================= */
    async handleRegister(event) {
        event.preventDefault();

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (!name || !email || !password) {
            return this.showToast('All fields required', 'error');
        }
        if (!this.validateEmail(email)) {
            return this.showToast('Invalid email', 'error');
        }
        if (password.length < 6) {
            return this.showToast('Password must be 6+ characters', 'error');
        }
        if (password !== confirmPassword) {
            return this.showToast('Passwords do not match', 'error');
        }

        try {
            const res = await fetch(`${this.baseURL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            localStorage.setItem('token', data.token);
            localStorage.setItem('librarian', JSON.stringify(data.librarian));

            this.showToast('Registration successful');
            this.redirectToDashboard();

        } catch (err) {
            this.showToast(err.message || 'Registration failed', 'error');
        }
    }

    /* =======================
       LOGOUT
    ======================= */
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('librarian');

        if (window.electronAPI && window.electronAPI.navigateTo) {
            window.electronAPI.navigateTo('login');
        } else {
            window.location.href = 'login.html';
        }
    }

    /* =======================
       INIT
    ======================= */
    init() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', e => this.handleLogin(e));
        }

        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', e => this.handleRegister(e));
        }

        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
    }
}

/* =======================
   START APP
======================= */
document.addEventListener('DOMContentLoaded', () => {
    const auth = new Auth();
    auth.init();
});

window.Auth = Auth;
