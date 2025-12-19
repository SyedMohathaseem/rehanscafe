import React, { useEffect, useState } from 'react';
import API from '../api';

interface Booking {
  _id: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  serviceType: string;
  bookingDate: string;
  status: string;
  revenue: number;
}

const Bookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await API.get('/bookings');
      setBookings(res.data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await API.put(`/bookings/${id}`, { status });
      fetchBookings();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const deleteBooking = async (id: string) => {
    if (confirm('Are you sure you want to delete this booking?')) {
      try {
        await API.delete(`/bookings/${id}`);
        fetchBookings();
      } catch (err) {
        alert('Failed to delete booking');
      }
    }
  };

  const filteredBookings = bookings.filter(booking =>
    booking.customer.name.toLowerCase().includes(search.toLowerCase()) ||
    booking.customer.email.toLowerCase().includes(search.toLowerCase()) ||
    booking.serviceType.toLowerCase().includes(search.toLowerCase())
  ).filter(booking => !statusFilter || booking.status === statusFilter);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Bookings Management</h1>
      <div className="mb-4 flex space-x-4">
        <input
          type="text"
          placeholder="Search by name, email, or service"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border rounded w-1/3"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded"
        >
          <option value="">All Status</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Pending">Pending</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 shadow rounded">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="px-4 py-2">Customer Name</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Phone</th>
                <th className="px-4 py-2">Service Type</th>
                <th className="px-4 py-2">Booking Date</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map(booking => (
                <tr key={booking._id} className="border-t">
                  <td className="px-4 py-2">{booking.customer.name}</td>
                  <td className="px-4 py-2">{booking.customer.email}</td>
                  <td className="px-4 py-2">{booking.customer.phone}</td>
                  <td className="px-4 py-2">{booking.serviceType}</td>
                  <td className="px-4 py-2">{new Date(booking.bookingDate).toLocaleString()}</td>
                  <td className="px-4 py-2">
                    <select
                      value={booking.status}
                      onChange={(e) => updateStatus(booking._id, e.target.value)}
                      className="px-2 py-1 border rounded"
                    >
                      <option value="Confirmed">Confirmed</option>
                      <option value="Pending">Pending</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => deleteBooking(booking._id)}
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Bookings;
