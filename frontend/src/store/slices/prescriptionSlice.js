// store/slices/prescriptionSlice.js (Updated)
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import prescriptionAPI, { APIUtils } from '../../services/prescriptionAPI';

// Async thunks
export const createPrescriptionRequest = createAsyncThunk(
  'prescription/create',
  async (formData, { rejectWithValue }) => {
    try {
      // Client-side validation
      const validationErrors = APIUtils.validatePrescriptionData({
        symptoms: formData.get('symptoms'),
        description: formData.get('description'),
        images: formData.getAll('images')
      });

      if (validationErrors.length > 0) {
        return rejectWithValue({
          message: validationErrors.join(', ')
        });
      }

      const response = await prescriptionAPI.createRequest(formData);
      return response.data;
    } catch (error) {
      const apiError = APIUtils.handleError(error);
      return rejectWithValue(apiError);
    }
  }
);

export const getPatientRequests = createAsyncThunk(
  'prescription/getPatientRequests',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      if (!APIUtils.checkRole('patient', auth.user?.role)) {
        return rejectWithValue({
          message: 'Access denied. Patient role required.'
        });
      }

      const response = await prescriptionAPI.getPatientRequests();      
      return response.data;
    } catch (error) {
      const apiError = APIUtils.handleError(error);
      return rejectWithValue(apiError);
    }
  }
);

export const getPharmacistRequests = createAsyncThunk(
  'prescription/getPharmacistRequests',
  async (queryParams, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      if (!APIUtils.checkRole('pharmacist', auth.user?.role)) {
        return rejectWithValue({
          message: 'Access denied. Pharmacist role required.'
        });
      }

      const response = await prescriptionAPI.getPharmacistRequests(queryParams);
      return response.data;
    } catch (error) {
      const apiError = APIUtils.handleError(error);
      return rejectWithValue(apiError);
    }
  }
);

export const updatePrescriptionRequest = createAsyncThunk(
  'prescription/update',
  async ({ requestId, data }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      if (!APIUtils.checkRole('pharmacist', auth.user?.role)) {
        return rejectWithValue({
          message: 'Access denied. Pharmacist role required.'
        });
      }

      // Client-side validation
      const validationErrors = APIUtils.validateResponseData(data);
      if (validationErrors.length > 0) {
        return rejectWithValue({
          message: validationErrors.join(', ')
        });
      }

      // Format medicine data
      const formattedData = {
        ...data,
        suggestedMedicines: APIUtils.formatMedicineData(data.suggestedMedicines)
      };

      const response = await prescriptionAPI.updateRequest(requestId, formattedData);
      return response.data;
    } catch (error) {
      const apiError = APIUtils.handleError(error);
      return rejectWithValue(apiError);
    }
  }
);

export const getRequestById = createAsyncThunk(
  'prescription/getById',
  async (requestId, { rejectWithValue }) => {
    try {
      const response = await prescriptionAPI.getRequestById(requestId);
      return response.data;
    } catch (error) {
      const apiError = APIUtils.handleError(error);
      return rejectWithValue(apiError);
    }
  }
);

export const deletePrescriptionRequest = createAsyncThunk(
  'prescription/delete',
  async (requestId, { rejectWithValue }) => {
    try {
      const response = await prescriptionAPI.deleteRequest(requestId);
      return response.data;
    } catch (error) {
      const apiError = APIUtils.handleError(error);
      return rejectWithValue(apiError);
    }
  }
);

const prescriptionSlice = createSlice({
  name: 'prescription',
  initialState: {
    requests: [],
    currentRequest: null,
    isLoading: false,
    error: null,
    success: false,
    stats: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    clearCurrentRequest: (state) => {
      state.currentRequest = null;
    },
    setCurrentRequest: (state, action) => {
      state.currentRequest = action.payload;
    },
    resetPrescriptionState: (state) => {
      state.requests = [];
      state.currentRequest = null;
      state.isLoading = false;
      state.error = null;
      state.success = false;
      state.stats = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Request
      .addCase(createPrescriptionRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createPrescriptionRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.requests.unshift(action.payload.data);
        state.success = true;
        state.error = null;
      })
      .addCase(createPrescriptionRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Get Patient Requests
      .addCase(getPatientRequests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPatientRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.requests = action.payload.data;
        state.error = null;
      })
      .addCase(getPatientRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get Pharmacist Requests
      .addCase(getPharmacistRequests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPharmacistRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.requests = action.payload.data;
        state.error = null;
      })
      .addCase(getPharmacistRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update Request
      .addCase(updatePrescriptionRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updatePrescriptionRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update the request in the list
        const index = state.requests.findIndex(
          req => req._id === action.payload.data._id
        );
        if (index !== -1) {
          state.requests[index] = action.payload.data;
        }
        state.currentRequest = action.payload.data;
        state.success = true;
        state.error = null;
      })
      .addCase(updatePrescriptionRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Get Request by ID
      .addCase(getRequestById.fulfilled, (state, action) => {
        state.currentRequest = action.payload.data;
      })
      // Delete Request
      .addCase(deletePrescriptionRequest.fulfilled, (state, action) => {
        state.requests = state.requests.filter(
          req => req._id !== action.payload.data._id
        );
        if (state.currentRequest && state.currentRequest._id === action.payload.data._id) {
          state.currentRequest = null;
        }
      });
  }
});

export const { 
  clearError, 
  clearSuccess, 
  clearCurrentRequest, 
  setCurrentRequest,
  resetPrescriptionState 
} = prescriptionSlice.actions;

export default prescriptionSlice.reducer;