import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { createSankalpam } from '../services/api';

const DailyPuja = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    fullName: '',
    gotra: '',
    city: '',
    prayer: ''
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Puja timings config - easy to change later
  const pujaTimings = [
    { name: t('dailyPuja.morningAarti'), time: '6:00 AM' },
    { name: t('dailyPuja.eveningAarti'), time: '7:00 PM' }
  ];

  // Daily rituals
  const dailyRituals = [
    t('dailyPuja.ritualAbhishekam'),
    t('dailyPuja.ritualAlankaram'),
    t('dailyPuja.ritualBhog'),
    t('dailyPuja.ritualBhajans')
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
    setSuccessMessage('');
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = t('dailyPuja.errorNameRequired');
    }
    if (!formData.prayer.trim()) {
      newErrors.prayer = t('dailyPuja.errorPrayerRequired');
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
      await createSankalpam(formData);
      // Show success message
      setSuccessMessage(t('dailyPuja.successMessage'));
      
      // Reset form
      setFormData({
        fullName: '',
        gotra: '',
        city: '',
        prayer: ''
      });
    } catch (error) {
      console.error('Error submitting sankalpam:', error);
      setSuccessMessage('');
      setErrors({ 
        submit: error.response?.data?.error || 'Failed to submit. Please try again.' 
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-saffron-600 mb-4 md:mb-6 text-center">
          {t('dailyPuja.title')}
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-6 md:mb-8">
          <p className="text-gray-700 text-base md:text-lg leading-relaxed mb-6">
            {t('dailyPuja.intro')}
          </p>
        </div>

        {/* Puja Timings Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-saffron-600 mb-4 md:mb-6">
            {t('dailyPuja.timingsTitle')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {pujaTimings.map((timing, index) => (
              <div key={index} className="bg-gradient-to-br from-saffron-50 to-saffron-100 rounded-lg p-4 md:p-6 text-center">
                <h3 className="text-xl md:text-2xl font-semibold text-saffron-700 mb-2">
                  {timing.name}
                </h3>
                <p className="text-2xl md:text-3xl font-bold text-saffron-600">
                  {timing.time}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Rituals Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-saffron-600 mb-4 md:mb-6">
            {t('dailyPuja.ritualsTitle')}
          </h2>
          <ul className="space-y-3 md:space-y-4">
            {dailyRituals.map((ritual, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="text-saffron-600 text-xl md:text-2xl mt-1">🕉️</span>
                <span className="text-gray-700 text-base md:text-lg flex-1">{ritual}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Sankalpam Form Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-bold text-saffron-600 mb-4 md:mb-6">
            {t('dailyPuja.sankalpamTitle')}
          </h2>
          
          {successMessage && (
            <div className="bg-green-50 border-2 border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm md:text-base">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">
                {t('dailyPuja.fullName')} *
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={`w-full px-4 py-3 md:py-2 border-2 rounded-lg focus:ring-2 focus:ring-saffron-500 text-base ${
                  errors.fullName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder={t('dailyPuja.fullNamePlaceholder')}
              />
              {errors.fullName && (
                <p className="text-red-600 text-sm mt-1">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">
                {t('dailyPuja.gotra')}
              </label>
              <input
                type="text"
                name="gotra"
                value={formData.gotra}
                onChange={handleChange}
                className="w-full px-4 py-3 md:py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron-500 text-base"
                placeholder={t('dailyPuja.gotraPlaceholder')}
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">
                {t('dailyPuja.city')}
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-4 py-3 md:py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron-500 text-base"
                placeholder={t('dailyPuja.cityPlaceholder')}
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">
                {t('dailyPuja.prayer')} *
              </label>
              <textarea
                name="prayer"
                value={formData.prayer}
                onChange={handleChange}
                rows={4}
                className={`w-full px-4 py-3 md:py-2 border-2 rounded-lg focus:ring-2 focus:ring-saffron-500 text-base ${
                  errors.prayer ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder={t('dailyPuja.prayerPlaceholder')}
              />
              {errors.prayer && (
                <p className="text-red-600 text-sm mt-1">{errors.prayer}</p>
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
              {t('dailyPuja.submitButton')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DailyPuja;


