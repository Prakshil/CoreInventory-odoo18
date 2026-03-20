import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RoleRoute = ({ allow, children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (Array.isArray(allow) && allow.length > 0 && !allow.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

export default RoleRoute;

