import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      console.log('API Request:', config.method?.toUpperCase(), config.url);
      let token = null;
      try {
        token = await AsyncStorage.getItem('token');
      } catch (storageError) {
        console.warn('AsyncStorage getItem failed:', storageError);
      }
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Failed to get token from storage:', error);
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    console.error('API Error:', error.response?.status, error.response?.data);
    if (error.response?.status === 401) {
      try {
        await AsyncStorage.removeItem('token');
      } catch (e) {
        console.warn('Failed to remove token:', e);
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  signup: (data) => api.post('/api/auth/signup', data),
  login: (data) => api.post('/api/auth/login', data),
};

export const userAPI = {
  getProfile: () => api.get('/api/users/profile'),
  updateProfile: (data) => api.put('/api/users/profile', data),
};

export const expenseAPI = {
  create: (data) => api.post('/api/expenses/', data),
  getExpenses: (year, month) => api.get(`/api/expenses/?year=${year}&month=${month}`),
  getMonthlyStats: (year, month) => api.get(`/api/expenses/monthly-stats?year=${year}&month=${month}`),
  getDashboardStats: () => api.get('/api/expenses/dashboard-stats'),
  update: (id, data) => api.put(`/api/expenses/${id}`, data),
  delete: (id) => api.delete(`/api/expenses/${id}`),
};

export const reportAPI = {
  generatePDF: (params) => api.get('/api/reports/pdf', { params, responseType: 'blob' }),
  generateExcel: (params) => api.get('/api/reports/excel', { params, responseType: 'blob' }),
};

export const aiAPI = {
  chat: (data) => api.post('/api/ai/chat', data),
};

export default api;