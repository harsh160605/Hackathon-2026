import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

// Add auth token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const signup = (data) => API.post('/auth/signup', data);
export const login = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');
export const updateProfile = (data) => API.put('/auth/profile', data);
export const deleteAccount = () => API.delete('/auth/account');

// Tasks
export const getTasks = (params) => API.get('/tasks', { params });
export const getTask = (id) => API.get(`/tasks/${id}`);
export const createTask = (data) => API.post('/tasks', data);
export const updateTask = (id, data) => API.put(`/tasks/${id}`, data);
export const matchTask = (id) => API.post(`/tasks/${id}/match`);
export const assignTask = (id, volunteerId) => API.post(`/tasks/${id}/assign`, { volunteerId });
export const completeTask = (id, data) => API.put(`/tasks/${id}/complete`, data);
export const addTaskMessage = (id, text) => API.post(`/tasks/${id}/messages`, { text });

// Volunteers
export const getVolunteers = (params) => API.get('/volunteers', { params });
export const getVolunteer = (id) => API.get(`/volunteers/${id}`);

// NGOs
export const getNGOs = () => API.get('/ngos');
export const createNGO = (data) => API.post('/ngos', data);
export const getNGO = (id) => API.get(`/ngos/${id}`);
export const joinNGO = (id) => API.post(`/ngos/${id}/join`);

// Dashboard
export const getDashboardStats = () => API.get('/dashboard/stats');
export const getNGODashboard = (ngoId) => API.get(`/dashboard/ngo/${ngoId}`);

// Notifications
export const getNotifications = () => API.get('/notifications');
export const markNotificationRead = (id) => API.put(`/notifications/${id}/read`);
export const markAllRead = () => API.put('/notifications/read-all');

// AI Services (Connecting directly to FastAPI backend)
export const predictPriority = (data) => axios.post('http://localhost:8000/priority', data);
export const extractSkills = (data) => axios.post('http://localhost:8000/extract-skills', data);

// Scan Report (Document AI)
export const scanDocument = (formData) => API.post('/scan-report', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const getDrafts = () => API.get('/scan-report/drafts');
export const publishDraft = (id, data) => API.put(`/scan-report/drafts/${id}/publish`, data);
export const discardDraft = (id) => API.delete(`/scan-report/drafts/${id}`);

export default API;
