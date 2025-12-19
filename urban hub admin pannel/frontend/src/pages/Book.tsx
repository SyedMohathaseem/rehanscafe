import React, { useState } from 'react';

const Book: React.FC = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    serviceType: 'Table Reservation',
    bookingDate: '',
    revenue: 100
  });
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
      const newBooking = { ...form, id: Date.now(), status: 'Pending' };
      bookings.push(newBooking);
      localStorage.setItem('bookings', JSON.stringify(bookings));
      setMessage('Booking created successfully!');
      setForm({
        name: '',
        email: '',
        phone: '',
        serviceType: 'Table Reservation',
        bookingDate: '',
        revenue: 100
      });
    } catch (err) {
      setMessage('Error creating booking.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Book at REHAN'S Multi Cuisine Restaurants</h2>
        {message && <p className="mb-4 text-green-500">{message}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2">Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Phone</label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Service Type</label>
            <select
              name="serviceType"
              value={form.serviceType}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            >
              <option>Table Reservation</option>
              <option>Event Booking</option>
              <option>Private Dining</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-2">Booking Date & Time</label>
            <input
              type="datetime-local"
              name="bookingDate"
              value={form.bookingDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            Book Now
          </button>
        </form>
      </div>
    </div>
  );
};

export default Book;