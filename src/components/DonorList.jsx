import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getPublicDonationsPaginated, getCountries, getStates, getDistricts, getThanas, getVillages } from '../services/api';

// xlsx library loaded from CDN (see public/index.html)
// Access via window.XLSX
const XLSX = typeof window !== 'undefined' ? window.XLSX : null;

const DonorList = () => {
  const [donations, setDonations] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
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

  // Auto-select Jharkhand when states load
  useEffect(() => {
    if (states.length > 0 && !selectedStateId) {
      const jharkhand = states.find(s => s.name === 'Jharkhand');
      if (jharkhand) {
        setSelectedStateId(jharkhand.id);
        const defaultFilters = {
          name: '',
          stateId: jharkhand.id,
          district: '',
          thana: '',
          village: ''
        };
        setSearchFilters(defaultFilters);
        // Trigger search immediately for default state
        loadDonations(0, defaultFilters);
      }
    }
  }, [states]);

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

  // Load donations when page changes
  useEffect(() => {
    loadDonations(currentPage);
    // Note: loadDonations uses searchFilters but we intentionally only re-run on page change
    // eslint-disable-next-line
  }, [currentPage]);

  // Handle search filter changes with debouncing
  useEffect(() => {
    // Skip on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Reset to page 0 when filters change
    if (currentPage !== 0) {
      setCurrentPage(0);
    } else {
      // Debounce search by 300ms if already on page 0
      searchTimeoutRef.current = setTimeout(() => {
        loadDonations(0);
      }, 300);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
    // Note: currentPage and loadDonations are intentionally omitted from dependencies
    // eslint-disable-next-line
  }, [searchFilters.name, searchFilters.stateId, searchFilters.district, searchFilters.thana, searchFilters.village]);

  const loadDonations = async (page, filters = null) => {
    setLoading(true);
    setError(null);
    try {
      const filtersToUse = filters || searchFilters;
      const response = await getPublicDonationsPaginated(page, pageSize, filtersToUse);
      setDonations(response.donations || []);
      setCurrentPage(response.currentPage || 0);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (err) {
      console.error('Error loading donations:', err);
      setError('Failed to load donor list. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  const formatAmount = (amount) => {
    if (!amount) return '₹0';
    return `₹${parseFloat(amount).toLocaleString('en-IN')}`;
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

  const handleStateChange = (stateId, stateName) => {
    setSelectedStateId(stateId);
    const newFilters = {
      ...searchFilters,
      stateId: stateId,
      district: '',
      thana: '',
      village: ''
    };
    setSearchFilters(newFilters);
    // Trigger search immediately with new filters (no debounce for dropdown selection)
    setCurrentPage(0);
    loadDonations(0, newFilters);
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
    const jharkhand = states.find(s => s.name === 'Jharkhand');
    const defaultStateId = jharkhand ? jharkhand.id : null;
    
    setSearchFilters({
      name: '',
      stateId: defaultStateId,
      district: '',
      thana: '',
      village: ''
    });
    setSelectedStateId(defaultStateId);
    setSelectedDistrictId(null);
    setSelectedThanaId(null);
    setSelectedVillageId(null);
    setShowCustomVillage(false);
    setCustomVillageName('');
  };

  const exportToExcel = async () => {
    if (!XLSX) {
      alert('Excel export library is not loaded. Please refresh the page and try again.');
      return;
    }

    try {
      setLoading(true);
      // Fetch all matching donations (not paginated) for export
      const response = await getPublicDonationsPaginated(0, 10000, searchFilters);
      const allDonations = response.donations || [];

      // Prepare data for Excel
      const excelData = allDonations.map((donation, index) => ({
        'S.No': index + 1,
        'Name': donation.name || 'Anonymous Devotee',
        'Email': donation.email || '',
        'Phone': donation.phone || '',
        'Country': donation.countryName || '',
        'State': donation.stateName || '',
        'District': donation.districtName || '',
        'Thana': donation.thanaName || '',
        'Village': donation.villageName || donation.customVillageName || '',
        'Amount (₹)': parseFloat(donation.amount || 0).toFixed(2),
        'Date': formatDate(donation.createdAt)
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      const colWidths = [
        { wch: 8 },   // S.No
        { wch: 25 },  // Name
        { wch: 30 },  // Email
        { wch: 15 },  // Phone
        { wch: 15 },  // Country
        { wch: 20 },  // State
        { wch: 20 },  // District
        { wch: 20 },  // Thana
        { wch: 25 },  // Village
        { wch: 15 },  // Amount
        { wch: 20 }   // Date
      ];
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'Donor List');

      // Generate filename with current date
      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `Donor_List_${dateStr}.xlsx`;

      // Write file
      XLSX.writeFile(wb, filename);
    } catch (err) {
      console.error('Error exporting to Excel:', err);
      setError('Failed to export data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-saffron-50 to-white py-8 md:py-12 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-saffron-600 mb-4">
            🙏 Samarpan Record (Donor List)
          </h1>
          <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
            A heartfelt tribute to all devotees who have contributed to the construction of Maa Durga's Mandir.
            Your generosity brings us closer to completing this sacred place of worship.
          </p>
        </div>

        {/* Stats and Export Button */}
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {totalElements > 0 && (
              <p className="text-gray-700 text-sm md:text-base">
                Total Donors: <span className="font-bold text-saffron-600">{totalElements}</span>
              </p>
            )}
            <button
              onClick={exportToExcel}
              disabled={loading || totalElements === 0}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition shadow-md ${
                loading || totalElements === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              📥 Download Excel
            </button>
          </div>
        </div>

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
                  console.log('State changed to:', stateId); // Debug log
                  handleStateChange(stateId, null);
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
          {(searchFilters.name || searchFilters.district || searchFilters.thana || searchFilters.village) && (
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

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-saffron-600"></div>
            <p className="mt-4 text-gray-600">Loading donor list...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center mb-6">
            <p className="text-red-800">{error}</p>
            <button
              onClick={() => loadDonations(currentPage)}
              className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* Donor List - Desktop Table / Mobile Cards */}
        {!loading && !error && (
          <>
            {donations.length === 0 ? (
              <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 text-center">
                <p className="text-gray-500 text-lg">No donors yet. Be the first to contribute!</p>
                <Link
                  to="/mandir-nirmaan-seva"
                  className="inline-block mt-4 bg-saffron-500 text-white px-6 py-3 rounded-lg hover:bg-saffron-600 transition"
                >
                  Make a Donation
                </Link>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block bg-white rounded-lg shadow-lg overflow-hidden mb-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-saffron-100">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-bold text-saffron-800 uppercase">#</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-saffron-800 uppercase">Name</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-saffron-800 uppercase">Location</th>
                          <th className="px-6 py-4 text-right text-sm font-bold text-saffron-800 uppercase">Amount</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-saffron-800 uppercase">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {donations.map((donation, index) => (
                          <tr key={donation.id} className="hover:bg-saffron-50 transition-colors">
                            <td className="px-6 py-4 text-sm text-gray-700">
                              {(currentPage * pageSize) + index + 1}
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                              {donation.name || 'Anonymous Devotee'}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {donation.districtName && donation.stateName 
                                ? `${donation.districtName}, ${donation.stateName}`
                                : donation.city || 'N/A'}
                            </td>
                            <td className="px-6 py-4 text-sm font-bold text-saffron-600 text-right">
                              {formatAmount(donation.amount)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {formatDate(donation.createdAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4 mb-6">
                  {donations.map((donation, index) => (
                    <div key={donation.id} className="bg-white rounded-lg shadow-md p-4 border-l-4 border-saffron-500">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-base">
                            {donation.name || 'Anonymous Devotee'}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {donation.districtName && donation.stateName 
                              ? `${donation.districtName}, ${donation.stateName}`
                              : donation.city || ''}
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-bold text-saffron-600 text-lg">
                            {formatAmount(donation.amount)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            #{((currentPage * pageSize) + index + 1)}
                          </p>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                          {formatDate(donation.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                      <div className="text-sm text-gray-600">
                        Showing {donations.length > 0 ? (currentPage * pageSize) + 1 : 0} to{' '}
                        {Math.min((currentPage + 1) * pageSize, totalElements)} of {totalElements} donors
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePageChange(0)}
                          disabled={currentPage === 0}
                          className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                            currentPage === 0
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              : 'bg-saffron-500 text-white hover:bg-saffron-600'
                          }`}
                        >
                          First
                        </button>
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 0}
                          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                            currentPage === 0
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              : 'bg-saffron-500 text-white hover:bg-saffron-600'
                          }`}
                        >
                          Previous
                        </button>
                        <div className="flex items-center gap-2">
                          <span className="px-4 py-2 bg-saffron-100 text-saffron-600 rounded-lg text-sm font-semibold">
                            Page {currentPage + 1} of {totalPages}
                          </span>
                        </div>
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage >= totalPages - 1}
                          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                            currentPage >= totalPages - 1
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              : 'bg-saffron-500 text-white hover:bg-saffron-600'
                          }`}
                        >
                          Next
                        </button>
                        <button
                          onClick={() => handlePageChange(totalPages - 1)}
                          disabled={currentPage >= totalPages - 1}
                          className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                            currentPage >= totalPages - 1
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              : 'bg-saffron-500 text-white hover:bg-saffron-600'
                          }`}
                        >
                          Last
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Back to Donation Page */}
        <div className="mt-8 text-center">
          <Link
            to="/mandir-nirmaan-seva"
            className="inline-block bg-saffron-500 text-white px-6 py-3 rounded-lg hover:bg-saffron-600 transition font-semibold shadow-md"
          >
            ← Back to Donation Page
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DonorList;
