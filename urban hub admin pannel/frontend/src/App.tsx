import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Bookings from './pages/Bookings';
import Customers from './pages/Customers';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Book from './pages/Book';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

const App: React.FC = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/book" element={<Book />} />
    <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
      <Route path="/" element={<Dashboard />} />
      <Route path="/bookings" element={<Bookings />} />
      <Route path="/customers" element={<Customers />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/settings" element={<Settings />} />
    </Route>
    <Route path="*" element={<Navigate to="/" />} />
  </Routes>
);

export default App;
