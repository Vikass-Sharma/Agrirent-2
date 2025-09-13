const bcrypt = require('bcryptjs');
const { User } = require('../models');

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// const activateAdmin = async (req, res) => {
//   try {
//     const admin = await User.findOne({ email: process.env.ADMIN_EMAIL || 'admin@agrirent.com' });
//     if (!admin) {
//       return res.status(404).json({ message: 'Admin account not found' });
//     }
    
//     admin.status = 'active';
//     await admin.save();
    
//     res.json({
//       message: 'Admin account activated successfully',
//       user: {
//         id: admin._id,
//         name: admin.name,
//         email: admin.email,
//         role: admin.role,
//         status: admin.status
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

const initializeAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
      const admin = new User({
        name: process.env.ADMIN_NAME || 'AgriRent Admin',
        email: process.env.ADMIN_EMAIL || 'admin@agrirent.com',
        password: hashedPassword,
        role: 'admin',
        status: 'active'  // Ensure admin is active by default
      });
      await admin.save();
      console.log(`Default admin user created: ${process.env.ADMIN_EMAIL || 'admin@agrirent.com'} / ${process.env.ADMIN_PASSWORD || 'admin123'}`);
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};

module.exports = {
  getAllUsers,
  updateUser,
  // activateAdmin,
  initializeAdmin
};
