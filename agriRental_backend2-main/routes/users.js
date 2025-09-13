const express = require('express');
const router = express.Router();
const { getAllUsers, updateUser, activateAdmin } = require('../controllers/userController');

// User management routes
router.get('/', getAllUsers);
router.put('/:id', updateUser);

// Admin management routes
// router.post('/admin/activate', activateAdmin);

module.exports = router;
 