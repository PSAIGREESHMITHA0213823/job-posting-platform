// const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// const getToken = () => localStorage.getItem('token');

// const headers = () => ({
//   'Content-Type': 'application/json',
//   Authorization: `Bearer ${getToken()}`,
// });

// const request = async (method, path, body = null, isFormData = false) => {
//   const opts = {
//     method,
//     headers: isFormData
//       ? { Authorization: `Bearer ${getToken()}` }
//       : headers(),
//   };
//   if (body) opts.body = isFormData ? body : JSON.stringify(body);
//   const res = await fetch(`${BASE_URL}${path}`, opts);
//   const data = await res.json();
//   if (!res.ok) throw new Error(data.message || 'Request failed');
//   return data;
// };

// // Auth
// export const login = (email, password) =>
//   request('POST', '/auth/login', { email, password });

// export const register = (payload) =>
//   request('POST', '/auth/register/employee', payload);

// export const getMe = () => request('GET', '/auth/me');

// // Employee
// export const getProfile = () => request('GET', '/employee/profile');

// export const updateProfile = (formData) =>
//   request('PUT', '/employee/profile', formData, true);

// export const browseJobs = (params = {}) => {
//   const qs = new URLSearchParams(params).toString();
//   return request('GET', `/employee/jobs?${qs}`);
// };

// export const getJobDetail = (id) => request('GET', `/employee/jobs/${id}`);

// export const applyToJob = (formData) =>
//   request('POST', '/employee/apply', formData, true);

// export const getMyApplications = (params = {}) => {
//   const qs = new URLSearchParams(params).toString();
//   return request('GET', `/employee/applications?${qs}`);
// };

// export const saveJob = (jobId) =>
//   request('POST', `/employee/jobs/${jobId}/save`);

// export const getSavedJobs = () => request('GET', '/employee/saved-jobs');

// export const getNotifications = () => request('GET', '/employee/notifications');
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('token');

const headers = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
});

const request = async (method, path, body = null, isFormData = false) => {
  const opts = {
    method,
    headers: isFormData
      ? { Authorization: `Bearer ${getToken()}` }
      : headers(),
  };
  if (body) opts.body = isFormData ? body : JSON.stringify(body);
  const res = await fetch(`${BASE_URL}${path}`, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
};

// Auth
export const login = (email, password) =>
  request('POST', '/auth/login', { email, password });

export const register = (payload) =>
  request('POST', `/auth/register/${payload.role}`, payload);

export const getMe = () => request('GET', '/auth/me');

// Employee
export const getProfile = () => request('GET', '/employee/profile');

export const updateProfile = (formData) =>
  request('PUT', '/employee/profile', formData, true);

export const browseJobs = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request('GET', `/employee/jobs?${qs}`);
};

export const getJobDetail = (id) => request('GET', `/employee/jobs/${id}`);

export const applyToJob = (formData) =>
  request('POST', '/employee/apply', formData, true);

export const getMyApplications = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request('GET', `/employee/applications?${qs}`);
};

export const saveJob = (jobId) =>
  request('POST', `/employee/jobs/${jobId}/save`);

export const getSavedJobs = () => request('GET', '/employee/saved-jobs');

export const getNotifications = () => request('GET', '/employee/notifications');