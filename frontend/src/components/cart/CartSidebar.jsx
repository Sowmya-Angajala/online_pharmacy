import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  removeFromCart, 
  updateQuantity, 
  closeCart,
  clearCart 
} from '../../store/slices/cartSlice';
import './CartSidebar.css';

const CartSidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, totalAmount, totalItems } = useSelector((state) => state.cart);

  const handleQuantityChange = (id, newQuantity) => {
    if (newQuantity < 1) {
      dispatch(removeFromCart(id));
    } else {
      dispatch(updateQuantity({ id, quantity: newQuantity }));
    }
  };

  const handleCheckout = () => {
    dispatch(closeCart());
    navigate('/checkout');
  };

  const handleContinueShopping = () => {
    dispatch(closeCart());
  };

  if (items.length === 0) {
    return (
      <div className="cart-sidebar">
        <div className="cart-header">
          <h3>Your Cart ({totalItems})</h3>
          <button onClick={() => dispatch(closeCart())} className="close-btn">×</button>
        </div>
        
        <div className="empty-cart">
          <div className="empty-cart-icon">🛒</div>
          <h4>Your cart is empty</h4>
          <p>Add some medicines to get started</p>
          <button onClick={handleContinueShopping} className="continue-shopping-btn">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-sidebar">
      <div className="cart-header">
        <h3>Your Cart ({totalItems})</h3>
        <button onClick={() => dispatch(closeCart())} className="close-btn">×</button>
      </div>

      <div className="cart-items">
        {items.map(item => (
          <div key={item._id} className="cart-item">
            <div className="item-image">
              <div className="image-mini">💊</div>
            </div>
            
            <div className="item-details">
              <h4 className="item-name">{item.name}</h4>
              <p className="item-brand">{item.brand}</p>
              <p className="item-price">₹{item.price}</p>
            </div>

            <div className="item-controls">
              <div className="quantity-controls">
                <button 
                  onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                  className="quantity-btn"
                >
                  -
                </button>
                <span className="quantity">{item.quantity}</span>
                <button 
                  onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                  className="quantity-btn"
                >
                  +
                </button>
              </div>
              
              <button 
                onClick={() => dispatch(removeFromCart(item._id))}
                className="remove-btn"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="cart-footer">
        <div className="cart-total">
          <span>Total:</span>
          <span className="total-amount">₹{totalAmount.toFixed(2)}</span>
        </div>
        
        <div className="cart-actions">
          <button 
            onClick={() => dispatch(clearCart())}
            className="clear-cart-btn"
          >
            Clear Cart
          </button>
          <button 
            onClick={handleCheckout}
            className="checkout-btn"
          >
            Proceed to Checkout
          </button>
        </div>
        
        <button 
          onClick={handleContinueShopping}
          className="continue-shopping-link"
        >
          ← Continue Shopping
        </button>
      </div>
    </div>
  );
};

export default CartSidebar;