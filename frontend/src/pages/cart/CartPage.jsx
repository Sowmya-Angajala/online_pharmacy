// pages/Cart/CartPage.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart
} from '../../store/slices/cartSlice';
import './CartPage.css';

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cart, isLoading } = useSelector((state) => state.cart) || {};
  const { user } = useSelector((state) => state.auth);


  
  const [updatingItem, setUpdatingItem] = useState(null);

  useEffect(() => {
    if (user?.role === 'patient') {
      dispatch(getCart());
    }
  }, [dispatch, user]);

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setUpdatingItem(itemId);
    try {
      await dispatch(updateCartItem({ itemId, quantity: newQuantity })).unwrap();
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await dispatch(removeFromCart(itemId)).unwrap();
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      try {
        await dispatch(clearCart()).unwrap();
      } catch (error) {
        console.error('Error clearing cart:', error);
      }
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (!user || user.role !== 'patient') {
    navigate('/login');
    return null;
  }

  if (isLoading) {
    return (
      <div className="cart-page loading">
        <div className="loading-spinner"></div>
        <p>Loading your cart...</p>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <div className="cart-header">
          <h1>Shopping Cart</h1>
          {cart?.items.length > 0 && (
            <button onClick={handleClearCart} className="clear-cart-btn">
              Clear Cart
            </button>
          )}
        </div>

        {!cart || cart.items.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-cart-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Add some medicines to get started</p>
            <button 
              onClick={() => navigate('/medicines')}
              className="shop-now-btn"
            >
              Shop Medicines
            </button>
          </div>
        ) : (
          <div className="cart-content">
            <div className="cart-items">
              {cart.items.map((item) => (
                <div key={item._id} className="cart-item">
                  <div className="item-image">
                    <img 
                      src={item.medicine.images?.[0] || '/default-medicine.jpg'} 
                      alt={item.medicine.name}
                    />
                  </div>
                  
                  <div className="item-details">
                    <h3 className="item-name">{item.medicine.name}</h3>
                    <p className="item-brand">{item.medicine.brand}</p>
                    <p className="item-price">₹{item.price}</p>
                    
                    {item.medicine.stock < 10 && (
                      <p className="low-stock">
                        Only {item.medicine.stock} left in stock
                      </p>
                    )}
                  </div>

                  <div className="item-controls">
                    <div className="quantity-controls">
                      <button
                        onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                        disabled={item.quantity <= 1 || updatingItem === item._id}
                        className="quantity-btn"
                      >
                        −
                      </button>
                      
                      <span className="quantity-display">
                        {updatingItem === item._id ? '...' : item.quantity}
                      </span>
                      
                      <button
                        onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                        disabled={item.quantity >= item.medicine.stock || updatingItem === item._id}
                        className="quantity-btn"
                      >
                        +
                      </button>
                    </div>

                    <div className="item-total">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </div>

                    <button
                      onClick={() => handleRemoveItem(item._id)}
                      disabled={updatingItem === item._id}
                      className="remove-btn"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <div className="summary-card">
                <h3>Order Summary</h3>
                
                <div className="summary-row">
                  <span>Subtotal ({cart.totalItems} items)</span>
                  <span>₹{cart.subtotal?.toFixed(2) || '0.00'}</span>
                </div>
                
                <div className="summary-row">
                  <span>Shipping</span>
                  <span>
                    {cart.subtotal > 500 ? 'FREE' : '₹40.00'}
                  </span>
                </div>
                
                <div className="summary-row">
                  <span>Tax (5%)</span>
                  <span>₹{((cart.subtotal || 0) * 0.05).toFixed(2)}</span>
                </div>
                
                <div className="summary-row total">
                  <span>Total</span>
                  <span>₹{cart.totalAmount?.toFixed(2) || '0.00'}</span>
                </div>

                <button 
                  onClick={handleCheckout}
                  className="checkout-btn"
                >
                  Proceed to Checkout
                </button>

                {cart.subtotal < 500 && (
                  <p className="shipping-note">
                    Add ₹{(500 - cart.subtotal).toFixed(2)} more for FREE shipping!
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;