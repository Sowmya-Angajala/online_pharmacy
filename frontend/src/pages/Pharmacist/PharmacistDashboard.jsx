// pages/Pharmacist/PharmacistDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  getPharmacistRequests, 
  updatePrescriptionRequest 
} from '../../store/slices/prescriptionSlice';
import './PharmacistDashboard.css';

const PharmacistDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { requests, isLoading, error, success } = useSelector((state) => state.prescription);
  const { user } = useSelector((state) => state.auth);
  
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [responseData, setResponseData] = useState({
    pharmacistNotes: '',
    suggestedMedicines: [{ 
      name: '', 
      dosage: '', 
      frequency: '', 
      duration: '', 
      instructions: '',
      importantNotes: '' 
    }]
  });
  const [filters, setFilters] = useState({
    status: 'all',
    search: ''
  });

  // Check if user is pharmacist
  if (user?.role !== 'pharmacist') {
    navigate('/');
    return null;
  }

  useEffect(() => {
    dispatch(getPharmacistRequests());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      // Refresh requests after successful update
      dispatch(getPharmacistRequests());
    }
  }, [success, dispatch]);

  const handleAddMedicine = () => {
    setResponseData({
      ...responseData,
      suggestedMedicines: [
        ...responseData.suggestedMedicines,
        { name: '', dosage: '', frequency: '', duration: '', instructions: '', importantNotes: '' }
      ]
    });
  };

  const handleRemoveMedicine = (index) => {
    if (responseData.suggestedMedicines.length > 1) {
      const newMedicines = responseData.suggestedMedicines.filter((_, i) => i !== index);
      setResponseData({ ...responseData, suggestedMedicines: newMedicines });
    }
  };

  const handleMedicineChange = (index, field, value) => {
    const newMedicines = [...responseData.suggestedMedicines];
    newMedicines[index][field] = value;
    setResponseData({ ...responseData, suggestedMedicines: newMedicines });
  };

  const handleSubmitResponse = async () => {
    if (!responseData.pharmacistNotes.trim()) {
      alert('Please provide pharmacist notes');
      return;
    }

    // Validate medicines
    for (let medicine of responseData.suggestedMedicines) {
      if (!medicine.name.trim() || !medicine.dosage.trim() || 
          !medicine.frequency.trim() || !medicine.duration.trim()) {
        alert('Please fill all required medicine fields');
        return;
      }
    }

    try {
      await dispatch(updatePrescriptionRequest({
        requestId: selectedRequest._id,
        data: responseData
      })).unwrap();
      
      // Reset form
      setSelectedRequest(null);
      setResponseData({
        pharmacistNotes: '',
        suggestedMedicines: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '', importantNotes: '' }]
      });
      
    } catch (error) {
      console.error('Error submitting response:', error);
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesStatus = filters.status === 'all' || request.status === filters.status;
    const matchesSearch = request.patient?.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
                         request.symptoms.toLowerCase().includes(filters.search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    in_review: requests.filter(r => r.status === 'in_review').length,
    completed: requests.filter(r => r.status === 'completed').length
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: 'status-pending', label: '⏳ Pending' },
      in_review: { class: 'status-review', label: '🔍 In Review' },
      completed: { class: 'status-completed', label: '✅ Completed' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return <span className={`status-badge ${config.class}`}>{config.label}</span>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading && requests.length === 0) {
    return (
      <div className="pharmacist-dashboard loading">
        <div className="container">
          <div className="loading-spinner"></div>
          <p>Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pharmacist-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h2>Prescription Requests Dashboard</h2>
          <p>Review patient requests and provide medication recommendations</p>
        </div>

        {error && (
          <div className="error-alert">
            Error: {error.message}
          </div>
        )}

        {success && (
          <div className="success-alert">
            ✅ Response submitted successfully!
          </div>
        )}

        {/* Statistics */}
        <div className="stats-grid">
          <div className="stat-card total">
            <h3>Total Requests</h3>
            <span className="stat-number">{stats.total}</span>
          </div>
          <div className="stat-card pending">
            <h3>Pending</h3>
            <span className="stat-number">{stats.pending}</span>
          </div>
          <div className="stat-card review">
            <h3>In Review</h3>
            <span className="stat-number">{stats.in_review}</span>
          </div>
          <div className="stat-card completed">
            <h3>Completed</h3>
            <span className="stat-number">{stats.completed}</span>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="filter-group">
            <label>Status Filter:</label>
            <select 
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="all">All Requests</option>
              <option value="pending">Pending</option>
              <option value="in_review">In Review</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Search:</label>
            <input
              type="text"
              placeholder="Search by patient name or symptoms..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
            />
          </div>
        </div>

        <div className="dashboard-content">
          {/* Requests List */}
          <div className="requests-panel">
            <h3>Requests ({filteredRequests.length})</h3>
            <div className="requests-list">
              {filteredRequests.map(request => (
                <div 
                  key={request._id}
                  className={`request-item ${selectedRequest?._id === request._id ? 'active' : ''} ${
                    request.status === 'pending' ? 'urgent' : ''
                  }`}
                  onClick={() => {
                    setSelectedRequest(request);
                    if (request.status === 'completed') {
                      setResponseData({
                        pharmacistNotes: request.pharmacistNotes || '',
                        suggestedMedicines: request.suggestedMedicines.length > 0 
                          ? request.suggestedMedicines 
                          : [{ name: '', dosage: '', frequency: '', duration: '', instructions: '', importantNotes: '' }]
                      });
                    } else {
                      setResponseData({
                        pharmacistNotes: '',
                        suggestedMedicines: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '', importantNotes: '' }]
                      });
                    }
                  }}
                >
                  <div className="request-item-header">
                    <strong>{request.patient?.name || 'Unknown Patient'}</strong>
                    {getStatusBadge(request.status)}
                  </div>
                  <p className="symptoms-preview">{request.symptoms.substring(0, 100)}...</p>
                  <div className="request-meta">
                    <span>Submitted: {formatDate(request.createdAt)}</span>
                    {request.status === 'pending' && (
                      <span className="urgent-badge">⚠️ Needs Attention</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {filteredRequests.length === 0 && (
              <div className="empty-requests">
                <p>No requests found matching your filters</p>
              </div>
            )}
          </div>

          {/* Response Panel */}
          <div className="response-panel">
            {selectedRequest ? (
              <div className="response-form">
                <div className="response-header">
                  <h3>Response to {selectedRequest.patient?.name}'s Request</h3>
                  {selectedRequest.status === 'completed' && (
                    <span className="completed-label">Already Responded</span>
                  )}
                </div>

                {/* Patient Information */}
                <div className="patient-info">
                  <h4>Patient Information</h4>
                  <div className="info-grid">
                    <div>
                      <label>Name:</label>
                      <span>{selectedRequest.patient?.name || 'N/A'}</span>
                    </div>
                    <div>
                      <label>Email:</label>
                      <span>{selectedRequest.patient?.email || 'N/A'}</span>
                    </div>
                    <div>
                      <label>Phone:</label>
                      <span>{selectedRequest.patient?.phone || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Request Details */}
                <div className="request-details">
                  <h4>📋 Symptoms</h4>
                  <p>{selectedRequest.symptoms}</p>

                  <h4>📝 Description</h4>
                  <p>{selectedRequest.description}</p>

                  {selectedRequest.images.length > 0 && (
                    <>
                      <h4>🖼️ Attached Images</h4>
                      <div className="images-grid">
                        {selectedRequest.images.map((image, index) => (
                          <div key={index} className="image-item">
                            <img 
                              src={`http://localhost:5000${image}`} 
                              alt={`Prescription ${index + 1}`}
                              onClick={() => window.open(`http://localhost:5000${image}`, '_blank')}
                            />
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Response Form */}
                {selectedRequest.status !== 'completed' && (
                  <>
                    <div className="form-group">
                      <label>Pharmacist Notes *</label>
                      <textarea
                        value={responseData.pharmacistNotes}
                        onChange={(e) => setResponseData({...responseData, pharmacistNotes: e.target.value})}
                        placeholder="Provide your professional assessment, advice, and any important notes for the patient..."
                        rows="6"
                        required
                      />
                    </div>

                    <div className="medicines-section">
                      <label>Suggested Medicines *</label>
                      {responseData.suggestedMedicines.map((medicine, index) => (
                        <div key={index} className="medicine-form">
                          <div className="medicine-form-header">
                            <h5>Medicine #{index + 1}</h5>
                            {responseData.suggestedMedicines.length > 1 && (
                              <button 
                                type="button"
                                onClick={() => handleRemoveMedicine(index)}
                                className="remove-medicine-btn"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                          
                          <div className="medicine-fields">
                            <input
                              type="text"
                              placeholder="Medicine Name *"
                              value={medicine.name}
                              onChange={(e) => handleMedicineChange(index, 'name', e.target.value)}
                              required
                            />
                            <input
                              type="text"
                              placeholder="Dosage (e.g., 500mg) *"
                              value={medicine.dosage}
                              onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                              required
                            />
                            <input
                              type="text"
                              placeholder="Frequency (e.g., Twice daily) *"
                              value={medicine.frequency}
                              onChange={(e) => handleMedicineChange(index, 'frequency', e.target.value)}
                              required
                            />
                            <input
                              type="text"
                              placeholder="Duration (e.g., 5 days) *"
                              value={medicine.duration}
                              onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                              required
                            />
                            <input
                              type="text"
                              placeholder="Special Instructions"
                              value={medicine.instructions}
                              onChange={(e) => handleMedicineChange(index, 'instructions', e.target.value)}
                            />
                            <input
                              type="text"
                              placeholder="Important Notes/Warnings"
                              value={medicine.importantNotes}
                              onChange={(e) => handleMedicineChange(index, 'importantNotes', e.target.value)}
                            />
                          </div>
                        </div>
                      ))}
                      
                      <button 
                        type="button" 
                        onClick={handleAddMedicine}
                        className="add-medicine-btn"
                      >
                        + Add Another Medicine
                      </button>
                    </div>

                    <div className="form-actions">
                      <button 
                        onClick={handleSubmitResponse}
                        disabled={isLoading}
                        className="submit-response-btn"
                      >
                        {isLoading ? 'Submitting...' : 'Submit Response'}
                      </button>
                    </div>
                  </>
                )}

                {selectedRequest.status === 'completed' && (
                  <div className="existing-response">
                    <h4>Your Previous Response</h4>
                    <p><strong>Notes:</strong> {selectedRequest.pharmacistNotes}</p>
                    
                    {selectedRequest.suggestedMedicines.length > 0 && (
                      <div>
                        <strong>Medicines Suggested:</strong>
                        {selectedRequest.suggestedMedicines.map((medicine, index) => (
                          <div key={index} className="medicine-review">
                            <p><strong>{medicine.name}</strong> - {medicine.dosage}</p>
                            <p>Frequency: {medicine.frequency} | Duration: {medicine.duration}</p>
                            {medicine.instructions && <p>Instructions: {medicine.instructions}</p>}
                            {medicine.importantNotes && (
                              <p className="important">Important: {medicine.importantNotes}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="no-selection">
                <div className="no-selection-icon">👨‍⚕️</div>
                <h3>Select a Request</h3>
                <p>Choose a patient request from the list to view details and provide a response</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacistDashboard;