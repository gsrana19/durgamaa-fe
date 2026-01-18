import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminDonations, updateDonation, checkAuth, logout, getCountries, getStates, getDistricts, getThanas, getVillages } from '../../services/api';

const AdminDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Search filters
  const [searchFilters, setSearchFilters] = useState({
    name: '',
    stateId: null,
    district: '',
    thana: '',
    village: ''
  });

  // Location data for dropdowns
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [thanas, setThanas] = useState([]);
  const [villages, setVillages] = useState([]);

  // Selected location IDs for cascading dropdowns
  const [selectedStateId, setSelectedStateId] = useState(null);
  const [selectedDistrictId, setSelectedDistrictId] = useState(null);
  const [selectedThanaId, setSelectedThanaId] = useState(null);
  const [selectedVillageId, setSelectedVillageId] = useState(null);
  const [showCustomVillage, setShowCustomVillage] = useState(false);
  const [customVillageName, setCustomVillageName] = useState('');

  const searchTimeoutRef = useRef(null);
  const isInitialMount = useRef(true);
  
  // Load countries on mount
  useEffect(() => {
    loadCountries();
  }, []);

  // Load states when countries load (default to India)
  useEffect(() => {
    if (countries.length > 0) {
      const india = countries.find(c => c.name === 'India') || countries[0];
      if (india) {
        loadStates(india.id);
      }
    }
  }, [countries]);

  // Load districts when state changes
  useEffect(() => {
    if (selectedStateId) {
      loadDistricts(selectedStateId);
    } else {
      setDistricts([]);
      setSelectedDistrictId(null);
      setThanas([]);
      setSelectedThanaId(null);
      setVillages([]);
      setSelectedVillageId(null);
    }
  }, [selectedStateId]);

  // Load thanas when district changes
  useEffect(() => {
    if (selectedDistrictId) {
      loadThanas(selectedDistrictId);
    } else {
      setThanas([]);
      setSelectedThanaId(null);
      setVillages([]);
      setSelectedVillageId(null);
    }
  }, [selectedDistrictId]);

  // Load villages when thana changes
  useEffect(() => {
    if (selectedThanaId) {
      loadVillages(selectedThanaId);
    } else {
      setVillages([]);
      setSelectedVillageId(null);
      setShowCustomVillage(false);
      setCustomVillageName('');
    }
  }, [selectedThanaId]);

  // Load donations when filters change (with debouncing)
  useEffect(() => {
    // Skip on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      loadDonations();
      return;
    }

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search by 300ms
    searchTimeoutRef.current = setTimeout(() => {
      loadDonations();
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchFilters.name, searchFilters.stateId, searchFilters.district, searchFilters.thana, searchFilters.village]);
  
  const loadDonations = async () => {
    try {
      const auth = await checkAuth();
      if (!auth.authenticated) {
        navigate('/admin/login');
        return;
      }
      const data = await getAdminDonations(searchFilters);
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

  const loadCountries = async () => {
    try {
      const data = await getCountries();
      setCountries(data);
    } catch (error) {
      console.error('Error loading countries:', error);
    }
  };

  const loadStates = async (countryId) => {
    try {
      const data = await getStates(countryId);
      setStates(data);
    } catch (error) {
      console.error('Error loading states:', error);
    }
  };

  const loadDistricts = async (stateId) => {
    try {
      const data = await getDistricts(stateId);
      setDistricts(data);
      setSelectedDistrictId(null);
      setThanas([]);
      setSelectedThanaId(null);
      setVillages([]);
      setSelectedVillageId(null);
    } catch (error) {
      console.error('Error loading districts:', error);
    }
  };

  const loadThanas = async (districtId) => {
    try {
      const data = await getThanas(districtId);
      setThanas(data);
      setSelectedThanaId(null);
      setVillages([]);
      setSelectedVillageId(null);
    } catch (error) {
      console.error('Error loading thanas:', error);
    }
  };

  const loadVillages = async (thanaId) => {
    try {
      const data = await getVillages(thanaId);
      setVillages(data);
      setSelectedVillageId(null);
      setShowCustomVillage(false);
      setCustomVillageName('');
    } catch (error) {
      console.error('Error loading villages:', error);
    }
  };

  const handleStateChange = (stateId) => {
    setSelectedStateId(stateId);
    setSearchFilters(prev => ({
      ...prev,
      stateId: stateId,
      district: '',
      thana: '',
      village: ''
    }));
  };

  const handleDistrictChange = (districtId, districtName) => {
    setSelectedDistrictId(districtId);
    setSearchFilters(prev => ({
      ...prev,
      district: districtName || '',
      thana: '',
      village: ''
    }));
  };

  const handleThanaChange = (thanaId, thanaName) => {
    setSelectedThanaId(thanaId);
    setSearchFilters(prev => ({
      ...prev,
      thana: thanaName || '',
      village: ''
    }));
  };

  const handleVillageChange = (villageId, villageName) => {
    if (villageId === 'OTHER') {
      setShowCustomVillage(true);
      setSelectedVillageId(null);
      setSearchFilters(prev => ({ ...prev, village: '' }));
      setCustomVillageName('');
    } else {
      setShowCustomVillage(false);
      setSelectedVillageId(villageId);
      setCustomVillageName('');
      setSearchFilters(prev => ({ ...prev, village: villageName || '' }));
    }
  };

  const handleCustomVillageChange = (value) => {
    setCustomVillageName(value);
    setSearchFilters(prev => ({ ...prev, village: value }));
  };

  const handleNameFilterChange = (value) => {
    setSearchFilters(prev => ({
      ...prev,
      name: value
    }));
  };

  const handleClearFilters = () => {
    setSearchFilters({
      name: '',
      stateId: null,
      district: '',
      thana: '',
      village: ''
    });
    setSelectedStateId(null);
    setSelectedDistrictId(null);
    setSelectedThanaId(null);
    setSelectedVillageId(null);
    setShowCustomVillage(false);
    setCustomVillageName('');
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
                onClick={() => navigate('/admin/expenses')}
                className="px-3 md:px-4 py-2 bg-white text-saffron-600 rounded hover:bg-gray-100 text-sm md:text-base"
              >
                Expenses
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
        {/* Search Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6">
          <h2 className="text-xl font-bold text-saffron-600 mb-4">Search Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Name Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name (Wildcard Search)
              </label>
              <input
                type="text"
                value={searchFilters.name}
                onChange={(e) => handleNameFilterChange(e.target.value)}
                placeholder="Enter name..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-transparent"
              />
            </div>

            {/* State Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State
              </label>
              <select
                value={selectedStateId || ''}
                onChange={(e) => {
                  const stateId = e.target.value ? parseInt(e.target.value) : null;
                  handleStateChange(stateId);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-transparent bg-white"
              >
                <option value="">All States</option>
                {states.map((state) => (
                  <option key={state.id} value={state.id}>
                    {state.name}
                  </option>
                ))}
              </select>
            </div>

            {/* District/City Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                District/City
              </label>
              <select
                value={selectedDistrictId || ''}
                onChange={(e) => {
                  const districtId = e.target.value ? parseInt(e.target.value) : null;
                  const district = districts.find(d => d.id === districtId);
                  handleDistrictChange(districtId, district?.name);
                }}
                disabled={!selectedStateId || districts.length === 0}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-transparent bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">All Districts</option>
                {districts.map((district) => (
                  <option key={district.id} value={district.id}>
                    {district.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Thana Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thana
              </label>
              <select
                value={selectedThanaId || ''}
                onChange={(e) => {
                  const thanaId = e.target.value ? parseInt(e.target.value) : null;
                  const thana = thanas.find(t => t.id === thanaId);
                  handleThanaChange(thanaId, thana?.name);
                }}
                disabled={!selectedDistrictId || thanas.length === 0}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-transparent bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">All Thanas</option>
                {thanas.map((thana) => (
                  <option key={thana.id} value={thana.id}>
                    {thana.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Village Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Village
              </label>
              {!showCustomVillage ? (
                <select
                  value={selectedVillageId || ''}
                  onChange={(e) => {
                    if (e.target.value === 'OTHER') {
                      handleVillageChange('OTHER', '');
                    } else {
                      const villageId = e.target.value ? parseInt(e.target.value) : null;
                      const village = villages.find(v => v.id === villageId);
                      handleVillageChange(villageId, village?.name);
                    }
                  }}
                  disabled={!selectedThanaId || villages.length === 0}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-transparent bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">All Villages</option>
                  {villages.map((village) => (
                    <option key={village.id} value={village.id}>
                      {village.name}
                    </option>
                  ))}
                  {villages.length > 0 && (
                    <option value="OTHER">Other (Village not listed)</option>
                  )}
                </select>
              ) : (
                <input
                  type="text"
                  value={customVillageName}
                  onChange={(e) => handleCustomVillageChange(e.target.value)}
                  placeholder="Enter village name..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-transparent"
                />
              )}
            </div>
          </div>
          
          {/* Clear Filters Button */}
          {(searchFilters.name || searchFilters.stateId || searchFilters.district || searchFilters.thana || searchFilters.village) && (
            <div className="mt-4">
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm font-semibold"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

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

