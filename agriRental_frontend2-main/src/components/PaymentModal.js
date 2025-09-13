import React, { useState, useEffect } from 'react';
import { X, CreditCard, Check, XCircle, Clock, DollarSign } from 'lucide-react';
import { bookingService } from '../services/api';
import { toast } from 'react-toastify';

const PaymentModal = ({ booking, isOpen, onClose, onPaymentComplete }) => {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [processing, setProcessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
  });

  // Countdown timer for payment hold
  useEffect(() => {
    if (!isOpen || !booking?.paymentHoldExpiry) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expiry = new Date(booking.paymentHoldExpiry).getTime();
      const difference = expiry - now;

      if (difference > 0) {
        setTimeLeft(Math.floor(difference / 1000));
      } else {
        setTimeLeft(0);
        toast.error('Payment window expired. Equipment released.');
        onClose();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, booking?.paymentHoldExpiry, onClose]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const simulatePayment = async (success = true) => {
    setProcessing(true);
    
    // Debugging: Log booking object
    console.log('PaymentModal - booking object:', booking);
    console.log('PaymentModal - booking._id:', booking?._id);
    
    if (!booking || !booking._id) {
      toast.error('Booking ID not found. Please try again.');
      setProcessing(false);
      return;
    }
    
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      if (success) {
        // Call backend to confirm payment
        const result = await bookingService.confirmPayment(booking._id, {
          paymentMethod,
          transactionId: `TXN_${Date.now()}`, // Simulate transaction ID
          paymentData: { ...paymentData, cardNumber: '**** **** **** ' + paymentData.cardNumber.slice(-4) }
        });
        
        toast.success('Payment successful! Booking confirmed.');
        onPaymentComplete(result);
        onClose();
      } else {
        // Call backend to handle payment failure
        await bookingService.failPayment(booking._id);
        toast.error('Payment failed. Equipment released.');
        onClose();
      }
    } catch (error) {
      toast.error('Payment processing error: ' + (error.response?.data?.message || error.message));
    } finally {
      setProcessing(false);
    }
  };

  const handleSuccessPayment = () => {
    simulatePayment(true);
  };

  const handleFailPayment = () => {
    simulatePayment(false);
  };

  const handleCancel = async () => {
    if (!booking || !booking._id) {
      toast.error('Booking ID not found. Please try again.');
      return;
    }
    
    try {
      await bookingService.cancelPayment(booking._id);
      toast.info('Payment cancelled. Equipment released.');
      onClose();
    } catch (error) {
      toast.error('Error cancelling payment: ' + (error.response?.data?.message || error.message));
    }
  };

  if (!isOpen || !booking) return null;

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
        maxWidth: '500px',
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
          <CreditCard size={24} />
          Complete Payment
        </h2>

        {/* Timer */}
        <div style={{
          backgroundColor: timeLeft < 300 ? '#ffebee' : '#e8f5e8',
          color: timeLeft < 300 ? '#d32f2f' : '#2e7d32',
          padding: '10px 15px',
          borderRadius: '8px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: 'bold'
        }}>
          <Clock size={16} />
          Time remaining: {formatTime(timeLeft)}
        </div>

        {/* Booking Summary */}
        <div style={{
          backgroundColor: 'var(--gray-light)',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '25px'
        }}>
          <h3 style={{ marginBottom: '10px', color: 'var(--primary-green)' }}>
            Booking Summary
          </h3>
          <p><strong>Equipment:</strong> {booking.equipmentId?.name}</p>
          <p><strong>Dates:</strong> {
            booking.selectedDates && booking.selectedDates.length > 0 
              ? booking.selectedDates.join(', ')
              : `${booking.startDate} to ${booking.endDate}`
          }</p>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '5px',
            marginTop: '10px',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            color: 'var(--accent-brown)'
          }}>
            <DollarSign size={20} />
            Total: ₹{booking.totalAmount}
          </div>
        </div>

        {/* Payment Method Selection */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ marginBottom: '15px' }}>Payment Method</h4>
          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
            <button
              type="button"
              onClick={() => handlePaymentMethodChange('card')}
              style={{
                padding: '10px 20px',
                border: `2px solid ${paymentMethod === 'card' ? 'var(--primary-green)' : 'var(--gray-light)'}`,
                borderRadius: '8px',
                backgroundColor: paymentMethod === 'card' ? 'var(--light-green)' : 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <CreditCard size={16} />
              Credit/Debit Card
            </button>
          </div>
        </div>

        {/* Payment Form */}
        {paymentMethod === 'card' && (
          <div style={{ marginBottom: '25px' }}>
            <div style={{ display: 'grid', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Card Number
                </label>
                <input
                  type="text"
                  name="cardNumber"
                  value={paymentData.cardNumber}
                  onChange={handleInputChange}
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid var(--gray-light)',
                    borderRadius: '5px'
                  }}
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    name="expiryDate"
                    value={paymentData.expiryDate}
                    onChange={handleInputChange}
                    placeholder="MM/YY"
                    maxLength="5"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid var(--gray-light)',
                      borderRadius: '5px'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    CVV
                  </label>
                  <input
                    type="text"
                    name="cvv"
                    value={paymentData.cvv}
                    onChange={handleInputChange}
                    placeholder="123"
                    maxLength="4"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid var(--gray-light)',
                      borderRadius: '5px'
                    }}
                  />
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Cardholder Name
                </label>
                <input
                  type="text"
                  name="cardName"
                  value={paymentData.cardName}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid var(--gray-light)',
                    borderRadius: '5px'
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Test Payment Buttons */}
        <div style={{
          backgroundColor: '#fff3cd',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #ffeaa7'
        }}>
          <h5 style={{ marginBottom: '10px', color: '#856404' }}>
            Test Payment Options:
          </h5>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={handleSuccessPayment}
              disabled={processing || timeLeft === 0}
              style={{
                padding: '10px 15px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: processing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                opacity: processing || timeLeft === 0 ? 0.6 : 1
              }}
            >
              <Check size={16} />
              Simulate Success
            </button>
            
            <button
              onClick={handleFailPayment}
              disabled={processing || timeLeft === 0}
              style={{
                padding: '10px 15px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: processing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                opacity: processing || timeLeft === 0 ? 0.6 : 1
              }}
            >
              <XCircle size={16} />
              Simulate Failure
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '15px' }}>
          <button
            onClick={handleCancel}
            disabled={processing}
            style={{
              flex: 1,
              padding: '12px',
              border: '1px solid var(--gray-dark)',
              backgroundColor: 'white',
              color: 'var(--gray-dark)',
              borderRadius: '5px',
              cursor: processing ? 'not-allowed' : 'pointer',
              opacity: processing ? 0.6 : 1
            }}
          >
            Cancel Payment
          </button>
        </div>

        {/* Processing Indicator */}
        {processing && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: '10px'
          }}>
            <div className="spinner" style={{ width: '40px', height: '40px', marginBottom: '20px' }}></div>
            <p style={{ fontSize: '18px', fontWeight: 'bold' }}>Processing Payment...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
