const express = require('express');
const router = express.Router();
const {
  getAllEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  getCategories,
  getLocations,
  getDebugEquipment,
  getUnavailableDates
} = require('../controllers/equipmentController');
 
// Equipment routes
router.get('/', getAllEquipment);
router.get('/debug', getDebugEquipment);
router.get('/categories', getCategories);
router.get('/locations', getLocations);
router.get('/:id/unavailable-dates', getUnavailableDates);
router.get('/:id', getEquipmentById);
router.post('/', createEquipment);
router.put('/:id', updateEquipment);
router.delete('/:id', deleteEquipment);

module.exports = router;
 