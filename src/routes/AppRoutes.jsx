import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Home from '../pages/Home';
import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile/Profile';
import Orders from '../pages/Orders/Orders';
import Login from '../components/Login';
import Register from '../components/Register';
import AdminDashboard from '../srinivas/AdminDashboard';
import Products from '../pages/Products/Products';
import ProductDetail from '../pages/ProductDetail';
import Cart from '../pages/Cart';
import Wishlist from '../pages/Wishlist';
import { authService } from '../services/authService';

// Guard for protected routes (e.g. Dashboard)
const ProtectedRoute = ({ children }) => {
  const isAuth = authService.isAuthenticated();
  const location = useLocation();
  if (!isAuth) return <Navigate to="/login" replace state={{ from: location }} />;
  
  const currentUser = authService.getCurrentUser();
  if (currentUser?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  return children;
};

// Guard for admin-only routes (e.g. Admin Panel)
const AdminRoute = ({ children }) => {
  const isAuth = authService.isAuthenticated();
  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.role === 'admin';
  return isAuth && isAdmin ? children : <Navigate to="/dashboard" replace />;
};

// Guard for public-only auth routes (e.g. Login, Register)
const PublicRoute = ({ children }) => {
  const isAuth = authService.isAuthenticated();
  if (isAuth) {
    const currentUser = authService.getCurrentUser();
    return currentUser?.role === 'admin' ? <Navigate to="/admin" replace /> : <Navigate to="/dashboard" replace />;
  }
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="/products" element={<Products />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/cart" element={<Cart />} />

      {/* Guest-only Auth Pages */}
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />
      <Route 
        path="/register" 
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } 
      />

      {/* Authenticated-only Protected Pages */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/orders" 
        element={
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/wishlist" 
        element={
          <ProtectedRoute>
            <Wishlist />
          </ProtectedRoute>
        } 
      />

      {/* Admin-only Protected Pages */}
      <Route 
        path="/admin" 
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } 
      />

      {/* Fallback routing */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
