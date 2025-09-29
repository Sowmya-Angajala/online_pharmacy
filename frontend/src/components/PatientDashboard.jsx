import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getMedicines } from '../../store/slices/medicineSlice';
import { toggleCart } from '../../store/slices/cartSlice';
import { getPatientOrders } from '../../store/slices/orderSlice';
import MedicineCard from '../../components/MedicineCard/MedicineCard';
import CartSidebar from '../../components/Cart/CartSidebar';
import OrderStatus from '../../components/Order/OrderStatus';
import './PatientDashboard.css';

const PatientDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('medicines');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  const { medicines, isLoading: medicinesLoading } = useSelector((state) => state.medicines);
  const { items: cartItems, totalItems, isCartOpen } = useSelector((state) => state.cart);
  const { orders, isLoading: ordersLoading } = useSelector((state) => state.orders);
  const { user } = useSelector((state) => state.auth);

  // Redirect if not patient
  useEffect(() => {
    if (user?.role !== 'patient') {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    dispatch(getMedicines());
    dispatch(getPatientOrders());
  }, [dispatch]);

  // Filter medicines based on search and category
  const filteredMedicines = medicines.filter(medicine => {
    const matchesSearch = medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         medicine.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || medicine.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(medicines.map(med => med.category))];

  if (medicinesLoading && medicines.length === 0) {
    return (
      <div className="patient-dashboard loading">
        <div className="loading-spinner"></div>
        <p>Loading medicines...</p>
      </div>
    );
  }

  return (
    <div className="patient-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="container">
          <div className="header-content">
            <h1>Welcome back, {user?.name}!</h1>
            <p>Find and order your medicines easily</p>
          </div>
          
          <div className="header-actions">
            <button 
              className="cart-icon-btn"
              onClick={() => dispatch(toggleCart())}
            >
              🛒 Cart ({totalItems})
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="dashboard-nav">
        <div className="container">
          <div className="nav-tabs">
            <button 
              className={`tab-btn ${activeTab === 'medicines' ? 'active' : ''}`}
              onClick={() => setActiveTab('medicines')}
            >
              💊 Browse Medicines
            </button>
            <button 
              className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              📦 My Orders ({orders.length})
            </button>
            <button 
              className={`tab-btn ${activeTab === 'prescriptions' ? 'active' : ''}`}
              onClick={() => navigate('/my-requests')}
            >
              📋 Prescription Requests
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="container">
          {activeTab === 'medicines' && (
            <div className="medicines-section">
              {/* Filters */}
              <div className="filters-bar">
                <div className="search-box">
                  <input
                    type="text"
                    placeholder="Search medicines..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                  <span className="search-icon">🔍</span>
                </div>
                
                <select 
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="category-filter"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Medicines Grid */}
              <div className="medicines-grid">
                {filteredMedicines.map(medicine => (
                  <MedicineCard key={medicine._id} medicine={medicine} />
                ))}
              </div>

              {filteredMedicines.length === 0 && (
                <div className="no-medicines">
                  <div className="no-medicines-icon">💊</div>
                  <h3>No medicines found</h3>
                  <p>Try adjusting your search or filter criteria</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            <OrderStatus orders={orders} isLoading={ordersLoading} />
          )}
        </div>
      </main>

      {/* Cart Sidebar */}
      {isCartOpen && <CartSidebar />}
    </div>
  );
};

export default PatientDashboard;