import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../Backend/Context/UserContext';

export const AuthRoute = ({ children }) => {
  const { user, loading } = useContext(UserContext);
  
  if (loading) {
    return null; // or a loading spinner
  }

  if (user) {
    return <Navigate to="/discover" replace />;
  }

  return children;
};

export default function ProtectedRoute({ children }) {
  const { user, loading } = useContext(UserContext);

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
