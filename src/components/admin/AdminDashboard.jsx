import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminStats, checkAuth, logout } from '../../services/api';
import { useIdleTimeout } from '../../hooks/useIdleTimeout';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastLoginTime, setLastLoginTime] = useState(null);
  const navigate = useNavigate();
  
  // Set up idle timeout (5 minutes)
  useIdleTimeout(5, async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('isAuthenticated');
    navigate('/admin/login', { 
      state: { message: 'Session expired due to inactivity. Please login again.' }
    });
  });
  
  useEffect(() => {
    loadDashboard();
  }, []);
  
  const loadDashboard = async () => {
    try {
      const auth = await checkAuth();
      if (!auth.authenticated) {
        navigate('/admin/login');
        return;
      }
      const statsData = await getAdminStats();
      setStats(statsData);
      
      // Get last login time from localStorage
      const storedLoginTime = localStorage.getItem('lastLoginTime');
      if (storedLoginTime) {
        setLastLoginTime(storedLoginTime);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        // Session expired
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('lastLoginTime');
        navigate('/admin/login', { 
          state: { message: 'Session expired. Please login again.' }
        });
      } else {
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login');
    } catch (error) {
      navigate('/admin/login');
    }
  };
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Responsive */}
      <div className="bg-saffron-600 text-white p-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold">Admin Dashboard</h1>
              {lastLoginTime && (
                <p className="text-sm mt-1 opacity-90">
                  Last login: {lastLoginTime}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => navigate('/admin/donations')}
                className="px-3 md:px-4 py-2 bg-white text-saffron-600 rounded hover:bg-gray-100 text-sm md:text-base"
              >
                Donations
              </button>
              <button
                onClick={() => navigate('/admin/updates')}
                className="px-3 md:px-4 py-2 bg-white text-saffron-600 rounded hover:bg-gray-100 text-sm md:text-base"
              >
                Updates
              </button>
              <button
                onClick={() => navigate('/admin/expenses')}
                className="px-3 md:px-4 py-2 bg-white text-saffron-600 rounded hover:bg-gray-100 text-sm md:text-base"
              >
                Expenses
              </button>
              <button
                onClick={() => navigate('/admin/events')}
                className="px-3 md:px-4 py-2 bg-white text-saffron-600 rounded hover:bg-gray-100 text-sm md:text-base"
              >
                Events
              </button>
              <button
                onClick={() => navigate('/admin/team-members')}
                className="px-3 md:px-4 py-2 bg-white text-saffron-600 rounded hover:bg-gray-100 text-sm md:text-base"
              >
                Team Members
              </button>
              <button
                onClick={handleLogout}
                className="px-3 md:px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm md:text-base"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
          {/* Quick Actions - Left Side */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
              <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6">Quick Actions</h3>
              <div className="space-y-4">
                <button
                  onClick={() => navigate('/admin/donations')}
                  className="w-full p-4 md:p-6 bg-saffron-100 hover:bg-saffron-200 rounded-lg text-left transition"
                >
                  <div className="font-bold text-saffron-700 text-lg md:text-xl mb-2">Manage Donations</div>
                  <div className="text-sm md:text-base text-gray-600">View and manage all donations</div>
                </button>
                <button
                  onClick={() => navigate('/admin/updates')}
                  className="w-full p-4 md:p-6 bg-saffron-100 hover:bg-saffron-200 rounded-lg text-left transition"
                >
                  <div className="font-bold text-saffron-700 text-lg md:text-xl mb-2">Manage Updates</div>
                  <div className="text-sm md:text-base text-gray-600">Add and edit construction updates</div>
                </button>
                <button
                  onClick={() => navigate('/admin/expenses')}
                  className="w-full p-4 md:p-6 bg-saffron-100 hover:bg-saffron-200 rounded-lg text-left transition"
                >
                  <div className="font-bold text-saffron-700 text-lg md:text-xl mb-2">Manage Expenses</div>
                  <div className="text-sm md:text-base text-gray-600">Add and manage expenditures</div>
                </button>
                <button
                  onClick={() => navigate('/admin/events')}
                  className="w-full p-4 md:p-6 bg-saffron-100 hover:bg-saffron-200 rounded-lg text-left transition"
                >
                  <div className="font-bold text-saffron-700 text-lg md:text-xl mb-2">Manage Events</div>
                  <div className="text-sm md:text-base text-gray-600">Add and manage special events</div>
                </button>
                <button
                  onClick={() => navigate('/admin/team-members')}
                  className="w-full p-4 md:p-6 bg-saffron-100 hover:bg-saffron-200 rounded-lg text-left transition"
                >
                  <div className="font-bold text-saffron-700 text-lg md:text-xl mb-2">Manage Team Members</div>
                  <div className="text-sm md:text-base text-gray-600">Add and manage team member photos</div>
                </button>
              </div>
            </div>
          </div>
          
          {/* Statistics - Right Side */}
          <div className="lg:col-span-3">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 md:mb-8">Statistics</h2>
            {stats && (
              <div className="space-y-4 md:space-y-6">
                {/* Top Row: Total Amount Collected, Total Money Left */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                    <div className="text-3xl md:text-4xl font-bold text-saffron-600 mb-2 break-words">
                      ₹{stats.totalAmount.toLocaleString('en-IN')}
                    </div>
                    <div className="text-gray-600 text-sm md:text-base">Total Amount Collected</div>
                  </div>
                  <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                    <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2 break-words">
                      ₹{(stats.remainingAmount || 0).toLocaleString('en-IN')}
                    </div>
                    <div className="text-gray-600 text-sm md:text-base">Total Money Left</div>
                  </div>
                </div>
                
                {/* Bottom Row: Expensed So Far, Total Donors, Donations (Last 7 Days) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                  <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                    <div className="text-3xl md:text-4xl font-bold text-red-600 mb-2 break-words">
                      ₹{(stats.totalExpenses || 0).toLocaleString('en-IN')}
                    </div>
                    <div className="text-gray-600 text-sm md:text-base">Expensed So Far</div>
                  </div>
                  <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                    <div className="text-3xl md:text-4xl font-bold text-saffron-600 mb-2">
                      {stats.totalDonors}
                    </div>
                    <div className="text-gray-600 text-sm md:text-base">Total Donors</div>
                  </div>
                  <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                    <div className="text-3xl md:text-4xl font-bold text-saffron-600 mb-2">
                      {stats.last7DaysCount}
                    </div>
                    <div className="text-gray-600 text-sm md:text-base">Donations (Last 7 Days)</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
