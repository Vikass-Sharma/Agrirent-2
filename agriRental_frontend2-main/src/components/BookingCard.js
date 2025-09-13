import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle, Calendar, Trash2 } from 'lucide-react';
import { bookingService } from '../services/api';
import { toast } from 'react-toastify';
 
// Enhanced card component for displaying bookings with individual date support
const BookingCard = ({ booking, onStatusUpdate }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [showCancelDates, setShowCancelDates] = useState(false);
  const [selectedCancelDates, setSelectedCancelDates] = useState([]);

  // Accept a pending booking (owner action)
  const handleAccept = async () => {
    try {
      console.log('Accepting booking with owner ID:', user.id);
      const result = await bookingService.accept(booking._id, user.id);
      toast.success('Booking accepted successfully!');
      console.log('Accept result:', result);
      onStatusUpdate();
    } catch (error) {
      toast.error('Failed to accept booking');
      console.error('Error accepting booking:', error);
    }
  };

  // Reject a pending booking (owner action)
  const handleReject = async () => {
    try {
      console.log('Rejecting booking with owner ID:', user.id);
      const result = await bookingService.reject(booking._id, user.id);
      console.log('Reject result:', result);
      toast.success('Booking rejected');
      onStatusUpdate();
    } catch (error) {
      console.error('Error rejecting booking:', error);
      toast.error(`Failed to reject booking: ${error.response?.data?.message || error.message}`);
    }
  };

  // Mark confirmed booking as completed (owner action)
  const handleComplete = async () => {
    try {
      console.log('Completing booking with owner ID:', user.id);
      const result = await bookingService.complete(booking._id, user.id);
      toast.success('Booking marked as completed!');
      console.log('Complete result:', result);
      onStatusUpdate();
    } catch (error) {
      toast.error('Failed to complete booking');
      console.error('Error completing booking:', error);
    }
  };

  // NEW: Cancel specific dates from booking
  const handleCancelSpecificDates = async () => {
    if (selectedCancelDates.length === 0) {
      toast.warning('Please select dates to cancel');
      return;
    }

    try {
      const result = await bookingService.cancelSpecificDates(
        booking._id, 
        selectedCancelDates, 
        user.id
      );
      
      if (result.remainingDates.length === 0) {
        toast.success('Entire booking cancelled');
      } else {
        toast.success(`Cancelled ${selectedCancelDates.length} dates. ${result.remainingDates.length} dates remaining.`);
      }
      
      setShowCancelDates(false);
      setSelectedCancelDates([]);
      onStatusUpdate();
    } catch (error) {
      toast.error(`Failed to cancel dates: ${error.response?.data?.message || error.message}`);
      console.error('Error cancelling specific dates:', error);
    }
  };

  // Get appropriate icon based on booking status
  const getStatusIcon = () => {
    switch (booking.status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-gray-500" />;
      case 'payment_hold':
        return <Clock className="w-5 h-5 text-orange-500" />;
      case 'payment_failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (booking.status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      case 'payment_hold':
        return 'bg-orange-100 text-orange-800';
      case 'payment_failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get booking dates (individual or range)
  const getBookingDates = () => {
    if (booking.selectedDates && booking.selectedDates.length > 0) {
      // Individual dates format
      return {
        type: 'individual',
        dates: booking.selectedDates,
        display: booking.selectedDates.length > 3 
          ? `${booking.selectedDates.slice(0, 3).map(formatDate).join(', ')} +${booking.selectedDates.length - 3} more`
          : booking.selectedDates.map(formatDate).join(', ')
      };
    } else {
      // Traditional range format
      return {
        type: 'range',
        dates: [booking.startDate, booking.endDate],
        display: `${formatDate(booking.startDate)} - ${formatDate(booking.endDate)}`
      };
    }
  };

  const bookingDates = getBookingDates();

  return (
    <div className="booking-card">
      <div className="booking-header">
        <div className="booking-info">
          <h4>{booking.equipmentId?.name || 'Equipment'}</h4>
          
          {/* Enhanced date display */}
          <div className="booking-dates">
            <Calendar size={16} style={{ marginRight: '5px' }} />
            <span>{bookingDates.display}</span>
            {bookingDates.type === 'individual' && (
              <span style={{ 
                marginLeft: '8px', 
                fontSize: '12px', 
                backgroundColor: 'var(--primary-green)', 
                color: 'white', 
                padding: '2px 6px', 
                borderRadius: '10px' 
              }}>
                {booking.selectedDates.length} days
              </span>
            )}
          </div>

          <p className="booking-amount">₹{booking.totalAmount}</p>
        </div>
        <div className="booking-status">
          <div className={`status-badge ${getStatusColor()}`}>
            {getStatusIcon()}
            <span>{booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</span>
          </div>
        </div>
      </div>

      <div className="booking-customer">
        <p><strong>Customer:</strong> {booking.userId?.name || 'N/A'}</p>
        <p><strong>Email:</strong> {booking.userId?.email || 'N/A'}</p>
        <p><strong>Phone:</strong> {booking.userId?.phone || 'N/A'}</p>
      </div>

      {/* Individual dates detail (expandable) */}
      {bookingDates.type === 'individual' && booking.selectedDates.length > 3 && (
        <details style={{ marginBottom: '15px' }}>
          <summary style={{ cursor: 'pointer', color: 'var(--primary-green)' }}>
            View all {booking.selectedDates.length} selected dates
          </summary>
          <div style={{ 
            marginTop: '10px', 
            padding: '10px', 
            backgroundColor: 'var(--gray-light)', 
            borderRadius: '5px',
            fontSize: '14px'
          }}>
            {booking.selectedDates.map(formatDate).join(', ')}
          </div>
        </details>
      )}

      {/* Cancel specific dates section */}
      {showCancelDates && bookingDates.type === 'individual' && ['pending', 'confirmed'].includes(booking.status) && (
        <div style={{
          marginBottom: '15px',
          padding: '15px',
          backgroundColor: '#fff3cd',
          borderRadius: '5px',
          border: '1px solid #ffeaa7'
        }}>
          <h5 style={{ marginBottom: '10px' }}>Select dates to cancel:</h5>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
            {booking.selectedDates.map(date => (
              <label key={date} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer',
                padding: '5px 8px',
                backgroundColor: selectedCancelDates.includes(date) ? '#e17055' : 'white',
                color: selectedCancelDates.includes(date) ? 'white' : 'black',
                borderRadius: '3px',
                fontSize: '12px'
              }}>
                <input
                  type="checkbox"
                  checked={selectedCancelDates.includes(date)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedCancelDates([...selectedCancelDates, date]);
                    } else {
                      setSelectedCancelDates(selectedCancelDates.filter(d => d !== date));
                    }
                  }}
                  style={{ marginRight: '5px' }}
                />
                {formatDate(date)}
              </label>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              className="btn btn-danger" 
              onClick={handleCancelSpecificDates}
              style={{ fontSize: '12px', padding: '5px 10px' }}
            >
              Cancel Selected ({selectedCancelDates.length})
            </button>
            <button 
              className="btn btn-outline" 
              onClick={() => {
                setShowCancelDates(false);
                setSelectedCancelDates([]);
              }}
              style={{ fontSize: '12px', padding: '5px 10px' }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="booking-actions">
        {/* Owner actions for pending bookings */}
        {booking.status === 'pending' && user.role === 'owner' && (
          <>
            <button className="btn btn-success" onClick={handleAccept}>
              <CheckCircle className="w-4 h-4" />
              Accept
            </button>
            <button className="btn btn-danger" onClick={handleReject}>
              <XCircle className="w-4 h-4" />
              Reject
            </button>
          </>
        )}

        {/* Owner actions for confirmed bookings */}
        {booking.status === 'confirmed' && user.role === 'owner' && (
          <button className="btn btn-primary" onClick={handleComplete}>
            <CheckCircle className="w-4 h-4" />
            Mark Complete
          </button>
        )}

        {/* User actions for their own bookings */}
        {booking.userId === user.id && ['pending', 'confirmed'].includes(booking.status) && (
          <>
            {bookingDates.type === 'individual' && booking.selectedDates.length > 1 && (
              <button 
                className="btn btn-warning" 
                onClick={() => setShowCancelDates(!showCancelDates)}
                style={{ fontSize: '12px' }}
              >
                <Trash2 className="w-4 h-4" />
                Cancel Dates
              </button>
            )}
          </>
        )}

        {/* Status display for completed/rejected bookings */}
        {(booking.status === 'completed' || booking.status === 'rejected') && (
          <span className="action-completed">
            {booking.status === 'completed' ? 'Rental Completed' : 'Booking Rejected'}
          </span>
        )}
      </div>
    </div>
  );
};

export default BookingCard;
