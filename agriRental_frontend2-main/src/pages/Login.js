import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/api';
import { toast } from 'react-toastify';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';

// User authentication page with email/password login
const Login = () => {
  // Form state for email and password inputs
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false); // Toggle password visibility
  const [loading, setLoading] = useState(false); // Button loading state
  
  const { login } = useAuth(); // Auth context for setting user state
  const navigate = useNavigate(); // React Router navigation

  // Handle input field changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Process login form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Call backend login API
      const response = await authService.login(formData.email, formData.password);
      login(response.user); // Save user to auth context
      toast.success(`Welcome back, ${response.user.name}!`);
      
      // Redirect to appropriate dashboard based on user role
      if (response.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (response.user.role === 'owner') {
        navigate('/owner/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
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
        maxWidth: '900px',
        width: '100%',
        margin: '0 20px'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '500px' }}>
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
                <LogIn size={32} />
                Welcome Back
              </h1>
              <p style={{ color: 'var(--gray-dark)' }}>
                Sign in to access your AgriRent account
              </p>
            </div>

            <form onSubmit={handleSubmit}>
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
                    Signing In...
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '25px' }}>
              <p style={{ color: 'var(--gray-dark)' }}>
                Don't have an account?{' '}
                <Link to="/register" style={{ 
                  color: 'var(--primary-green)', 
                  textDecoration: 'none',
                  fontWeight: '500'
                }}>
                  Sign up here
                </Link>
              </p>
            </div>

            {/* Demo Credentials */}
            <div style={{
              marginTop: '30px',
              padding: '20px',
              backgroundColor: 'var(--gray-light)',
              borderRadius: '8px',
              fontSize: '14px'
            }}>
              <h4 style={{ marginBottom: '10px', color: 'var(--primary-green)' }}>
                Demo Credentials:
              </h4>
              <p style={{ margin: '5px 0', color: 'var(--gray-dark)' }}>
                <strong>Admin:</strong> admin@agrirent.com / admin123
              </p>
              <p style={{ margin: '5px 0', color: 'var(--gray-dark)' }}>
                <strong>Owner:</strong> owner@test.com / password123
              </p>
              <p style={{ margin: '5px 0', color: 'var(--gray-dark)' }}>
                <strong>User:</strong> user@test.com / password123
              </p>
            </div>
          </div>

          {/* Right Side - Image/Branding */}
          <div style={{
            background: 'linear-gradient(135deg, var(--primary-green) 0%, var(--soft-green) 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
            padding: '40px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>
              🚜
            </div>
            <h2 style={{ fontSize: '2rem', marginBottom: '15px' }}>
              AgriRent Platform
            </h2>
            <p style={{ fontSize: '1.1rem', opacity: 0.9, lineHeight: '1.6' }}>
              Access to modern farming equipment, 
              boost your productivity, and grow your agricultural business.
            </p>
            <div style={{ marginTop: '30px', display: 'flex', gap: '20px' }}>
              <span style={{ fontSize: '2rem' }}>🌾</span>
              <span style={{ fontSize: '2rem' }}>🌱</span>
              <span style={{ fontSize: '2rem' }}>🌽</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
