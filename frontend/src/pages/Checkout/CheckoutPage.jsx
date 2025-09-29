// pages/Checkout/CheckoutPage.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createOrder } from '../../store/slices/orderSlice';
import { getCart, clearCart } from '../../store/slices/cartSlice';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cart, isLoading: cartLoading } = useSelector((state) => state.cart) || {};
  const { isLoading: orderLoading, error, success } = useSelector((state) => state.orders) || {};
  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    shippingAddress: {
      fullName: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      phone: ''
    },
    paymentMethod: 'cash_on_delivery'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user?.role === 'patient') {
      dispatch(getCart());
    }
  }, [dispatch, user]);

  useEffect(() => {
    // Pre-fill form with user data if available
    if (user) {
      setFormData(prev => ({
        ...prev,
        shippingAddress: {
          ...prev.shippingAddress,
          fullName: user.name || '',
          phone: user.phone || ''
        }
      }));
    }
  }, [user]);

  useEffect(() => {
    if (success) {
      toast.success('🎉 Order placed successfully!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      // Clear cart and redirect after a delay
      setTimeout(() => {
        dispatch(clearCart());
        navigate('/my-orders');
      }, 2000);
    }
  }, [success, navigate, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(`Order failed: ${error.message}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  }, [error]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('shippingAddress.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        shippingAddress: {
          ...prev.shippingAddress,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate shipping address
    if (!formData.shippingAddress.fullName.trim()) {
      newErrors['shippingAddress.fullName'] = 'Full name is required';
    }

    if (!formData.shippingAddress.address.trim()) {
      newErrors['shippingAddress.address'] = 'Address is required';
    }

    if (!formData.shippingAddress.city.trim()) {
      newErrors['shippingAddress.city'] = 'City is required';
    }

    if (!formData.shippingAddress.state.trim()) {
      newErrors['shippingAddress.state'] = 'State is required';
    }

    if (!formData.shippingAddress.zipCode.trim()) {
      newErrors['shippingAddress.zipCode'] = 'ZIP code is required';
    } else if (!/^\d{6}$/.test(formData.shippingAddress.zipCode)) {
      newErrors['shippingAddress.zipCode'] = 'ZIP code must be 6 digits';
    }

    if (!formData.shippingAddress.phone.trim()) {
      newErrors['shippingAddress.phone'] = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.shippingAddress.phone)) {
      newErrors['shippingAddress.phone'] = 'Phone number must be 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors before submitting', {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    if (!cart || cart.items.length === 0) {
      toast.error('Your cart is empty', {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      // Prepare order data with cart items
      const orderData = {
        ...formData,
        cartItems: cart.items.map(item => ({
          medicineId: item.medicine._id,
          quantity: item.quantity,
          price: item.price
        }))
      };

      await dispatch(createOrder(orderData)).unwrap();
    } catch (error) {
      console.error('Order creation failed:', error);
    }
  };

  const handleBackToCart = () => {
    navigate('/cart');
  };

  if (!user || user.role !== 'patient') {
    navigate('/login');
    return null;
  }

  if (cartLoading || !cart) {
    return (
      <div className="checkout-page loading">
        <div className="loading-spinner"></div>
        <p>Loading checkout...</p>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="empty-cart">
            <div className="empty-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Add some items to your cart before checkout</p>
            <button 
              onClick={() => navigate('/medicines')}
              className="shop-now-btn"
            >
              Shop Medicines
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate order summary
  const subtotal = cart.totalAmount || 0;
  const shippingFee = subtotal > 500 ? 0 : 40;
  const tax = subtotal * 0.05;
  const totalAmount = subtotal + shippingFee + tax;

  return (
    <div className="checkout-page">
      <div className="container">
        <div className="checkout-header">
          <h1>Checkout</h1>
          <button onClick={handleBackToCart} className="back-btn">
            ← Back to Cart
          </button>
        </div>

        <div className="checkout-content">
          {/* Shipping and Payment Form */}
          <div className="checkout-form-section">
            <form onSubmit={handleSubmit} className="checkout-form">
              {/* Shipping Address */}
              <div className="form-section">
                <h2>Shipping Address</h2>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="fullName">Full Name *</label>
                    <input
                      type="text"
                      id="fullName"
                      name="shippingAddress.fullName"
                      value={formData.shippingAddress.fullName}
                      onChange={handleInputChange}
                      className={errors['shippingAddress.fullName'] ? 'error' : ''}
                      placeholder="Enter your full name"
                    />
                    {errors['shippingAddress.fullName'] && (
                      <span className="error-text">{errors['shippingAddress.fullName']}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">Phone Number *</label>
                    <input
                      type="tel"
                      id="phone"
                      name="shippingAddress.phone"
                      value={formData.shippingAddress.phone}
                      onChange={handleInputChange}
                      className={errors['shippingAddress.phone'] ? 'error' : ''}
                      placeholder="Enter your 10-digit phone number"
                      maxLength="10"
                    />
                    {errors['shippingAddress.phone'] && (
                      <span className="error-text">{errors['shippingAddress.phone']}</span>
                    )}
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="address">Address *</label>
                    <textarea
                      id="address"
                      name="shippingAddress.address"
                      value={formData.shippingAddress.address}
                      onChange={handleInputChange}
                      className={errors['shippingAddress.address'] ? 'error' : ''}
                      placeholder="Enter your complete address"
                      rows="3"
                    />
                    {errors['shippingAddress.address'] && (
                      <span className="error-text">{errors['shippingAddress.address']}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="city">City *</label>
                    <input
                      type="text"
                      id="city"
                      name="shippingAddress.city"
                      value={formData.shippingAddress.city}
                      onChange={handleInputChange}
                      className={errors['shippingAddress.city'] ? 'error' : ''}
                      placeholder="Enter your city"
                    />
                    {errors['shippingAddress.city'] && (
                      <span className="error-text">{errors['shippingAddress.city']}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="state">State *</label>
                    <input
                      type="text"
                      id="state"
                      name="shippingAddress.state"
                      value={formData.shippingAddress.state}
                      onChange={handleInputChange}
                      className={errors['shippingAddress.state'] ? 'error' : ''}
                      placeholder="Enter your state"
                    />
                    {errors['shippingAddress.state'] && (
                      <span className="error-text">{errors['shippingAddress.state']}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="zipCode">ZIP Code *</label>
                    <input
                      type="text"
                      id="zipCode"
                      name="shippingAddress.zipCode"
                      value={formData.shippingAddress.zipCode}
                      onChange={handleInputChange}
                      className={errors['shippingAddress.zipCode'] ? 'error' : ''}
                      placeholder="Enter 6-digit ZIP code"
                      maxLength="6"
                    />
                    {errors['shippingAddress.zipCode'] && (
                      <span className="error-text">{errors['shippingAddress.zipCode']}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="form-section">
                <h2>Payment Method</h2>
                <div className="payment-options">
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash_on_delivery"
                      checked={formData.paymentMethod === 'cash_on_delivery'}
                      onChange={handleInputChange}
                    />
                    <div className="payment-content">
                      <span className="payment-title">Cash on Delivery</span>
                      <span className="payment-desc">Pay when you receive your order</span>
                    </div>
                  </label>

                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="upi"
                      checked={formData.paymentMethod === 'upi'}
                      onChange={handleInputChange}
                    />
                    <div className="payment-content">
                      <span className="payment-title">UPI Payment</span>
                      <span className="payment-desc">Pay using UPI apps</span>
                    </div>
                  </label>

                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={formData.paymentMethod === 'card'}
                      onChange={handleInputChange}
                    />
                    <div className="payment-content">
                      <span className="payment-title">Credit/Debit Card</span>
                      <span className="payment-desc">Pay using your card</span>
                    </div>
                  </label>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={orderLoading}
                className="place-order-btn"
              >
                {orderLoading ? (
                  <>
                    <div className="btn-spinner"></div>
                    Placing Order...
                  </>
                ) : (
                  `Place Order - ₹${totalAmount.toFixed(2)}`
                )}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="order-summary-section">
            <div className="summary-card">
              <h2>Order Summary</h2>
              
              {/* Order Items */}
              <div className="order-items-preview">
                <h3>Items ({cart.totalItems})</h3>
                <div className="items-list">
                  {cart.items.map((item) => (
                    <div key={item._id} className="order-item-preview">
                      <div className="item-image">
                        <img 
                          src={item.medicine.images?.[0] || '/default-medicine.jpg'} 
                          alt={item.medicine.name}
                        />
                      </div>
                      <div className="item-details">
                        <span className="item-name">{item.medicine.name}</span>
                        <span className="item-quantity">Qty: {item.quantity}</span>
                        <span className="item-price">₹{item.price.toFixed(2)} each</span>
                      </div>
                      <span className="item-total">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="price-breakdown">
                <div className="price-row">
                  <span>Subtotal ({cart.totalItems} items):</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="price-row">
                  <span>Shipping:</span>
                  <span>{shippingFee === 0 ? 'FREE' : `₹${shippingFee.toFixed(2)}`}</span>
                </div>
                <div className="price-row">
                  <span>Tax (5%):</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <div className="price-row total">
                  <span>Total Amount:</span>
                  <span>₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="delivery-info">
                <h4>🚚 Delivery Information</h4>
                <p>Estimated delivery: 3-5 business days</p>
                {shippingFee === 0 ? (
                  <p className="free-shipping">🎉 You qualify for FREE shipping!</p>
                ) : (
                  <p className="shipping-note">
                    Add ₹{(500 - subtotal).toFixed(2)} more for FREE shipping
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;