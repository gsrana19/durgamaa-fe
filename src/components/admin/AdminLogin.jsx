import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { login, checkAuth } from '../../services/api';

const AdminLogin = () => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    checkAuthStatus();
    // Check if there's a session expiry message
    if (location.state?.message) {
      setError(location.state.message);
    }
  }, [location]);
  
  const checkAuthStatus = async () => {
    try {
      const auth = await checkAuth();
      if (auth.authenticated) {
        navigate('/admin/dashboard');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await login(userId, password);
      console.log('Login response received:', response);
      console.log('Response type:', typeof response);
      console.log('Response keys:', response ? Object.keys(response) : 'null');
      
      // Check if response has authenticated flag or message indicating success
      if (response && (
        response.authenticated === true || 
        response.message === 'Login successful' ||
        response.sessionId
      )) {
        console.log('Login successful, navigating to dashboard');
        
        // Store authentication and last login time
        localStorage.setItem('isAuthenticated', 'true');
        if (response.lastLoginTime) {
          localStorage.setItem('lastLoginTime', response.lastLoginTime);
        }
        
        // Small delay to ensure session is set
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 100);
      } else {
        console.warn('Login response missing expected fields:', response);
        setError('Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login catch error:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        response: error.response,
        responseData: error.response?.data,
        responseStatus: error.response?.status
      });
      
      // If we got a 200 response but axios still threw, it might be a parsing issue
      if (error.response && error.response.status === 200) {
        console.log('Got 200 but error thrown, trying to use response data');
        const data = error.response.data;
        if (data && (data.authenticated || data.message === 'Login successful')) {
          setTimeout(() => {
            navigate('/admin/dashboard');
          }, 100);
          return;
        }
      }
      
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Network Error';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-saffron-50 to-white flex items-center justify-center py-8 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-saffron-600 text-center mb-6 md:mb-8">Admin Login</h1>
        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm md:text-base">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">User ID</label>
            <input
              type="text"
              required
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full px-4 py-3 md:py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-transparent text-base"
              placeholder="Enter user ID"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 md:py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-transparent text-base"
              placeholder="Enter password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-saffron-500 to-saffron-600 text-white font-bold py-4 md:py-3 px-6 rounded-lg hover:from-saffron-600 hover:to-saffron-700 disabled:opacity-50 transition text-base md:text-lg"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="mt-6 text-center text-xs md:text-sm text-gray-600">
          <p>Default credentials: admin / admin123</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

