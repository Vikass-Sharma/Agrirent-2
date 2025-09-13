import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth services
export const authService = {
  login: async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },
  
  register: async (userData) => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  }
};

// Equipment services
export const equipmentService = {
  getAll: async (filters = {}) => {
    const response = await api.get('/api/equipment', { params: filters });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/api/equipment/${id}`);
    return response.data;
  },
  
  create: async (equipmentData) => {
    const response = await api.post('/api/equipment', equipmentData);
    return response.data;
  },
  
  update: async (id, equipmentData) => {
    const response = await api.put(`/api/equipment/${id}`, equipmentData);
    return response.data;
  },
  
  delete: async (id, ownerId) => {
    const response = await api.delete(`/api/equipment/${id}`, { data: { owner: ownerId } });
    return response.data;
  },
  
  getCategories: async () => {
    const response = await api.get('/api/equipment/categories');
    return response.data;
  },
  
  getLocations: async () => {
    const response = await api.get('/api/equipment/locations');
    return response.data;
  },
  
  getUnavailableDates: async (equipmentId) => {
    const response = await api.get(`/api/equipment/${equipmentId}/unavailable-dates`);
    return response.data;
  }
};

// Enhanced Booking services for individual date selection system
export const bookingService = {
  // Get all bookings with enhanced filtering
  getAll: async (filters = {}) => {
    const response = await api.get('/api/bookings2', { params: filters });
    return response.data;
  },
  
  // Create booking with support for individual date selection and payment hold
  create: async (bookingData) => {
    const response = await api.post('/api/bookings2', bookingData);
    return response.data;
  }, 
  
  // NEW: Create payment hold (reserves equipment for 10 minutes)
  createPaymentHold: async (bookingData) => {
    const response = await api.post('/api/bookings2/payment-hold', bookingData);
    return response.data;
  },
  
  // NEW: Confirm payment and complete booking
  confirmPayment: async (bookingId, paymentData) => {
    const response = await api.put(`/api/bookings2/${bookingId}/confirm-payment`, paymentData);
    return response.data;
  },
  
  // NEW: Handle payment failure
  failPayment: async (bookingId) => {
    const response = await api.put(`/api/bookings2/${bookingId}/fail-payment`);
    return response.data;
  },
  
  // NEW: Cancel payment hold
  cancelPayment: async (bookingId) => {
    const response = await api.put(`/api/bookings2/${bookingId}/cancel-payment`);
    return response.data;
  },
  
  // Update booking status (legacy support)
  updateStatus: async (id, status, ownerId = null) => {
    const response = await api.put(`/api/bookings2/${id}`, { status, ownerId });
    return response.data;
  },
  
  // Owner-specific booking management (enhanced)
  accept: async (id, ownerId) => {
    const response = await api.put(`/api/bookings2/${id}/accept`, { ownerId });
    return response.data;
  },
  
  reject: async (id, ownerId) => {
    const response = await api.put(`/api/bookings2/${id}/reject`, { ownerId });
    return response.data;
  },
  
  complete: async (id, ownerId) => {
    const response = await api.put(`/api/bookings2/${id}/complete`, { ownerId });
    return response.data;
  },
  
  // Get booking by ID
  getById: async (id) => {
    const response = await api.get(`/api/bookings2/${id}`);
    return response.data;
  },

  // NEW: Cancel specific dates within a booking
  cancelSpecificDates: async (id, datesToCancel, userId) => {
    const response = await api.put(`/api/bookings2/${id}/cancel-dates`, { 
      datesToCancel, 
      userId 
    });
    return response.data;
  },

  // NEW: Check availability for individual dates or date ranges
  checkAvailability: async (equipmentId, options = {}) => {
    const { selectedDates, startDate, endDate } = options;
    let url = `/api/bookings2/equipment/${equipmentId}/availability`;
    
    const params = new URLSearchParams();
    if (selectedDates && Array.isArray(selectedDates)) {
      params.append('selectedDates', selectedDates.join(','));
    } else if (startDate && endDate) {
      params.append('startDate', startDate);
      params.append('endDate', endDate);
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await api.get(url);
    return response.data;
  },

  // NEW: Get monthly calendar for equipment
  getCalendar: async (equipmentId, month = null, year = null) => {
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    if (year) params.append('year', year);
    
    const url = `/api/bookings2/equipment/${equipmentId}/calendar${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await api.get(url);
    return response.data;
  },

  // NEW: Get bookings for specific equipment
  getByEquipment: async (equipmentId, filters = {}) => {
    const response = await api.get(`/api/bookings2/equipment/${equipmentId}`, { params: filters });
    return response.data;
  },

  // NEW: Get user's bookings
  getByUser: async (userId) => {
    const response = await api.get(`/api/bookings2/user/${userId}`);
    return response.data;
  },

  // NEW: Get owner's bookings
  getByOwner: async (ownerId) => {
    const response = await api.get(`/api/bookings2/owner/${ownerId}`);
    return response.data;
  },

  // NEW: Get bookings by status
  getByStatus: async (status) => {
    const response = await api.get(`/api/bookings2/status/${status}`);
    return response.data;
  }
};

// User services
export const userService = {
  getAll: async () => {
    const response = await api.get('/api/users');
    return response.data;
  },
  
  update: async (id, userData) => {
    const response = await api.put(`/api/users/${id}`, userData);
    return response.data;
  }
};

export default api;
