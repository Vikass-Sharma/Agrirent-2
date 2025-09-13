require('dotenv').config();
const express = require('express');
const connectDB = require('./config/database');
const setupMiddleware = require('./middleware');
const apiRoutes = require('./routes');
// const frontendRoutes = require('./routes/frontend');
const { initializeAdmin } = require('./controllers/userController');
const { cleanupExpiredPaymentHolds } = require('./controllers/bookingController2');

const app = express();

// Connect to database
connectDB();

// Setup middleware
setupMiddleware(app);

// API routes
app.use('/api', apiRoutes);

// Frontend routes (must come after API routes)
// app.use('/', frontendRoutes);

// Payment hold cleanup service - runs every minute
setInterval(async () => {
  try {
    const result = await cleanupExpiredPaymentHolds();
    
  } catch (error) {
    console.error('Payment hold cleanup error:', error);
  }
}, 60000); // Run every 60 seconds

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Agriculture Equipment Rental Server running on port ${PORT}`);
  console.log('Payment hold cleanup service started - running every 60 seconds');
  initializeAdmin();
});
