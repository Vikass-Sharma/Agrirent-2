import React from 'react';
import { MapPin, Clock, DollarSign } from 'lucide-react';

// Card component for displaying equipment details with optional booking/management actions
const EquipmentCard = ({ equipment, onBook, onEdit, onDelete, showActions = false, userRole }) => {
  // Trigger booking modal for this equipment
  const handleBookClick = () => {
    onBook && onBook(equipment);
  };

  // Trigger edit form for equipment owner
  const handleEditClick = () => {
    onEdit && onEdit(equipment);
  };

  // Trigger delete confirmation for equipment owner
  const handleDeleteClick = () => {
    onDelete && onDelete(equipment);
  };

  return (
    <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Equipment Image */}
      <div style={{
        width: '100%',
        height: '200px',
        backgroundImage: `url(${equipment.image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderRadius: '8px',
        marginBottom: '15px',
        position: 'relative'
      }}>
        {/* Category Badge */}
        <span style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          backgroundColor: 'var(--primary-green)',
          color: 'white',
          padding: '5px 10px',
          borderRadius: '15px',
          fontSize: '12px',
          fontWeight: '500'
        }}>
          {equipment.category}
        </span>

        {/* Availability Badge */}
        <span style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          backgroundColor: equipment.available > 0 ? '#28a745' : '#dc3545',
          color: 'white',
          padding: '5px 10px',
          borderRadius: '15px',
          fontSize: '12px',
          fontWeight: '500'
        }}>
          {equipment.available > 0 ? `${equipment.available} Available` : 'Unavailable'}
        </span>
      </div>

      {/* Equipment Info */}
      <h3 style={{ 
        marginBottom: '10px', 
        color: 'var(--primary-green)',
        fontSize: '1.2rem',
        fontWeight: '600'
      }}>
        {equipment.name}
      </h3>

      <p style={{ 
        color: 'var(--gray-dark)', 
        marginBottom: '5px',
        fontSize: '14px'
      }}>
        <strong>Model:</strong> {equipment.model}
      </p>

      <p style={{ 
        color: 'var(--gray-dark)', 
        marginBottom: '15px',
        fontSize: '14px',
        lineHeight: '1.4'
      }}>
        {equipment.description.length > 100 
          ? `${equipment.description.substring(0, 100)}...` 
          : equipment.description
        }
      </p>

      {/* Equipment Details */}
      <div style={{ marginBottom: '15px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '5px', 
          marginBottom: '8px',
          fontSize: '14px',
          color: 'var(--gray-dark)'
        }}>
          <DollarSign size={16} color="var(--accent-brown)" />
          <span><strong>${equipment.pricePerHour}/hour</strong></span>
        </div>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '5px', 
          marginBottom: '8px',
          fontSize: '14px',
          color: 'var(--gray-dark)'
        }}>
          <MapPin size={16} color="var(--accent-brown)" />
          <span>{equipment.location}</span>
        </div>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '5px',
          fontSize: '14px',
          color: 'var(--gray-dark)'
        }}>
          <Clock size={16} color="var(--accent-brown)" />
          <span>{equipment.quantity} total units</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ 
        display: 'flex', 
        gap: '10px',
        marginTop: 'auto'
      }}>
        {!showActions ? (
          <button 
            onClick={handleBookClick}
            className="btn btn-primary"
            style={{ 
              flex: 1,
              disabled: equipment.available <= 0
            }}
            disabled={equipment.available <= 0}
          >
            {equipment.available > 0 ? 'Book Now' : 'Unavailable'}
          </button>
        ) : (
          <>
            {userRole === 'owner' && (
              <>
                <button 
                  onClick={handleEditClick}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Edit
                </button>
                <button 
                  onClick={handleDeleteClick}
                  className="btn btn-danger"
                  style={{ flex: 1 }}
                >
                  Delete
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EquipmentCard;
