import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { registerUser, clearError } from '../../store/slices/authSlice'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    dateOfBirth: '',
    role: 'patient' // Default to patient
  })

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isLoading, error, user } = useSelector((state) => state.auth)

  // In Register.jsx - update the useEffect
useEffect(() => {
  if (user) {
    // Redirect based on role
    switch(user.role) {
      case 'admin':
        navigate('/admin/dashboard');
        break;
      case 'pharmacist':
        navigate('/pharmacist/dashboard');
        break;
      default:
        navigate('/dashboard'); // For patients
    }
  }
}, [user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    dispatch(registerUser(formData))
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Your Account</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password (min. 6 characters)"
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="Enter your phone number"
            />
          </div>

          <div className="form-group">
            <label>Date of Birth</label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              required
            />
          </div>

          {/* Role Selection Field - Updated to match your schema */}
          <div className="form-group">
            <label>Account Type</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="role-select"
            >
              <option value="patient">Patient</option>
              <option value="pharmacist">Pharmacist</option>
              <option value="admin">Administrator</option>
            </select>
            <small className="role-hint">
              {formData.role === 'admin' 
                ? 'Admin accounts have full system access.' 
                : formData.role === 'pharmacist'
                ? 'Pharmacist accounts can manage prescriptions and inventory.'
                : 'Patient accounts can browse and order medications.'}
            </small>
          </div>
          
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Register'}
          </button>
        </form>
        
        <p>
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  )
}

export default Register