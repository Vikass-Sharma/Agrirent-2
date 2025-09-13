import React from 'react';

// Site footer with company info, links, and contact details
const Footer = () => {
  return (
    <footer style={{
      backgroundColor: 'var(--primary-black)',
      color: 'var(--pure-white)',
      padding: '50px 0 30px',
      marginTop: '80px',
      borderTop: '1px solid var(--gray-light)'
    }}>
      <div className="container">
        <div className="grid grid-3">
          {/* Company branding and description */}
          <div>
            <h3 style={{ 
              marginBottom: '20px', 
              fontSize: '24px',
              fontWeight: '700',
              letterSpacing: '-0.5px'
            }}>🚜 AgriRent</h3>
            <p style={{ 
              lineHeight: '1.7',
              color: 'var(--gray-light)',
              fontSize: '14px'
            }}>
              Your trusted partner for agriculture equipment rental. 
              Empowering farmers with quality equipment and reliable service.
            </p>
          </div>
          
          <div>
            <h4 style={{ 
              marginBottom: '20px',
              fontSize: '16px',
              fontWeight: '600'
            }}>Quick Links</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '10px' }}>
                <a href="/equipment" style={{ 
                  color: 'var(--gray-light)', 
                  textDecoration: 'none',
                  fontSize: '14px',
                  transition: 'color 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.color = 'var(--pure-white)'}
                onMouseLeave={(e) => e.target.style.color = 'var(--gray-light)'}>
                  Browse Equipment
                </a>
              </li>
              <li style={{ marginBottom: '10px' }}>
                <a href="/register" style={{ 
                  color: 'var(--gray-light)', 
                  textDecoration: 'none',
                  fontSize: '14px',
                  transition: 'color 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.color = 'var(--pure-white)'}
                onMouseLeave={(e) => e.target.style.color = 'var(--gray-light)'}>
                  Become an Owner
                </a>
              </li>
              <li style={{ marginBottom: '10px' }}>
                <a href="/about" style={{ color: 'white', textDecoration: 'none' }}>About Us</a>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <a href="/contact" style={{ color: 'white', textDecoration: 'none' }}>Contact</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 style={{ marginBottom: '15px' }}>Contact Info</h4>
            <p style={{ marginBottom: '8px' }}>📧 support@agrirent.com</p>
            <p style={{ marginBottom: '8px' }}>📞 +1 (555) 123-4567</p>
            <p style={{ marginBottom: '8px' }}>📍 123 Farm Road, Agricultural City</p>
            <div style={{ marginTop: '15px' }}>
              <span style={{ marginRight: '10px' }}>🌾</span>
              <span style={{ marginRight: '10px' }}>🚜</span>
              <span style={{ marginRight: '10px' }}>🌱</span>
              <span>🌽</span>
            </div>
          </div>
        </div>
        
        <hr style={{ margin: '30px 0 20px', border: 'none', borderTop: '1px solid rgba(255,255,255,0.3)' }} />
        
        <div className="text-center">
          <p>&copy; 2025 AgriRent. All rights reserved. | Made with 💚 for farmers</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
