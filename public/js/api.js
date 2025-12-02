// API Base URL
const API_URL = 'http://localhost:5000/api';

// API Helper Functions
const api = {
    // Auth endpoints
    async register(data) {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            credentials: 'include'
        });
        return response.json();
    },

    async verifyEmail(data) {
        const response = await fetch(`${API_URL}/auth/verify-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            credentials: 'include'
        });
        return response.json();
    },

    async resendVerification(userId) {
        const response = await fetch(`${API_URL}/auth/resend-verification`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
            credentials: 'include'
        });
        return response.json();
    },

    async login(data) {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            credentials: 'include'
        });
        return response.json();
    },

    async logout() {
        const response = await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        return response.json();
    },

    async getProfile() {
        const response = await fetch(`${API_URL}/users/me`, {
            credentials: 'include'
        });
        return response.json();
    },

    async updateProfile(data) {
        const response = await fetch(`${API_URL}/users/me`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            credentials: 'include'
        });
        const result = await response.json();
        if (result.success && result.user) {
            userState.setUser(result.user);
        }
        return result;
    },

    async uploadProfilePhoto(formData) {
        const response = await fetch(`${API_URL}/users/me/photo`, {
            method: 'PATCH',
            body: formData,
            credentials: 'include'
        });
        const result = await response.json();
        if (result.success && result.photoUrl) {
            if (userState.user) {
                userState.setUser({ ...userState.user, profilePhotoUrl: result.photoUrl });
            }
        }
        return result;
    },

    async getCurrentUser() {
        const response = await fetch(`${API_URL}/auth/me`, {
            credentials: 'include'
        });
        return response.json();
    },

    async forgotPassword(email) {
        const response = await fetch(`${API_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
            credentials: 'include'
        });
        return response.json();
    },

    async resetPassword(data) {
        const response = await fetch(`${API_URL}/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            credentials: 'include'
        });
        return response.json();
    },

    // Movie endpoints
    async getMovies() {
        const response = await fetch(`${API_URL}/movies`);
        return response.json();
    },

    async getMovie(id) {
        const response = await fetch(`${API_URL}/movies/${id}`);
        return response.json();
    },

    async addMovieReview(id, data) {
        const response = await fetch(`${API_URL}/movies/${id}/reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            credentials: 'include'
        });
        return response.json();
    },

    async searchMovies(query) {
        const response = await fetch(`${API_URL}/movies/search?query=${query}`);
        return response.json();
    },

    async createMovie(data) {
        const response = await fetch(`${API_URL}/movies`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            credentials: 'include'
        });
        return response.json();
    },

    async updateMovie(id, data) {
        const response = await fetch(`${API_URL}/movies/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            credentials: 'include'
        });
        return response.json();
    },

    async deleteMovie(id) {
        const response = await fetch(`${API_URL}/movies/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        return response.json();
    },

    // Booking endpoints
    async createBooking(data) {
        const response = await fetch(`${API_URL}/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            credentials: 'include'
        });
        return response.json();
    },

    async getMyBookings() {
        const response = await fetch(`${API_URL}/bookings/my-bookings`, {
            credentials: 'include'
        });
        return response.json();
    },

    async getBooking(id) {
        const response = await fetch(`${API_URL}/bookings/${id}`, {
            credentials: 'include'
        });
        return response.json();
    },

    async cancelBooking(id) {
        const response = await fetch(`${API_URL}/bookings/${id}/cancel`, {
            method: 'PUT',
            credentials: 'include'
        });
        return response.json();
    },

    async getAvailableSeats(movieId, date, time, studio) {
        const response = await fetch(
            `${API_URL}/bookings/available-seats?movieId=${movieId}&date=${date}&time=${time}&studio=${studio}`
        );
        return response.json();
    },

    // Admin endpoints
    async getDashboardStats() {
        const response = await fetch(`${API_URL}/admin/stats`, {
            credentials: 'include'
        });
        return response.json();
    },

    async getAllUsers() {
        const response = await fetch(`${API_URL}/admin/users`, {
            credentials: 'include'
        });
        return response.json();
    },

    async getAllTransactions() {
        const response = await fetch(`${API_URL}/admin/transactions`, {
            credentials: 'include'
        });
        return response.json();
    },

    async getAllBookings() {
        const response = await fetch(`${API_URL}/admin/bookings`, {
            credentials: 'include'
        });
        return response.json();
    },

    async updateUserRole(userId, role) {
        const response = await fetch(`${API_URL}/admin/users/role`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, role }),
            credentials: 'include'
        });
        return response.json();
    },

    async deleteUser(userId) {
        const response = await fetch(`${API_URL}/admin/users/${userId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        return response.json();
    },

    async updateBookingStatus(bookingId, status, paymentStatus) {
        const response = await fetch(`${API_URL}/admin/bookings/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookingId, status, paymentStatus }),
            credentials: 'include'
        });
        return response.json();
    }
};

// User state management
const userState = {
    user: null,
    isAuthenticated: false,

    setUser(user) {
        if (user) {
            this.user = user;
            this.isAuthenticated = true;
        } else {
            this.user = null;
            this.isAuthenticated = false;
        }
    },

    async checkAuth() {
        try {
            const result = await api.getCurrentUser();
            if (result.success) {
                this.setUser(result.user);
                return true;
            }
            this.setUser(null);
            return false;
        } catch (error) {
            this.setUser(null);
            return false;
        }
    },

    logout() {
        this.setUser(null);
    },

    isAdmin() {
        return this.user && (this.user.role === 'admin' || this.user.role === 'superadmin');
    },

    isSuperAdmin() {
        return this.user && this.user.role === 'superadmin';
    }
};

// Add userState to api object for consistency
api.userState = userState;

// Utility functions
function showLoading(message = 'Loading...') {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.querySelector('.loading-text').textContent = message;
        loading.classList.add('active');
    }
}

function hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.classList.remove('active');
    }
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.textContent = message;
        toast.className = `toast ${type} show`;
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    } else {
        alert(message);
    }
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatDateTime(date) {
    return new Date(date).toLocaleString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Initialize user state on page load (only for pages that don't have their own initialization)
// Individual pages should handle their own initialization

async function updateNavigation(activePage = '') {
    const navMenu = document.getElementById('navMenu');
    if (!navMenu) {
        return;
    }

    await userState.checkAuth();
    const user = userState.user;
    const currentPath = window.location.pathname.split('/').pop();

    const isPathMatch = (href) => {
        if (!currentPath && href === 'index.html') {
            return true;
        }
        return currentPath === href;
    };

    const navLinks = [
        { key: 'home', label: 'Home', href: 'index.html' },
        { key: 'movies', label: 'Film', href: 'movies.html' },
        { key: 'schedule', label: 'Jadwal', href: 'schedule.html' },
        { key: 'about', label: 'Tentang', href: 'about.html' }
    ];

    const navItems = navLinks.map(link => {
        const isActive = activePage
            ? link.key === activePage
            : isPathMatch(link.href);
        return `<li><a href="${link.href}"${isActive ? ' class="active"' : ''}>${link.label}</a></li>`;
    });

    if (user && userState.isAuthenticated) {
        const bookingsActive = activePage === 'bookings' || (!activePage && isPathMatch('my-bookings.html'));
        navItems.push(`<li><a href="my-bookings.html"${bookingsActive ? ' class="active"' : ''}>My Bookings</a></li>`);

        const profileActive = activePage === 'profile' || (!activePage && isPathMatch('my-profile.html'));
        navItems.push(`<li><a href="my-profile.html"${profileActive ? ' class="active"' : ''}>Profil Saya</a></li>`);

        if (userState.isAdmin()) {
            const adminActive = activePage === 'admin' || (!activePage && isPathMatch('admin-dashboard.html'));
            navItems.push('<li><span class="admin-badge">Admin</span></li>');
            navItems.push(`<li><a href="admin-dashboard.html"${adminActive ? ' class="active"' : ''}>Dashboard</a></li>`);
        }

        const displayName = user.displayName || user.firstName;
        navItems.push(`<li><button class="nav-button" onclick="handleLogout(event)">Logout (${displayName})</button></li>`);
    } else {
        const loginActive = activePage === 'login' || (!activePage && isPathMatch('login.html'));
        const registerActive = activePage === 'register' || (!activePage && isPathMatch('register.html'));
        navItems.push(`<li><a href="login.html"${loginActive ? ' class="active"' : ''}>Login</a></li>`);
        navItems.push(`<li><a href="register.html"${registerActive ? ' class="active"' : ''}>Daftar</a></li>`);
    }

    navMenu.innerHTML = navItems.join('');
}

async function handleLogout(event) {
    event.preventDefault();
    try {
        await api.logout();
        userState.logout();
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Logout error:', error);
    }
}
