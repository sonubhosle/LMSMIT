// Toast notification component

class Toast {
    constructor() {
        this.container = document.getElementById('toastContainer');
        if (!this.container) {
            this.createContainer();
        }
    }

    createContainer() {
        this.container = document.createElement('div');
        this.container.id = 'toastContainer';
        this.container.className = 'fixed top-4 right-4 z-50 space-y-2';
        document.body.appendChild(this.container);
    }

    show(message, type = 'success', duration = 5000) {
        const toast = document.createElement('div');
        toast.className = `animate-fade-in bg-white border-l-4 ${
            type === 'success' ? 'border-green-500' : 
            type === 'error' ? 'border-red-500' : 
            type === 'warning' ? 'border-yellow-500' :
            type === 'info' ? 'border-blue-500' :
            'border-slate-500'
        } p-4 rounded-r-lg shadow-lg max-w-md`;
        
        const icon = type === 'success' ? 'fa-check-circle' :
                    type === 'error' ? 'fa-exclamation-circle' :
                    type === 'warning' ? 'fa-exclamation-triangle' :
                    type === 'info' ? 'fa-info-circle' :
                    'fa-bell';
        
        const iconColor = type === 'success' ? 'text-green-500' :
                         type === 'error' ? 'text-red-500' :
                         type === 'warning' ? 'text-yellow-500' :
                         type === 'info' ? 'text-blue-500' :
                         'text-slate-500';
        
        toast.innerHTML = `
            <div class="flex items-center">
                <div class="flex-shrink-0">
                    <i class="fas ${icon} ${iconColor} text-lg"></i>
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

        this.container.appendChild(toast);

        // Auto remove after duration
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, duration);

        return toast;
    }

    success(message, duration = 5000) {
        return this.show(message, 'success', duration);
    }

    error(message, duration = 5000) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration = 5000) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration = 5000) {
        return this.show(message, 'info', duration);
    }
}

// Global toast instance
window.toast = new Toast();

// Export for use in other files
window.Toast = Toast;