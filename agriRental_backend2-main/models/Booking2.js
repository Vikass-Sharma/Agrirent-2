const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  equipmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment', required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startDate: { type: String, required: true }, // Still keep for compatibility
  endDate: { type: String, required: true },   // Still keep for compatibility
  selectedDates: { 
    type: [String], 
    required: false,
    default: []
  }, // NEW: Array of individual selected dates ["2025-08-22", "2025-08-23", "2025-08-24"]
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'rejected', 'payment_hold', 'payment_failed'], 
    default: 'pending' 
  },
  // NEW: Payment tracking fields
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  paymentHoldExpiry: { 
    type: Date, 
    required: false 
  }, // 10-minute hold expiry time
  isPaymentHold: { 
    type: Boolean, 
    default: false 
  }, // Flag to identify if booking is in payment hold
  paymentMethod: { 
    type: String, 
    required: false 
  }, // Store payment method for future reference
  transactionId: { 
    type: String, 
    required: false 
  }, // Store transaction ID after payment
  createdAt: { type: Date, default: Date.now }
});

// Add index for better query performance
bookingSchema.index({ equipmentId: 1, status: 1 });
bookingSchema.index({ userId: 1 });
bookingSchema.index({ owner: 1 });
bookingSchema.index({ selectedDates: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
