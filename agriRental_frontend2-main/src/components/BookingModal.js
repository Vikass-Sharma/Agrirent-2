import React, { useState } from 'react';
import { X, Calendar, DollarSign, User, Check, Ban } from 'lucide-react';
import { bookingService, equipmentService } from '../services/api';
import { toast } from 'react-toastify';
import PaymentModal from './PaymentModal';
 
// Enhanced modal for creating bookings with individual date selection support
const BookingModal = ({ equipment, isOpen, onClose, userId }) => {
  const [bookingMode, setBookingMode] = useState('range'); // 'range' or 'individual'
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    selectedDates: [], // NEW: Array of individually selected dates
    totalAmount: 0
  });
  const [loading, setLoading] = useState(false);
  const [availability, setAvailability] = useState(null); // Store availability check results
  const [showPayment, setShowPayment] = useState(false);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [unavailableDates, setUnavailableDates] = useState([]); // Store unavailable dates

  // Auto-calculate total cost when dates change
  React.useEffect(() => {
    if (equipment) {
      if (bookingMode === 'range' && formData.startDate && formData.endDate) {
        // Traditional range calculation
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Include both start and end dates
        const totalHours = diffDays * 24;
        
        setFormData(prev => ({
          ...prev,
          totalAmount: totalHours * equipment.pricePerHour
        }));
      } else if (bookingMode === 'individual' && formData.selectedDates.length > 0) {
        // Individual dates calculation (24 hours per selected date)
        const totalHours = formData.selectedDates.length * 24;
        setFormData(prev => ({
          ...prev,
          totalAmount: totalHours * equipment.pricePerHour
        }));
      }
    }
  }, [formData.startDate, formData.endDate, formData.selectedDates, equipment, bookingMode]);

  // Fetch unavailable dates when modal opens or equipment changes
  React.useEffect(() => {
    const fetchUnavailableDates = async () => {
      if (equipment && isOpen) {
        try {
          const response = await equipmentService.getUnavailableDates(equipment._id);
          setUnavailableDates(response.unavailableDates || []);
        } catch (error) {
          console.error('Error fetching unavailable dates:', error);
          setUnavailableDates([]);
        }
      }
    };

    fetchUnavailableDates();
  }, [equipment, isOpen]);

  // Check availability before booking
  const checkAvailability = async () => {
    if (!equipment) return;

    try {
      let availabilityData;
      
      if (bookingMode === 'range' && formData.startDate && formData.endDate) {
        availabilityData = await bookingService.checkAvailability(equipment._id, {
          startDate: formData.startDate,
          endDate: formData.endDate
        });
      } else if (bookingMode === 'individual' && formData.selectedDates.length > 0) {
        availabilityData = await bookingService.checkAvailability(equipment._id, {
          selectedDates: formData.selectedDates
        });
      }

      setAvailability(availabilityData);
      
      if (!availabilityData?.available) {
        toast.warning('Some dates are not available. Please check the availability details.');
      }
    } catch (error) {
      console.error('Error checking availability:', error);
      toast.error('Failed to check availability');
    }
  };

  // Submit booking request to backend (creates payment hold)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ========== VALIDATION: 15 DAY LIMIT ==========
      const today = new Date();
      const maxDate = new Date(today);
      maxDate.setDate(today.getDate() + 15); // 15 days from today
      
      let totalDays = 0;
      let invalidDates = [];
      
      if (bookingMode === 'range') {
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        
        // Check if end date is beyond 15 days
        if (end > maxDate) {
          toast.error(`Booking dates must be within 15 days from today. Latest allowed date: ${maxDate.toLocaleDateString()}`);
          setLoading(false);
          return;
        }
      } else {
        totalDays = formData.selectedDates.length;
        
        // Check each selected date is within 15 days
        formData.selectedDates.forEach(dateStr => {
          const selectedDate = new Date(dateStr);
          if (selectedDate > maxDate) {
            invalidDates.push(dateStr);
          }
        });
        
        if (invalidDates.length > 0) {
          toast.error(`Some selected dates are beyond 15-day limit: ${invalidDates.join(', ')}. Latest allowed: ${maxDate.toLocaleDateString()}`);
          setLoading(false);
          return;
        }
      }

      if (totalDays > 15) {
        toast.error(`Maximum booking period is 15 days. You selected ${totalDays} days.`);
        setLoading(false);
        return;
      }

      let bookingData = {
        userId: userId,
        equipmentId: equipment._id,
        totalAmount: formData.totalAmount
      };

      // Add date information based on booking mode
      if (bookingMode === 'range') {
        bookingData.startDate = formData.startDate;
        bookingData.endDate = formData.endDate;
      } else {
        bookingData.selectedDates = formData.selectedDates;
      }
 
      // Create payment hold instead of direct booking
      const result = await bookingService.createPaymentHold(bookingData);
      toast.success('Equipment reserved for 10 minutes. Complete payment to confirm booking.');
      
      // Store the booking and show payment modal
      console.log('BookingModal - createPaymentHold result:', result);
      setCurrentBooking(result.booking); // Extract booking from result
      setShowPayment(true);
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reserve equipment');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentComplete = (completedBooking) => {
    // Reset form for next use
    setFormData({
      startDate: '',
      endDate: '',
      selectedDates: [],
      totalAmount: 0
    });
    setAvailability(null);
    setCurrentBooking(null);
    setShowPayment(false);
    onClose();
  };

  const handlePaymentClose = () => {
    setShowPayment(false);
    setCurrentBooking(null);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setAvailability(null); // Reset availability when dates change
  };

  // Handle individual date selection
  const handleDateClick = (date) => {
    if (bookingMode !== 'individual') return;

    const dateStr = date;
    
    // Check if date is unavailable (booked or on hold)
    if (unavailableDates.includes(dateStr)) {
      toast.error('This date is already booked or on hold');
      return;
    }
    
    const currentDates = [...formData.selectedDates];
    
    if (currentDates.includes(dateStr)) {
      // Remove date if already selected
      setFormData({
        ...formData,
        selectedDates: currentDates.filter(d => d !== dateStr)
      });
    } else {
      // Check 15-day count limit before adding
      if (currentDates.length >= 15) {
        toast.warning('Maximum 15 days can be selected for booking');
        return;
      }
      
      // Check if date is within 15-day window from today
      const today = new Date();
      const maxDate = new Date(today);
      maxDate.setDate(today.getDate() + 15);
      const selectedDate = new Date(dateStr);
      
      if (selectedDate > maxDate) {
        toast.warning(`Date must be within 15 days from today. Latest allowed: ${maxDate.toLocaleDateString()}`);
        return;
      }
      
      // Add date if not selected and within limits
      setFormData({
        ...formData,
        selectedDates: [...currentDates, dateStr].sort()
      });
    }
    setAvailability(null); // Reset availability when dates change
  };

  // Generate calendar for individual date selection
  const generateCalendar = () => {
    const today = new Date();
    const calendar = [];
    
    // Generate only next 15 days for selection (within booking window)
    for (let i = 0; i < 15; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Check if date is unavailable (booked or on hold)
      const isUnavailable = unavailableDates.includes(dateStr);
      
      calendar.push({
        date: dateStr,
        day: date.getDate(),
        month: date.getMonth(),
        year: date.getFullYear(),
        isSelected: formData.selectedDates.includes(dateStr),
        isAvailable: !isUnavailable, // Available if not in unavailable list
        isWithinWindow: true // All dates are within window now
      });
    }
    
    return calendar;
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
        overflow: 'auto',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--gray-dark)'
          }}
        >
          <X size={24} />
        </button>

        {/* Header */}
        <h2 style={{ 
          marginBottom: '20px', 
          color: 'var(--primary-green)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <Calendar size={24} />
          Book Equipment
        </h2>

        {/* Equipment Info */}
        <div style={{
          backgroundColor: 'var(--gray-light)',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '25px'
        }}>
          <h3 style={{ marginBottom: '10px', color: 'var(--primary-green)' }}>
            {equipment?.name}
          </h3>
          <p style={{ color: 'var(--gray-dark)', marginBottom: '10px' }}>
            <strong>Model:</strong> {equipment?.model}
          </p>
          <p style={{ color: 'var(--gray-dark)', marginBottom: '10px' }}>
            <strong>Location:</strong> {equipment?.location}
          </p>
          <p style={{ 
            color: 'var(--accent-brown)', 
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <DollarSign size={16} />
            ${equipment?.pricePerHour}/hour
          </p>
        </div>

        {/* Booking Mode Selection */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
            Booking Mode:
          </label>
          <div style={{ display: 'flex', gap: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                value="range"
                checked={bookingMode === 'range'}
                onChange={(e) => setBookingMode(e.target.value)}
                style={{ marginRight: '8px' }}
              />
              Date Range
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                value="individual"
                checked={bookingMode === 'individual'}
                onChange={(e) => setBookingMode(e.target.value)}
                style={{ marginRight: '8px' }}
              />
              Individual Dates
            </label>
          </div>
        </div>

        {/* Booking Form */}
        <form onSubmit={handleSubmit}>
          {bookingMode === 'range' ? (
            // Traditional date range selection
            <>
              <div className="form-group">
                <label className="form-label">
                  <Calendar size={16} style={{ marginRight: '5px' }} />
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="form-input"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  max={(() => {
                    const maxDate = new Date();
                    maxDate.setDate(maxDate.getDate() + 15);
                    return maxDate.toISOString().split('T')[0];
                  })()}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Calendar size={16} style={{ marginRight: '5px' }} />
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="form-input"
                  required
                  min={formData.startDate || new Date().toISOString().split('T')[0]}
                  max={(() => {
                    const maxDate = new Date();
                    maxDate.setDate(maxDate.getDate() + 15);
                    return maxDate.toISOString().split('T')[0];
                  })()}
                />
              </div>
            </>
          ) : (
            // Individual date selection
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                Select Individual Dates:
                <span style={{ 
                  marginLeft: '10px', 
                  fontSize: '12px', 
                  color: formData.selectedDates.length >= 15 ? '#e74c3c' : '#27ae60',
                  fontWeight: 'normal' 
                }}>
                  ({formData.selectedDates.length}/15 days selected)
                </span>
              </label>
              
              {/* Selected dates display */}
              {formData.selectedDates.length > 0 && (
                <div style={{ 
                  marginBottom: '15px', 
                  padding: '10px', 
                  backgroundColor: 'var(--light-green)', 
                  borderRadius: '5px' 
                }}>
                  <strong>Selected Dates:</strong> {formData.selectedDates.join(', ')}
                </div>
              )}

              {/* Legend */}
              <div style={{ 
                marginBottom: '10px', 
                fontSize: '12px', 
                display: 'flex', 
                gap: '15px',
                alignItems: 'center',
                flexWrap: 'wrap'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div style={{ 
                    width: '12px', 
                    height: '12px', 
                    backgroundColor: 'var(--primary-green)', 
                    borderRadius: '2px' 
                  }}></div>
                  <span>Selected</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div style={{ 
                    width: '12px', 
                    height: '12px', 
                    backgroundColor: 'white', 
                    border: '1px solid #ccc',
                    borderRadius: '2px' 
                  }}></div>
                  <span>Available</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div style={{ 
                    width: '12px', 
                    height: '12px', 
                    backgroundColor: '#2c2c2c', 
                    borderRadius: '2px' 
                  }}></div>
                  <span>Booked/Hold</span>
                </div>
              </div>

              {/* Calendar grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '5px',
                maxHeight: '200px',
                overflow: 'auto',
                border: '1px solid var(--gray-light)',
                padding: '10px',
                borderRadius: '5px'
              }}>
                {generateCalendar().map((day, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleDateClick(day.date)}
                    style={{
                      padding: '8px 4px',
                      border: '1px solid var(--gray-light)',
                      borderRadius: '3px',
                      backgroundColor: day.isSelected 
                        ? 'var(--primary-green)' 
                        : day.isAvailable 
                        ? 'white' 
                        : '#2c2c2c', // Dark black/gray for unavailable dates
                      color: day.isSelected 
                        ? 'white' 
                        : day.isAvailable 
                        ? 'black' 
                        : '#888', // Light gray text for unavailable dates
                      cursor: day.isAvailable ? 'pointer' : 'not-allowed',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    disabled={!day.isAvailable}
                  >
                    {day.day}
                    {day.isSelected && <Check size={12} style={{ marginLeft: '2px' }} />}
                    {!day.isAvailable && <Ban size={10} style={{ marginLeft: '2px' }} />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Availability Check Button */}
          <div style={{ marginBottom: '20px' }}>
            <button
              type="button"
              onClick={checkAvailability}
              className="btn btn-outline"
              style={{ width: '100%' }}
              disabled={
                (bookingMode === 'range' && (!formData.startDate || !formData.endDate)) ||
                (bookingMode === 'individual' && formData.selectedDates.length === 0)
              }
            >
              Check Availability
            </button>
          </div>

          {/* Availability Results */}
          {availability && (
            <div style={{
              marginBottom: '20px',
              padding: '15px',
              borderRadius: '8px',
              backgroundColor: availability.available ? 'var(--light-green)' : '#ffebee'
            }}>
              <h4 style={{ marginBottom: '10px' }}>
                {availability.available ? '✅ Available' : '❌ Some dates unavailable'}
              </h4>
              <p><strong>Available Units:</strong> {availability.availableUnits} / {availability.totalUnits}</p>
              {availability.unavailableDates?.length > 0 && (
                <p style={{ color: 'red' }}>
                  <strong>Unavailable Dates:</strong> {availability.unavailableDates.join(', ')}
                </p>
              )}
            </div>
          )}

          {/* Cost Calculation */}
          {formData.totalAmount > 0 && (
            <div style={{
              backgroundColor: 'var(--light-green)',
              color: 'white',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: '10px',
                fontSize: '1.2rem',
                fontWeight: 'bold'
              }}>
                <DollarSign size={20} />
                Total Cost: ${formData.totalAmount.toFixed(2)}
              </div>
              <p style={{ fontSize: '14px', marginTop: '5px', opacity: 0.9 }}>
                {bookingMode === 'range' 
                  ? 'Based on date range (24 hours per day)'
                  : `Based on ${formData.selectedDates.length} selected days`
                }
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '15px', marginTop: '25px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
              style={{ flex: 1 }}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 1 }}
              disabled={
                loading || 
                (bookingMode === 'range' && (!formData.startDate || !formData.endDate)) ||
                (bookingMode === 'individual' && formData.selectedDates.length === 0) ||
                (availability && !availability.available)
              }
            >
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
                  Booking...
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <User size={16} />
                  Proceed to Payment
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
      
      {/* Payment Modal */}
      <PaymentModal
        booking={currentBooking}
        isOpen={showPayment}
        onClose={handlePaymentClose}
        onPaymentComplete={handlePaymentComplete}
      />
    </div>
  );
};

export default BookingModal;
