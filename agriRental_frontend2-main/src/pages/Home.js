import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

// Landing page with hero section and features
const Home = () => {
  return (
    <div>
      {/* Main hero banner with call-to-action buttons */}
      <section style={{
        background: 'linear-gradient(135deg, var(--primary-black) 0%, var(--secondary-black) 100%)',
        color: 'var(--pure-white)',
        padding: '100px 0',
        textAlign: 'center'
      }}>
        <div className="container">
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: '800',
            marginBottom: '24px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            letterSpacing: '-1px'
          }}>
            🚜 Modern Equipment for Modern Farming
          </h1>
          <p style={{
            fontSize: '1.3rem',
            marginBottom: '50px',
            maxWidth: '700px',
            margin: '0 auto 50px',
            opacity: 0.9,
            lineHeight: '1.6'
          }}>
            Rent high-quality agricultural equipment from trusted owners in your area. 
            Save money, boost productivity, and grow your farm efficiently.
          </p>
          {/* Primary action buttons */}
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/equipment" className="btn" style={{
              backgroundColor: 'var(--pure-white)',
              color: 'var(--primary-black)',
              padding: '16px 32px',
              fontSize: '1.1rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              border: 'none',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              textDecoration: 'none'
            }}>
              Browse Equipment <ArrowRight size={20} />
            </Link>
            <Link to="/register" className="btn" style={{
              backgroundColor: 'transparent',
              borderColor: 'var(--pure-white)',
              color: 'var(--pure-white)',
              border: '2px solid var(--pure-white)',
              padding: '16px 32px',
              fontSize: '1.1rem',
              fontWeight: '600',
              borderRadius: '8px',
              textDecoration: 'none'
            }}>
              List Your Equipment
            </Link>
          </div>
        </div>
      </section>

      {/* Platform benefits and features section */}
      <section style={{ padding: '100px 0', backgroundColor: 'var(--gray-lighter)' }}>
        <div className="container">
          <h2 style={{
            textAlign: 'center',
            marginBottom: '60px',
            color: 'var(--primary-black)',
            fontSize: '2.8rem',
            fontWeight: '700',
            letterSpacing: '-1px'
          }}>
            Why Choose AgriRent?
          </h2>
          
          <div className="grid grid-3">
            <div style={{ textAlign: 'center' }}>
              <div style={{
                backgroundColor: 'var(--primary-black)',
                color: 'var(--pure-white)',
                width: '90px',
                height: '90px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                fontSize: '2.2rem',
                boxShadow: '0 8px 20px var(--shadow-medium)'
              }}>
                🚜
              </div>
              <h3 style={{ 
                marginBottom: '16px', 
                color: 'var(--primary-black)',
                fontSize: '1.5rem',
                fontWeight: '600'
              }}>
                Quality Equipment
              </h3>
              <p style={{ 
                color: 'var(--gray-dark)', 
                lineHeight: '1.7',
                fontSize: '15px'
              }}>
                Access to well-maintained, modern agricultural equipment from verified owners. 
                All equipment is regularly inspected for safety and performance.
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                backgroundColor: 'var(--accent-blue)',
                color: 'var(--pure-white)',
                width: '90px',
                height: '90px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                fontSize: '2.2rem',
                boxShadow: '0 8px 20px var(--shadow-medium)'
              }}>
                💰
              </div>
              <h3 style={{ 
                marginBottom: '16px', 
                color: 'var(--primary-black)',
                fontSize: '1.5rem',
                fontWeight: '600'
              }}>
                Cost Effective
              </h3>
              <p style={{ 
                color: 'var(--gray-dark)', 
                lineHeight: '1.7',
                fontSize: '15px'
              }}>
                Save significantly on equipment costs. Rent only when you need it instead of 
                making expensive purchases. Perfect for seasonal farming operations.
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                backgroundColor: 'var(--success-green)',
                color: 'var(--pure-white)',
                width: '90px',
                height: '90px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                fontSize: '2.2rem',
                boxShadow: '0 8px 20px var(--shadow-medium)'
              }}>
                🤝
              </div>
              <h3 style={{ 
                marginBottom: '16px', 
                color: 'var(--primary-black)',
                fontSize: '1.5rem',
                fontWeight: '600'
              }}>
                Trusted Network
              </h3>
              <p style={{ 
                color: 'var(--gray-dark)', 
                lineHeight: '1.7',
                fontSize: '15px'
              }}>
                Connect with verified equipment owners in your local area. 
                Build lasting relationships and support your farming community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{
        padding: '80px 0',
        backgroundColor: 'var(--primary-black)',
        color: 'var(--pure-white)'
      }}>
        <div className="container">
          <div className="grid grid-4">
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ 
                fontSize: '3rem', 
                fontWeight: 'bold', 
                marginBottom: '10px',
                color: 'var(--pure-white)'
              }}>500+</h3>
              <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>Equipment Available</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ 
                fontSize: '3rem', 
                fontWeight: 'bold', 
                marginBottom: '10px',
                color: 'var(--pure-white)'
              }}>1000+</h3>
              <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>Happy Farmers</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ 
                fontSize: '3rem', 
                fontWeight: 'bold', 
                marginBottom: '10px',
                color: 'var(--pure-white)'
              }}>50+</h3>
              <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>Cities Covered</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ 
                fontSize: '3rem', 
                fontWeight: 'bold', 
                marginBottom: '10px',
                color: 'var(--pure-white)'
              }}>24/7</h3>
              <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>Support Available</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{ padding: '80px 0', backgroundColor: 'var(--pure-white)' }}>
        <div className="container">
          <h2 style={{
            textAlign: 'center',
            marginBottom: '50px',
            color: 'var(--primary-black)',
            fontSize: '2.5rem',
            fontWeight: '700'
          }}>
            How It Works
          </h2>
          
          <div className="grid grid-3">
            <div style={{ textAlign: 'center' }}>
              <div style={{
                backgroundColor: 'var(--primary-black)',
                color: 'var(--pure-white)',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: '1.5rem',
                fontWeight: 'bold'
              }}>
                1
              </div>
              <h3 style={{ marginBottom: '15px', color: 'var(--primary-black)' }}>
                Browse & Search
              </h3>
              <p style={{ color: 'var(--gray-dark)', lineHeight: '1.6' }}>
                Search for equipment by type, location, and availability. 
                Filter results to find exactly what you need for your farm.
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                backgroundColor: 'var(--accent-blue)',
                color: 'var(--pure-white)',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: '1.5rem',
                fontWeight: 'bold'
              }}>
                2
              </div>
              <h3 style={{ marginBottom: '15px', color: 'var(--primary-black)' }}>
                Book Instantly
              </h3>
              <p style={{ color: 'var(--gray-dark)', lineHeight: '1.6' }}>
                Select your dates, review the cost, and book instantly. 
                Get confirmation immediately and track your booking status.
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                backgroundColor: 'var(--success-green)',
                color: 'var(--pure-white)',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: '1.5rem',
                fontWeight: 'bold'
              }}>
                3
              </div>
              <h3 style={{ marginBottom: '15px', color: 'var(--primary-black)' }}>
                Use & Return
              </h3>
              <p style={{ color: 'var(--gray-dark)', lineHeight: '1.6' }}>
                Pick up the equipment and use it for your farming needs. 
                Return it on time and rate your experience to help others.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '100px 0',
        backgroundColor: 'var(--gray-lighter)',
        textAlign: 'center'
      }}>
        <div className="container">
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            marginBottom: '20px',
            color: 'var(--primary-black)'
          }}>
            Ready to Get Started?
          </h2>
          <p style={{
            fontSize: '1.2rem',
            marginBottom: '40px',
            color: 'var(--gray-dark)',
            maxWidth: '600px',
            margin: '0 auto 40px'
          }}>
            Join thousands of farmers who are already saving money and increasing productivity with AgriRent.
          </p>
          <Link to="/register" className="btn btn-primary" style={{
            padding: '16px 32px',
            fontSize: '1.1rem',
            fontWeight: '600',
            textDecoration: 'none'
          }}>
            Get Started Today
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
