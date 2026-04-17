import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ authUser, children }) {
  const location = useLocation();
  if (!authUser?.token) {
    return <Navigate to="/profile" replace state={{ from: location.pathname }} />;
  }
  return children;
}
