const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const equipmentRoutes = require('./equipment');
// const bookingRoutes = require('./bookings');
const userRoutes = require('./users');
const bookingRoutes2 = require('./bookings2');

// Use routes
router.use('/auth', authRoutes);
router.use('/equipment', equipmentRoutes);
// router.use('/bookings', bookingRoutes);
router.use('/users', userRoutes);
router.use('/bookings2', bookingRoutes2);

module.exports = router;
