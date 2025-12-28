import axios from 'axios';

// API Base URL configuration
// For local development: use http://localhost:8083/api
// For ngrok: set REACT_APP_API_URL in frontend/.env file
// Example: REACT_APP_API_URL=https://xxxx-xx-xx-xx-xx.ngrok-free.app/api
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8083/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Public APIs
export const getDonationStats = async () => {
  const response = await api.get('/donations/stats');
  return response.data;
};

export const getPublicDonations = async () => {
  const response = await api.get('/donations/public');
  return response.data;
};

export const getPublicDonationsPaginated = async (page = 0, size = 20) => {
  const response = await api.get(`/donations/public/paginated?page=${page}&size=${size}`);
  return response.data;
};

export const createDonation = async (donationData) => {
  const response = await api.post('/donations', donationData);
  return response.data;
};

export const getPublicUpdates = async () => {
  const response = await api.get('/updates/public');
  return response.data;
};

// Auth APIs
export const login = async (userId, password) => {
  const response = await api.post('/auth/login', { userId, password });
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

export const checkAuth = async () => {
  const response = await api.get('/auth/check');
  return response.data;
};

export const adminSignup = async (userId, password) => {
  const response = await api.post('/auth/admin/signup', { userId, password });
  return response.data;
};

// Admin APIs
export const getAdminDonations = async () => {
  const response = await api.get('/admin/donations');
  return response.data;
};

export const updateDonation = async (id, data) => {
  const response = await api.patch(`/admin/donations/${id}`, data);
  return response.data;
};

export const getAdminStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

export const getAdminUpdates = async () => {
  const response = await api.get('/admin/updates');
  return response.data;
};

export const createUpdate = async (data) => {
  const response = await api.post('/admin/updates', data);
  return response.data;
};

export const updateUpdate = async (id, data) => {
  const response = await api.put(`/admin/updates/${id}`, data);
  return response.data;
};

export const deleteUpdate = async (id) => {
  const response = await api.delete(`/admin/updates/${id}`);
  return response.data;
};

// Location APIs
export const getCountries = async () => {
  const response = await api.get('/locations/countries');
  return response.data;
};

export const getStates = async (countryId) => {
  const response = await api.get(`/locations/states?countryId=${countryId}`);
  return response.data;
};

export const getDistricts = async (stateId) => {
  const response = await api.get(`/locations/districts?stateId=${stateId}`);
  return response.data;
};

export const getThanas = async (districtId) => {
  const response = await api.get(`/locations/thanas?districtId=${districtId}`);
  return response.data;
};

export const getVillages = async (thanaId) => {
  const response = await api.get(`/locations/villages?thanaId=${thanaId}`);
  return response.data;
};

export default api;

