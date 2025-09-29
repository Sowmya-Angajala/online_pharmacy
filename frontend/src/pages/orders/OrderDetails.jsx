import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderById } from '../../store/slices/orderSlice';
import './OrderDetails.css';

const OrderDetails = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { currentOrder, isLoading, error } = useSelector((state) => state.orders) || {};
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (orderId) {
      dispatch(getOrderById(orderId));
    }
  }, [dispatch, orderId]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: 'status-pending', label: '⏳ Pending' },
      confirmed: { class: 'status-confirmed', label: '✅ Confirmed' },
      packed: { class: 'status-packed', label: '📦 Packed' },
      shipped: { class: 'status-shipped', label: '🚚 Shipped' },
      delivered: { class: 'status-delivered', label: '🎉 Delivered' },
      cancelled: { class: 'status-cancelled', label: '❌ Cancelled' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return <span className={`status-badge ${config.class}`}>{config.label}</span>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getProgressSteps = (status) => {
    const steps = [
      { key: 'pending', label: 'Order Placed' },
      { key: 'confirmed', label: 'Confirmed' },
      { key: 'packed', label: 'Packed' },
      { key: 'shipped', label: 'Shipped' },
      { key: 'delivered', label: 'Delivered' }
    ];
    
    const currentIndex = steps.findIndex(step => step.key === status);
    return steps.map((step, index) => ({
      ...step,
      active: index <= currentIndex,
      completed: index < currentIndex
    }));
  };

  if (isLoading) {
    return (
      <div className="order-details loading">
        <div className="loading-spinner"></div>
        <p>Loading order details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-details">
        <div className="container">
          <div className="error-alert">
            Error loading order: {error.message}
          </div>
          <button onClick={() => navigate('/my-orders')} className="back-btn">
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  if (!currentOrder) {
    return null;
  }

  const progressSteps = getProgressSteps(currentOrder.orderStatus);

  return (
    <div className="order-details">
      <div className="container">
        <div className="details-header">
          <button onClick={() => navigate('/my-orders')} className="back-btn">
            ← Back to Orders
          </button>
          <h1>Order Details</h1>
        </div>

        <div className="order-summary">
          <div className="summary-card">
            <div className="order-id-status">
              <h2>Order #{currentOrder.orderId}</h2>
              {getStatusBadge(currentOrder.orderStatus)}
            </div>
            <p className="order-date">Placed on {formatDate(currentOrder.createdAt)}</p>
            
            {currentOrder.deliveryDate && (
              <p className="delivery-date">
                Delivered on {formatDate(currentOrder.deliveryDate)}
              </p>
            )}
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="progress-tracker">
          <h3>Order Progress</h3>
          <div className="progress-steps">
            {progressSteps.map((step, index) => (
              <div key={step.key} className={`progress-step ${step.active ? 'active' : ''} ${step.completed ? 'completed' : ''}`}>
                <div className="step-icon">
                  {step.completed ? '✓' : index + 1}
                </div>
                <span className="step-label">{step.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="details-grid">
          {/* Order Items */}
          <div className="details-section">
            <h3>Order Items</h3>
            <div className="items-list">
              {currentOrder.items.map((item, index) => (
                <div key={index} className="order-item-detail">
                  <div className="item-info">
                    <h4>{item.name}</h4>
                    <p>Quantity: {item.quantity}</p>
                    <p>Price: ₹{item.price.toFixed(2)} each</p>
                  </div>
                  <div className="item-total">
                    ₹{item.total.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="details-section">
            <h3>Order Summary</h3>
            <div className="summary-details">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>₹{currentOrder.subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping:</span>
                <span>{currentOrder.shippingFee === 0 ? 'FREE' : `₹${currentOrder.shippingFee.toFixed(2)}`}</span>
              </div>
              <div className="summary-row">
                <span>Tax (5%):</span>
                <span>₹{currentOrder.tax.toFixed(2)}</span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>₹{currentOrder.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          <div className="details-section">
            <h3>Shipping Information</h3>
            <div className="shipping-details">
              <p><strong>{currentOrder.shippingAddress.fullName}</strong></p>
              <p>{currentOrder.shippingAddress.address}</p>
              <p>
                {currentOrder.shippingAddress.city}, {currentOrder.shippingAddress.state} - {currentOrder.shippingAddress.zipCode}
              </p>
              <p>Phone: {currentOrder.shippingAddress.phone}</p>
            </div>
          </div>

          {/* Payment Information */}
          <div className="details-section">
            <h3>Payment Information</h3>
            <div className="payment-details">
              <p><strong>Method:</strong> {currentOrder.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' : 
                 currentOrder.paymentMethod === 'upi' ? 'UPI' : 'Credit/Debit Card'}</p>
              <p><strong>Status:</strong> 
                <span className={`payment-status ${currentOrder.paymentStatus}`}>
                  {currentOrder.paymentStatus}
                </span>
              </p>
            </div>
          </div>

          {/* Tracking Information */}
          {currentOrder.trackingNumber && (
            <div className="details-section">
              <h3>Tracking Information</h3>
              <div className="tracking-details">
                <p><strong>Tracking Number:</strong> {currentOrder.trackingNumber}</p>
                {currentOrder.orderStatus === 'shipped' && (
                  <button className="track-package-btn">
                    Track Package
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;