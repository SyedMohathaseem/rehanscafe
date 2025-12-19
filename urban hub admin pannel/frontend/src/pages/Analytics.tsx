import React, { useEffect, useState } from 'react';
import API from '../api';

interface BookingByDate {
  _id: string; // date string
  count: number;
  revenue: number;
}

const Analytics: React.FC = () => {
  const [bookingsByDate, setBookingsByDate] = useState<BookingByDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  useEffect(() => {
    fetchBookingsByDate();
  }, []);

  const fetchBookingsByDate = async () => {
    try {
      const params: Record<string, string> = {};
      if (from) params.from = from;
      if (to) params.to = to;
      const res = await API.get('/bookings-by-date', { params });
      setBookingsByDate(res.data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    fetchBookingsByDate();
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Booking Analytics</h1>
      <div className="mb-4 flex space-x-4">
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="px-3 py-2 border rounded"
        />
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="px-3 py-2 border rounded"
        />
        <button
          onClick={handleFilter}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Filter
        </button>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 shadow rounded">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Number of Bookings</th>
                <th className="px-4 py-2">Total Revenue</th>
              </tr>
            </thead>
            <tbody>
              {bookingsByDate.map(item => (
                <tr key={item._id} className="border-t">
                  <td className="px-4 py-2">{item._id}</td>
                  <td className="px-4 py-2">{item.count}</td>
                  <td className="px-4 py-2">{`₹${item.revenue}`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Analytics;
