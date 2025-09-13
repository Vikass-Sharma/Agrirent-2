import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { equipmentService, bookingService } from '../services/api';
import { toast } from 'react-toastify';
import EquipmentCard from '../components/EquipmentCard';
import BookingCard from '../components/BookingCard';
import { Plus, Settings, Package, Calendar, DollarSign, TrendingUp } from 'lucide-react';

// Equipment owner dashboard for managing inventory and bookings
const OwnerDashboard = () => {
  const [equipment, setEquipment] = useState([]); // Owner's equipment list
  const [bookings, setBookings] = useState([]); // Bookings for owner's equipment
  const [loading, setLoading] = useState(true); // Page loading state
  const [showAddForm, setShowAddForm] = useState(false); // Show add equipment form
  const [editingEquipment, setEditingEquipment] = useState(null); // Equipment being edited
  const [stats, setStats] = useState({ // Owner business statistics
    totalEquipment: 0,
    totalBookings: 0,
    totalEarnings: 0,
    availableEquipment: 0
  });
  
  const { user } = useAuth(); // Current logged-in owner

  // Get all data belonging to this owner
  const fetchOwnerData = useCallback(async () => {
    try {
      const [equipmentData, bookingsData] = await Promise.all([
        equipmentService.getAll({ owner: user?.id }), // Only owner's equipment
        bookingService.getAll({ owner: user?.id }) // Only bookings for owner's equipment
      ]);
      
      setEquipment(equipmentData);
      setBookings(bookingsData);
      calculateStats(equipmentData, bookingsData); // Update business stats
    } catch (error) {
      toast.error('Failed to fetch owner data');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Fetch owner's equipment and bookings when component mounts
  useEffect(() => {
    fetchOwnerData();
  }, [fetchOwnerData]);

  // Calculate business statistics from equipment and booking data
  const calculateStats = (equipmentData, bookingsData) => {
    const stats = {
      totalEquipment: equipmentData.length,
      totalBookings: bookingsData.length,
      totalEarnings: bookingsData.reduce((sum, b) => sum + (b.totalAmount || 0), 0),
      availableEquipment: equipmentData.filter(e => e.available > 0).length
    };
    setStats(stats);
  };

  const handleAddEquipment = () => {
    setEditingEquipment(null);
    setShowAddForm(true);
  };

  const handleEditEquipment = (equipmentItem) => {
    setEditingEquipment(equipmentItem);
    setShowAddForm(true);
  };

  const handleDeleteEquipment = async (equipmentItem) => {
    if (window.confirm(`Are you sure you want to delete "${equipmentItem.name}"?`)) {
      try {
        await equipmentService.delete(equipmentItem._id, user?.id);
        toast.success('Equipment deleted successfully');
        fetchOwnerData();
      } catch (error) {
        toast.error('Failed to delete equipment');
      }
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
          <Settings size={36} />
          Owner Dashboard
        </h1>
        <p style={{ color: 'var(--gray-dark)', fontSize: '1.1rem' }}>
          Manage your equipment inventory and track rental bookings.
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
          <h3 style={{ fontSize: '2rem', marginBottom: '5px', color: 'var(--pure-white)' }}>{stats.totalEquipment}</h3>
          <p style={{ color: 'var(--pure-white)', opacity: 0.9 }}>Total Equipment</p>
        </div>

        <div className="card" style={{ 
          textAlign: 'center', 
          backgroundColor: 'var(--success-green)', 
          color: 'var(--pure-white)',
          border: 'none',
          boxShadow: '0 8px 20px var(--shadow-medium)'
        }}>
          <TrendingUp size={32} style={{ marginBottom: '10px' }} />
          <h3 style={{ fontSize: '2rem', marginBottom: '5px', color: 'var(--pure-white)' }}>{stats.availableEquipment}</h3>
          <p style={{ color: 'var(--pure-white)', opacity: 0.9 }}>Available</p>
        </div>

        <div className="card" style={{ 
          textAlign: 'center', 
          backgroundColor: 'var(--accent-blue)', 
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
          backgroundColor: 'var(--warning-orange)', 
          color: 'var(--pure-white)',
          border: 'none',
          boxShadow: '0 8px 20px var(--shadow-medium)'
        }}>
          <DollarSign size={32} style={{ marginBottom: '10px' }} />
          <h3 style={{ fontSize: '2rem', marginBottom: '5px', color: 'var(--pure-white)' }}>${stats.totalEarnings}</h3>
          <p style={{ color: 'var(--pure-white)', opacity: 0.9 }}>Total Earnings</p>
        </div>
      </div>

      {/* Equipment Management */}
      <div className="card" style={{ marginBottom: '30px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '25px'
        }}>
          <h2 style={{
            color: 'var(--primary-black)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <Package size={24} />
            My Equipment
          </h2>
          <button
            onClick={handleAddEquipment}
            className="btn btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Plus size={16} />
            Add Equipment
          </button>
        </div>

        {equipment.length > 0 ? (
          <div className="grid grid-3">
            {equipment.map((item) => (
              <EquipmentCard
                key={item._id}
                equipment={item}
                showActions={true}
                userRole="owner"
                onEdit={handleEditEquipment}
                onDelete={handleDeleteEquipment}
              />
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: 'var(--gray-dark)'
          }}>
            <Package size={48} style={{ marginBottom: '20px', opacity: 0.5 }} />
            <h3 style={{ marginBottom: '10px' }}>No Equipment Listed</h3>
            <p style={{ marginBottom: '20px' }}>
              Start earning by listing your agricultural equipment for rent.
            </p>
            <button onClick={handleAddEquipment} className="btn btn-primary">
              Add Your First Equipment
            </button>
          </div>
        )}
      </div>

      {/* Recent Bookings */}
      <div className="card">
        <h2 style={{
          color: 'var(--primary-black)',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <Calendar size={24} />
          Recent Bookings
        </h2>

        {bookings.length > 0 ? (
          <div className="grid grid-2">
            {bookings.slice(0, 10).map((booking) => (
              <BookingCard
                key={booking._id}
                booking={booking}
                onStatusUpdate={fetchOwnerData}
              />
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: 'var(--gray-dark)'
          }}>
            <Calendar size={48} style={{ marginBottom: '20px', opacity: 0.5 }} />
            <h3 style={{ marginBottom: '10px' }}>No Bookings Yet</h3>
            <p>
              Once you list equipment, rental bookings will appear here.
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Equipment Form Modal */}
      {showAddForm && (
        <EquipmentFormModal
          equipment={editingEquipment}
          isOpen={showAddForm}
          onClose={() => {
            setShowAddForm(false);
            setEditingEquipment(null);
          }}
          onSuccess={() => {
            setShowAddForm(false);
            setEditingEquipment(null);
            fetchOwnerData();
          }}
          ownerId={user?.id}
        />
      )}
    </div>
  );
};

// Equipment Form Modal Component
const EquipmentFormModal = ({ equipment, isOpen, onClose, onSuccess, ownerId }) => {
  const [formData, setFormData] = useState({
    name: '',
    model: '',
    image: '',
    pricePerHour: '',
    description: '',
    quantity: '',
    available: '',
    category: '',
    location: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (equipment) {
      setFormData({
        name: equipment.name || '',
        model: equipment.model || '',
        image: equipment.image || '',
        pricePerHour: equipment.pricePerHour || '',
        description: equipment.description || '',
        quantity: equipment.quantity || '',
        available: equipment.available || '',
        category: equipment.category || '',
        location: equipment.location || ''
      });
    }
  }, [equipment]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        pricePerHour: parseFloat(formData.pricePerHour),
        quantity: parseInt(formData.quantity),
        available: parseInt(formData.available),
        owner: ownerId
      };

      if (equipment) {
        await equipmentService.update(equipment._id, submitData);
        toast.success('Equipment updated successfully');
      } else {
        await equipmentService.create(submitData);
        toast.success('Equipment added successfully');
      }
      
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save equipment');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '10px',
        padding: '30px',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <h2 style={{ marginBottom: '20px', color: 'var(--primary-green)' }}>
          {equipment ? 'Edit Equipment' : 'Add New Equipment'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Equipment Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Model</label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="">Select Category</option>
                <option value="Tractor">Tractor</option>
                <option value="Harvester">Harvester</option>
                <option value="Planter">Planter</option>
                <option value="Cultivator">Cultivator</option>
                <option value="Sprayer">Sprayer</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Price per Hour ($)</label>
              <input
                type="number"
                name="pricePerHour"
                value={formData.pricePerHour}
                onChange={handleChange}
                className="form-input"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Total Quantity</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className="form-input"
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Available Quantity</label>
              <input
                type="number"
                name="available"
                value={formData.available}
                onChange={handleChange}
                className="form-input"
                min="0"
                max={formData.quantity}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Image URL</label>
            <input
              type="url"
              name="image"
              value={formData.image}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-input"
              rows="3"
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '15px', marginTop: '25px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 1 }}
              disabled={loading}
            >
              {loading ? 'Saving...' : equipment ? 'Update Equipment' : 'Add Equipment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OwnerDashboard;
