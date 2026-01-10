import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { createSevaBooking } from '../services/api';

// Hardcoded Sevas array - TODO: Fetch from backend API
const sevas = [
  {
    id: 1,
    name: 'Annapurna Seva',
    shortDescription: 'Sponsor food offering to the deity and devotees.',
    suggestedDonation: '₹1,000'
  },
  {
    id: 2,
    name: 'Deep Seva (Lighting Lamps)',
    shortDescription: 'Light oil lamps for the deity during evening aarti.',
    suggestedDonation: '₹500'
  },
  {
    id: 3,
    name: 'Vastra Seva',
    shortDescription: 'Offer new clothes and ornaments to the deity.',
    suggestedDonation: '₹2,000'
  },
  {
    id: 4,
    name: 'Abhishekam Seva',
    shortDescription: 'Sacred bath ritual for the deity with milk, honey, and water.',
    suggestedDonation: '₹1,500'
  },
  {
    id: 5,
    name: 'Bhog/Prasad Seva',
    shortDescription: 'Offer special food to the deity which is then distributed as prasad.',
    suggestedDonation: '₹800'
  }
];

const SevaBooking = () => {
  const { t } = useTranslation();
  const [selectedSeva, setSelectedSeva] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    sevaName: '',
    bookingDate: '',
    devoteeName: '',
    gotra: '',
    phoneOrEmail: '',
    specialIntentions: ''
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const handleBookNow = (seva) => {
    setSelectedSeva(seva);
    setFormData({
      sevaName: seva.name,
      bookingDate: '',
      devoteeName: '',
      gotra: '',
      phoneOrEmail: '',
      specialIntentions: ''
    });
    setErrors({});
    setSuccessMessage('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedSeva(null);
    setFormData({
      sevaName: '',
      bookingDate: '',
      devoteeName: '',
      gotra: '',
      phoneOrEmail: '',
      specialIntentions: ''
    });
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.bookingDate) {
      newErrors.bookingDate = t('sevaBooking.errorDateRequired');
    } else {
      const selectedDate = new Date(formData.bookingDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.bookingDate = t('sevaBooking.errorDatePast');
      }
    }
    if (!formData.devoteeName.trim()) {
      newErrors.devoteeName = t('sevaBooking.errorNameRequired');
    }
    if (!formData.phoneOrEmail.trim()) {
      newErrors.phoneOrEmail = t('sevaBooking.errorContactRequired');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    try {
      await createSevaBooking(formData);
      closeModal();
      setSuccessMessage(t('sevaBooking.successMessage'));
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (error) {
      console.error('Error booking seva:', error);
      const errorMessage = error.response?.data?.error || 'Failed to book seva. Please try again.';
      setErrors({ submit: errorMessage });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-saffron-600 mb-6 md:mb-8 text-center">
          {t('sevaBooking.title')}
        </h1>

        {/* Payment Note */}
        <div className="bg-yellow-50 border-2 border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-6 text-sm md:text-base">
          {/* TODO: Integrate online payment via UPI/QR */}
          {t('sevaBooking.paymentNote')}
        </div>

        {/* Sevas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          {sevas.map((seva) => (
            <div
              key={seva.id}
              className="bg-white rounded-lg shadow-lg p-6 md:p-8 hover:shadow-xl transition-shadow flex flex-col"
            >
              <h3 className="text-xl md:text-2xl font-bold text-saffron-600 mb-3">
                {seva.name}
              </h3>
              <p className="text-gray-700 mb-4 flex-grow text-base md:text-lg">
                {seva.shortDescription}
              </p>
              <p className="text-saffron-600 font-semibold mb-4 text-base md:text-lg">
                {t('sevaBooking.suggestedDonation')}: {seva.suggestedDonation}
              </p>
              <button
                onClick={() => handleBookNow(seva)}
                className="w-full bg-saffron-500 text-white px-6 py-3 rounded-lg hover:bg-saffron-600 text-base md:text-lg font-semibold transition-colors min-h-[44px]"
              >
                {t('sevaBooking.bookNow')}
              </button>
            </div>
          ))}
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border-2 border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm md:text-base">
            {successMessage}
          </div>
        )}

        {/* Booking Modal */}
        {showModal && selectedSeva && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 md:p-8">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl md:text-3xl font-bold text-saffron-600">
                    {t('sevaBooking.bookingForm')}
                  </h2>
                  <button
                    onClick={closeModal}
                    className="text-gray-500 hover:text-gray-700 text-2xl md:text-3xl font-bold min-w-[44px] min-h-[44px]"
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">
                      {t('sevaBooking.selectedSeva')}
                    </label>
                    <input
                      type="text"
                      value={formData.sevaName}
                      readOnly
                      className="w-full px-4 py-3 md:py-2 border-2 border-gray-300 rounded-lg bg-gray-50 text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">
                      {t('sevaBooking.date')} *
                    </label>
                    <input
                      type="date"
                      name="bookingDate"
                      value={formData.bookingDate}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      className={`w-full px-4 py-3 md:py-2 border-2 rounded-lg focus:ring-2 focus:ring-saffron-500 text-base ${
                        errors.bookingDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.bookingDate && (
                      <p className="text-red-600 text-sm mt-1">{errors.bookingDate}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">
                      {t('sevaBooking.devoteeName')} *
                    </label>
                    <input
                      type="text"
                      name="devoteeName"
                      value={formData.devoteeName}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 md:py-2 border-2 rounded-lg focus:ring-2 focus:ring-saffron-500 text-base ${
                        errors.devoteeName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder={t('sevaBooking.devoteeNamePlaceholder')}
                    />
                    {errors.devoteeName && (
                      <p className="text-red-600 text-sm mt-1">{errors.devoteeName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">
                      {t('sevaBooking.gotra')}
                    </label>
                    <input
                      type="text"
                      name="gotra"
                      value={formData.gotra}
                      onChange={handleChange}
                      className="w-full px-4 py-3 md:py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron-500 text-base"
                      placeholder={t('sevaBooking.gotraPlaceholder')}
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">
                      {t('sevaBooking.phoneOrEmail')} *
                    </label>
                    <input
                      type="text"
                      name="phoneOrEmail"
                      value={formData.phoneOrEmail}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 md:py-2 border-2 rounded-lg focus:ring-2 focus:ring-saffron-500 text-base ${
                        errors.phoneOrEmail ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder={t('sevaBooking.phoneOrEmailPlaceholder')}
                    />
                    {errors.phoneOrEmail && (
                      <p className="text-red-600 text-sm mt-1">{errors.phoneOrEmail}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">
                      {t('sevaBooking.specialIntentions')}
                    </label>
                    <textarea
                      name="specialIntentions"
                      value={formData.specialIntentions}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-3 md:py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron-500 text-base"
                      placeholder={t('sevaBooking.specialIntentionsPlaceholder')}
                    />
                  </div>

                  {errors.submit && (
                    <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm md:text-base">
                      {errors.submit}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="submit"
                      className="flex-1 bg-saffron-500 text-white px-6 py-3 rounded-lg hover:bg-saffron-600 text-base md:text-lg font-semibold transition-colors min-h-[44px]"
                    >
                      {t('sevaBooking.submitButton')}
                    </button>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 text-base md:text-lg font-semibold transition-colors min-h-[44px]"
                    >
                      {t('sevaBooking.cancel')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SevaBooking;

