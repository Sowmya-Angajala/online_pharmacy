// pages/Patient/UploadPrescription.jsx
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createPrescriptionRequest } from "../../store/slices/prescriptionSlice";
import "./UploadPrescription.css";

const UploadPrescription = () => {
  const [formData, setFormData] = useState({
    symptoms: "",
    description: "",
    images: [],
  });

  const [imagePreviews, setImagePreviews] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, success } =
    useSelector((state) => state.prescription) || {};
  const { user } = useSelector((state) => state.auth);

  // Check if user is patient
  if (user?.role !== "patient") {
    navigate("/");
    return null;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    // Create previews
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);

    setFormData({
      ...formData,
      images: files,
    });
  };

  const removeImage = (index) => {
    const newImages = [...formData.images];
    const newPreviews = [...imagePreviews];

    newImages.splice(index, 1);
    newPreviews.splice(index, 1);

    setFormData({ ...formData, images: newImages });
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.symptoms.trim() || !formData.description.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    const submitData = new FormData();
    submitData.append("symptoms", formData.symptoms);
    submitData.append("description", formData.description);

    formData.images.forEach((image) => {
      submitData.append("images", image);
    });

    try {
      const result = await dispatch(
        createPrescriptionRequest(submitData)
      ).unwrap();

      if (result.success) {
        // Reset form
        setFormData({
          symptoms: "",
          description: "",
          images: [],
        });
        setImagePreviews([]);

        // Redirect to my requests page after 2 seconds
        setTimeout(() => {
          navigate("/my-requests");
        }, 2000);
      }
    } catch (error) {
      console.error("Submission error:", error);
    }
  };

  return (
    <div className="upload-prescription">
      <div className="container">
        <div className="prescription-header">
          <h2>Upload Prescription Request</h2>
          <p>
            Describe your symptoms and upload prescription images for pharmacist
            review
          </p>
        </div>

        {error && (
          <div className="error-alert">
            {error.message || "Error submitting request. Please try again."}
          </div>
        )}

        {success && (
          <div className="success-alert">
            ✅ Request submitted successfully! Redirecting to your requests...
          </div>
        )}

        <form onSubmit={handleSubmit} className="prescription-form">
          <div className="form-group">
            <label htmlFor="symptoms">Symptoms *</label>
            <textarea
              id="symptoms"
              name="symptoms"
              value={formData.symptoms}
              onChange={handleChange}
              required
              placeholder="Describe your symptoms in detail (e.g., fever, headache, cough, etc.)"
              rows="4"
              maxLength="1000"
            />
            <small>{formData.symptoms.length}/1000 characters</small>
          </div>

          <div className="form-group">
            <label htmlFor="description">Detailed Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Provide detailed information about your condition, duration, severity, and any other relevant details..."
              rows="6"
              maxLength="2000"
            />
            <small>{formData.description.length}/2000 characters</small>
          </div>

          <div className="form-group">
            <label htmlFor="images">
              Upload Images (Optional, Max 5 files)
            </label>
            <div className="file-upload-area">
              <input
                type="file"
                id="images"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="file-input"
                disabled={formData.images.length >= 5}
              />
              <label htmlFor="images" className="file-upload-label">
                <span className="upload-icon">📁</span>
                <span>Choose files or drag and drop here</span>
                <small>Supported formats: JPG, PNG, PDF (Max 5MB each)</small>
              </label>
            </div>

            {imagePreviews.length > 0 && (
              <div className="image-previews">
                <h4>Selected Images ({imagePreviews.length}/5):</h4>
                <div className="preview-grid">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="preview-item">
                      <img src={preview} alt={`Preview ${index + 1}`} />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="remove-image-btn"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate("/my-requests")}
              className="cancel-btn"
            >
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="submit-btn">
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Submitting...
                </>
              ) : (
                "Submit Request"
              )}
            </button>
          </div>
        </form>

        <div className="help-section">
          <h4>💡 Tips for better assistance:</h4>
          <ul>
            <li>Describe symptoms clearly and include duration</li>
            <li>Mention any existing medical conditions</li>
            <li>List current medications you're taking</li>
            <li>Include any known allergies</li>
            <li>Upload clear images of prescriptions or lab reports</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UploadPrescription;
