const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  model: { type: String, required: true },
  image: { type: String, required: true },
  pricePerHour: { type: Number, required: true },
  description: { type: String, required: true },
  quantity: { type: Number, required: true },
  available: { type: Number, required: true },
  category: { type: String, required: true }, // Tractor, Harvester, Planter, etc.
  location: { type: String, required: true }, // equipment location
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('Equipment', equipmentSchema);
