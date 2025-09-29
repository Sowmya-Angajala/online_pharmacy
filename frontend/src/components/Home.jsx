import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaFilter,
  FaMapMarkerAlt,
  FaUpload,
  FaCalendarAlt,
  FaShieldAlt,
  FaFlask,
} from "react-icons/fa";
import "../../home.css";
import { medicinesAPI } from "../services/api";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../store/slices/cartSlice";

// Mock data - Replace with actual API calls
const mockMedicines = [
  {
    id: 1,
    name: "Paracetamol 500mg",
    brand: "Cipla",
    category: "Pain Relief",
    price: 25,
    inStock: true,
  },
  {
    id: 2,
    name: "Amoxicillin 250mg",
    brand: "Sun Pharma",
    category: "Antibiotics",
    price: 180,
    inStock: true,
  },
  {
    id: 3,
    name: "Metformin 500mg",
    brand: "Dr. Reddy's",
    category: "Diabetes",
    price: 120,
    inStock: false,
  },
  {
    id: 4,
    name: "Atorvastatin 10mg",
    brand: "Lupin",
    category: "Cholesterol",
    price: 95,
    inStock: true,
  },
  {
    id: 5,
    name: "Vitamin C 1000mg",
    brand: "Himalaya",
    category: "Supplements",
    price: 45,
    inStock: true,
  },
  {
    id: 6,
    name: "Cetirizine 10mg",
    brand: "Cipla",
    category: "Allergy",
    price: 30,
    inStock: true,
  },
  {
    id: 7,
    name: "Omeprazole 20mg",
    brand: "Sun Pharma",
    category: "Acidity",
    price: 85,
    inStock: true,
  },
  {
    id: 8,
    name: "Aspirin 75mg",
    brand: "Bayer",
    category: "Cardiac",
    price: 55,
    inStock: false,
  },
];

const categories = [
  "All",
  "Pain Relief",
  "Antibiotics",
  "Diabetes",
  "Cholesterol",
  "Supplements",
  "Allergy",
  "Acidity",
  "Cardiac",
];
const brands = [
  "All",
  "Cipla",
  "Sun Pharma",
  "Dr. Reddy's",
  "Lupin",
  "Himalaya",
  "Bayer",
];

const Home = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [errorFetchingmedicine, setFetchingErros] = useState(false);
  const [medicines, setMedicines] = useState(mockMedicines);
  const [filteredMedicines, setFilteredMedicines] = useState(mockMedicines);
  const [isSearching, setIsSearching] = useState(false);
  const { user } = useSelector((state) => state.auth);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fetchMedicines = async () => {
    try {
      const res = await medicinesAPI.fetchMedicines();

      setMedicines(res?.data?.medicines);
    } catch (err) {
      setFetchingErros(true);
    }
  };

  // Filter states
  const [filters, setFilters] = useState({
    category: "All",
    brand: "All",
    priceRange: [0, 500],
    inStock: false,
    sortBy: "name",
  });

  // Debounced search function
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  };

  // Real-time search with debouncing
  const handleSearch = useCallback(
    debounce((term) => {
      if (term.trim() === "") {
        setSuggestions([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);

      // Simulate API call delay
      setTimeout(() => {
        const results = mockMedicines
          .filter(
            (medicine) =>
              medicine.name.toLowerCase().includes(term.toLowerCase()) ||
              medicine.brand.toLowerCase().includes(term.toLowerCase()) ||
              medicine.category.toLowerCase().includes(term.toLowerCase())
          )
          .slice(0, 5); // Limit to 5 suggestions

        setSuggestions(results);
        setIsSearching(false);
      }, 300);
    }, 300),
    []
  );

  // Apply filters
  const applyFilters = useCallback(() => {
    let results = medicines;

    // Search filter
    if (searchTerm) {
      results = results?.filter(
        (medicine) =>
          medicine?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
          medicine?.brand?.toLowerCase()?.includes(searchTerm?.toLowerCase())
      );
    }

    // Category filter
    if (filters?.category !== "All") {
      results = results?.filter(
        (medicine) => medicine?.category === filters?.category
      );
    }

    // Brand filter
    if (filters.brand !== "All") {
      results = results?.filter(
        (medicine) => medicine?.brand === filters?.brand
      );
    }

    // Price range filter
    results = results?.filter(
      (medicine) =>
        medicine?.price >= filters?.priceRange[0] &&
        medicine?.price <= filters?.priceRange[1]
    );

    // Stock filter
    if (filters?.inStock) {
      results = results?.filter((medicine) => medicine?.inStock);
    }

    // Sorting
    results?.sort((a, b) => {
      switch (filters.sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredMedicines(results);
  }, [searchTerm, filters, medicines]);

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    handleSearch(value);
  };

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      category: "All",
      brand: "All",
      priceRange: [0, 500],
      inStock: false,
      sortBy: "name",
    });
    setSearchTerm("");
    setSuggestions([]);
  };

  const handleAddToCart = (medicine) => {
    console.log(medicine,"mediv");
    
    if (!user) {
      navigate("/login");
    } else {
      dispatch(addToCart(medicine));
    }
  };

  // Apply filters when any filter changes
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  useEffect(() => {
    fetchMedicines();
  }, []);

  return (
    <div className="homepage">
      {/* Header */}
      {/* <header className="home-header">
        <div className="container">
          <h1 className="logo">MediCare Pharmacy</h1>
          <p className="tagline">Your trusted partner in health and wellness</p>
        </div>
      </header> */}

      {/* Hero Search Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h2>Find Medicines & Health Products</h2>

            {/* Real-time Search Box */}
            <div className="search-container">
              <div className="search-box">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search medicines, brands, categories..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="search-input"
                />
                {isSearching && <div className="search-spinner"></div>}
              </div>

              {/* Search Suggestions */}
              {suggestions.length > 0 && (
                <div className="suggestions-dropdown">
                  {suggestions.map((medicine) => (
                    <div key={medicine.id} className="suggestion-item">
                      <span className="medicine-name">{medicine.name}</span>
                      <span className="medicine-brand">{medicine.brand}</span>
                      <span className="medicine-price">₹{medicine.price}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container main-container">
        <div className="content-wrapper">
          {/* Filters Sidebar */}
          <aside className="filters-sidebar">
            <div className="filters-header">
              <span className="filter-icon">⚙️</span>
              <h3>Filters</h3>
              <button onClick={resetFilters} className="reset-btn">
                Reset
              </button>
            </div>

            {/* Category Filter */}
            <div className="filter-group">
              <label>Category</label>
              <div className="filter-options">
                {categories.map((category) => (
                  <button
                    key={category}
                    className={`filter-option ${
                      filters.category === category ? "active" : ""
                    }`}
                    onClick={() => handleFilterChange("category", category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Brand Filter */}
            <div className="filter-group">
              <label>Brand</label>
              <div className="filter-options">
                {brands.map((brand) => (
                  <button
                    key={brand}
                    className={`filter-option ${
                      filters.brand === brand ? "active" : ""
                    }`}
                    onClick={() => handleFilterChange("brand", brand)}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="filter-group">
              <label>
                Price Range: ₹{filters.priceRange[0]} - ₹{filters.priceRange[1]}
              </label>
              <div className="price-slider">
                <input
                  type="range"
                  min="0"
                  max="500"
                  value={filters.priceRange[0]}
                  onChange={(e) =>
                    handleFilterChange("priceRange", [
                      parseInt(e.target.value),
                      filters.priceRange[1],
                    ])
                  }
                  className="slider"
                />
                <input
                  type="range"
                  min="0"
                  max="500"
                  value={filters.priceRange[1]}
                  onChange={(e) =>
                    handleFilterChange("priceRange", [
                      filters.priceRange[0],
                      parseInt(e.target.value),
                    ])
                  }
                  className="slider"
                />
              </div>
            </div>

            {/* Availability Filter */}
            <div className="filter-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filters.inStock}
                  onChange={(e) =>
                    handleFilterChange("inStock", e.target.checked)
                  }
                />
                In Stock Only
              </label>
            </div>

            {/* Sort By */}
            <div className="filter-group">
              <label>Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                className="sort-select"
              >
                <option value="name">Name (A-Z)</option>
                <option value="price-low">Price (Low to High)</option>
                <option value="price-high">Price (High to Low)</option>
              </select>
            </div>
          </aside>

          {/* Medicines Grid */}
          <main className="medicines-grid">
            <div className="results-header">
              <span>{filteredMedicines.length} medicines found</span>
            </div>

            <div className="medicines-list">
              {filteredMedicines.map((medicine) => (
                <div key={medicine.id} className="medicine-card">
                  <div className="medicine-image">
                    <div className="image-placeholder">💊</div>
                  </div>
                  <div className="medicine-info">
                    <h3 className="medicine-name">{medicine.name}</h3>
                    <p className="medicine-brand">{medicine.brand}</p>
                    <p className="medicine-category">{medicine.category}</p>
                    <div className="medicine-footer">
                      <span className="medicine-price">₹{medicine.price}</span>
                      <span
                        className={`stock-status ${
                          medicine.inStock ? "in-stock" : "out-of-stock"
                        }`}
                      >
                        {medicine.inStock ? "In Stock" : "In Stock"}
                      </span>
                    </div>
                    <button
                      className={`add-to-cart-btn ${
                        !medicine.inStock ? "disabled" : ""
                      }`}
                      onClick={() => handleAddToCart(medicine)}
                    >
                      {medicine.inStock ? "Add to Cart" : "Add to Cart"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredMedicines.length === 0 && (
              <div className="no-results">
                <p>No medicines found matching your criteria.</p>
                <button onClick={resetFilters} className="reset-filters-btn">
                  Reset Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Services Section */}
      <section className="services-section">
        <div className="container">
          <h2>Our Services</h2>
          <div className="services-grid">
            <div className="service-card">
              <span className="service-icon">🏪</span>
              <h3>Pharmacy Near Me</h3>
              <p>Find nearby pharmacies</p>
              <button className="service-btn">FIND STORE</button>
            </div>

            <div className="service-card">
              <span className="service-icon">💰</span>
              <h3>Get 20%* off on Medicines</h3>
              <p>Special discount on prescription</p>
              <button className="service-btn">UPLOAD NOW</button>
            </div>

            <div className="service-card">
              <span className="service-icon">👨‍⚕️</span>
              <h3>Doctor Appointment</h3>
              <p>Consult with top doctors</p>
              <button className="service-btn">BOOK NOW</button>
            </div>

            <div className="service-card">
              <span className="service-icon">🛡️</span>
              <h3>Health Insurance</h3>
              <p>Secure your health future</p>
              <button className="service-btn">EXPLORE PLANS</button>
            </div>

            <div className="service-card">
              <span className="service-icon">🔬</span>
              <h3>Lab Tests</h3>
              <p>Accurate results at home</p>
              <button className="service-btn">AT HOME</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
