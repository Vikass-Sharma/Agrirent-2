import React, { useState, useEffect, useCallback } from 'react';
// import { useAuth } from '../contexts/AuthContext';
import { equipmentService, bookingService, userService } from '../services/api';
import { toast } from 'react-toastify';
import { 
  BarChart3, 
  Users, 
  Package, 
  Calendar, 
  DollarSign, 
  TrendingUp,
  Shield
} from 'lucide-react';

// Admin dashboard with platform overview and management tools
const AdminDashboard = () => {
  const [stats, setStats] = useState({ // Platform-wide statistics
    totalUsers: 0,
    totalEquipment: 0,
    totalBookings: 0,
    totalRevenue: 0,
    activeUsers: 0,
    availableEquipment: 0
  });
  const [users, setUsers] = useState([]); // All platform users
  const [equipment, setEquipment] = useState([]); // All equipment on platform
  const [bookings, setBookings] = useState([]); // All bookings on platform
  const [loading, setLoading] = useState(true); // Page loading state
  const [activeTab, setActiveTab] = useState('overview'); // Current tab view
  
  // Get comprehensive platform data from all endpoints
  const fetchAdminData = useCallback(async () => {
    try {
      const [usersData, equipmentData, bookingsData] = await Promise.all([
        userService.getAll(), // All users
        equipmentService.getAll(), // All equipment
        bookingService.getAll() // All bookings
      ]);
      
      setUsers(usersData);
      setEquipment(equipmentData);
      setBookings(bookingsData);
      calculateStats(usersData, equipmentData, bookingsData); // Generate platform stats
    } catch (error) {
      toast.error('Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array since function doesn't depend on any props/state

  // Fetch all platform data when component mounts
  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const calculateStats = (usersData, equipmentData, bookingsData) => {
    const stats = {
      totalUsers: usersData.length,
      totalEquipment: equipmentData.length,
      totalBookings: bookingsData.length,
      totalRevenue: bookingsData.reduce((sum, b) => sum + (b.totalAmount || 0), 0),
      activeUsers: usersData.filter(u => u.status === 'active').length,
      availableEquipment: equipmentData.filter(e => e.available > 0).length
    };
    setStats(stats);
  };

  const handleUserStatusChange = async (userId, newStatus) => {
    try {
      await userService.update(userId, { status: newStatus });
      toast.success(`User ${newStatus} successfully`);
      fetchAdminData();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#27ae60';
      case 'suspended': return '#e74c3c';
      case 'pending': return '#f39c12';
      case 'confirmed': return '#27ae60';
      case 'completed': return '#3498db';
      case 'cancelled': return '#e74c3c';
      default: return '#95a5a6';
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
          <Shield size={36} />
          Admin Dashboard
        </h1>
        <p style={{ color: 'var(--gray-dark)', fontSize: '1.1rem' }}>
          Manage users, equipment, and monitor platform analytics.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-4" style={{ marginBottom: '40px' }}>
        <div className="card" style={{ 
          textAlign: 'center', 
          backgroundColor: 'var(--accent-blue)', 
          color: 'var(--pure-white)',
          border: 'none',
          boxShadow: '0 8px 20px var(--shadow-medium)'
        }}>
          <Users size={32} style={{ marginBottom: '10px' }} />
          <h3 style={{ fontSize: '2rem', marginBottom: '5px', color: 'var(--pure-white)' }}>{stats.totalUsers}</h3>
          <p style={{ color: 'var(--pure-white)', opacity: 0.9 }}>Total Users</p>
          <small style={{ opacity: 0.8, color: 'var(--pure-white)' }}>{stats.activeUsers} active</small>
        </div>

        <div className="card" style={{ 
          textAlign: 'center', 
          backgroundColor: 'var(--success-green)', 
          color: 'var(--pure-white)',
          border: 'none',
          boxShadow: '0 8px 20px var(--shadow-medium)'
        }}>
          <Package size={32} style={{ marginBottom: '10px' }} />
          <h3 style={{ fontSize: '2rem', marginBottom: '5px', color: 'var(--pure-white)' }}>{stats.totalEquipment}</h3>
          <p style={{ color: 'var(--pure-white)', opacity: 0.9 }}>Total Equipment</p>
          <small style={{ opacity: 0.8, color: 'var(--pure-white)' }}>{stats.availableEquipment} available</small>
        </div>

        <div className="card" style={{ 
          textAlign: 'center', 
          backgroundColor: 'var(--warning-orange)', 
          color: 'var(--pure-white)',
          border: 'none',
          boxShadow: '0 8px 20px var(--shadow-medium)'
        }}>
          <Calendar size={32} style={{ marginBottom: '10px' }} />
          <h3 style={{ fontSize: '2rem', marginBottom: '5px', color: 'var(--pure-white)' }}>{stats.totalBookings}</h3>
          <p style={{ color: 'var(--pure-white)', opacity: 0.9 }}>Total Bookings</p>
        </div>

        <div className="card" style={{ 
          textAlign: 'center', 
          backgroundColor: 'var(--primary-black)', 
          color: 'var(--pure-white)',
          border: 'none',
          boxShadow: '0 8px 20px var(--shadow-medium)'
        }}>
          <DollarSign size={32} style={{ marginBottom: '10px' }} />
          <h3 style={{ fontSize: '2rem', marginBottom: '5px', color: 'var(--pure-white)' }}>${stats.totalRevenue}</h3>
          <p style={{ color: 'var(--pure-white)', opacity: 0.9 }}>Total Revenue</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: '5px',
        marginBottom: '30px',
        backgroundColor: 'white',
        padding: '5px',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'users', label: 'Users', icon: Users },
          { id: 'equipment', label: 'Equipment', icon: Package },
          { id: 'bookings', label: 'Bookings', icon: Calendar }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '12px 20px',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                backgroundColor: activeTab === tab.id ? 'var(--primary-black)' : 'transparent',
                color: activeTab === tab.id ? 'var(--pure-white)' : 'var(--gray-dark)',
                fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                transition: 'all 0.3s ease'
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div>
          {/* Platform Analytics */}
          <div className="card" style={{ marginBottom: '30px' }}>
            <h2 style={{
              color: 'var(--primary-green)',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <TrendingUp size={24} />
              Platform Analytics
            </h2>
            
            <div className="grid grid-3">
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📈</div>
                <h4 style={{ color: 'var(--primary-green)', marginBottom: '5px' }}>Growth Rate</h4>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-brown)' }}>
                  +{Math.round((stats.totalUsers / 100) * 100)}%
                </p>
                <small style={{ color: 'var(--gray-dark)' }}>User growth this month</small>
              </div>

              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⚡</div>
                <h4 style={{ color: 'var(--primary-green)', marginBottom: '5px' }}>Utilization Rate</h4>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-brown)' }}>
                  {Math.round((stats.totalBookings / stats.totalEquipment) * 100) || 0}%
                </p>
                <small style={{ color: 'var(--gray-dark)' }}>Equipment utilization</small>
              </div>

              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>💰</div>
                <h4 style={{ color: 'var(--primary-green)', marginBottom: '5px' }}>Avg. Revenue</h4>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-brown)' }}>
                  ${Math.round(stats.totalRevenue / stats.totalBookings) || 0}
                </p>
                <small style={{ color: 'var(--gray-dark)' }}>Per booking</small>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 style={{ color: 'var(--primary-green)', marginBottom: '20px' }}>Quick Actions</h3>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <button onClick={() => setActiveTab('users')} className="btn btn-primary">
                👥 Manage Users
              </button>
              <button onClick={() => setActiveTab('equipment')} className="btn btn-secondary">
                🚜 View Equipment
              </button>
              <button onClick={() => setActiveTab('bookings')} className="btn btn-outline">
                📅 Review Bookings
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="card">
          <h2 style={{
            color: 'var(--primary-green)',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <Users size={24} />
            User Management
          </h2>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--gray-light)' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid var(--gray-medium)' }}>
                    Name
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid var(--gray-medium)' }}>
                    Email
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid var(--gray-medium)' }}>
                    Role
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid var(--gray-medium)' }}>
                    Status
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid var(--gray-medium)' }}>
                    Joined
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid var(--gray-medium)' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((userItem) => (
                  <tr key={userItem._id} style={{ borderBottom: '1px solid var(--gray-light)' }}>
                    <td style={{ padding: '12px' }}>
                      <strong style={{ color: 'var(--primary-green)' }}>
                        {userItem.name}
                      </strong>
                    </td>
                    <td style={{ padding: '12px', fontSize: '14px', color: 'var(--gray-dark)' }}>
                      {userItem.email}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        textTransform: 'uppercase',
                        backgroundColor: userItem.role === 'admin' ? '#e74c3c' : userItem.role === 'owner' ? '#f39c12' : '#3498db',
                        color: 'white'
                      }}>
                        {userItem.role}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        textTransform: 'uppercase',
                        backgroundColor: userItem.status === 'active' ? '#27ae60' : '#e74c3c',
                        color: 'white'
                      }}>
                        {userItem.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontSize: '14px', color: 'var(--gray-dark)' }}>
                      {new Date(userItem.joinDate).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {userItem.role !== 'admin' && (
                        <button
                          onClick={() => handleUserStatusChange(
                            userItem._id, 
                            userItem.status === 'active' ? 'suspended' : 'active'
                          )}
                          style={{
                            padding: '6px 12px',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '500',
                            backgroundColor: userItem.status === 'active' ? '#e74c3c' : '#27ae60',
                            color: 'white'
                          }}
                        >
                          {userItem.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'equipment' && (
        <div className="card">
          <h2 style={{
            color: 'var(--primary-green)',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <Package size={24} />
            Equipment Overview
          </h2>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--gray-light)' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid var(--gray-medium)' }}>
                    Equipment
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid var(--gray-medium)' }}>
                    Category
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid var(--gray-medium)' }}>
                    Location
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid var(--gray-medium)' }}>
                    Price/Hour
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid var(--gray-medium)' }}>
                    Availability
                  </th>
                </tr>
              </thead>
              <tbody>
                {equipment.slice(0, 10).map((item) => (
                  <tr key={item._id} style={{ borderBottom: '1px solid var(--gray-light)' }}>
                    <td style={{ padding: '12px' }}>
                      <div>
                        <strong style={{ color: 'var(--primary-green)' }}>
                          {item.name}
                        </strong>
                        <br />
                        <small style={{ color: 'var(--gray-dark)' }}>
                          {item.model}
                        </small>
                      </div>
                    </td>
                    <td style={{ padding: '12px', fontSize: '14px', color: 'var(--gray-dark)' }}>
                      {item.category}
                    </td>
                    <td style={{ padding: '12px', fontSize: '14px', color: 'var(--gray-dark)' }}>
                      {item.location}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <strong style={{ color: 'var(--accent-brown)' }}>
                        ${item.pricePerHour}
                      </strong>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: item.available > 0 ? '#27ae60' : '#e74c3c',
                        color: 'white'
                      }}>
                        {item.available}/{item.quantity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'bookings' && (
        <div className="card">
          <h2 style={{
            color: 'var(--primary-green)',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <Calendar size={24} />
            Recent Bookings
          </h2>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--gray-light)' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid var(--gray-medium)' }}>
                    Equipment
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid var(--gray-medium)' }}>
                    User
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
                </tr>
              </thead>
              <tbody>
                {bookings.slice(0, 10).map((booking) => (
                  <tr key={booking._id} style={{ borderBottom: '1px solid var(--gray-light)' }}>
                    <td style={{ padding: '12px' }}>
                      <strong style={{ color: 'var(--primary-green)' }}>
                        {booking.equipmentId?.name || 'Equipment Not Found'}
                      </strong>
                    </td>
                    <td style={{ padding: '12px', fontSize: '14px', color: 'var(--gray-dark)' }}>
                      User #{booking.userId}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontSize: '14px' }}>
                        <div>{booking.startDate}</div>
                        <div>{booking.endDate}</div>
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
                        color: 'white'
                      }}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
