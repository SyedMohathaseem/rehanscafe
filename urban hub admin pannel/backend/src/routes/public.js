import express from 'express';
import Booking from '../models/Booking.js';
import Customer from '../models/Customer.js';

const router = express.Router();

// POST /api/bookings - Public booking creation
router.post('/bookings', async (req, res) => {
  try {
    const { name, email, phone, serviceType, bookingDate, revenue } = req.body;

    // Find or create customer
    let customer = await Customer.findOne({ email });
    if (!customer) {
      customer = new Customer({ name, email, phone });
      await customer.save();
    }

    // Create booking
    const booking = new Booking({
      customer: customer._id,
      serviceType,
      bookingDate: new Date(bookingDate),
      status: 'Pending',
      revenue: revenue || 0
    });
    await booking.save();

    res.status(201).json({ message: 'Booking created successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;