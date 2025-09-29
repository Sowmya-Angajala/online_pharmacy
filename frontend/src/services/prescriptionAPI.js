import axios from 'axios';

const API_URL = 'http://localhost:5000/api/prescription'; // Adjust if your backend runs on different port

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 seconds timeout
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
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.data);
      
      // Handle specific HTTP status codes
      if (error.response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else if (error.response.status === 403) {
        // Access denied
        console.error('Access denied: You do not have permission for this action');
      } else if (error.response.status === 500) {
        // Server error
        console.error('Server error: Please try again later');
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('Network error: Please check your connection');
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

const prescriptionAPI = {
  /**
   * Create a new prescription request (Patient)
   * @param {FormData} formData - Form data with symptoms, description, and images
   */
  createRequest: (formData) => {
    return api.post('/requests', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000, // 30 seconds for file uploads
    });
  },

  /**
   * Get all prescription requests for the logged-in patient
   */
  getPatientRequests: () => {
    return api.get('/patient/requests');
  },

  /**
   * Get all prescription requests for pharmacist review
   * @param {Object} queryParams - Optional query parameters (status, page, limit)
   */
  getPharmacistRequests: (queryParams = {}) => {
    const params = new URLSearchParams();
    
    if (queryParams.status) params.append('status', queryParams.status);
    if (queryParams.page) params.append('page', queryParams.page);
    if (queryParams.limit) params.append('limit', queryParams.limit);
    if (queryParams.search) params.append('search', queryParams.search);
    
    const queryString = params.toString();
    const url = queryString ? `/pharmacist/requests?${queryString}` : '/pharmacist/requests';
    
    return api.get(url);
  },

  /**
   * Get a single prescription request by ID
   * @param {string} requestId - The ID of the prescription request
   */
  getRequestById: (requestId) => {
    return api.get(`/requests/${requestId}`);
  },

  /**
   * Update a prescription request with pharmacist response
   * @param {string} requestId - The ID of the prescription request
   * @param {Object} data - Response data including pharmacistNotes and suggestedMedicines
   */
  updateRequest: (requestId, data) => {
    return api.put(`/requests/${requestId}`, data);
  },

  /**
   * Update the status of a prescription request
   * @param {string} requestId - The ID of the prescription request
   * @param {string} status - New status (pending, in_review, completed)
   */
  updateRequestStatus: (requestId, status) => {
    return api.patch(`/requests/${requestId}/status`, { status });
  },

  /**
   * Delete a prescription request (Admin/Patient)
   * @param {string} requestId - The ID of the prescription request to delete
   */
  deleteRequest: (requestId) => {
    return api.delete(`/requests/${requestId}`);
  },

  /**
   * Upload images for a prescription request
   * @param {FormData} formData - Form data containing images
   */
  uploadImages: (formData) => {
    return api.post('/upload/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Get statistics for pharmacist dashboard
   */
  getDashboardStats: () => {
    return api.get('/pharmacist/stats');
  }
};

// Utility functions for API
export const APIUtils = {
  /**
   * Handle API errors consistently
   */
  handleError: (error) => {
    if (error.response) {
      return {
        message: error.response.data.message || 'An error occurred',
        status: error.response.status,
        data: error.response.data
      };
    } else if (error.request) {
      return {
        message: 'Network error: Unable to connect to server',
        status: 0
      };
    } else {
      return {
        message: error.message || 'An unexpected error occurred',
        status: -1
      };
    }
  },

  /**
   * Check if user has required role for API call
   */
  checkRole: (requiredRole, userRole) => {
    return userRole === requiredRole || userRole === 'admin';
  },

  /**
   * Format medicine data for API submission
   */
  formatMedicineData: (medicines) => {
    return medicines.map(medicine => ({
      name: medicine.name.trim(),
      dosage: medicine.dosage.trim(),
      frequency: medicine.frequency.trim(),
      duration: medicine.duration.trim(),
      instructions: medicine.instructions?.trim() || '',
      importantNotes: medicine.importantNotes?.trim() || ''
    }));
  },

  /**
   * Validate prescription request data before submission
   */
  validatePrescriptionData: (data) => {
    const errors = [];

    if (!data.symptoms || data.symptoms.trim().length < 10) {
      errors.push('Symptoms must be at least 10 characters long');
    }

    if (!data.description || data.description.trim().length < 20) {
      errors.push('Description must be at least 20 characters long');
    }

    if (data.images && data.images.length > 5) {
      errors.push('Maximum 5 images allowed');
    }

    return errors;
  },

  /**
   * Validate pharmacist response data
   */
  validateResponseData: (data) => {
    const errors = [];

    if (!data.pharmacistNotes || data.pharmacistNotes.trim().length < 10) {
      errors.push('Pharmacist notes must be at least 10 characters long');
    }

    if (!data.suggestedMedicines || data.suggestedMedicines.length === 0) {
      errors.push('At least one medicine suggestion is required');
    } else {
      data.suggestedMedicines.forEach((medicine, index) => {
        if (!medicine.name.trim()) {
          errors.push(`Medicine ${index + 1}: Name is required`);
        }
        if (!medicine.dosage.trim()) {
          errors.push(`Medicine ${index + 1}: Dosage is required`);
        }
        if (!medicine.frequency.trim()) {
          errors.push(`Medicine ${index + 1}: Frequency is required`);
        }
        if (!medicine.duration.trim()) {
          errors.push(`Medicine ${index + 1}: Duration is required`);
        }
      });
    }

    return errors;
  }
};

// Export both default and named exports
export default prescriptionAPI;