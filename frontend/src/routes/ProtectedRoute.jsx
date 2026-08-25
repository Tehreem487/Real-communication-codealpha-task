import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // or relative path if hook is configured

export const ProtectedRoute = () => {
  const user = JSON.parse(localStorage.getItem('rtc_user'));

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};