import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPublicDonationsPaginated } from '../services/api';

const DonorList = () => {
  const [donations, setDonations] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDonations(currentPage);
  }, [currentPage]);

  const loadDonations = async (page) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getPublicDonationsPaginated(page, pageSize);
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

        {/* Stats */}
        {totalElements > 0 && (
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6 text-center">
            <p className="text-gray-700 text-sm md:text-base">
              Total Donors: <span className="font-bold text-saffron-600">{totalElements}</span>
            </p>
          </div>
        )}

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
