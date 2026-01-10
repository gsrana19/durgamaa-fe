import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { checkAuth } from '../services/api';

const PrivateRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const auth = await checkAuth();
        setIsAuthenticated(auth.authenticated);
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    verifyAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-saffron-50 to-white flex items-center justify-center">
        <div className="text-saffron-600 text-xl">Loading...</div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/admin/login" replace />;
};

export default PrivateRoute;




