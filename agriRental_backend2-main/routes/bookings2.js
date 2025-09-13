const express = require('express');
const router = express.Router();
const {
  getAllBookings,
  createBooking,
  createPaymentHold,
  confirmPayment,
  failPayment,
  cancelPayment,
  getBookingById,
  acceptBooking,
  rejectBooking,
  completeBooking,
  updateBooking,
  checkAvailability,
  getBookingCalendar,
  cancelSpecificDates
} = require('../controllers/bookingController2');

// Basic booking routes (same as original)
router.get('/', getAllBookings);
router.post('/', createBooking);
 
// NEW: Payment-related routes
router.post('/payment-hold', createPaymentHold);
router.put('/:id/confirm-payment', confirmPayment);
router.put('/:id/fail-payment', failPayment);
router.put('/:id/cancel-payment', cancelPayment);

router.get('/:id', getBookingById);

// Owner-specific booking management endpoints (MUST come before general /:id route)
router.put('/:id/accept', acceptBooking);
router.put('/:id/reject', rejectBooking);
router.put('/:id/complete', completeBooking);

// NEW: Cancel specific dates within a booking
router.put('/:id/cancel-dates', cancelSpecificDates);

// General booking update endpoint (MUST come after specific routes)
router.put('/:id', updateBooking);

// NEW ENHANCED ROUTES FOR TIME-SLOT BOOKING SYSTEM

// Check equipment availability for specific date range
// GET /api/bookings/equipment/:equipmentId/availability?startDate=2025-08-27&endDate=2025-08-30
router.get('/equipment/:equipmentId/availability', checkAvailability);

// Get booking calendar for equipment (monthly view)
// GET /api/bookings/equipment/:equipmentId/calendar?month=8&year=2025
router.get('/equipment/:equipmentId/calendar', getBookingCalendar);





// Get all bookings for specific equipment
// GET /api/bookings/equipment/:equipmentId
router.get('/equipment/:equipmentId', async (req, res) => {
  try {
    req.query.equipmentId = req.params.equipmentId;
    return getAllBookings(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching equipment bookings' });
  }
});

// Get bookings by status for specific equipment
// GET /api/bookings/equipment/:equipmentId/status/:status
router.get('/equipment/:equipmentId/status/:status', async (req, res) => {
  try {
    req.query.equipmentId = req.params.equipmentId;
    req.query.status = req.params.status;
    return getAllBookings(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching equipment bookings by status' });
  }
});

// Get bookings for date range for specific equipment
// GET /api/bookings/equipment/:equipmentId/daterange?startDate=2025-08-27&endDate=2025-08-30
router.get('/equipment/:equipmentId/daterange', async (req, res) => {
  try {
    req.query.equipmentId = req.params.equipmentId;
    // startDate and endDate will be passed through query parameters
    return getAllBookings(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching equipment bookings for date range' });
  }
});

// Get user's booking history
// GET /api/bookings/user/:userId
router.get('/user/:userId', async (req, res) => {
  try {
    req.query.userId = req.params.userId;
    return getAllBookings(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user bookings' });
  }
});

// Get owner's bookings (all bookings for equipment owned by this user)
// GET /api/bookings/owner/:ownerId
router.get('/owner/:ownerId', async (req, res) => {
  try {
    req.query.owner = req.params.ownerId;
    return getAllBookings(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching owner bookings' });
  }
});

// Get bookings by status
// GET /api/bookings/status/:status
router.get('/status/:status', async (req, res) => {
  try {
    req.query.status = req.params.status;
    return getAllBookings(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings by status' });
  }
});

module.exports = router;
