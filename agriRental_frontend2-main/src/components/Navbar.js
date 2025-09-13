import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, User, LogOut, Home, Grid, Plus, BarChart3 } from 'lucide-react';

// Navigation bar with role-based menu items and mobile responsive design
const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin, isOwner } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false); // Mobile menu state

  // Handle user logout and navigation
  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  // Toggle mobile hamburger menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav style={{
      backgroundColor: 'var(--primary-black)',
      color: 'var(--pure-white)',
      padding: '1rem 0',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      boxShadow: '0 4px 12px var(--shadow-medium)',
      borderBottom: '1px solid var(--gray-light)'
    }}>
      <div className="container">
        <div className="d-flex justify-between align-center">
          {/* Logo */}
          <Link to="/" style={{ 
            color: 'var(--pure-white)', 
            textDecoration: 'none',
            fontSize: '1.6rem',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            letterSpacing: '-0.5px'
          }}>
            🚜 AgriRent
          </Link>

          {/* Desktop Menu */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ display: window.innerWidth > 768 ? 'flex' : 'none', gap: '20px' }}>
              <Link to="/" style={{ 
                color: 'var(--pure-white)', 
                textDecoration: 'none', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px',
                padding: '8px 12px',
                borderRadius: '6px',
                transition: 'background-color 0.3s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--secondary-black)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>
                <Home size={16} /> Home
              </Link>
              <Link to="/equipment" style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Grid size={16} /> Equipment
              </Link>
              
              {isAuthenticated && (
                <>
                  {isOwner && (
                    <Link to="/owner/dashboard" style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Plus size={16} /> My Equipment
                    </Link>
                  )}
                  {isAdmin && (
                    <Link to="/admin/dashboard" style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <BarChart3 size={16} /> Admin
                    </Link>
                  )}
                  <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <User size={16} /> Dashboard
                  </Link>
                </>
              )}
            </div>

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ display: window.innerWidth > 768 ? 'block' : 'none' }}>
                  Welcome, {user?.name}!
                </span>
                <button 
                  onClick={handleLogout}
                  style={{
                    background: 'transparent',
                    border: '2px solid white',
                    color: 'white',
                    padding: '8px 15px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <LogOut size={16} />
                  {window.innerWidth > 768 && 'Logout'}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '10px' }}>
                <Link to="/login" className="btn btn-outline" style={{ color: 'white', borderColor: 'white' }}>
                  Login
                </Link>
                <Link to="/register" className="btn" style={{ backgroundColor: 'var(--accent-brown)' }}>
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button 
              onClick={toggleMenu}
              style={{
                display: window.innerWidth <= 768 ? 'block' : 'none',
                background: 'transparent',
                border: 'none',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            marginTop: '20px',
            padding: '20px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: '10px'
          }}>
            <Link to="/" onClick={() => setIsMenuOpen(false)} style={{ color: 'white', textDecoration: 'none' }}>
              🏠 Home
            </Link>
            <Link to="/equipment" onClick={() => setIsMenuOpen(false)} style={{ color: 'white', textDecoration: 'none' }}>
              🚜 Equipment
            </Link>
            
            {isAuthenticated && (
              <>
                {isOwner && (
                  <Link to="/owner/dashboard" onClick={() => setIsMenuOpen(false)} style={{ color: 'white', textDecoration: 'none' }}>
                    ➕ My Equipment
                  </Link>
                )}
                {isAdmin && (
                  <Link to="/admin/dashboard" onClick={() => setIsMenuOpen(false)} style={{ color: 'white', textDecoration: 'none' }}>
                    📊 Admin Dashboard
                  </Link>
                )}
                <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} style={{ color: 'white', textDecoration: 'none' }}>
                  👤 My Dashboard
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
