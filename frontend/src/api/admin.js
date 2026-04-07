import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// Attach token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const adminApi = {
  // Dashboard
  getDashboard: () => api.get('/admin/dashboard'),

  // Companies
  getCompanies: (params) => api.get('/admin/companies', { params }),
  toggleCompanyStatus: (id) => api.patch(`/admin/companies/${id}/toggle`),
  verifyCompany: (id) => api.patch(`/admin/companies/${id}/verify`),

  // Users
  getUsers: (params) => api.get('/admin/users', { params }),
  toggleUserStatus: (id) => api.patch(`/admin/users/${id}/toggle`),

  // Payments
  getPayments: (params) => api.get('/admin/payments', { params }),

  // Subscription Plans
  getPlans: () => api.get('/admin/plans'),
  createPlan: (data) => api.post('/admin/plans', data),
  updatePlan: (id, data) => api.put(`/admin/plans/${id}`, data),
  deletePlan: (id) => api.delete(`/admin/plans/${id}`),

  // Revenue
  getRevenue: (params) => api.get('/admin/revenue', { params }),

  // Settings
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data),

  // Auth
  login: (credentials) => api.post('/admin/login', credentials),
  logout: () => api.post('/admin/logout'),
};

export default api;