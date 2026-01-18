import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { createFlowerOffering } from '../../services/api';
import '../Home.css';

const FlowerOfferingPage = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    flowerType: ''
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Recommended flowers - easy to edit later
  const recommendedFlowers = [
    'Red Hibiscus (गुड़हल)',
    'Marigold (गेंदा)',
    'Rose (गुलाब)',
    'Jasmine (चमेली)',
    'Lotus (कमल)',
    'Chrysanthemum (गुलदाउदी)'
  ];

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
      newErrors.name = 'Name is required';
    }
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await createFlowerOffering({
        name: formData.name,
        date: formData.date,
        flowerType: formData.flowerType || null
      });
      
      setSuccessMessage('Your flower offering pledge has been recorded. Jai Maa Durga.');
      setFormData({
        name: '',
        date: '',
        flowerType: ''
      });
    } catch (error) {
      console.error('Error submitting flower offering:', error);
      setErrorMessage(
        error.response?.data?.error || 
        error.message || 
        'Unable to submit your request right now. Please try again later.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="home">
      <section 
        className="hero"
        style={{
          backgroundImage: `url('/temple-hero.jpeg')`
        }}
      >
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">Flower Offering</h1>
          <p className="hero-subtitle">Offer flowers to Maa Durga</p>
        </div>
      </section>

      <section className="temple-info">
        <h2>About Flower Offering</h2>
        <p>
          Offering flowers to Maa Durga is a beautiful way to express devotion and seek blessings. 
          Flowers are considered pure and sacred, symbolizing love, devotion, and the beauty of nature. 
          Each flower carries its own significance and energy, making the offering a meaningful act of worship.
        </p>
      </section>

      <section className="temple-info">
        <h2>Recommended Flowers</h2>
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '10px',
          marginTop: '15px'
        }}>
          {recommendedFlowers.map((flower, index) => (
            <span
              key={index}
              style={{
                padding: '8px 16px',
                backgroundColor: '#fff3cd',
                color: '#856404',
                borderRadius: '20px',
                fontSize: '14px',
                border: '1px solid #ffc107'
              }}
            >
              {flower}
            </span>
          ))}
        </div>
      </section>

      <section className="temple-info">
        <h2>How You Can Offer</h2>
        <ul style={{ listStyle: 'disc', paddingLeft: '20px', color: '#666', lineHeight: '1.8' }}>
          <li>Bring your own fresh flowers to the temple</li>
          <li>Purchase flowers at the temple counter (if available)</li>
          <li>Offer flowers with devotion and a pure heart</li>
          <li>Place flowers gently at the feet of Maa Durga</li>
          <li>Chant mantras or prayers while offering</li>
        </ul>
      </section>

      <section className="temple-info">
        <h2>Pledge Your Flower Offering</h2>
        {successMessage && (
          <div style={{ 
            backgroundColor: '#d4edda', 
            color: '#155724', 
            padding: '12px', 
            borderRadius: '5px', 
            marginBottom: '20px',
            border: '1px solid #c3e6cb'
          }}>
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div style={{ 
            backgroundColor: '#f8d7da', 
            color: '#721c24', 
            padding: '12px', 
            borderRadius: '5px', 
            marginBottom: '20px',
            border: '1px solid #f5c6cb'
          }}>
            {errorMessage}
          </div>
        )}
        <form onSubmit={handleSubmit} style={{ maxWidth: '600px' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: 'bold' }}>
              Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '12px',
                border: errors.name ? '2px solid #dc3545' : '2px solid #ddd',
                borderRadius: '5px',
                fontSize: '16px'
              }}
              placeholder="Enter your name"
            />
            {errors.name && (
              <span style={{ color: '#dc3545', fontSize: '14px', display: 'block', marginTop: '5px' }}>
                {errors.name}
              </span>
            )}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: 'bold' }}>
              Date *
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              style={{
                width: '100%',
                padding: '12px',
                border: errors.date ? '2px solid #dc3545' : '2px solid #ddd',
                borderRadius: '5px',
                fontSize: '16px'
              }}
            />
            {errors.date && (
              <span style={{ color: '#dc3545', fontSize: '14px', display: 'block', marginTop: '5px' }}>
                {errors.date}
              </span>
            )}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: 'bold' }}>
              Type of Flower (Optional)
            </label>
            <select
              name="flowerType"
              value={formData.flowerType}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #ddd',
                borderRadius: '5px',
                fontSize: '16px',
                backgroundColor: 'white'
              }}
            >
              <option value="">Select a flower type (optional)</option>
              {recommendedFlowers.map((flower, index) => (
                <option key={index} value={flower}>
                  {flower}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
            style={{ 
              width: '100%', 
              marginTop: '10px',
              opacity: isSubmitting ? 0.6 : 1,
              cursor: isSubmitting ? 'not-allowed' : 'pointer'
            }}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Pledge'}
          </button>
        </form>
      </section>
    </div>
  );
};

export default FlowerOfferingPage;


