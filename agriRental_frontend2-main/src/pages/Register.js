import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/api';
import { toast } from 'react-toastify';
import { Mail, Lock, User, Phone, Eye, EyeOff, UserPlus } from 'lucide-react';

// User registration page with role selection (user/owner)
const Register = () => {
  // Form state for all registration fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user', // Default to regular user
    phone: ''
  });
  const [showPassword, setShowPassword] = useState(false); // Toggle password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Toggle confirm password visibility
  const [loading, setLoading] = useState(false); // Form submission loading state
  
  const { login } = useAuth(); // Auth context for immediate login after registration
  const navigate = useNavigate(); // React Router navigation

  // Handle input field changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Process registration form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      // Remove confirmPassword before sending to backend
      const { confirmPassword, ...submitData } = formData;
      const response = await authService.register(submitData);
      login(response.user); // Automatically log in the new user
      toast.success(`Welcome to AgriRent, ${response.user.name}!`);
      
      // Redirect to appropriate dashboard based on selected role
      if (response.user.role === 'owner') {
        navigate('/owner/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 200px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--gray-light)',
      padding: '40px 0'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '15px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        maxWidth: '1000px',
        width: '100%',
        margin: '0 20px'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '600px' }}>
          {/* Left Side - Form */}
          <div style={{ padding: '40px' }}>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <h1 style={{
                color: 'var(--primary-green)',
                marginBottom: '10px',
                fontSize: '2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}>
                <UserPlus size={32} />
                Join AgriRent
              </h1>
              <p style={{ color: 'var(--gray-dark)' }}>
                Create your account and start renting equipment
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">
                  <User size={16} style={{ marginRight: '8px' }} />
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Mail size={16} style={{ marginRight: '8px' }} />
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Phone size={16} style={{ marginRight: '8px' }} />
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Account Type</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="user">User (Rent Equipment)</option>
                  <option value="owner">Owner (List Equipment)</option>
                </select>
                <small style={{ color: 'var(--gray-dark)', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                  {formData.role === 'user' 
                    ? 'Choose this to rent equipment for your farming needs'
                    : 'Choose this to list your equipment for rent and earn money'
                  }
                </small>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Lock size={16} style={{ marginRight: '8px' }} />
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter your password"
                    required
                    style={{ paddingRight: '45px' }}
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--gray-dark)'
                    }}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Lock size={16} style={{ marginRight: '8px' }} />
                  Confirm Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Confirm your password"
                    required
                    style={{ paddingRight: '45px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--gray-dark)'
                    }}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  marginTop: '10px'
                }}
                disabled={loading}
              >
                {loading ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
                    Creating Account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '25px' }}>
              <p style={{ color: 'var(--gray-dark)' }}>
                Already have an account?{' '}
                <Link to="/login" style={{ 
                  color: 'var(--primary-green)', 
                  textDecoration: 'none',
                  fontWeight: '500'
                }}>
                  Sign in here
                </Link>
              </p>
            </div>
          </div>

          {/* Right Side - Benefits */}
          <div style={{
            background: 'linear-gradient(135deg, var(--modern-green) 0%, var(--light-green) 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
            padding: '40px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>
              🌾
            </div>
            <h2 style={{ fontSize: '2rem', marginBottom: '20px' }}>
              Join Our Community
            </h2>
            
            <div style={{ textAlign: 'left', maxWidth: '300px' }}>
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🚜 For Renters:
                </h4>
                <ul style={{ fontSize: '14px', opacity: 0.9, listStyle: 'none', padding: 0 }}>
                  <li style={{ marginBottom: '5px' }}>• Access quality equipment</li>
                  <li style={{ marginBottom: '5px' }}>• Save on equipment costs</li>
                  <li style={{ marginBottom: '5px' }}>• Flexible rental periods</li>
                </ul>
              </div>
              
              <div>
                <h4 style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  💰 For Owners:
                </h4>
                <ul style={{ fontSize: '14px', opacity: 0.9, listStyle: 'none', padding: 0 }}>
                  <li style={{ marginBottom: '5px' }}>• Earn from idle equipment</li>
                  <li style={{ marginBottom: '5px' }}>• Easy listing process</li>
                  <li style={{ marginBottom: '5px' }}>• Secure transactions</li>
                </ul>
              </div>
            </div>

            <div style={{ marginTop: '30px', display: 'flex', gap: '20px' }}>
              <span style={{ fontSize: '2rem' }}>🌱</span>
              <span style={{ fontSize: '2rem' }}>🌽</span>
              <span style={{ fontSize: '2rem' }}>🚜</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
