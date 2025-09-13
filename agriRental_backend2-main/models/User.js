const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'owner', 'admin'], default: 'user' },
  phone: String,
  joinDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'suspended'], default: 'active' }
});

module.exports = mongoose.model('User', userSchema);
