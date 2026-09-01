import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const location = useLocation();

  const token =
    localStorage.getItem('token') ||
    localStorage.getItem('authToken') ||
    localStorage.getItem('accessToken');

  const isLoggedIn =
    localStorage.getItem('isLoggedIn') === 'true' ||
    !!token ||
    !!localStorage.getItem('userInfo') ||
    !!localStorage.getItem('workspace_profile');

  if (!isLoggedIn) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  return children;
}