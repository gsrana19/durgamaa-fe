import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { getDonationStats, createDonation, getPublicUpdates, 
         getCountries, getStates, getDistricts, getThanas, getVillages } from '../services/api';

const MandirNirmaanSeva = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [updates, setUpdates] = useState([]);
  
  // Location data from API
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [thanas, setThanas] = useState([]);
  const [villages, setVillages] = useState([]);
  
  // Selected location IDs
  const [selectedCountryId, setSelectedCountryId] = useState(null);
  const [selectedStateId, setSelectedStateId] = useState(null);
  const [selectedDistrictId, setSelectedDistrictId] = useState(null);
  const [selectedThanaId, setSelectedThanaId] = useState(null);
  const [selectedVillageId, setSelectedVillageId] = useState(null);
  const [customVillageName, setCustomVillageName] = useState('');
  const [showCustomVillage, setShowCustomVillage] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    amount: 0,
    showPublic: true,
  });
  
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Load countries on mount
  useEffect(() => {
    loadCountries();
    loadData();
  }, []);
  
  // Load default location (India -> Jharkhand -> Hazaribag -> Ichak -> Mangura)
  useEffect(() => {
    if (countries.length > 0 && !selectedCountryId) {
      const india = countries.find(c => c.name === 'India') || countries[0];
      if (india) {
        setSelectedCountryId(india.id);
      }
    }
  }, [countries]);
  
  // Load states when country changes
  useEffect(() => {
    if (selectedCountryId) {
      loadStates(selectedCountryId);
    } else {
      setStates([]);
      setSelectedStateId(null);
    }
  }, [selectedCountryId]);
  
  // Auto-select Jharkhand when states load
  useEffect(() => {
    if (states.length > 0 && !selectedStateId) {
      const jharkhand = states.find(s => s.name === 'Jharkhand') || states[0];
      if (jharkhand) {
        setSelectedStateId(jharkhand.id);
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
    }
  }, [selectedStateId]);
  
  // Auto-select Hazaribag when districts load
  useEffect(() => {
    if (districts.length > 0 && !selectedDistrictId) {
      const hazaribag = districts.find(d => d.name === 'Hazaribag') || districts[0];
      if (hazaribag) {
        setSelectedDistrictId(hazaribag.id);
      }
    }
  }, [districts]);
  
  // Load thanas when district changes
  useEffect(() => {
    if (selectedDistrictId) {
      loadThanas(selectedDistrictId);
    } else {
      setThanas([]);
      setSelectedThanaId(null);
    }
  }, [selectedDistrictId]);
  
  // Auto-select Ichak when thanas load
  useEffect(() => {
    if (thanas.length > 0 && !selectedThanaId) {
      const ichak = thanas.find(t => t.name === 'Ichak') || thanas[0];
      if (ichak) {
        setSelectedThanaId(ichak.id);
      }
    }
  }, [thanas]);
  
  // Load villages when thana changes
  useEffect(() => {
    if (selectedThanaId) {
      loadVillages(selectedThanaId);
    } else {
      setVillages([]);
      setSelectedVillageId(null);
      setShowCustomVillage(false);
    }
  }, [selectedThanaId]);
  
  // Auto-select Mangura when villages load
  useEffect(() => {
    if (villages.length > 0 && !selectedVillageId && !showCustomVillage) {
      const mangura = villages.find(v => v.name === 'Mangura') || villages[0];
      if (mangura) {
        setSelectedVillageId(mangura.id);
      }
    }
    // Show custom village input if no villages available
    if (villages.length === 0 && selectedThanaId) {
      setShowCustomVillage(true);
      setSelectedVillageId(null);
    }
  }, [villages]);
  
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
      setSelectedStateId(null);
      setDistricts([]);
      setThanas([]);
      setVillages([]);
      setSelectedDistrictId(null);
      setSelectedThanaId(null);
      setSelectedVillageId(null);
      setShowCustomVillage(false);
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
      setVillages([]);
      setSelectedThanaId(null);
      setSelectedVillageId(null);
      setShowCustomVillage(false);
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
      setShowCustomVillage(false);
    } catch (error) {
      console.error('Error loading thanas:', error);
    }
  };
  
  const loadVillages = async (thanaId) => {
    try {
      const data = await getVillages(thanaId);
      setVillages(data);
      setSelectedVillageId(null);
      setShowCustomVillage(data.length === 0);
      if (data.length === 0) {
        setCustomVillageName('');
      }
    } catch (error) {
      console.error('Error loading villages:', error);
      setVillages([]);
      setShowCustomVillage(true);
    }
  };
  
  const loadData = async () => {
    try {
      const [statsData, updatesData] = await Promise.all([
        getDonationStats(),
        getPublicUpdates(),
      ]);
      setStats(statsData);
      setUpdates(updatesData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation: Either villageId or customVillageName must be provided
    if (!selectedVillageId && (!customVillageName || customVillageName.trim() === '')) {
      alert('Please select a village or enter a custom village name.');
      return;
    }
    
    setLoading(true);
    try {
      const donationPayload = {
        ...formData,
        countryId: selectedCountryId,
        stateId: selectedStateId,
        districtId: selectedDistrictId,
        thanaId: selectedThanaId,
        villageId: selectedVillageId,
        customVillageName: selectedVillageId ? null : customVillageName.trim(),
      };
      
      const response = await createDonation(donationPayload);
      setReceipt(response);
      
      // Reset form - reload default location
      setFormData({
        name: '',
        email: '',
        phone: '',
        amount: 0,
        showPublic: true,
      });
      setCustomVillageName('');
      setSelectedVillageId(null);
      setShowCustomVillage(false);
      
      // Reset to default location (India -> Jharkhand -> Hazaribag -> Ichak -> Mangura)
      if (countries.length > 0) {
        const india = countries.find(c => c.name === 'India') || countries[0];
        if (india) {
          setSelectedCountryId(india.id);
        }
      }
      
      await loadData();
    } catch (error) {
      console.error('Error submitting donation:', error);
      alert('Error submitting donation. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const progress = stats ? (stats.totalAmount / stats.targetAmount) * 100 : 0;
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-saffron-50 to-white">
      {/* Hero Section - Mobile First */}
      <section className="bg-gradient-to-r from-saffron-400 to-saffron-600 text-white py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12">
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl md:text-5xl font-bold mb-4">{t('donation.title')}</h1>
              <p className="text-base md:text-xl leading-relaxed">
                {t('donation.subtitle')}
              </p>
            </div>
            <div className="flex-1 hidden md:block">
              <div className="bg-white bg-opacity-20 rounded-lg p-8 text-center">
                <div className="text-6xl">🕉️</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <div className="container mx-auto px-4 py-8 md:py-12 space-y-8">
        {/* Project Details */}
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-bold text-saffron-600 mb-4 md:mb-6">{t('donation.projectTitle')}</h2>
          <div className="space-y-4 text-gray-700 text-sm md:text-base leading-relaxed">
            <div>
              <strong className="text-saffron-600 block mb-1">{t('donation.location')}</strong>
              <span>{t('donation.locationValue')}</span>
            </div>
            <div>
              <strong className="text-saffron-600 block mb-1">{t('donation.purpose')}</strong>
              <span>{t('donation.purposeDesc')}</span>
            </div>
            <div>
              <strong className="text-saffron-600 block mb-2">{t('donation.phases')}</strong>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>{t('donation.phase1')}</li>
                <li>{t('donation.phase2')}</li>
                <li>{t('donation.phase3')}</li>
                <li>{t('donation.phase4')}</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Donation Summary - Responsive Grid */}
        {stats && (
          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold text-saffron-600 mb-4 md:mb-6">{t('donation.blessingsTitle')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6">
              <div className="text-center p-4 bg-saffron-50 rounded-lg">
                <div className="text-2xl md:text-4xl font-bold text-saffron-600 mb-2">
                  ₹{stats.totalAmount.toLocaleString('en-IN')}
                </div>
                <div className="text-gray-600 text-sm md:text-base">{t('donation.totalCollected')}</div>
              </div>
              <div className="text-center p-4 bg-saffron-50 rounded-lg">
                <div className="text-2xl md:text-4xl font-bold text-saffron-600 mb-2">
                  ₹{stats.targetAmount.toLocaleString('en-IN')}
                </div>
                <div className="text-gray-600 text-sm md:text-base">{t('donation.target')}</div>
              </div>
              <div className="text-center p-4 bg-saffron-50 rounded-lg">
                <div className="text-2xl md:text-4xl font-bold text-saffron-600 mb-2">
                  {stats.totalDonors}
                </div>
                <div className="text-gray-600 text-sm md:text-base">{t('donation.devotees')}</div>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 md:h-6">
              <div
                className="bg-gradient-to-r from-saffron-400 to-saffron-600 h-4 md:h-6 rounded-full flex items-center justify-center text-white text-xs md:text-sm font-bold transition-all"
                style={{ width: `${Math.min(progress, 100)}%` }}
              >
                {progress.toFixed(1)}%
              </div>
            </div>
          </div>
        )}
        
        {/* Donation Form - Mobile Friendly */}
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-bold text-saffron-600 mb-4 md:mb-6">{t('donation.makeDonation')}</h2>
          {receipt ? (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-6">
              <h3 className="text-xl md:text-2xl font-bold text-green-800 mb-4">{t('donation.thankYou')}</h3>
              <div className="space-y-2 text-gray-700 text-sm md:text-base">
                <p><strong>{t('donation.donationId')}</strong> {receipt.id}</p>
                <p><strong>{t('donation.name')}</strong> {receipt.name}</p>
                <p><strong>{t('donation.amount')}</strong> ₹{receipt.amount.toLocaleString('en-IN')}</p>
                <p><strong>{t('donation.date')}</strong> {new Date(receipt.createdAt).toLocaleString()}</p>
              </div>
              <button
                onClick={() => setReceipt(null)}
                className="mt-4 w-full md:w-auto bg-saffron-500 text-white px-6 py-3 rounded-lg hover:bg-saffron-600 transition text-base md:text-lg"
              >
                {t('donation.makeAnother')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">{t('donation.fullName')}</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 md:py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-transparent text-base"
                    placeholder={t('donation.fullNamePlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">{t('donation.email')}</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 md:py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-transparent text-base"
                    placeholder={t('donation.emailPlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">{t('donation.phone')}</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 md:py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-transparent text-base"
                    placeholder={t('donation.phonePlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">{t('donation.amountLabel')}</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.amount || ''}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 md:py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-transparent text-base"
                    placeholder={t('donation.amountPlaceholder')}
                  />
                </div>
              </div>
              
              {/* Location Details Section */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg md:text-xl font-bold text-saffron-600 mb-4">{t('donation.locationDetails')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">{t('donation.country')}</label>
                    <select
                      required
                      value={selectedCountryId || ''}
                      onChange={(e) => setSelectedCountryId(parseLong(e.target.value))}
                      className="w-full px-4 py-3 md:py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-transparent text-base bg-white"
                    >
                      <option value="">{t('donation.selectCountry')}</option>
                      {countries.map((country) => (
                        <option key={country.id} value={country.id}>{country.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">{t('donation.state')}</label>
                    <select
                      required
                      value={selectedStateId || ''}
                      onChange={(e) => setSelectedStateId(parseLong(e.target.value))}
                      className="w-full px-4 py-3 md:py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-transparent text-base bg-white"
                      disabled={!selectedCountryId || states.length === 0}
                    >
                      <option value="">{t('donation.selectState')}</option>
                      {states.map((state) => (
                        <option key={state.id} value={state.id}>{state.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">{t('donation.district')}</label>
                    <select
                      required
                      value={selectedDistrictId || ''}
                      onChange={(e) => setSelectedDistrictId(parseLong(e.target.value))}
                      className="w-full px-4 py-3 md:py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-transparent text-base bg-white"
                      disabled={!selectedStateId || districts.length === 0}
                    >
                      <option value="">{t('donation.selectDistrict')}</option>
                      {districts.map((district) => (
                        <option key={district.id} value={district.id}>{district.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">{t('donation.thana')}</label>
                    <select
                      required
                      value={selectedThanaId || ''}
                      onChange={(e) => setSelectedThanaId(parseLong(e.target.value))}
                      className="w-full px-4 py-3 md:py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-transparent text-base bg-white"
                      disabled={!selectedDistrictId || thanas.length === 0}
                    >
                      <option value="">{t('donation.selectThana')}</option>
                      {thanas.map((thana) => (
                        <option key={thana.id} value={thana.id}>{thana.name}</option>
                      ))}
                    </select>
                  </div>
                  {!showCustomVillage && villages.length > 0 && (
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">{t('donation.village')}</label>
                      <select
                        required={!showCustomVillage}
                        value={selectedVillageId || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === 'OTHER') {
                            setShowCustomVillage(true);
                            setSelectedVillageId(null);
                            setCustomVillageName('');
                          } else {
                            setSelectedVillageId(parseLong(value));
                            setShowCustomVillage(false);
                            setCustomVillageName('');
                          }
                        }}
                        className="w-full px-4 py-3 md:py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-transparent text-base bg-white"
                        disabled={!selectedThanaId || villages.length === 0}
                      >
                        <option value="">{t('donation.selectVillage')}</option>
                        {villages.map((village) => (
                          <option key={village.id} value={village.id}>{village.name}</option>
                        ))}
                        <option value="OTHER">{t('donation.otherVillage')}</option>
                      </select>
                    </div>
                  )}
                  {(showCustomVillage || (villages.length === 0 && selectedThanaId)) && (
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">{t('donation.villageNotListed')}</label>
                      <input
                        type="text"
                        required={showCustomVillage || villages.length === 0}
                        value={customVillageName}
                        onChange={(e) => {
                          setCustomVillageName(e.target.value);
                          setSelectedVillageId(null);
                        }}
                        className="w-full px-4 py-3 md:py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-transparent text-base"
                        placeholder={t('donation.villagePlaceholder')}
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="showPublic"
                  checked={formData.showPublic}
                  onChange={(e) => setFormData({ ...formData, showPublic: e.target.checked })}
                  className="w-5 h-5 mr-3 cursor-pointer"
                />
                <label htmlFor="showPublic" className="text-gray-700 text-sm md:text-base cursor-pointer">
                  {t('donation.showPublic')}
                </label>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-saffron-500 to-saffron-600 text-white font-bold py-4 md:py-3 px-6 rounded-lg hover:from-saffron-600 hover:to-saffron-700 disabled:opacity-50 transition text-base md:text-lg"
              >
                {loading ? t('donation.submitting') : t('donation.submitDonation')}
              </button>
            </form>
          )}
        </div>
        
        {/* Donor List Link */}
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-saffron-600 mb-2">{t('donation.donorListTitle')}</h2>
              <p className="text-gray-600 text-sm md:text-base">
                {t('donation.donorListDesc')}
              </p>
            </div>
            <Link
              to="/donor-list"
              className="w-full md:w-auto bg-saffron-500 text-white px-6 py-3 rounded-lg hover:bg-saffron-600 transition text-center font-semibold text-base md:text-lg shadow-md"
            >
              {t('donation.viewAllDonors')}
            </Link>
          </div>
        </div>
        
        {/* Construction Updates - Responsive Grid */}
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-bold text-saffron-600 mb-4 md:mb-6">{t('donation.constructionUpdates')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {updates.length === 0 ? (
              <div className="col-span-full text-center text-gray-500 py-8">
                {t('donation.noUpdates')}
              </div>
            ) : (
              updates.map((update) => (
                <div key={update.id} className="border-2 border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  {update.imageUrl && (
                    <img src={update.imageUrl} alt={update.title} className="w-full h-48 object-cover rounded mb-4" />
                  )}
                  <h3 className="text-lg md:text-xl font-bold text-saffron-600 mb-2">{update.title}</h3>
                  <p className="text-gray-700 mb-2 text-sm md:text-base line-clamp-3">{update.message}</p>
                  <p className="text-xs md:text-sm text-gray-500">{new Date(update.createdAt).toLocaleDateString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      {/* Footer Message */}
      <div className="bg-saffron-100 text-center py-8 mt-12">
        <p className="text-base md:text-lg text-gray-700 italic px-4">
          {t('donation.footerMessage')}
        </p>
      </div>
    </div>
  );
};

// Helper function to parse Long
function parseLong(value) {
  if (!value || value === '') return null;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? null : parsed;
}

export default MandirNirmaanSeva;
