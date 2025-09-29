// pages/Patient/MyRequests.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getPatientRequests } from '../../store/slices/prescriptionSlice';
import './MyRequests.css';

const MyRequests = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { requests, isLoading, error } = useSelector((state) => state.prescription) || {};
  const { user } = useSelector((state) => state.auth);
  const [expandedRequest, setExpandedRequest] = useState(null);

  // Check if user is patient
  if (user?.role !== 'patient') {
    navigate('/');
    return null;
  }


  console.log(user,"userrr");
  

  useEffect(() => {
    dispatch(getPatientRequests());
  }, [dispatch]);

  const toggleExpand = (requestId) => {
    setExpandedRequest(expandedRequest === requestId ? null : requestId);
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
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="my-requests loading">
        <div className="container">
          <div className="loading-spinner"></div>
          <p>Loading your requests...</p>
        </div>
      </div>
    );
  }

  console.log(requests,"lallaa");
  
  return (
    <div className="my-requests">
      <div className="container">
        <div className="requests-header">
          <h2>My Prescription Requests</h2>
          <button 
            onClick={() => navigate('/upload-prescription')}
            className="new-request-btn"
          >
            + New Request
          </button>
        </div>

        {error && (
          <div className="error-alert">
            Error loading requests: {error.message}
          </div>
        )}

        { !requests && !requests?.length  ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No prescription requests yet</h3>
            <p>Submit your first prescription request to get started</p>
            <button 
              onClick={() => navigate('/upload-prescription')}
              className="cta-button"
            >
              Create Your First Request
            </button>
          </div>
        ) : (
          <div className="requests-list">
            {requests?.map((request) => (
              <div key={request._id} className="request-card">
                <div 
                  className="request-header"
                  onClick={() => toggleExpand(request._id)}
                >
                  <div className="request-info">
                    <h3>Request #{request._id.slice(-6).toUpperCase()}</h3>
                    {getStatusBadge(request.status)}
                  </div>
                  <div className="request-meta">
                    <span>Submitted: {formatDate(request.createdAt)}</span>
                    <button className="expand-btn">
                      {expandedRequest === request._id ? '▲' : '▼'}
                    </button>
                  </div>
                </div>

                {expandedRequest === request._id && (
                  <div className="request-details">
                    <div className="detail-section">
                      <h4>📋 Symptoms</h4>
                      <p>{request.symptoms}</p>
                    </div>

                    <div className="detail-section">
                      <h4>📝 Description</h4>
                      <p>{request.description}</p>
                    </div>

                    {request.images.length > 0 && (
                      <div className="detail-section">
                        <h4>🖼️ Attached Images</h4>
                        <div className="images-grid">
                          {request.images.map((image, index) => (
                            <div key={index} className="image-item">
                              <img 
                                src={`http://localhost:5000${image}`} 
                                alt={`Prescription ${index + 1}`}
                                onClick={() => window.open(`http://localhost:5000${image}`, '_blank')}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {request.status === 'completed' && request.pharmacistNotes && (
                      <div className="pharmacist-response">
                        <h4>💊 Pharmacist's Response</h4>
                        
                        <div className="response-section">
                          <h5>Professional Notes:</h5>
                          <p>{request.pharmacistNotes}</p>
                        </div>

                        {request.suggestedMedicines && request.suggestedMedicines.length > 0 && (
                          <div className="response-section">
                            <h5>💊 Recommended Medicines:</h5>
                            <div className="medicines-list">
                              {request.suggestedMedicines.map((medicine, index) => (
                                <div key={index} className="medicine-item">
                                  <div className="medicine-header">
                                    <strong>{medicine.name}</strong>
                                    <span className="dosage">{medicine.dosage}</span>
                                  </div>
                                  <div className="medicine-details">
                                    <span>Frequency: {medicine.frequency}</span>
                                    <span>Duration: {medicine.duration}</span>
                                    {medicine.instructions && (
                                      <span>Instructions: {medicine.instructions}</span>
                                    )}
                                    {medicine.importantNotes && (
                                      <span className="important-notes">
                                        ⚠️ {medicine.importantNotes}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {request.respondedBy && (
                          <div className="response-meta">
                            <p>
                              <strong>Responded by:</strong> {request.respondedBy.name}
                              {request.respondedAt && (
                                <span> on {formatDate(request.respondedAt)}</span>
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {request.status === 'pending' && (
                      <div className="pending-notice">
                        <p>⏳ Your request is waiting for pharmacist review. You'll be notified once it's processed.</p>
                      </div>
                    )}

                    {request.status === 'in_review' && (
                      <div className="review-notice">
                        <p>🔍 Your request is currently being reviewed by our pharmacist.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRequests;