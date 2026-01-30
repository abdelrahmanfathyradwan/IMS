import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    getMe: () => api.get('/auth/me'),
    logout: () => api.post('/auth/logout'),
    getUsers: () => api.get('/auth/users'),
    updateUser: (id, data) => api.put(`/auth/users/${id}`, data),
    deleteUser: (id) => api.delete(`/auth/users/${id}`)
};

// Customers API
export const customersAPI = {
    getAll: (params) => api.get('/customers', { params }),
    getOne: (id) => api.get(`/customers/${id}`),
    create: (data) => api.post('/customers', data),
    update: (id, data) => api.put(`/customers/${id}`, data),
    delete: (id) => api.delete(`/customers/${id}`)
};

// Contracts API
export const contractsAPI = {
    getAll: (params) => api.get('/contracts', { params }),
    getOne: (id) => api.get(`/contracts/${id}`),
    create: (data) => api.post('/contracts', data),
    update: (id, data) => api.put(`/contracts/${id}`, data),
    delete: (id) => api.delete(`/contracts/${id}`),
    getSummary: (id) => api.get(`/contracts/${id}/summary`)
};

// Installments API
export const installmentsAPI = {
    getAll: (params) => api.get('/installments', { params }),
    getOne: (id) => api.get(`/installments/${id}`),
    update: (id, data) => api.put(`/installments/${id}`, data),
    pay: (id, data) => api.post(`/installments/${id}/pay`, data),
    getOverdue: () => api.get('/installments/overdue'),
    getUpcoming: () => api.get('/installments/upcoming')
};

// Notifications API
export const notificationsAPI = {
    getAll: (params) => api.get('/notifications', { params }),
    send: (data) => api.post('/notifications/send', data),
    sendWhatsApp: (data) => api.post('/notifications/whatsapp', data),
    markAsRead: (id) => api.put(`/notifications/${id}/read`),
    delete: (id) => api.delete(`/notifications/${id}`)
};

// Reports API
export const reportsAPI = {
    getSummary: () => api.get('/reports/summary'),
    getInstallments: (params) => api.get('/reports/installments', { params }),
    getCustomers: () => api.get('/reports/customers'),
    getOverdue: () => api.get('/reports/overdue'),
    getMonthly: (params) => api.get('/reports/monthly', { params })
};

// Export API
export const exportAPI = {
    installmentsPDF: (params) => api.get('/export/pdf/installments', { params, responseType: 'blob' }),
    installmentsExcel: (params) => api.get('/export/excel/installments', { params, responseType: 'blob' }),
    customersPDF: () => api.get('/export/pdf/customers', { responseType: 'blob' }),
    customersExcel: () => api.get('/export/excel/customers', { responseType: 'blob' }),
    overduePDF: () => api.get('/export/pdf/overdue', { responseType: 'blob' }),
    overdueExcel: () => api.get('/export/excel/overdue', { responseType: 'blob' })
};

// Settings API
export const settingsAPI = {
    getAll: () => api.get('/settings'),
    update: (data) => api.put('/settings', data),
    reset: () => api.post('/settings/reset')
};

// Helper to download blob
export const downloadBlob = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
};

export default api;
