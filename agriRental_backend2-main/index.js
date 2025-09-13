// Load environment variables FIRST
require('dotenv').config();

const express = require('express');
const connectDB = require('./config/database');
const setupMiddleware = require('./middleware');
const apiRoutes = require('./routes');
const { initializeAdmin } = require('./controllers/userController');
const { cleanupExpiredPaymentHolds } = require('./controllers/bookingController2');

const app = express();

// Debug environment variables
console.log('Environment check:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- PORT:', process.env.PORT);
console.log('- MONGODB_URI exists:', !!process.env.MONGODB_URI);
console.log('- ADMIN_EMAIL:', process.env.ADMIN_EMAIL);

// Connect to database
connectDB();

// Setup middleware
setupMiddleware(app);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    message: 'AgriRent Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'AgriRent Backend API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      api: '/api'
    }
  });
});

// API routes
app.use('/api', apiRoutes);

// Payment hold cleanup service
setInterval(async () => {
  try {
    const result = await cleanupExpiredPaymentHolds();
    if (result.expiredCount > 0) {
      console.log(`Cleaned up ${result.expiredCount} expired payment holds`);
    }
  } catch (error) {
    console.error('Payment hold cleanup error:', error);
  }
}, 60000);

const PORT = process.env.PORT || 8000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Agriculture Equipment Rental Server running on port ${PORT}`);
  console.log('Payment hold cleanup service started - running every 60 seconds');
  initializeAdmin();
});