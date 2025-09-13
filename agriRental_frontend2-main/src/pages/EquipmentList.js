import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { equipmentService } from '../services/api';
import { toast } from 'react-toastify';
import EquipmentCard from '../components/EquipmentCard';
import SearchBar from '../components/SearchBar';
import BookingModal from '../components/BookingModal';
import { Grid, AlertCircle } from 'lucide-react';

const EquipmentList = () => {
  const [equipment, setEquipment] = useState([]);
  const [filteredEquipment, setFilteredEquipment] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    fetchEquipment();
    fetchCategories();
    fetchLocations();
  }, []);

  const fetchEquipment = async () => {
    try {
      const data = await equipmentService.getAll();
      setEquipment(data);
      setFilteredEquipment(data);
    } catch (error) {
      toast.error('Failed to fetch equipment');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await equipmentService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories');
    }
  };

  const fetchLocations = async () => {
    try {
      const data = await equipmentService.getLocations();
      setLocations(data);
    } catch (error) {
      console.error('Failed to fetch locations');
    }
  };

  const handleSearch = (filters) => {
    let filtered = equipment;

    // Search by name/model
    if (filters.search) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.model.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Filter by category
    if (filters.category) {
      filtered = filtered.filter(item => item.category === filters.category);
    }

    // Filter by location
    if (filters.location) {
      filtered = filtered.filter(item =>
        item.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    setFilteredEquipment(filtered);
  };

  const handleBookEquipment = (equipmentItem) => {
    if (!isAuthenticated) {
      toast.error('Please login to book equipment');
      return;
    }
    setSelectedEquipment(equipmentItem);
    setShowBookingModal(true);
  };

  const handleCloseBookingModal = () => {
    setShowBookingModal(false);
    setSelectedEquipment(null);
    // Refresh equipment list to update availability
    fetchEquipment();
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
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{
          color: 'var(--primary-green)',
          fontSize: '2.5rem',
          marginBottom: '15px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '15px'
        }}>
          <Grid size={36} />
          Browse Equipment
        </h1>
        <p style={{
          color: 'var(--gray-dark)',
          fontSize: '1.1rem',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          Find the perfect agricultural equipment for your farming needs. 
          Filter by category, location, or search by name.
        </p>
      </div>

      {/* Search and Filters */}
      <SearchBar
        onSearch={handleSearch}
        categories={categories}
        locations={locations}
      />

      {/* Results Summary */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        padding: '15px 20px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
      }}>
        <div>
          <span style={{ fontWeight: 'bold', color: 'var(--primary-green)' }}>
            {filteredEquipment.length}
          </span>
          <span style={{ color: 'var(--gray-dark)', marginLeft: '5px' }}>
            equipment available
          </span>
        </div>
        <div style={{ fontSize: '14px', color: 'var(--gray-dark)' }}>
          Showing results from {categories.length} categories across {locations.length} locations
        </div>
      </div>

      {/* Equipment Grid */}
      {filteredEquipment.length > 0 ? (
        <div className="grid grid-3">
          {filteredEquipment.map((item) => (
            <EquipmentCard
              key={item._id}
              equipment={item}
              onBook={handleBookEquipment}
            />
          ))}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          backgroundColor: 'white',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <AlertCircle size={48} color="var(--gray-medium)" style={{ marginBottom: '20px' }} />
          <h3 style={{ color: 'var(--gray-dark)', marginBottom: '10px' }}>
            No Equipment Found
          </h3>
          <p style={{ color: 'var(--gray-dark)', marginBottom: '20px' }}>
            No equipment matches your current search criteria. Try adjusting your filters or search terms.
          </p>
          <button
            onClick={() => handleSearch({ search: '', category: '', location: '' })}
            className="btn btn-primary"
          >
            Show All Equipment
          </button>
        </div>
      )}

      {/* Equipment Stats */}
      {equipment.length > 0 && (
        <div style={{
          marginTop: '60px',
          padding: '40px',
          backgroundColor: 'var(--gray-light)',
          borderRadius: '15px',
          textAlign: 'center'
        }}>
          <h3 style={{ marginBottom: '30px', color: 'var(--primary-green)' }}>
            Equipment Statistics
          </h3>
          <div className="grid grid-4">
            <div>
              <div style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: 'var(--primary-green)',
                marginBottom: '5px'
              }}>
                {equipment.length}
              </div>
              <p style={{ color: 'var(--gray-dark)' }}>Total Equipment</p>
            </div>
            <div>
              <div style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: 'var(--accent-brown)',
                marginBottom: '5px'
              }}>
                {equipment.filter(item => item.available > 0).length}
              </div>
              <p style={{ color: 'var(--gray-dark)' }}>Available Now</p>
            </div>
            <div>
              <div style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: 'var(--primary-green)',
                marginBottom: '5px'
              }}>
                {categories.length}
              </div>
              <p style={{ color: 'var(--gray-dark)' }}>Categories</p>
            </div>
            <div>
              <div style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: 'var(--accent-brown)',
                marginBottom: '5px'
              }}>
                {locations.length}
              </div>
              <p style={{ color: 'var(--gray-dark)' }}>Locations</p>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      <BookingModal
        equipment={selectedEquipment}
        isOpen={showBookingModal}
        onClose={handleCloseBookingModal}
        userId={user?.id}
      />
    </div>
  );
};

export default EquipmentList;
