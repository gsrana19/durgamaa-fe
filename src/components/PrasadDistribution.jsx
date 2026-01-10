import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { createPrasadSponsorship } from '../services/api';

// Today's Prasad config - easy to change later
const todaysPrasad = {
  name: 'Suji Halwa',
  distributionTime: 'After Morning Aarti',
  note: 'Available for all devotees present in the Mandir.'
};

const PrasadDistribution = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    occasion: '',
    preferredDate: ''
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
    setSuccessMessage('');
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = t('prasadDistribution.errorNameRequired');
    }
    if (!formData.preferredDate) {
      newErrors.preferredDate = t('prasadDistribution.errorDateRequired');
    } else {
      const selectedDate = new Date(formData.preferredDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.preferredDate = t('prasadDistribution.errorDatePast');
      }
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
      await createPrasadSponsorship(formData);
      setSuccessMessage(t('prasadDistribution.successMessage'));
      
      // Reset form
      setFormData({
        name: '',
        occasion: '',
        preferredDate: ''
      });
    } catch (error) {
      console.error('Error submitting prasad sponsorship:', error);
      const errorMessage = error.response?.data?.error || 'Failed to submit. Please try again.';
      setErrors({ submit: errorMessage });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-saffron-600 mb-6 md:mb-8 text-center">
          {t('prasadDistribution.title')}
        </h1>

        {/* Today's Prasad Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-saffron-600 mb-4 md:mb-6">
            {t('prasadDistribution.todaysPrasad')}
          </h2>
          <div className="bg-gradient-to-br from-saffron-50 to-saffron-100 rounded-lg p-4 md:p-6">
            <h3 className="text-xl md:text-2xl font-semibold text-saffron-700 mb-2">
              {todaysPrasad.name}
            </h3>
            <p className="text-saffron-600 font-semibold mb-3 text-base md:text-lg">
              {t('prasadDistribution.distributionTime')}: {todaysPrasad.distributionTime}
            </p>
            <p className="text-gray-700 text-base md:text-lg">
              {todaysPrasad.note}
            </p>
          </div>
        </div>

        {/* Sponsor Prasad Seva Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-saffron-600 mb-4 md:mb-6">
            {t('prasadDistribution.sponsorTitle')}
          </h2>
          <p className="text-gray-700 mb-6 text-base md:text-lg leading-relaxed">
            {t('prasadDistribution.sponsorDescription')}
          </p>

          {successMessage && (
            <div className="bg-green-50 border-2 border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm md:text-base">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">
                {t('prasadDistribution.name')} *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-3 md:py-2 border-2 rounded-lg focus:ring-2 focus:ring-saffron-500 text-base ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder={t('prasadDistribution.namePlaceholder')}
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">
                {t('prasadDistribution.occasion')}
              </label>
              <input
                type="text"
                name="occasion"
                value={formData.occasion}
                onChange={handleChange}
                className="w-full px-4 py-3 md:py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron-500 text-base"
                placeholder={t('prasadDistribution.occasionPlaceholder')}
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">
                {t('prasadDistribution.preferredDate')} *
              </label>
              <input
                type="date"
                name="preferredDate"
                value={formData.preferredDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-3 md:py-2 border-2 rounded-lg focus:ring-2 focus:ring-saffron-500 text-base ${
                  errors.preferredDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.preferredDate && (
                <p className="text-red-600 text-sm mt-1">{errors.preferredDate}</p>
              )}
            </div>

            {errors.submit && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm md:text-base">
                {errors.submit}
              </div>
            )}

            <button
              type="submit"
              className="w-full md:w-auto bg-saffron-500 text-white px-8 py-3 md:py-3 rounded-lg hover:bg-saffron-600 text-base md:text-lg font-semibold transition-colors min-h-[44px]"
            >
              {t('prasadDistribution.submitButton')}
            </button>
          </form>
        </div>

        {/* Hygiene/Kitchen Info Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-bold text-saffron-600 mb-4 md:mb-6">
            {t('prasadDistribution.hygieneTitle')}
          </h2>
          <ul className="space-y-3 md:space-y-4">
            <li className="flex items-start gap-3">
              <span className="text-green-600 text-xl md:text-2xl mt-1">✓</span>
              <span className="text-gray-700 text-base md:text-lg flex-1">{t('prasadDistribution.hygienePoint1')}</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-600 text-xl md:text-2xl mt-1">✓</span>
              <span className="text-gray-700 text-base md:text-lg flex-1">{t('prasadDistribution.hygienePoint2')}</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-600 text-xl md:text-2xl mt-1">✓</span>
              <span className="text-gray-700 text-base md:text-lg flex-1">{t('prasadDistribution.hygienePoint3')}</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-600 text-xl md:text-2xl mt-1">✓</span>
              <span className="text-gray-700 text-base md:text-lg flex-1">{t('prasadDistribution.hygienePoint4')}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PrasadDistribution;

