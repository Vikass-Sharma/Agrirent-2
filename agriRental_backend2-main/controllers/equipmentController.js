const { Equipment } = require('../models');
const { Booking2 } = require('../models');

// Calculate real-time availability for equipment based on current bookings
const calculateRealTimeAvailability = async (equipmentList) => {
  const equipmentWithAvailability = await Promise.all(
    equipmentList.map(async (equipment) => {
      // Show general equipment availability (total quantity)
      // Specific date availability is handled in booking flow, not equipment listing
      
      return {
        ...equipment.toObject(),
        available: equipment.quantity, // Show total quantity as available
        totalQuantity: equipment.quantity,
        activeBookings: 0 
      };
    })
  );
  
  return equipmentWithAvailability;
};

const getAllEquipment = async (req, res) => {
  try {
    const { owner, category, location } = req.query;
    let filter = {};
    
    // Always filter by owner if provided (for admin dashboard)
    if (owner) {
      filter.owner = owner;
    }
    
    // Filter by category (Tractor, Harvester, etc.)
    if (category) {
      filter.category = category;
    }
    
    // Filter by location
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }
    
    const equipment = await Equipment.find(filter);
    
    // Calculate real-time availability for all equipment
    const equipmentWithRealTimeAvailability = await calculateRealTimeAvailability(equipment);
    
    res.json(equipmentWithRealTimeAvailability);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getEquipmentById = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    // Only owner can view equipment details if owner query param is provided
    if (req.query.owner && equipment.owner.toString() !== req.query.owner) {
      return res.status(403).json({ message: 'Access denied: not your equipment' });
    }
    
    // Calculate real-time availability for this specific equipment
    const [equipmentWithAvailability] = await calculateRealTimeAvailability([equipment]);
    
    res.json(equipmentWithAvailability);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createEquipment = async (req, res) => {
  try {
    const equipment = new Equipment(req.body);
    await equipment.save();
    res.status(201).json(equipment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    
    // Only owner can update equipment
    const requesterId = req.body.owner || req.body.requesterId;
    if (!requesterId || equipment.owner.toString() !== requesterId) {
      return res.status(403).json({ message: 'Access denied: not your equipment' });
    }
    
    // Only allow status change and own equipment updates
    equipment.name = req.body.name || equipment.name;
    equipment.model = req.body.model || equipment.model;
    equipment.image = req.body.image || equipment.image;
    equipment.pricePerHour = req.body.pricePerHour || equipment.pricePerHour;
    equipment.description = req.body.description || equipment.description;
    equipment.quantity = req.body.quantity || equipment.quantity;
    equipment.available = req.body.available || equipment.available;
    equipment.category = req.body.category || equipment.category;
    equipment.location = req.body.location || equipment.location;
    
    await equipment.save();
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    
    // Only owner can delete equipment
    const requesterId = req.body.owner || req.body.requesterId;
    if (!requesterId || equipment.owner.toString() !== requesterId) {
      return res.status(403).json({ message: 'Access denied: not your equipment' });
    }
    
    await Equipment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Equipment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await Equipment.distinct('category');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getLocations = async (req, res) => {
  try {
    const locations = await Equipment.distinct('location');
    res.json(locations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDebugEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.find({}, 'name available quantity category location');
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get unavailable dates for a specific equipment
const getUnavailableDates = async (req, res) => {
  try {
    const equipmentId = req.params.id;
    const equipment = await Equipment.findById(equipmentId);
    
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const now = new Date();
    
    // Get next 30 days to check
    const unavailableDates = [];
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() + i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      // Count active bookings for this specific date
      const activeBookingsCount = await Booking2.countDocuments({
        equipmentId: equipmentId,
        $and: [
          {
            $or: [
              // Confirmed bookings
              { status: 'confirmed' },
              // Pending bookings (after payment, awaiting owner approval)
              { status: 'pending' },
              // Accepted bookings (from old system)
              { status: 'accepted' },
              // Payment holds that haven't expired (10-minute window)
              { 
                status: 'payment_hold',
                paymentHoldExpiry: { $gt: now }
              }
            ]
          },
          {
            $or: [
              // Traditional range bookings that include this date
              {
                startDate: { $lte: checkDate },
                endDate: { $gte: checkDate },
                selectedDates: { $exists: false }
              },
              // Individual date bookings that include this date
              {
                selectedDates: dateStr
              }
            ]
          }
        ]
      });

      // If all units are booked for this date, mark as unavailable
      if (activeBookingsCount >= equipment.quantity) {
        unavailableDates.push(dateStr);
      }
    }
    res.json({ unavailableDates });
  } catch (error) {
    console.error('Error in getUnavailableDates:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment, 
  getCategories,
  getLocations,
  getDebugEquipment,
  getUnavailableDates
};
