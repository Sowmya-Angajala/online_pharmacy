import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getUserOrders, cancelOrder } from '../../store/slices/orderSlice';
import './UserOrders.css';

const UserOrders = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orders, isLoading, error } = useSelector((state) => state.orders) || {};
  const { user } = useSelector((state) => state.auth);
  
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (user?.role === 'patient') {
      dispatch(getUserOrders());
    }
  }, [dispatch, user]);

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        await dispatch(cancelOrder(orderId)).unwrap();
      } catch (error) {
        console.error('Error cancelling order:', error);
      }
    }
  };

  const handleViewOrder = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: 'status-pending', label: '⏳ Pending', color: '#f59e0b' },
      confirmed: { class: 'status-confirmed', label: '✅ Confirmed', color: '#10b981' },
      packed: { class: 'status-packed', label: '📦 Packed', color: '#3b82f6' },
      shipped: { class: 'status-shipped', label: '🚚 Shipped', color: '#8b5cf6' },
      delivered: { class: 'status-delivered', label: '🎉 Delivered', color: '#059669' },
      cancelled: { class: 'status-cancelled', label: '❌ Cancelled', color: '#ef4444' }
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

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.orderStatus === filter);

  if (!user || user.role !== 'patient') {
    navigate('/login');
    return null;
  }

  if (isLoading) {
    return (
      <div className="user-orders loading">
        <div className="loading-spinner"></div>
        <p>Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="user-orders">
      <div className="container">
        <div className="orders-header">
          <h1>My Orders</h1>
          <div className="order-filters">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All Orders
            </button>
            <button 
              className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
              onClick={() => setFilter('pending')}
            >
              Pending
            </button>
            <button 
              className={`filter-btn ${filter === 'delivered' ? 'active' : ''}`}
              onClick={() => setFilter('delivered')}
            >
              Delivered
            </button>
          </div>
        </div>

        {error && (
          <div className="error-alert">
            Error loading orders: {error.message}
          </div>
        )}

        {filteredOrders.length === 0 ? (
          <div className="empty-orders">
            <div className="empty-icon">📦</div>
            <h2>No orders found</h2>
            <p>
              {filter === 'all' 
                ? "You haven't placed any orders yet" 
                : `No ${filter} orders found`
              }
            </p>
            {filter === 'all' && (
              <button 
                onClick={() => navigate('/medicines')}
                className="shop-now-btn"
              >
                Start Shopping
              </button>
            )}
          </div>
        ) : (
          <div className="orders-list">
            {filteredOrders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <h3>Order #{order.orderId}</h3>
                    <p className="order-date">Placed on {formatDate(order.createdAt)}</p>
                  </div>
                  <div className="order-status">
                    {getStatusBadge(order.orderStatus)}
                    <p className="order-amount">₹{order.totalAmount.toFixed(2)}</p>
                  </div>
                </div>

                <div className="order-items">
                  <h4>Items ({order.items.length})</h4>
                  <div className="items-list">
                    {order.items.slice(0, 3).map((item, index) => (
                      <div key={index} className="order-item">
                        <span className="item-name">{item.name}</span>
                        <span className="item-quantity">Qty: {item.quantity}</span>
                        <span className="item-price">₹{item.total.toFixed(2)}</span>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="more-items">
                        +{order.items.length - 3} more items
                      </div>
                    )}
                  </div>
                </div>

                <div className="order-footer">
                  <div className="shipping-info">
                    <strong>Shipping to:</strong> {order.shippingAddress.fullName}, {order.shippingAddress.city}
                  </div>
                  
                  <div className="order-actions">
                    <button 
                      onClick={() => handleViewOrder(order._id)}
                      className="view-order-btn"
                    >
                      View Details
                    </button>
                    
                    {order.orderStatus === 'pending' && (
                      <button 
                        onClick={() => handleCancelOrder(order._id)}
                        className="cancel-order-btn"
                      >
                        Cancel Order
                      </button>
                    )}
                    
                    {order.orderStatus === 'shipped' && order.trackingNumber && (
                      <button className="track-order-btn">
                        Track Order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserOrders;