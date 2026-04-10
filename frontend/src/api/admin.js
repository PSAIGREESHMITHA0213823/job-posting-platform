
// // import axios from 'axios';

// // const api = axios.create({
// //   baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
// // });

// // api.interceptors.request.use((config) => {
// //   const token = localStorage.getItem('token');
// //   if (token) {
// //     config.headers.Authorization = `Bearer ${token}`;
// //   }
// //   return config;
// // });

// // api.interceptors.response.use(
// //   (response) => response,
// //   (error) => {
// //     if (error.response?.status === 401) {
// //       localStorage.removeItem('token');
// //       window.location.href = '/login';
// //     }
// //     return Promise.reject(error);
// //   }
// // );

// // export const adminApi = {
// //   // Dashboard
// //   getDashboard: () => api.get('/admin/dashboard'),

// //   // Companies
// //   getCompanies:        (params)    => api.get('/admin/companies', { params }),
// //   createCompany:       (data)      => api.post('/admin/companies', data),
// //   updateCompany:       (id, data)  => api.put(`/admin/companies/${id}`, data),
// //   deleteCompany:       (id)        => api.delete(`/admin/companies/${id}`),
// //   toggleCompanyStatus: (id)        => api.patch(`/admin/companies/${id}/toggle`),
// //   verifyCompany:       (id)        => api.patch(`/admin/companies/${id}/verify`),

// //   // Users
// //   getUsers:        (params)   => api.get('/admin/users', { params }),
// //   createUser:      (data)     => api.post('/admin/users', data),
// //   updateUser:      (id, data) => api.put(`/admin/users/${id}`, data),
// //   deleteUser:      (id)       => api.delete(`/admin/users/${id}`),
// //   toggleUserStatus:(id)       => api.patch(`/admin/users/${id}/toggle`),

// //   // Payments
// //   getPayments:   (params)   => api.get('/admin/payments', { params }),
// //   createPayment: (data)     => api.post('/admin/payments', data),
// //   updatePayment: (id, data) => api.put(`/admin/payments/${id}`, data),
// //   deletePayment: (id)       => api.delete(`/admin/payments/${id}`),

// //   // Subscription Plans
// //   getPlans:    ()          => api.get('/admin/plans'),
// //   createPlan:  (data)      => api.post('/admin/plans', data),
// //   updatePlan:  (id, data)  => api.put(`/admin/plans/${id}`, data),
// //   deletePlan:  (id)        => api.delete(`/admin/plans/${id}`),

// //   // Revenue
// //   getRevenue: (params) => api.get('/admin/revenue', { params }),

// //   // Settings
// //   getSettings:    ()     => api.get('/admin/settings'),
// //   updateSettings: (data) => api.put('/admin/settings', data),
// // };

// // export default api;
// export const adminApi = {
//   // Dashboard
//   getDashboard: () => api.get('/admin/dashboard'),

//   // Companies
//   getCompanies:        (params)    => api.get('/admin/companies', { params }),
//   createCompany:       (data)      => api.post('/admin/companies', data),
//   updateCompany:       (id, data)  => api.put(`/admin/companies/${id}`, data),
//   deleteCompany:       (id)        => api.delete(`/admin/companies/${id}`),
//   toggleCompanyStatus: (id)        => api.patch(`/admin/companies/${id}/toggle`),
//   verifyCompany:       (id)        => api.patch(`/admin/companies/${id}/verify`),

//   // Users
//   getUsers:        (params)   => api.get('/admin/users', { params }),
//   createUser:      (data)     => api.post('/admin/users', data),
//   updateUser:      (id, data) => api.put(`/admin/users/${id}`, data),
//   deleteUser:      (id)       => api.delete(`/admin/users/${id}`),
//   toggleUserStatus:(id)       => api.patch(`/admin/users/${id}/toggle`),

//   // Payments
//   getPayments:   (params)   => api.get('/admin/payments', { params }),
//   createPayment: (data)     => api.post('/admin/payments', data),
//   updatePayment: (id, data) => api.put(`/admin/payments/${id}`, data),
//   deletePayment: (id)       => api.delete(`/admin/payments/${id}`),

//   // Subscription Plans
//   getPlans:    ()          => api.get('/admin/plans'),
//   createPlan:  (data)      => api.post('/admin/plans', data),
//   updatePlan:  (id, data)  => api.put(`/admin/plans/${id}`, data),
//   deletePlan:  (id)        => api.delete(`/admin/plans/${id}`),

//   // Revenue
//   getRevenue: (params) => api.get('/admin/revenue', { params }),

//   // Settings
//   getSettings:    ()     => api.get('/admin/settings'),
//   updateSettings: (data) => api.put('/admin/settings', data),

//   // ✅ ADD HERE (Profile section)
//   getProfile: () => api.get('/admin/profile'),
//   updateProfile: (data) => api.put('/admin/profile', data),
//   changePassword: (data) => api.put('/admin/profile/password', data),
// };
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const adminApi = {
  // Dashboard
  getDashboard: () => api.get('/admin/dashboard'),

  // Companies
  getCompanies:        (params)    => api.get('/admin/companies', { params }),
  createCompany:       (data)      => api.post('/admin/companies', data),
  updateCompany:       (id, data)  => api.put(`/admin/companies/${id}`, data),
  deleteCompany:       (id)        => api.delete(`/admin/companies/${id}`),
  toggleCompanyStatus: (id)        => api.patch(`/admin/companies/${id}/toggle`),
  verifyCompany:       (id)        => api.patch(`/admin/companies/${id}/verify`),

  // Users
  getUsers:        (params)   => api.get('/admin/users', { params }),
  createUser:      (data)     => api.post('/admin/users', data),
  updateUser:      (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser:      (id)       => api.delete(`/admin/users/${id}`),
  toggleUserStatus:(id)       => api.patch(`/admin/users/${id}/toggle`),

  // Payments
  getPayments:   (params)   => api.get('/admin/payments', { params }),
  createPayment: (data)     => api.post('/admin/payments', data),
  updatePayment: (id, data) => api.put(`/admin/payments/${id}`, data),
  deletePayment: (id)       => api.delete(`/admin/payments/${id}`),

  // Subscription Plans
  getPlans:    ()          => api.get('/admin/plans'),
  createPlan:  (data)      => api.post('/admin/plans', data),
  updatePlan:  (id, data)  => api.put(`/admin/plans/${id}`, data),
  deletePlan:  (id)        => api.delete(`/admin/plans/${id}`),

  // Revenue
  getRevenue: (params) => api.get('/admin/revenue', { params }),

  // Settings
  getSettings:    ()     => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data),

  // Profile
  getProfile: () => api.get('/admin/profile'),
  updateProfile: (data) => api.put('/admin/profile', data),
  changePassword: (data) => api.put('/admin/profile/password', data),
};

export default api;