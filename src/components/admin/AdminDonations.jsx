import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminDonations, updateDonation, checkAuth, logout } from '../../services/api';

const AdminDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    loadDonations();
  }, []);
  
  const loadDonations = async () => {
    try {
      const auth = await checkAuth();
      if (!auth.authenticated) {
        navigate('/admin/login');
        return;
      }
      const data = await getAdminDonations();
      setDonations(data);
    } catch (error) {
      console.error('Error loading donations:', error);
      navigate('/admin/login');
    } finally {
      setLoading(false);
    }
  };
  
  const handleTogglePublic = async (id, currentValue) => {
    try {
      await updateDonation(id, { showPublic: !currentValue });
      await loadDonations();
    } catch (error) {
      console.error('Error updating donation:', error);
      alert('Error updating donation');
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
            <h1 className="text-xl md:text-2xl font-bold">Manage Donations</h1>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="px-3 md:px-4 py-2 bg-white text-saffron-600 rounded hover:bg-gray-100 text-sm md:text-base"
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate('/admin/updates')}
                className="px-3 md:px-4 py-2 bg-white text-saffron-600 rounded hover:bg-gray-100 text-sm md:text-base"
              >
                Updates
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
        {/* Mobile: Card Layout */}
        <div className="md:hidden space-y-4">
          {donations.length === 0 ? (
            <div className="text-center text-gray-500 py-8 bg-white rounded-lg p-6">
              No donations found
            </div>
          ) : (
            donations.map((donation) => (
              <div key={donation.id} className="bg-white rounded-lg shadow-lg p-4 border-2 border-gray-200">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-bold text-gray-800 text-lg">{donation.name}</div>
                    <div className="text-sm text-gray-600 mt-1">ID: {donation.id}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-saffron-600">₹{donation.amount.toLocaleString('en-IN')}</div>
                    <div className="text-xs text-gray-500">{new Date(donation.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div><strong>Email:</strong> {donation.email || '-'}</div>
                  <div><strong>Phone:</strong> {donation.phone}</div>
                  <div className="pt-2 border-t">
                    <div className="text-xs text-gray-600 space-y-1">
                      <div><strong>Location:</strong> {
                        donation.villageName || donation.customVillageName || 'N/A'
                      }, {donation.thanaName || '-'}, {donation.districtName || '-'}, {donation.stateName || '-'}, {donation.countryName || '-'}</div>
                      {donation.customVillageName && (
                        <div className="text-saffron-600 italic">(Custom: {donation.customVillageName})</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span><strong>Public:</strong> {donation.showPublic ? 'Yes' : 'No'}</span>
                    <button
                      onClick={() => handleTogglePublic(donation.id, donation.showPublic)}
                      className={`px-4 py-2 rounded text-sm font-semibold ${
                        donation.showPublic
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      Toggle
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Desktop: Table Layout */}
        <div className="hidden md:block bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-saffron-100">
                <tr>
                  <th className="px-6 py-3 text-left text-gray-700 font-semibold">ID</th>
                  <th className="px-6 py-3 text-left text-gray-700 font-semibold">Name</th>
                  <th className="px-6 py-3 text-left text-gray-700 font-semibold">Email</th>
                  <th className="px-6 py-3 text-left text-gray-700 font-semibold">Phone</th>
                  <th className="px-6 py-3 text-left text-gray-700 font-semibold">Location</th>
                  <th className="px-6 py-3 text-left text-gray-700 font-semibold">Amount</th>
                  <th className="px-6 py-3 text-left text-gray-700 font-semibold">Date</th>
                  <th className="px-6 py-3 text-left text-gray-700 font-semibold">Public</th>
                </tr>
              </thead>
              <tbody>
                {donations.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      No donations found
                    </td>
                  </tr>
                ) : (
                  donations.map((donation) => (
                    <tr key={donation.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4">{donation.id}</td>
                      <td className="px-6 py-4 font-semibold">{donation.name}</td>
                      <td className="px-6 py-4">{donation.email || '-'}</td>
                      <td className="px-6 py-4">{donation.phone}</td>
                      <td className="px-6 py-4 text-xs">
                        <div>{donation.villageName || donation.customVillageName || 'N/A'}, {donation.thanaName || '-'}</div>
                        <div className="text-gray-500">{donation.districtName || '-'}, {donation.stateName || '-'}</div>
                        <div className="text-gray-400">{donation.countryName || '-'}</div>
                        {donation.customVillageName && (
                          <div className="text-saffron-600 italic mt-1">(Custom: {donation.customVillageName})</div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-semibold text-saffron-600">₹{donation.amount.toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4">{new Date(donation.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleTogglePublic(donation.id, donation.showPublic)}
                          className={`px-3 py-1 rounded text-sm font-semibold ${
                            donation.showPublic
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }`}
                        >
                          {donation.showPublic ? 'Yes' : 'No'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDonations;
