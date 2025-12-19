import React from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, CalendarIcon, UsersIcon, ChartBarIcon, CogIcon } from '@heroicons/react/24/outline';

const navItems = [
  { name: 'Dashboard', path: '/', icon: <HomeIcon className="h-6 w-6" /> },
  { name: 'Bookings', path: '/bookings', icon: <CalendarIcon className="h-6 w-6" /> },
  { name: 'Customers', path: '/customers', icon: <UsersIcon className="h-6 w-6" /> },
  { name: 'Analytics', path: '/analytics', icon: <ChartBarIcon className="h-6 w-6" /> },
  { name: 'Settings', path: '/settings', icon: <CogIcon className="h-6 w-6" /> },
];

const Sidebar: React.FC = () => (
  <aside className="w-64 bg-white dark:bg-gray-800 shadow-lg hidden md:block">
    <div className="h-16 flex items-center justify-center font-bold text-xl border-b dark:border-gray-700">REHAN'S Multi Cuisine Restaurants Admin</div>
    <nav className="mt-4">
      {navItems.map((item) => (
        <NavLink
          key={item.name}
          to={item.path}
          className={({ isActive }) =>
            `flex items-center px-6 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition ${isActive ? 'bg-gray-200 dark:bg-gray-700 font-semibold' : ''}`
          }
        >
          {item.icon}
          <span className="ml-3">{item.name}</span>
        </NavLink>
      ))}
    </nav>
  </aside>
);

export default Sidebar;
