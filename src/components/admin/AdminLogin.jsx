import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, checkAuth } from '../../services/api';

const AdminLogin = () => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    checkAuthStatus();
  }, []);
  
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
      await login(userId, password);
      navigate('/admin/dashboard');
    } catch (error) {
      setError(error.response?.data?.error || 'Login failed. Please check your credentials.');
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
