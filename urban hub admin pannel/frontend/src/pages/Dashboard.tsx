import React, { useEffect, useState } from 'react';

interface Stats {
  totalCustomers: number;
  totalBookings: number;
  bookingsToday: number;
  revenue: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalCustomers: 0,
    totalBookings: 0,
    bookingsToday: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const customers = new Set(bookings.map((b: any) => b.email));
    const today = new Date().toDateString();
    const bookingsToday = bookings.filter((b: any) => new Date(b.bookingDate).toDateString() === today).length;
    const revenue = bookings.reduce((sum: number, b: any) => sum + (b.revenue || 0), 0);
    setStats({
      totalCustomers: customers.size,
      totalBookings: bookings.length,
      bookingsToday,
      revenue,
    });
    setLoading(false);
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col items-center transition-transform duration-300 hover:scale-105">
          <span className="text-3xl font-bold animate-pulse">{loading ? '...' : stats.totalCustomers}</span>
          <span className="text-gray-500">Total Customers</span>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col items-center transition-transform duration-300 hover:scale-105">
          <span className="text-3xl font-bold animate-pulse">{loading ? '...' : stats.totalBookings}</span>
          <span className="text-gray-500">Total Bookings</span>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col items-center transition-transform duration-300 hover:scale-105">
          <span className="text-3xl font-bold animate-pulse">{loading ? '...' : stats.bookingsToday}</span>
          <span className="text-gray-500">Bookings Today</span>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col items-center transition-transform duration-300 hover:scale-105">
          <span className="text-3xl font-bold animate-pulse">{loading ? '...' : `$${stats.revenue}`}</span>
          <span className="text-gray-500">Revenue</span>
        </div>
      </div>
      {/* Charts will be added here */}
    </div>
  );
};

export default Dashboard;
