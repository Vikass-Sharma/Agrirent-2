const { Booking2: Booking, Equipment } = require('../models');

/**
 * Helper function to generate array of dates between start and end
 * Now also accepts array of individual dates
 */
const getDateRange = (startDate, endDate) => {
  // If startDate is an array, return it directly (individual dates)
  if (Array.isArray(startDate)) {
    return startDate.sort(); // Ensure dates are sorted
  }
  
  // Traditional range generation
  const dates = [];
  const currentDate = new Date(startDate);
  const endDateObj = new Date(endDate);
  
  while (currentDate <= endDateObj) {
    dates.push(new Date(currentDate).toISOString().split('T')[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
};

/**
 * Input Formats Supported:
 * 1. Traditional: startDate="2025-08-22", endDate="2025-08-24"
 * 2. Individual dates: selectedDates=["2025-08-22", "2025-08-23", "2025-08-24"]
 */


const checkEquipmentAvailability = async (equipmentId, startDateOrArray, endDate = null, excludeBookingId = null) => {
  try {
    // ========== STEP 1: GET EQUIPMENT DETAILS ==========
    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) {
      return { available: false, message: 'Equipment not found' };
    }

    // ========== STEP 2: DETERMINE REQUEST TYPE AND GET DATES ==========
    let requestedDates;
    
    if (Array.isArray(startDateOrArray)) {
      // Individual date selection mode
      requestedDates = startDateOrArray.sort();
      console.log(`Checking availability for individual dates: ${requestedDates.join(', ')}`);
    } else {
      // Traditional date range mode
      requestedDates = getDateRange(startDateOrArray, endDate);
      console.log(`Checking availability for date range: ${startDateOrArray} to ${endDate}`);
    }

    if (requestedDates.length === 0) {
      return { available: false, message: 'No dates provided' };
    }

    // ========== STEP 3: FETCH EXISTING BOOKINGS ==========
    const now = new Date();
    const query = {
      equipmentId: equipmentId,
      $or: [
        // Confirmed and pending bookings (always count)
        { status: { $in: ['confirmed', 'pending'] } },
        // Payment holds that haven't expired yet
        { 
          status: 'payment_hold',
          paymentHoldExpiry: { $gt: now }
        }
      ]
    };
    
    if (excludeBookingId) {
      query._id = { $ne: excludeBookingId };
    }

    // Use Booking2 model (imported as Booking alias) to get current bookings
    const existingBookings = await Booking.find(query);

    // ========== STEP 4: CALCULATE PER-DATE AVAILABILITY ==========
    const dateAvailability = {};
    let overallAvailable = true;
    let minAvailableUnits = equipment.quantity;

    for (const date of requestedDates) {

      // Count bookings that include this specific date
      const bookingsForDate = existingBookings.filter(booking => {
        // Check if booking has selectedDates array (new format)
        if (booking.selectedDates && booking.selectedDates.length > 0) {
          return booking.selectedDates.includes(date);
        } else {
          // Fallback to traditional range checking (old format)
          const bookingDates = getDateRange(booking.startDate, booking.endDate);
          return bookingDates.includes(date);
        }
      });

      const availableForDate = equipment.quantity - bookingsForDate.length;
      dateAvailability[date] = {
        availableUnits: availableForDate,
        totalUnits: equipment.quantity,
        bookingsCount: bookingsForDate.length,
        available: availableForDate > 0
      };

      // Track overall availability
      if (availableForDate <= 0) {
        overallAvailable = false;
      }
      minAvailableUnits = Math.min(minAvailableUnits, availableForDate);
    }

    // ========== STEP 5: RETURN COMPREHENSIVE AVAILABILITY DATA ==========
    return {
      available: overallAvailable,
      availableUnits: minAvailableUnits,
      totalUnits: equipment.quantity,
      requestedDates: requestedDates,
      dateAvailability: dateAvailability,
      message: overallAvailable 
        ? `${minAvailableUnits} units available for all selected dates`
        : 'Some dates are not available',
      unavailableDates: Object.keys(dateAvailability).filter(date => !dateAvailability[date].available)
    };
  } catch (error) {
    console.error('Error checking availability:', error);
    return { available: false, message: 'Error checking availability' };
  }
};



const getAllBookings = async (req, res) => {
  try {
    const { userId, owner, equipmentId, status, startDate, endDate } = req.query;
    let filter = {};
    
    // Build filter object based on query parameters
    if (userId) filter.userId = userId;
    if (owner) filter.owner = owner;
    if (equipmentId) filter.equipmentId = equipmentId;
    if (status) filter.status = status;
    
    // Advanced date range filtering - find bookings that overlap with specified range
    if (startDate && endDate) {
      filter.$or = [
        {
          // Booking overlaps if it starts before our end date AND ends after our start date
          startDate: { $lte: endDate },
          endDate: { $gte: startDate }
        }
      ];
    }
    
    // Execute query with population for related data
    const bookings = await Booking.find(filter)
      .populate('equipmentId')  // Get full equipment details
      .populate('userId', 'name email phone')  // Get user contact info
      .populate('owner', 'name email')  // Get owner contact info
      .sort({ createdAt: -1 });  // Sort by newest first
      
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Error fetching bookings' });
  }
};


const createBooking = async (req, res) => {
  try {
    const { 
      userId,  
      equipmentId, 
      startDate,     // Traditional mode
      endDate,       // Traditional mode
      selectedDates, // New individual date selection mode
      totalAmount
    } = req.body;

    // ========== STEP 1: DETERMINE BOOKING MODE ==========
    let bookingDates;
    let bookingStartDate, bookingEndDate;

    if (selectedDates && Array.isArray(selectedDates) && selectedDates.length > 0) {
      // Individual date selection mode
      bookingDates = selectedDates.sort();
      bookingStartDate = bookingDates[0];
      bookingEndDate = bookingDates[bookingDates.length - 1];
      console.log(`Individual date booking request: ${bookingDates.join(', ')}`);
    } else if (startDate && endDate) {
      // Traditional date range mode
      bookingDates = getDateRange(startDate, endDate);
      bookingStartDate = startDate;
      bookingEndDate = endDate;
      console.log(`Range booking request: ${startDate} to ${endDate}`);
    } else {
      return res.status(400).json({ 
        message: 'Either provide selectedDates array or startDate & endDate' 
      });
    }

    // ========== STEP 2: DATE VALIDATION ==========
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Calculate maximum allowed date (15 days from today)
    const maxAllowedDate = new Date(today);
    maxAllowedDate.setDate(today.getDate() + 15);

    // Validate all dates are not in the past and within 15-day window
    for (const date of bookingDates) {
      const checkDate = new Date(date);
      if (checkDate < today) {
        return res.status(400).json({ 
          message: `Date ${date} cannot be in the past` 
        });
      }
      if (checkDate > maxAllowedDate) {
        return res.status(400).json({ 
          message: `Date ${date} is beyond the 15-day booking window. Latest allowed: ${maxAllowedDate.toISOString().split('T')[0]}` 
        });
      }
    }

    // Validate booking duration (max 15 individual dates or 15-day range)
    if (bookingDates.length > 15) {
      return res.status(400).json({ 
        message: 'Cannot book more than 15 dates at once' 
      });
    }

    // ========== STEP 3: EQUIPMENT VALIDATION ==========
    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    console.log(`Booking request for equipment: ${equipment.name}`);
    console.log(`Selected dates: ${bookingDates.join(', ')}`);

    // ========== STEP 4: AVAILABILITY CHECK ==========
    const availability = await checkEquipmentAvailability(equipmentId, bookingDates);
    
    if (!availability.available) {
      console.log('Booking blocked:', availability.message);
      return res.status(400).json({ 
        message: availability.message,
        unavailableDates: availability.unavailableDates,
        dateAvailability: availability.dateAvailability
      });
    }

    // ========== STEP 5: CREATE BOOKING WITH INDIVIDUAL DATES ==========
    const booking = new Booking({
      userId,
      equipmentId,
      owner: equipment.owner,
      startDate: bookingStartDate,
      endDate: bookingEndDate,
      selectedDates: bookingDates,  // Store individual selected dates
      totalAmount,
      status: 'pending'
    });

    await booking.save();
    console.log(`Booking created successfully for dates: ${bookingDates.join(', ')}`);

    // ========== STEP 6: PREPARE RESPONSE ==========
    await booking.populate('equipmentId');
    await booking.populate('userId', 'name email phone');
    await booking.populate('owner', 'name email');

    res.status(201).json({
      booking,
      message: 'Booking created successfully',
      bookedDates: bookingDates,
      dateAvailability: availability.dateAvailability
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Error creating booking' });
  }
};


const createPaymentHold = async (req, res) => {
  try {
    const { 
      userId, 
      equipmentId, 
      startDate,
      endDate,
      selectedDates,
      totalAmount
    } = req.body;

    // Determine booking dates (same logic as createBooking)
    let bookingDates;
    let bookingStartDate, bookingEndDate;

    if (selectedDates && Array.isArray(selectedDates) && selectedDates.length > 0) {
      bookingDates = selectedDates.sort();
      bookingStartDate = bookingDates[0];
      bookingEndDate = bookingDates[bookingDates.length - 1];
    } else if (startDate && endDate) {
      bookingDates = getDateRange(startDate, endDate);
      bookingStartDate = startDate;
      bookingEndDate = endDate;
    } else {
      return res.status(400).json({ 
        message: 'Either provide selectedDates array or startDate & endDate' 
      });
    }

    // Equipment validation
    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    // Availability check
    const availability = await checkEquipmentAvailability(equipmentId, bookingDates);
    if (!availability.available) {
      return res.status(400).json({ 
        message: availability.message,
        unavailableDates: availability.unavailableDates
      });
    }

    // Create payment hold (10 minutes from now)
    const holdExpiry = new Date();
    holdExpiry.setMinutes(holdExpiry.getMinutes() + 10);

    const booking = new Booking({
      userId,
      equipmentId,
      owner: equipment.owner,
      startDate: bookingStartDate,
      endDate: bookingEndDate,
      selectedDates: bookingDates,
      totalAmount,
      status: 'payment_hold',   // window booked for 10 min
      paymentStatus: 'pending',
      isPaymentHold: true,
      paymentHoldExpiry: holdExpiry
    });

    await booking.save();
    await booking.populate('equipmentId');
    await booking.populate('userId', 'name email phone');

    res.status(201).json({
      booking,
      message: 'Equipment reserved for 10 minutes. Complete payment to confirm.',
      holdExpiresAt: holdExpiry
    });
  } catch (error) {
    console.error('Error creating payment hold:', error);
    res.status(500).json({ message: 'Error creating payment hold' });
  }
};


const confirmPayment = async (req, res) => {
  try {
    const { paymentMethod, transactionId, paymentData } = req.body;
    
    const booking = await Booking.findById(req.params.id).populate('equipmentId');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if booking is in payment hold state
    if (booking.status !== 'payment_hold' || !booking.isPaymentHold) {
      return res.status(400).json({ message: 'Booking is not in payment hold state' });
    }

    // Check if hold has expired
    if (new Date() > booking.paymentHoldExpiry) {
      // Auto-expire the booking
      booking.status = 'cancelled';
      booking.paymentStatus = 'failed';
      booking.isPaymentHold = false;
      await booking.save();
      
      return res.status(400).json({ message: 'Payment hold expired. Equipment released.' });
    }

    // Re-check availability before confirming (prevent race conditions)
    const availability = await checkEquipmentAvailability(
      booking.equipmentId._id, 
      booking.selectedDates, 
      null, 
      booking._id // Exclude current booking from availability check
    );
    
    if (!availability.available) {
      booking.status = 'cancelled';
      booking.paymentStatus = 'failed';
      booking.isPaymentHold = false;
      await booking.save();
      
      return res.status(400).json({ 
        message: 'Equipment no longer available. Payment cancelled and equipment released.' 
      });
    }

    // Update booking to confirmed status
    booking.status = 'pending'; // Pending delivery status 
    booking.paymentStatus = 'completed';
    booking.isPaymentHold = false;
    booking.paymentMethod = paymentMethod;
    booking.transactionId = transactionId;
    booking.paymentHoldExpiry = null;
    
    await booking.save();
    await booking.populate('owner', 'name email');

    res.json({
      booking,
      message: 'Payment successful! Booking confirmed and sent to owner for approval.'
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ message: 'Error confirming payment' });
  }
};


const failPayment = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status !== 'payment_hold') {
      return res.status(400).json({ message: 'Booking is not in payment hold state' });
    }

    // Update booking to failed status
    booking.status = 'payment_failed';
    booking.paymentStatus = 'failed';
    booking.isPaymentHold = false;
    booking.paymentHoldExpiry = null;
    
    await booking.save();

    res.json({
      message: 'Payment failed. Equipment released.',
      booking
    });
  } catch (error) {
    console.error('Error failing payment:', error);
    res.status(500).json({ message: 'Error processing payment failure' });
  }
};


const cancelPayment = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status !== 'payment_hold') {
      return res.status(400).json({ message: 'Booking is not in payment hold state' });
    }

    // Update booking to cancelled status
    booking.status = 'cancelled';
    booking.paymentStatus = 'cancelled';
    booking.isPaymentHold = false;
    booking.paymentHoldExpiry = null;
    
    await booking.save();

    res.json({
      message: 'Payment cancelled. Equipment released.',
      booking
    });
  } catch (error) {
    console.error('Error cancelling payment:', error);
    res.status(500).json({ message: 'Error cancelling payment' });
  }
};


const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('equipmentId')  // Get full equipment details
      .populate('userId', 'name email phone')  // Get user contact info
      .populate('owner', 'name email');  // Get owner contact info
      
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ message: 'Error fetching booking' });
  }
};


const acceptBooking = async (req, res) => {
  try {
    const { ownerId } = req.body;
    console.log('Accept booking request:', { bookingId: req.params.id, ownerId });
    
    // ========== STEP 1: FETCH AND VALIDATE BOOKING ==========
    
    const booking = await Booking.findById(req.params.id).populate('equipmentId');
    
    if (!booking) {
      console.log('Booking not found:', req.params.id);
      return res.status(404).json({ message: 'Booking not found' });
    }

    console.log('Booking found:', { bookingOwner: booking.owner.toString(), requestOwnerId: ownerId });

    // ========== STEP 2: AUTHORIZATION CHECK ==========
    
    // Verify the requesting user owns the equipment
    if (booking.owner.toString() !== ownerId) {
      console.log('Access denied: Owner mismatch');
      return res.status(403).json({ message: 'Access denied: You can only manage bookings for your equipment' });
    }

    // ========== STEP 3: STATUS VALIDATION ==========
    
    // Only pending bookings can be accepted
    if (booking.status !== 'pending') {
      console.log('Invalid status for acceptance:', booking.status);
      return res.status(400).json({ message: 'Only pending bookings can be accepted' });
    }

    // ========== STEP 4: RACE CONDITION PROTECTION ==========
    
    // Double-check availability before confirming (prevents race conditions)
    // Exclude current booking from the check since we're about to confirm it
    const availability = await checkEquipmentAvailability(
      booking.equipmentId, 
      booking.startDate, 
      booking.endDate, 
      booking._id  // Exclude this booking from availability calculation
    );

    // If equipment is no longer available, another booking was likely confirmed
    if (!availability.available) {
      console.log('Booking cannot be accepted: Equipment no longer available for these dates');
      return res.status(400).json({ 
        message: 'Equipment is no longer available for the requested dates',
        reason: 'Another booking was confirmed for overlapping dates'
      });
    }

    // ========== STEP 5: CONFIRM BOOKING ==========
    
    // Update booking status to confirmed
    booking.status = 'confirmed';
    await booking.save();
    console.log('Booking accepted successfully');

    // ========== STEP 6: SEND RESPONSE ==========
    
    res.json({ 
      message: 'Booking accepted successfully', 
      booking,
      remainingUnits: availability.availableUnits - 1  // Inform about remaining availability
    });
  } catch (error) {
    console.error('Error accepting booking:', error);
    res.status(500).json({ message: 'Error accepting booking', error: error.message });
  }
};


const rejectBooking = async (req, res) => {
  try {
    const { ownerId } = req.body;
    console.log('Reject booking request:', { bookingId: req.params.id, ownerId });
    
    // ========== STEP 1: FETCH AND VALIDATE BOOKING ==========
    
    const booking = await Booking.findById(req.params.id).populate('equipmentId');
    
    if (!booking) {
      console.log('Booking not found:', req.params.id);
      return res.status(404).json({ message: 'Booking not found' });
    }

    // ========== STEP 2: AUTHORIZATION CHECK ==========
    
    if (booking.owner.toString() !== ownerId) {
      console.log('Access denied: Owner mismatch for rejection');
      return res.status(403).json({ message: 'Access denied: You can only manage bookings for your equipment' });
    }

    // ========== STEP 3: STATUS VALIDATION ==========
    
    if (booking.status !== 'pending') {
      console.log('Invalid status for rejection:', booking.status);
      return res.status(400).json({ message: 'Only pending bookings can be rejected' });
    }

    // ========== STEP 4: UPDATE BOOKING STATUS ==========
    
    booking.status = 'rejected';
    await booking.save();

    // ========== STEP 5: CALCULATE NEW AVAILABILITY ==========
    
    // Calculate availability after rejection (for informational purposes)
    // This helps frontend show updated availability to other users
    const availability = await checkEquipmentAvailability(
      booking.equipmentId, 
      booking.startDate, 
      booking.endDate
    );

    console.log(`Booking rejected. ${availability.availableUnits} units now available for ${booking.startDate} to ${booking.endDate}`);

    // ========== STEP 6: SEND RESPONSE ==========
    
    res.json({ 
      message: 'Booking rejected successfully', 
      booking,
      availableUnits: availability.availableUnits  // Inform about current availability
    });
  } catch (error) {
    console.error('Error rejecting booking:', error);
    res.status(500).json({ message: 'Error rejecting booking', error: error.message });
  }
};


const completeBooking = async (req, res) => {
  try {
    const { ownerId } = req.body;
    console.log('Complete booking request:', { bookingId: req.params.id, ownerId });
    
    // ========== STEP 1: FETCH AND VALIDATE BOOKING ==========
    
    const booking = await Booking.findById(req.params.id).populate('equipmentId');
    
    if (!booking) {
      console.log('Booking not found:', req.params.id);
      return res.status(404).json({ message: 'Booking not found' });
    }

    // ========== STEP 2: AUTHORIZATION CHECK ==========
    
    if (booking.owner.toString() !== ownerId) {
      console.log('Access denied: Owner mismatch for completion');
      return res.status(403).json({ message: 'Access denied: You can only manage bookings for your equipment' });
    }

    // ========== STEP 3: STATUS VALIDATION ==========
    
    // Only confirmed bookings can be marked as completed
    if (booking.status !== 'confirmed') {
      console.log('Invalid status for completion:', booking.status);
      return res.status(400).json({ message: 'Only confirmed bookings can be marked as completed' });
    }

    // ========== STEP 4: UPDATE BOOKING STATUS ==========
    
    booking.status = 'completed';
    await booking.save();

    // ========== STEP 5: CALCULATE AVAILABILITY AFTER COMPLETION ==========
    
    // Calculate availability after completion (equipment is now "returned")
    // This helps with analytics and showing real-time availability
    const availability = await checkEquipmentAvailability(
      booking.equipmentId, 
      booking.startDate, 
      booking.endDate
    );

    console.log(`Booking completed. Equipment returned. ${availability.availableUnits} units available for ${booking.startDate} to ${booking.endDate}`);

    // ========== STEP 6: SEND RESPONSE ==========
    
    res.json({ 
      message: 'Booking marked as completed successfully', 
      booking,
      availableUnits: availability.availableUnits  // Current availability for this time slot
    });
  } catch (error) {
    console.error('Error completing booking:', error);
    res.status(500).json({ message: 'Error completing booking', error: error.message });
  }
};


const updateBooking = async (req, res) => {
  try {
    const { status, ownerId, startDate, endDate } = req.body;
    
    // ========== STEP 1: FETCH EXISTING BOOKING ==========
    
    const booking = await Booking.findById(req.params.id).populate('equipmentId');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // ========== STEP 2: AUTHORIZATION CHECK ==========
    
    // Check if the requester is the owner (for status changes like accept/reject)
    if (ownerId && booking.owner.toString() !== ownerId) {
      return res.status(403).json({ message: 'Access denied: You can only manage bookings for your equipment' });
    }

    // ========== STEP 3: DATE UPDATE VALIDATION ==========
    
    // If dates are being updated, perform comprehensive validation
    if (startDate && endDate) {
      
      // Validate new date format and logic
      const start = new Date(startDate);
      const end = new Date(endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Prevent booking in the past
      if (start < today) {
        return res.status(400).json({ message: 'Start date cannot be in the past' });
      }

      // Ensure logical date order
      if (start >= end) {
        return res.status(400).json({ message: 'End date must be after start date' });
      }

      // ========== STEP 4: AVAILABILITY CHECK FOR NEW DATES ==========
      
      // Check availability for new dates (excluding current booking from calculation)
      // This prevents the booking from conflicting with itself
      const availability = await checkEquipmentAvailability(
        booking.equipmentId, 
        startDate, 
        endDate, 
        booking._id  // Exclude current booking
      );

      // Block update if new dates are not available
      if (!availability.available) {
        return res.status(400).json({ 
          message: 'Equipment is not available for the new dates',
          availableUnits: availability.availableUnits
        });
      }

      // Update booking dates if validation passes
      booking.startDate = startDate;
      booking.endDate = endDate;
    }

    // ========== STEP 5: STATUS UPDATE ==========
    
    // Update status if provided
    if (status) {
      booking.status = status;
    }

    // ========== STEP 6: SAVE CHANGES ==========
    
    await booking.save();

    // ========== STEP 7: CALCULATE FINAL AVAILABILITY ==========
    
    // Calculate current availability for the booking's time slot
    // If status is terminal (completed/cancelled/rejected), exclude this booking
    const excludeFromAvailability = ['completed', 'cancelled', 'rejected'].includes(booking.status) 
      ? booking._id 
      : null;
      
    const availability = await checkEquipmentAvailability(
      booking.equipmentId, 
      booking.startDate, 
      booking.endDate, 
      excludeFromAvailability
    );

    // ========== STEP 8: SEND RESPONSE ==========
    
    res.json({
      booking,
      availableUnits: availability.availableUnits,
      message: 'Booking updated successfully'
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ message: 'Error updating booking' });
  }
};


const checkAvailability = async (req, res) => {
  try {
    const { equipmentId } = req.params;
    const { startDate, endDate, selectedDates } = req.query;

    // ========== STEP 1: PARAMETER VALIDATION ==========
    let datesToCheck;
    
    if (selectedDates) {
      // Individual dates mode: "2025-08-22,2025-08-23,2025-08-24"
      datesToCheck = selectedDates.split(',').map(date => date.trim());
    } else if (startDate && endDate) {
      // Traditional range mode
      datesToCheck = getDateRange(startDate, endDate);
    } else {
      return res.status(400).json({ 
        message: 'Provide either selectedDates (comma-separated) or startDate & endDate' 
      });
    }

    if (datesToCheck.length === 0) {
      return res.status(400).json({ message: 'No valid dates provided' });
    }

    // ========== STEP 2: AVAILABILITY CALCULATION ==========
    const availability = await checkEquipmentAvailability(equipmentId, datesToCheck);
    
    // ========== STEP 3: SEND DETAILED RESPONSE ==========
    res.json({
      equipmentId,
      requestType: selectedDates ? 'individual' : 'range',
      requestedDates: datesToCheck,
      ...availability
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({ message: 'Error checking availability' });
  }
};


const getBookingCalendar = async (req, res) => {
  try {
    const { equipmentId } = req.params;
    const { month, year } = req.query;

    // ========== STEP 1: EQUIPMENT VALIDATION ==========
    
    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    // ========== STEP 2: DATE RANGE CALCULATION ==========
    
    // Calculate start and end of the requested month
    const targetYear = year || new Date().getFullYear();
    const targetMonth = month || (new Date().getMonth() + 1);
    
    // First day of the month
    const startOfMonth = new Date(targetYear, targetMonth - 1, 1);
    // Last day of the month
    const endOfMonth = new Date(targetYear, targetMonth, 0);

    // ========== STEP 3: FETCH RELEVANT BOOKINGS ==========
    
    // Get all bookings for this equipment that overlap with the requested month
    const bookings = await Booking.find({
      equipmentId: equipmentId,
      status: { $in: ['confirmed', 'pending'] },  // Only active bookings
      $or: [
        {
          // Booking overlaps with the month if it starts before month ends and ends after month starts
          startDate: { $lte: endOfMonth.toISOString().split('T')[0] },
          endDate: { $gte: startOfMonth.toISOString().split('T')[0] }
        }
      ]
    }).populate('userId', 'name email');  // Include user details for calendar display

    // ========== STEP 4: BUILD CALENDAR DATA ==========
    
    // Create calendar object with day-by-day data
    const calendar = {};
    const currentDate = new Date(startOfMonth);
    
    // Loop through each day of the month
    while (currentDate <= endOfMonth) {
      const dateStr = currentDate.toISOString().split('T')[0];
      
      // Count bookings that are active on this specific date
      const dayBookings = bookings.filter(booking => {
        const bookingDates = getDateRange(booking.startDate, booking.endDate);
        return bookingDates.includes(dateStr);
      });

      // Calculate availability for this day
      calendar[dateStr] = {
        availableUnits: equipment.quantity - dayBookings.length,
        totalUnits: equipment.quantity,
        bookings: dayBookings.map(b => ({
          id: b._id,
          userId: b.userId,
          status: b.status,
          startDate: b.startDate,
          endDate: b.endDate
        }))
      };

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // ========== STEP 5: SEND CALENDAR RESPONSE ==========
    
    res.json({
      equipmentId,
      equipmentName: equipment.name,
      totalUnits: equipment.quantity,
      month: parseInt(targetMonth),
      year: parseInt(targetYear),
      calendar
    });
  } catch (error) {
    console.error('Error getting booking calendar:', error);
    res.status(500).json({ message: 'Error getting booking calendar' });
  }
};


const cancelSpecificDates = async (req, res) => {
  try {
    const { datesToCancel, userId } = req.body;
    const bookingId = req.params.id;

    // ========== STEP 1: VALIDATION ==========
    if (!datesToCancel || !Array.isArray(datesToCancel) || datesToCancel.length === 0) {
      return res.status(400).json({ message: 'datesToCancel array is required' });
    }

    // ========== STEP 2: FETCH BOOKING ==========
    const booking = await Booking.findById(bookingId).populate('equipmentId');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // ========== STEP 3: AUTHORIZATION ==========
    if (booking.userId !== userId) {
      return res.status(403).json({ message: 'Access denied: You can only cancel your own bookings' });
    }

    // ========== STEP 4: STATUS CHECK ==========
    if (!['pending', 'confirmed'].includes(booking.status)) {
      return res.status(400).json({ message: 'Can only cancel dates from pending or confirmed bookings' });
    }

    // ========== STEP 5: DETERMINE CURRENT BOOKED DATES ==========
    let currentBookedDates;
    if (booking.selectedDates && booking.selectedDates.length > 0) {
      currentBookedDates = booking.selectedDates;
    } else {
      // Fallback to range if selectedDates not available
      currentBookedDates = getDateRange(booking.startDate, booking.endDate);
    }

    // ========== STEP 6: VALIDATE CANCELLATION DATES ==========
    const invalidDates = datesToCancel.filter(date => !currentBookedDates.includes(date));
    if (invalidDates.length > 0) {
      return res.status(400).json({ 
        message: `These dates are not in your booking: ${invalidDates.join(', ')}` 
      });
    }

    // ========== STEP 7: CALCULATE REMAINING DATES ==========
    const remainingDates = currentBookedDates.filter(date => !datesToCancel.includes(date));
    
    if (remainingDates.length === 0) {
      // Cancel entire booking if no dates remain
      booking.status = 'cancelled';
      booking.selectedDates = [];
      console.log(`Entire booking cancelled - no dates remaining`);
    } else {
      // Update booking with remaining dates
      booking.selectedDates = remainingDates.sort();
      booking.startDate = remainingDates[0];
      booking.endDate = remainingDates[remainingDates.length - 1];
      
      // Recalculate amount (proportional to remaining dates)
      const originalDateCount = currentBookedDates.length;
      const remainingDateCount = remainingDates.length;
      booking.totalAmount = (booking.totalAmount * remainingDateCount) / originalDateCount;
      
      console.log(`Cancelled dates: ${datesToCancel.join(', ')}, Remaining: ${remainingDates.join(', ')}`);
    }

    // ========== STEP 8: SAVE CHANGES ==========
    await booking.save();

    // ========== STEP 9: CALCULATE NEW AVAILABILITY ==========
    const availability = await checkEquipmentAvailability(
      booking.equipmentId._id, 
      remainingDates.length > 0 ? remainingDates : datesToCancel
    );

    // ========== STEP 10: SEND RESPONSE ==========
    res.json({
      message: remainingDates.length > 0 
        ? 'Selected dates cancelled successfully' 
        : 'Booking cancelled completely',
      booking,
      cancelledDates: datesToCancel,
      remainingDates: remainingDates,
      newTotalAmount: booking.totalAmount,
      dateAvailability: availability.dateAvailability
    });

  } catch (error) {
    console.error('Error cancelling specific dates:', error);
    res.status(500).json({ message: 'Error cancelling specific dates' });
  }
};

/**
 * CLEANUP EXPIRED PAYMENT HOLDS - Automatically expire payment holds after 10 minutes
 * =================================================================================
 * This function should be called periodically (e.g., every minute) to clean up expired holds.
 */
const cleanupExpiredPaymentHolds = async () => {
  try {
    const now = new Date();
    
    // Find all expired payment holds
    const expiredHolds = await Booking.find({
      status: 'payment_hold',
      isPaymentHold: true,
      paymentHoldExpiry: { $lt: now }
    });

    console.log(`Found ${expiredHolds.length} expired payment holds to clean up`);

    // Update expired holds to cancelled status
    const result = await Booking.updateMany(
      {
        status: 'payment_hold',
        isPaymentHold: true,
        paymentHoldExpiry: { $lt: now }
      },
      {
        $set: {
          status: 'cancelled',
          paymentStatus: 'failed',
          isPaymentHold: false,
          paymentHoldExpiry: null
        }
      }
    );

    console.log(`Cleaned up ${result.modifiedCount} expired payment holds`);
    
    return {
      success: true,
      expiredCount: result.modifiedCount,
      message: `Cleaned up ${result.modifiedCount} expired payment holds`
    };
  } catch (error) {
    console.error('Error cleaning up expired payment holds:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
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
  cancelSpecificDates,
  cleanupExpiredPaymentHolds  // NEW: Add cleanup function
};
