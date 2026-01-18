import axios from 'axios';

// API Base URL configuration
// For local development: use http://localhost:8081/api (monolithic backend)
// For API Gateway: use http://localhost:8082/api
// For ngrok: set REACT_APP_API_URL in frontend/.env file
// Example: REACT_APP_API_URL=https://xxxx-xx-xx-xx-xx.ngrok-free.app/api
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8081/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 30000, // 30 second timeout
});

// Set default Content-Type for JSON requests only
api.defaults.headers.common['Content-Type'] = 'application/json';

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url, response.data);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      response: error.response,
      request: error.request
    });
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout');
    } else if (error.code === 'ERR_NETWORK') {
      console.error('Network error - check if API Gateway is running on', API_BASE_URL);
    } else if (error.response) {
      // Server responded with error status
      console.error('Server error:', error.response.status, error.response.data);
    }
    return Promise.reject(error);
  }
);

// Public APIs
export const getDonationStats = async () => {
  const response = await api.get('/donations/stats');
  return response.data;
};

export const getPublicDonations = async () => {
  const response = await api.get('/donations/public');
  return response.data;
};

export const getPublicDonationsPaginated = async (page = 0, size = 20, searchParams = {}) => {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString()
  });
  
  if (searchParams.name) params.append('name', searchParams.name);
  if (searchParams.stateId !== null && searchParams.stateId !== undefined) {
    params.append('stateId', searchParams.stateId.toString());
  }
  if (searchParams.district) params.append('district', searchParams.district);
  if (searchParams.thana) params.append('thana', searchParams.thana);
  if (searchParams.village) params.append('village', searchParams.village);
  
  const response = await api.get(`/donations/public/paginated?${params.toString()}`);
  return response.data;
};

export const createDonation = async (donationData) => {
  const response = await api.post('/donations', donationData);
  return response.data;
};

// Donation Confirmation APIs
export const confirmDonation = async (confirmationData) => {
  const response = await api.post('/donation-confirmations', confirmationData);
  return response.data;
};

export const getDonationConfirmations = async (status = null) => {
  const params = status ? `?status=${status}` : '';
  const response = await api.get(`/admin/donation-confirmations${params}`);
  return response.data;
};

export const verifyDonationConfirmation = async (id, adminNote = '') => {
  const response = await api.post(`/admin/donation-confirmations/${id}/verify`, {
    adminNote: adminNote
  });
  return response.data;
};

export const rejectDonationConfirmation = async (id, adminNote = '') => {
  const response = await api.post(`/admin/donation-confirmations/${id}/reject`, {
    adminNote: adminNote
  });
  return response.data;
};

export const getPublicUpdates = async () => {
  const response = await api.get('/updates/public');
  return response.data;
};

export const getUpdates = async (limit = 0, sort = 'desc') => {
  const params = new URLSearchParams();
  if (limit > 0) params.append('limit', limit.toString());
  if (sort) params.append('sort', sort);
  const response = await api.get(`/updates?${params.toString()}`);
  return response.data;
};

export const getAllImages = async () => {
  const response = await api.get('/updates/images');
  return response.data;
};

export const getLatestTempleImage = async () => {
  const response = await api.get('/updates/public/latest-image');
  return response.data;
};

// Auth APIs
export const login = async (userId, password) => {
  try {
    const response = await api.post('/auth/login', { userId, password });
    console.log('Login API response:', response);
    console.log('Login API response data:', response.data);
    console.log('Login API response status:', response.status);
    // Return the data, ensuring it has the expected structure
    const data = response.data || {};
    return {
      ...data,
      authenticated: data.authenticated !== undefined ? data.authenticated : true
    };
  } catch (error) {
    console.error('Login API error:', error);
    console.error('Error response:', error.response);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    // If it's a network error but we got a response, try to extract the data
    if (error.response && error.response.status === 200) {
      console.log('Got 200 response but axios threw error, returning response data');
      return error.response.data || { authenticated: true };
    }
    throw error;
  }
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
export const getAdminDonations = async (searchParams = {}) => {
  const params = new URLSearchParams();
  
  if (searchParams.name) params.append('name', searchParams.name);
  if (searchParams.stateId !== null && searchParams.stateId !== undefined) {
    params.append('stateId', searchParams.stateId.toString());
  }
  if (searchParams.district) params.append('district', searchParams.district);
  if (searchParams.thana) params.append('thana', searchParams.thana);
  if (searchParams.village) params.append('village', searchParams.village);
  
  const queryString = params.toString();
  const url = queryString ? `/admin/donations?${queryString}` : '/admin/donations';
  const response = await api.get(url);
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

export const setFeaturedImage = async (id, featured) => {
  const response = await api.post(`/admin/updates/${id}/set-featured?featured=${featured}`);
  return response.data;
};

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  // Create a new axios instance without default Content-Type for file uploads
  const uploadApi = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
  });
  
  const response = await uploadApi.post('/admin/upload/image', formData);
  return response.data;
};

export const uploadDocument = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  // Create a new axios instance without default Content-Type for file uploads
  const uploadApi = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
  });
  
  const response = await uploadApi.post('/admin/upload/document', formData);
  return response.data;
};

export const uploadPaymentScreenshot = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  // Create a new axios instance without default Content-Type for file uploads
  // The browser will automatically set Content-Type with boundary for multipart/form-data
  const uploadApi = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
  });
  
  // Public endpoint for payment screenshots (no auth required)
  // Full path: /api/donation-confirmations/upload-screenshot
  const response = await uploadApi.post('/donation-confirmations/upload-screenshot', formData, {
    headers: {
      // Don't set Content-Type - let browser set it with boundary
    },
  });
  return response.data;
};

export const getExpenseStats = async () => {
  const response = await api.get('/admin/expenses/stats');
  return response.data;
};

export const getAdminExpenses = async (page = 0, size = 10, description = '') => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('size', size.toString());
  if (description) {
    params.append('description', description);
  }
  const response = await api.get(`/admin/expenses?${params.toString()}`);
  return response.data;
};

export const createExpense = async (data) => {
  const response = await api.post('/admin/expenses', data);
  return response.data;
};

export const updateExpense = async (id, data) => {
  const response = await api.put(`/admin/expenses/${id}`, data);
  return response.data;
};

export const deleteExpense = async (id) => {
  const response = await api.delete(`/admin/expenses/${id}`);
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

// Sankalpam APIs
export const createSankalpam = async (data) => {
  const response = await api.post('/sankalpam', data);
  return response.data;
};

// Event APIs
export const getEvents = async () => {
  const response = await api.get('/events');
  return response.data;
};

export const createEvent = async (data) => {
  const response = await api.post('/events', data);
  return response.data;
};

export const updateEvent = async (id, data) => {
  const response = await api.put(`/events/${id}`, data);
  return response.data;
};

export const deleteEvent = async (id) => {
  const response = await api.delete(`/events/${id}`);
  return response.data;
};

// Event Media APIs
export const getEventMedia = async (eventId) => {
  const response = await api.get(`/events/${eventId}/media`);
  return response.data;
};

export const uploadEventMedia = async (eventId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  // Create a new axios instance without default Content-Type for file uploads
  const uploadApi = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
  });
  
  const response = await uploadApi.post(`/admin/events/${eventId}/media`, formData);
  return response.data;
};

export const deleteEventMedia = async (eventId, mediaId) => {
  const response = await api.delete(`/admin/events/${eventId}/media/${mediaId}`);
  return response.data;
};

export const getDeletedEventMedia = async (eventId) => {
  const response = await api.get(`/admin/events/${eventId}/media/deleted`);
  return response.data;
};

export const restoreEventMedia = async (eventId, mediaId) => {
  const response = await api.post(`/admin/events/${eventId}/media/${mediaId}/restore`);
  return response.data;
};

export const permanentlyDeleteEventMedia = async (eventId, mediaId) => {
  const response = await api.delete(`/admin/events/${eventId}/media/${mediaId}/permanent`);
  return response.data;
};

// Seva Booking APIs
export const createSevaBooking = async (data) => {
  const response = await api.post('/seva-bookings', data);
  return response.data;
};

// Prasad Sponsorship APIs
export const createPrasadSponsorship = async (data) => {
  const response = await api.post('/prasad-sponsorships', data);
  return response.data;
};

// Special Puja API
export const createSpecialPuja = async (data) => {
  const response = await api.post('/services/special-puja', data);
  return response.data;
};

// Morning Aarti API
export const createMorningAartiVisit = async (data) => {
  const response = await api.post('/services/morning-aarti', data);
  return response.data;
};

// Abhishekam API
export const createAbhishekamBooking = async (data) => {
  const response = await api.post('/services/abhishekam', data);
  return response.data;
};

// Flower Offering API
export const createFlowerOffering = async (data) => {
  const response = await api.post('/services/flowers', data);
  return response.data;
};

// Team Member APIs
export const getTeamMembers = async () => {
  const response = await api.get('/events/team-members');
  return response.data;
};

export const getAdminTeamMembers = async () => {
  const response = await api.get('/admin/team-members');
  return response.data;
};

export const createTeamMember = async (name, position, mobileNumber, displayOrder, imageFile) => {
  const formData = new FormData();
  formData.append('name', name);
  formData.append('position', position);
  if (mobileNumber) {
    formData.append('mobileNumber', mobileNumber);
  }
  if (displayOrder !== null && displayOrder !== undefined) {
    formData.append('displayOrder', displayOrder.toString());
  }
  formData.append('image', imageFile);
  
  const uploadApi = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
  });
  
  const response = await uploadApi.post('/admin/team-members', formData);
  return response.data;
};

export const updateTeamMember = async (id, name, position, mobileNumber, displayOrder, imageFile) => {
  const formData = new FormData();
  formData.append('name', name);
  formData.append('position', position);
  if (mobileNumber) {
    formData.append('mobileNumber', mobileNumber);
  }
  if (displayOrder !== null && displayOrder !== undefined) {
    formData.append('displayOrder', displayOrder.toString());
  }
  if (imageFile) {
    formData.append('image', imageFile);
  }
  
  const uploadApi = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
  });
  
  const response = await uploadApi.put(`/admin/team-members/${id}`, formData);
  return response.data;
};

export const deleteTeamMember = async (id) => {
  const response = await api.delete(`/admin/team-members/${id}`);
  return response.data;
};

export default api;

