import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  serviceType: {
    type: String,
    required: true
  },
  bookingDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Confirmed', 'Pending', 'Cancelled'],
    default: 'Pending'
  },
  revenue: {
    type: Number,
    required: true
  }
}, { timestamps: true });

export default mongoose.model('Booking', BookingSchema);
