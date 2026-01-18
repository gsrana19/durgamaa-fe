import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { createMorningAartiVisit } from '../../services/api';
import '../Home.css';

const MorningAartiPage = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    visitDate: '',
    familyMembers: ''
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Aarti timings - easy to edit later
  const aartiTimings = [
    { season: 'Summer', time: '6:00 AM – 6:30 AM' },
    { season: 'Winter', time: '6:30 AM – 7:00 AM' }
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
    if (!formData.visitDate) {
      newErrors.visitDate = 'Date of visit is required';
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
      await createMorningAartiVisit({
        name: formData.name,
        visitDate: formData.visitDate,
        familyMembers: formData.familyMembers ? parseInt(formData.familyMembers) : null
      });
      
      setSuccessMessage('Your visit plan has been recorded. We look forward to seeing you!');
      setFormData({
        name: '',
        visitDate: '',
        familyMembers: ''
      });
    } catch (error) {
      console.error('Error submitting morning aarti visit:', error);
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
          <h1 className="hero-title">Morning Aarti</h1>
          <p className="hero-subtitle">Participate in the morning aarti ceremony</p>
        </div>
      </section>

      <section className="temple-info">
        <h2>About Morning Aarti</h2>
        <p>
          The morning aarti is a sacred ceremony where devotees gather to offer prayers, 
          light lamps, and seek blessings from Maa Durga. It is a beautiful way to start 
          your day with divine energy and spiritual peace.
        </p>
      </section>

      <section className="temple-info">
        <h2>Aarti Timings</h2>
        <div className="timings-grid">
          {aartiTimings.map((timing, index) => (
            <div key={index} className="timing-item">
              <h4>{timing.season}</h4>
              <p>{timing.time}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="temple-info">
        <h2>What to Expect</h2>
        <ul style={{ listStyle: 'disc', paddingLeft: '20px', color: '#666', lineHeight: '1.8' }}>
          <li>Chanting of mantras and bhajans</li>
          <li>Offering of lamp (deep) and incense</li>
          <li>Darshan of Maa Durga after aarti</li>
          <li>Blessings from the priest</li>
          <li>Prasad distribution</li>
        </ul>
      </section>

      <section className="temple-info">
        <h2>Guidelines for Devotees</h2>
        <ul style={{ listStyle: 'disc', paddingLeft: '20px', color: '#666', lineHeight: '1.8' }}>
          <li>Please arrive 10–15 minutes before aarti</li>
          <li>Maintain silence and switch mobile to silent mode</li>
          <li>Dress modestly and respectfully</li>
          <li>Remove footwear before entering the prayer hall</li>
          <li>Follow the instructions of the temple staff</li>
        </ul>
      </section>

      <section className="temple-info">
        <h2>Plan Your Visit</h2>
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
              Date of Visit *
            </label>
            <input
              type="date"
              name="visitDate"
              value={formData.visitDate}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              style={{
                width: '100%',
                padding: '12px',
                border: errors.visitDate ? '2px solid #dc3545' : '2px solid #ddd',
                borderRadius: '5px',
                fontSize: '16px'
              }}
            />
            {errors.visitDate && (
              <span style={{ color: '#dc3545', fontSize: '14px', display: 'block', marginTop: '5px' }}>
                {errors.visitDate}
              </span>
            )}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: 'bold' }}>
              Number of Family Members (Optional)
            </label>
            <input
              type="number"
              name="familyMembers"
              value={formData.familyMembers}
              onChange={handleChange}
              min="1"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #ddd',
                borderRadius: '5px',
                fontSize: '16px'
              }}
              placeholder="Enter number of family members"
            />
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
            {isSubmitting ? 'Submitting...' : 'Submit Visit Plan'}
          </button>
        </form>
      </section>
    </div>
  );
};

export default MorningAartiPage;


