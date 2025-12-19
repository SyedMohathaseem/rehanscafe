import React from 'react';
import { useNavigate } from 'react-router-dom';

const Topbar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white dark:bg-gray-800 flex items-center justify-end px-6 border-b dark:border-gray-700">
      <div className="flex items-center space-x-4">
        <span className="text-gray-700 dark:text-gray-200 font-medium">Admin</span>
        <button
          onClick={handleLogout}
          className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Topbar;
