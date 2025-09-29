import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../store/slices/cartSlice';
import './MedicineCard.css';

const MedicineCard = ({ medicine }) => {
  const dispatch = useDispatch();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAddedMessage, setShowAddedMessage] = useState(false);

  const handleAddToCart = () => {
    dispatch(addToCart(medicine));
    setShowAddedMessage(true);
    setTimeout(() => setShowAddedMessage(false), 2000);
  };

  const getStockStatus = () => {
    if (medicine.stock === 0) return { text: 'Out of Stock', class: 'out-of-stock' };
    if (medicine.stock < 10) return { text: 'Low Stock', class: 'low-stock' };
    return { text: 'In Stock', class: 'in-stock' };
  };

  const stockStatus = getStockStatus();

  return (
    <div 
      className={`medicine-card ${isExpanded ? 'expanded' : ''}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="card-image">
        <div className="image-placeholder">💊</div>
        {medicine.prescriptionRequired && (
          <span className="prescription-badge">📋 Prescription Required</span>
        )}
      </div>

      <div className="card-content">
        <h3 className="medicine-name">{medicine.name}</h3>
        <p className="medicine-brand">{medicine.brand}</p>
        <p className="medicine-category">{medicine.category}</p>
        
        <div className="medicine-description">
          {medicine.description && (
            <p>{medicine.description.substring(0, 100)}...</p>
          )}
        </div>

        {isExpanded && (
          <div className="expanded-content">
            <div className="medicine-details">
              <p><strong>Composition:</strong> {medicine.composition || 'Not specified'}</p>
              <p><strong>Uses:</strong> {medicine.uses || 'General use'}</p>
              {medicine.sideEffects && (
                <p><strong>Side Effects:</strong> {medicine.sideEffects}</p>
              )}
            </div>
          </div>
        )}

        <div className="card-footer">
          <div className="price-section">
            <span className="current-price">₹{medicine.price}</span>
            {medicine.originalPrice && (
              <span className="original-price">₹{medicine.originalPrice}</span>
            )}
          </div>
          
          <div className="stock-status">
            <span className={`status ${stockStatus.class}`}>
              {stockStatus.text}
            </span>
          </div>
        </div>

        <div className="card-actions">
          <button
            onClick={handleAddToCart}
            disabled={medicine.stock === 0}
            className={`add-to-cart-btn ${medicine.stock === 0 ? 'disabled' : ''}`}
          >
            {showAddedMessage ? '✅ Added!' : '🛒 Add to Cart'}
          </button>
          
          <button 
            className="compare-btn"
            onClick={() => {/* Implement compare functionality */}}
          >
            ⚖ Compare
          </button>
        </div>
      </div>

      {/* Quick View Overlay */}
      {isExpanded && (
        <div className="quick-view-overlay">
          <button 
            className="quick-view-btn"
            onClick={() => {/* Implement quick view */}}
          >
            👁 Quick View
          </button>
        </div>
      )}
    </div>
  );
};

export default MedicineCard;