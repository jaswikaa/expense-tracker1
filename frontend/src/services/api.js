import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
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

export const authService = {
  login: (username, password) => 
    api.post('/auth/login', { username, password }).then(res => res.data),
  
  register: (userData) => 
    api.post('/auth/register', userData).then(res => res.data),
  
  getCurrentUser: () => 
    api.get('/auth/me').then(res => res.data.user)
};

export const transactionService = {
  getAll: (params = {}) => 
    api.get('/transactions', { params }).then(res => res.data),
  
  getRecent: () => 
    api.get('/transactions/recent').then(res => res.data),
  
  create: (transaction) => 
    api.post('/transactions', transaction).then(res => res.data),
  
  update: (id, transaction) => 
    api.put(`/transactions/${id}`, transaction).then(res => res.data),
  
  delete: (id) => 
    api.delete(`/transactions/${id}`).then(res => res.data),
  
  getSummary: (params = {}) => 
    api.get('/transactions/summary', { params }).then(res => res.data),
  
  getCategoryBreakdown: () => 
    api.get('/transactions/category-breakdown').then(res => res.data)
};

export const userService = {
  updateProfile: (profileData) => 
    api.put('/users/profile', profileData).then(res => res.data),
  
  updatePassword: (passwordData) => 
    api.put('/users/password', passwordData).then(res => res.data)
};

export default api;