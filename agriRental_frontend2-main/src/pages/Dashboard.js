import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { bookingService } from '../services/api';
import { toast } from 'react-toastify';
import { User, Calendar, Clock, DollarSign, Package, CheckCircle } from 'lucide-react';

// User dashboard showing their bookings and statistics
const Dashboard = () => {
  const [bookings, setBookings] = useState([]); // User's booking history
  const [loading, setLoading] = useState(true); // Page loading state
  const [stats, setStats] = useState({ // Calculated booking statistics
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    totalSpent: 0
  });
  
  const { user } = useAuth(); // Current logged-in user

  // Get all bookings for current user
  const fetchBookings = useCallback(async () => {
    try {
      const data = await bookingService.getAll({ userId: user?.id });
      setBookings(data);
      calculateStats(data); // Update statistics
    } catch (error) {
      toast.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Fetch user's bookings when component mounts or user changes
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Calculate booking statistics from fetched data
  const calculateStats = (bookingsData) => {
    const stats = {
      total: bookingsData.length,
      pending: bookingsData.filter(b => b.status === 'pending').length,
      confirmed: bookingsData.filter(b => b.status === 'confirmed').length,
      completed: bookingsData.filter(b => b.status === 'completed').length,
      totalSpent: bookingsData.reduce((sum, b) => sum + (b.totalAmount || 0), 0)
    };
    setStats(stats);
  };

  // Get color for booking status badges
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffeaa7';
      case 'confirmed': return '#81ecec';
      case 'completed': return '#74b9ff';
      case 'cancelled': return '#fab1a0';
      default: return '#ddd';
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case 'pending': return '#d63031';
      case 'confirmed': return '#00b894';
      case 'completed': return '#0984e3';
      case 'cancelled': return '#e17055';
      default: return '#666';
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '60px 0' }}>
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 0' }}>
      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{
          color: 'var(--primary-black)',
          fontSize: '2.5rem',
          marginBottom: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '15px'
        }}>
          <User size={36} />
          Welcome, {user?.name}!
        </h1>
        <p style={{ color: 'var(--gray-dark)', fontSize: '1.1rem' }}>
          Manage your equipment rentals and view your booking history.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-4" style={{ marginBottom: '40px' }}>
        <div className="card" style={{ 
          textAlign: 'center', 
          backgroundColor: 'var(--primary-black)', 
          color: 'var(--pure-white)',
          border: 'none',
          boxShadow: '0 8px 20px var(--shadow-medium)'
        }}>
          <Package size={32} style={{ marginBottom: '10px' }} />
          <h3 style={{ fontSize: '2rem', marginBottom: '5px', color: 'var(--pure-white)' }}>{stats.total}</h3>
          <p style={{ color: 'var(--pure-white)', opacity: 0.9 }}>Total Bookings</p>
        </div>

        <div className="card" style={{ 
          textAlign: 'center', 
          backgroundColor: 'var(--warning-orange)', 
          color: 'var(--pure-white)',
          border: 'none',
          boxShadow: '0 8px 20px var(--shadow-medium)'
        }}>
          <Clock size={32} style={{ marginBottom: '10px' }} />
          <h3 style={{ fontSize: '2rem', marginBottom: '5px', color: 'var(--pure-white)' }}>{stats.pending}</h3>
          <p style={{ color: 'var(--pure-white)', opacity: 0.9 }}>Pending</p>
        </div>

        <div className="card" style={{ 
          textAlign: 'center', 
          backgroundColor: 'var(--success-green)', 
          color: 'var(--pure-white)',
          border: 'none',
          boxShadow: '0 8px 20px var(--shadow-medium)'
        }}>
          <CheckCircle size={32} style={{ marginBottom: '10px' }} />
          <h3 style={{ fontSize: '2rem', marginBottom: '5px', color: 'var(--pure-white)' }}>{stats.confirmed}</h3>
          <p style={{ color: 'var(--pure-white)', opacity: 0.9 }}>Confirmed</p>
        </div>

        <div className="card" style={{ 
          textAlign: 'center', 
          backgroundColor: 'var(--accent-blue)', 
          color: 'var(--pure-white)',
          border: 'none',
          boxShadow: '0 8px 20px var(--shadow-medium)'
        }}>
          <DollarSign size={32} style={{ marginBottom: '10px' }} />
          <h3 style={{ fontSize: '2rem', marginBottom: '5px', color: 'var(--pure-white)' }}>${stats.totalSpent}</h3>
          <p style={{ color: 'var(--pure-white)', opacity: 0.9 }}>Total Spent</p>
        </div>
      </div>

      {/* Bookings List */}
      <div className="card">
        <h2 style={{
          color: 'var(--primary-black)',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <Calendar size={24} />
          My Bookings
        </h2>

        {bookings.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--gray-light)' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid var(--gray-medium)' }}>
                    Equipment
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid var(--gray-medium)' }}>
                    Dates
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid var(--gray-medium)' }}>
                    Amount
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid var(--gray-medium)' }}>
                    Status
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid var(--gray-medium)' }}>
                    Booked On
                  </th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id} style={{ borderBottom: '1px solid var(--gray-light)' }}>
                    <td style={{ padding: '12px' }}>
                      <div>
                        <strong style={{ color: 'var(--primary-black)' }}>
                          {booking.equipmentId?.name || 'Equipment Not Found'}
                        </strong>
                        <br />
                        <small style={{ color: 'var(--gray-dark)' }}>
                          {booking.equipmentId?.model} • {booking.equipmentId?.location}
                        </small>
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontSize: '14px' }}>
                        <div><strong>From:</strong> {booking.startDate}</div>
                        <div><strong>To:</strong> {booking.endDate}</div>
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <strong style={{ color: 'var(--accent-brown)', fontSize: '16px' }}>
                        ${booking.totalAmount}
                      </strong>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '500',
                        textTransform: 'uppercase',
                        backgroundColor: getStatusColor(booking.status),
                        color: getStatusTextColor(booking.status)
                      }}>
                        {booking.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontSize: '14px', color: 'var(--gray-dark)' }}>
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: 'var(--gray-dark)'
          }}>
            <Calendar size={48} style={{ marginBottom: '20px', opacity: 0.5 }} />
            <h3 style={{ marginBottom: '10px' }}>No Bookings Yet</h3>
            <p style={{ marginBottom: '20px' }}>
              You haven't made any equipment bookings yet. Start by browsing available equipment.
            </p>
            <a href="/equipment" className="btn btn-primary">
              Browse Equipment
            </a>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ marginTop: '30px' }}>
        <h3 style={{ color: 'var(--primary-green)', marginBottom: '20px' }}>
          Quick Actions
        </h3>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <a href="/equipment" className="btn btn-primary">
            🚜 Browse Equipment
          </a>
          <a href="/equipment?category=Tractor" className="btn btn-outline">
            🚛 Find Tractors
          </a>
          <a href="/equipment?category=Harvester" className="btn btn-outline">
            🌾 Find Harvesters
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
