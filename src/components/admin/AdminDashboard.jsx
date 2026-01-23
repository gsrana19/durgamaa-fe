import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { getAdminStats, checkAuth, logout } from '../../services/api';
import { useIdleTimeout } from '../../hooks/useIdleTimeout';

const AdminDashboard = () => {
  const { t } = useTranslation();
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
    return <div className="min-h-screen flex items-center justify-center">{t('messages.loading') || 'Loading...'}</div>;
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Responsive */}
      <div className="bg-saffron-600 text-white p-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold">{t('admin.dashboard.title') || 'Admin Dashboard'}</h1>
              {lastLoginTime && (
                <p className="text-sm mt-1 opacity-90">
                  {t('admin.dashboard.lastLogin') || 'Last login:'} {lastLoginTime}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => navigate('/admin/donations')}
                className="px-3 md:px-4 py-2 bg-white text-saffron-600 rounded hover:bg-gray-100 text-sm md:text-base"
              >
                {t('admin.nav.donations') || 'Donations'}
              </button>
              <button
                onClick={() => navigate('/admin/updates')}
                className="px-3 md:px-4 py-2 bg-white text-saffron-600 rounded hover:bg-gray-100 text-sm md:text-base"
              >
                {t('admin.nav.updates') || 'Updates'}
              </button>
              <button
                onClick={() => navigate('/admin/expenses')}
                className="px-3 md:px-4 py-2 bg-white text-saffron-600 rounded hover:bg-gray-100 text-sm md:text-base"
              >
                {t('admin.nav.expenses') || 'Expenses'}
              </button>
              <button
                onClick={() => navigate('/admin/events')}
                className="px-3 md:px-4 py-2 bg-white text-saffron-600 rounded hover:bg-gray-100 text-sm md:text-base"
              >
                {t('admin.nav.events') || 'Events'}
              </button>
              <button
                onClick={() => navigate('/admin/team-members')}
                className="px-3 md:px-4 py-2 bg-white text-saffron-600 rounded hover:bg-gray-100 text-sm md:text-base"
              >
                {t('admin.nav.teamMembers') || 'Team Members'}
              </button>
              <button
                onClick={() => navigate('/admin/donation-confirmations')}
                className="px-3 md:px-4 py-2 bg-white text-saffron-600 rounded hover:bg-gray-100 text-sm md:text-base"
              >
                {t('admin.nav.paymentConfirmations') || 'Payment Confirmations'}
              </button>
              <button
                onClick={handleLogout}
                className="px-3 md:px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm md:text-base"
              >
                {t('buttons.logout') || 'Logout'}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
          {/* Quick Actions - Left Side */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 lg:p-8">
              <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6">{t('admin.dashboard.quickActionsTitle') || 'Quick Actions'}</h3>
              <div className="space-y-4 md:space-y-5">
                {/* Manage Donations */}
                <div>
                  <h4 className="font-bold text-saffron-700 text-base md:text-lg lg:text-xl mb-2">{t('admin.dashboard.quickActions.manageDonations') || 'Manage Donations'}</h4>
                  <button
                    onClick={() => navigate('/admin/donations')}
                    className="w-full p-3 md:p-4 bg-saffron-100 hover:bg-saffron-200 rounded-lg text-left transition"
                  >
                    <div className="text-sm md:text-base text-gray-700">{t('admin.dashboard.quickActions.manageDonationsDesc') || 'View and manage all donations'}</div>
                  </button>
                </div>
                
                {/* Manage Updates */}
                <div>
                  <h4 className="font-bold text-saffron-700 text-base md:text-lg lg:text-xl mb-2">{t('admin.dashboard.quickActions.manageUpdates') || 'Manage Updates'}</h4>
                  <button
                    onClick={() => navigate('/admin/updates')}
                    className="w-full p-3 md:p-4 bg-saffron-100 hover:bg-saffron-200 rounded-lg text-left transition"
                  >
                    <div className="text-sm md:text-base text-gray-700">{t('admin.dashboard.quickActions.manageUpdatesDesc') || 'Add and edit construction updates'}</div>
                  </button>
                </div>
                
                {/* Manage Expenses */}
                <div>
                  <h4 className="font-bold text-saffron-700 text-base md:text-lg lg:text-xl mb-2">{t('admin.dashboard.quickActions.manageExpenses') || 'Manage Expenses'}</h4>
                  <button
                    onClick={() => navigate('/admin/expenses')}
                    className="w-full p-3 md:p-4 bg-saffron-100 hover:bg-saffron-200 rounded-lg text-left transition"
                  >
                    <div className="text-sm md:text-base text-gray-700">{t('admin.dashboard.quickActions.manageExpensesDesc') || 'Add and manage expenditures'}</div>
                  </button>
                </div>
                
                {/* Manage Events */}
                <div>
                  <h4 className="font-bold text-saffron-700 text-base md:text-lg lg:text-xl mb-2">{t('admin.dashboard.quickActions.manageEvents') || 'Manage Events'}</h4>
                  <button
                    onClick={() => navigate('/admin/events')}
                    className="w-full p-3 md:p-4 bg-saffron-100 hover:bg-saffron-200 rounded-lg text-left transition"
                  >
                    <div className="text-sm md:text-base text-gray-700">{t('admin.dashboard.quickActions.manageEventsDesc') || 'Add and manage special events'}</div>
                  </button>
                </div>
                
                {/* Manage Team Members */}
                <div>
                  <h4 className="font-bold text-saffron-700 text-base md:text-lg lg:text-xl mb-2">{t('admin.dashboard.quickActions.manageTeamMembers') || 'Manage Team Members'}</h4>
                  <button
                    onClick={() => navigate('/admin/team-members')}
                    className="w-full p-3 md:p-4 bg-saffron-100 hover:bg-saffron-200 rounded-lg text-left transition"
                  >
                    <div className="text-sm md:text-base text-gray-700">{t('admin.dashboard.quickActions.manageTeamMembersDesc') || 'Add and manage team member photos'}</div>
                  </button>
                </div>
                
                {/* Payment Confirmations */}
                <div>
                  <h4 className="font-bold text-saffron-700 text-base md:text-lg lg:text-xl mb-2">{t('admin.dashboard.quickActions.paymentConfirmations') || 'Payment Confirmations'}</h4>
                  <button
                    onClick={() => navigate('/admin/donation-confirmations')}
                    className="w-full p-3 md:p-4 bg-saffron-100 hover:bg-saffron-200 rounded-lg text-left transition"
                  >
                    <div className="text-sm md:text-base text-gray-700">{t('admin.dashboard.quickActions.paymentConfirmationsDesc') || 'Verify and manage donation confirmations'}</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Statistics - Right Side */}
          <div className="lg:col-span-3">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 md:mb-8">{t('admin.dashboard.statisticsTitle') || 'Statistics'}</h2>
            {stats && (
              <div className="space-y-4 md:space-y-6">
                {/* Top Row: Total Amount Collected, Total Money Left */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                    <div className="text-3xl md:text-4xl font-bold text-saffron-600 mb-2 break-words">
                      ₹{stats.totalAmount.toLocaleString('en-IN')}
                    </div>
                    <div className="text-gray-600 text-sm md:text-base">{t('admin.dashboard.statistics.totalAmountCollected') || 'Total Amount Collected'}</div>
                  </div>
                  <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                    <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2 break-words">
                      ₹{(stats.remainingAmount || 0).toLocaleString('en-IN')}
                    </div>
                    <div className="text-gray-600 text-sm md:text-base">{t('admin.dashboard.statistics.totalMoneyLeft') || 'Total Money Left'}</div>
                  </div>
                </div>
                
                {/* Bottom Row: Expensed So Far, Total Donors, Donations (Last 7 Days) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                  <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                    <div className="text-3xl md:text-4xl font-bold text-red-600 mb-2 break-words">
                      ₹{(stats.totalExpenses || 0).toLocaleString('en-IN')}
                    </div>
                    <div className="text-gray-600 text-sm md:text-base">{t('admin.dashboard.statistics.expensedSoFar') || 'Expensed So Far'}</div>
                  </div>
                  <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                    <div className="text-3xl md:text-4xl font-bold text-saffron-600 mb-2">
                      {stats.totalDonors}
                    </div>
                    <div className="text-gray-600 text-sm md:text-base">{t('admin.dashboard.statistics.totalDonors') || 'Total Donors'}</div>
                  </div>
                  <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                    <div className="text-3xl md:text-4xl font-bold text-saffron-600 mb-2">
                      {stats.last7DaysCount}
                    </div>
                    <div className="text-gray-600 text-sm md:text-base">{t('admin.dashboard.statistics.donationsLast7Days') || 'Donations (Last 7 Days)'}</div>
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
