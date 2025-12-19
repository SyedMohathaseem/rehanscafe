import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Admin from '../models/Admin.js';
import Booking from '../models/Booking.js';
import Customer from '../models/Customer.js';

const router = express.Router();

// Middleware to protect routes
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
}

// POST /admin/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const admin = await Admin.findOne({ username });
  if (!admin) return res.status(400).json({ message: 'Invalid credentials' });
  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
  const token = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1d' });
  res.json({ token });
});

// GET /admin/dashboard-stats
router.get('/dashboard-stats', auth, async (req, res) => {
  const totalCustomers = await Customer.countDocuments();
  const totalBookings = await Booking.countDocuments();
  const today = new Date();
  today.setHours(0,0,0,0);
  const bookingsToday = await Booking.countDocuments({ bookingDate: { $gte: today } });
  const revenue = await Booking.aggregate([
    { $group: { _id: null, total: { $sum: '$revenue' } } }
  ]);
  res.json({
    totalCustomers,
    totalBookings,
    bookingsToday,
    revenue: revenue[0]?.total || 0
  });
});


// GET /admin/bookings (with optional date range)
router.get('/bookings', auth, async (req, res) => {
  try {
    const { from, to } = req.query;
    let filter = {};
    if (from && to) {
      filter.bookingDate = { $gte: new Date(from), $lte: new Date(to) };
    }
    const bookings = await Booking.find(filter)
      .populate('customer', 'name email phone')
      .sort({ bookingDate: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /admin/bookings/:id (update status)
router.put('/bookings/:id', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('customer', 'name email phone');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /admin/bookings/:id
router.delete('/bookings/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json({ message: 'Booking deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /admin/customers/insights
router.get('/customers/insights', auth, async (req, res) => {
  try {
    const totalUnique = await Customer.countDocuments();
    const bookings = await Booking.find().populate('customer');
    const customerBookingCounts = {};
    const serviceCounts = {};
    const dateCounts = {};
    bookings.forEach(b => {
      const cid = b.customer._id.toString();
      customerBookingCounts[cid] = (customerBookingCounts[cid] || 0) + 1;
      serviceCounts[b.serviceType] = (serviceCounts[b.serviceType] || 0) + 1;
      const date = b.bookingDate.toISOString().split('T')[0];
      dateCounts[date] = (dateCounts[date] || 0) + 1;
    });
    const repeat = Object.values(customerBookingCounts).filter(c => c > 1).length;
    const newCustomers = totalUnique - repeat;
    const mostBookedServices = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1]);
    const peakDates = Object.entries(dateCounts).sort((a, b) => b[1] - a[1]);
    res.json({
      totalUnique,
      repeat,
      new: newCustomers,
      mostBookedServices,
      peakDates
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /admin/analytics/summary
router.get('/analytics/summary', auth, async (req, res) => {
  try {
    // Bar chart: daily bookings (last 30 days)
    const today = new Date();
    const start = new Date();
    start.setDate(today.getDate() - 29);
    const daily = await Booking.aggregate([
      { $match: { bookingDate: { $gte: start } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$bookingDate' } },
        count: { $sum: 1 }
      } },
      { $sort: { _id: 1 } }
    ]);
    // Line chart: monthly bookings (last 12 months)
    const yearAgo = new Date();
    yearAgo.setMonth(today.getMonth() - 11);
    const monthly = await Booking.aggregate([
      { $match: { bookingDate: { $gte: yearAgo } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$bookingDate' } },
        count: { $sum: 1 }
      } },
      { $sort: { _id: 1 } }
    ]);
    // Pie chart: booking status
    const status = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    res.json({ daily, monthly, status });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /admin/bookings-by-date
router.get('/bookings-by-date', auth, async (req, res) => {
  try {
    const { from, to } = req.query;
    let match = {};
    if (from && to) {
      match.bookingDate = { $gte: new Date(from), $lte: new Date(to) };
    }
    const bookingsByDate = await Booking.aggregate([
      { $match: match },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$bookingDate' } },
        count: { $sum: 1 },
        revenue: { $sum: '$revenue' }
      } },
      { $sort: { _id: -1 } }
    ]);
    res.json(bookingsByDate);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
