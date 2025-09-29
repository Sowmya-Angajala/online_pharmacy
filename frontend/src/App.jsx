// App.js - Updated with new Dashboard and Footer
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from './components/Navbar';

import Home from './components/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import UploadPrescription from './pages/Patient/UploadPrescription';
import MyRequests from './pages/Patient/MyRequests';
import PharmacistDashboard from './pages/Pharmacist/PharmacistDashboard';
import CartPage from './pages/cart/CartPage';
import OrderDetails from './pages/orders/OrderDetails';
import CheckoutPage from './pages/Checkout/CheckoutPage';
import UserOrders from './pages/orders/UserOrders';
import Footer from './pages/Footer/Footer';
import Dashboard from './pages/Dashboard';

// Temporary Admin Dashboard (you can enhance this later)
const AdminDashboard = () => (
  <div className="admin-dashboard">
    <div className="container">
      <h1>Admin Dashboard</h1>
      <p>Administrative features and system management</p>
    </div>
  </div>
);

function App() {
  const { user } = useSelector((state) => state.auth);

  return (
    <Router>
      <div className="App" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route 
              path="/login" 
              element={!user ? <Login /> : <Navigate to="/dashboard" />} 
            />
            <Route 
              path="/register" 
              element={!user ? <Register /> : <Navigate to="/dashboard" />} 
            />
            <Route 
              path="/dashboard" 
              element={user ? <Dashboard /> : <Navigate to="/login" />} 
            />
            
            {/* Patient Routes */}
            <Route 
              path="/upload-prescription" 
              element={user && user.role === 'patient' ? <UploadPrescription /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/cart" 
              element={user && user.role === 'patient' ? <CartPage /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/orders" 
              element={user && user.role === 'patient' ? <UserOrders /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/my-requests" 
              element={user && user.role === 'patient' ? <MyRequests /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/checkout" 
              element={user && user.role === 'patient' ? <CheckoutPage /> : <Navigate to="/login" />} 
            />
            
            {/* Pharmacist Routes */}
            <Route 
              path="/pharmacist-dashboard" 
              element={user && user.role === 'pharmacist' ? <PharmacistDashboard /> : <Navigate to="/login" />} 
            />
            
            {/* Admin Routes */}
            <Route 
              path="/admin/dashboard" 
              element={user && user.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />} 
            />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;