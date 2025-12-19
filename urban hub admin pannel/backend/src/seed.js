import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Admin from './models/Admin.js';
import Customer from './models/Customer.js';
import Booking from './models/Booking.js';

dotenv.config();

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Admin.deleteMany();
  await Customer.deleteMany();
  await Booking.deleteMany();

  const admin = new Admin({
    username: 'Syed',
    password: await bcrypt.hash('urbanhub2007', 10)
  });
  await admin.save();

  const customers = await Customer.insertMany([
    { name: 'Alice Smith', email: 'alice@example.com', phone: '1234567890' },
    { name: 'Bob Lee', email: 'bob@example.com', phone: '2345678901' },
    { name: 'Carol King', email: 'carol@example.com', phone: '3456789012' }
  ]);

  const bookings = await Booking.insertMany([
    { customer: customers[0]._id, serviceType: 'Table Reservation', bookingDate: new Date(), status: 'Confirmed', revenue: 100 },
    { customer: customers[1]._id, serviceType: 'Event Booking', bookingDate: new Date(), status: 'Pending', revenue: 200 },
    { customer: customers[2]._id, serviceType: 'Private Dining', bookingDate: new Date(), status: 'Cancelled', revenue: 0 }
  ]);

  console.log('Seed data inserted');
  process.exit();
};

seed();
