// components/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import '../../navbar.css';

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const { totalItems } = useSelector((state) => state.cart || {});
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          Med Plus
        </Link>
        
        <div className="nav-menu">
          {user ? (
            <>
              {/* Patient-specific links */}
              {user.role === 'patient' && (
                <>
                  <Link to="/upload-prescription" className="nav-link">
                    Upload Prescription
                  </Link>
                  <Link to="/my-requests" className="nav-link">
                    My Requests
                  </Link>
                  <Link to="/cart" className="nav-link cart-link">
                    🛒 Cart {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
                  </Link>
                  <Link to="/orders" className="nav-link">
                    My Orders
                  </Link>
                </>
              )}
              
              {/* Pharmacist-specific links */}
              {user.role === 'pharmacist' && (
                <Link to="/pharmacist-dashboard" className="nav-link">
                  Requests Dashboard
                </Link>
              )}

              {/* Admin-specific links */}
              {user.role === 'admin' && (
                <>
                  <Link to="/admin/dashboard" className="nav-link">
                    Admin Dashboard
                  </Link>
                  <Link to="/admin/orders" className="nav-link">
                    Manage Orders
                  </Link>
                  <Link to="/admin/medicines" className="nav-link">
                    Manage Medicines
                  </Link>
                </>
              )}
              
              {/* Common links */}
              <Link to="/medicines" className="nav-link">
                Medicines
              </Link>
              
              <div className="user-menu">
                <span className="user-greeting">Hello, {user.name}</span>
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/register" className="nav-link register-btn">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;