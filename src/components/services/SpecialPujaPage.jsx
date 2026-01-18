import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { createSpecialPuja } from '../../services/api';
import '../Home.css';

const SpecialPujaPage = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    pujaType: '',
    devoteeName: '',
    gotra: '',
    city: '',
    preferredDate: '',
    timeSlot: '',
    intention: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Available Special Pujas - easy to edit later
  const pujaTypes = [
    { 
      id: 'sankalp', 
      label: 'Sankalp Puja', 
      description: 'A sacred vow-taking ceremony for fulfilling specific wishes and intentions.',
      suggestedDonation: '₹1,500'
    },
    { 
      id: 'navgrah', 
      label: 'Navgrah Shanti Puja', 
      description: 'Peace and harmony puja to appease the nine planets and remove planetary afflictions.',
      suggestedDonation: '₹2,500'
    },
    { 
      id: 'health', 
      label: 'Health & Wellbeing Puja', 
      description: 'Prayers for good health, recovery from illness, and overall wellbeing.',
      suggestedDonation: '₹1,200'
    },
    { 
      id: 'studies', 
      label: 'Studies / Exam Success Puja', 
      description: 'Blessings for academic success, exam performance, and educational achievements.',
      suggestedDonation: '₹1,000'
    }
  ];

  const timeSlots = [
    { value: 'morning', label: 'Morning (6:00 AM - 9:00 AM)' },
    { value: 'evening', label: 'Evening (6:00 PM - 8:00 PM)' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
    setSuccessMessage('');
    setErrorMessage('');
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.pujaType) {
      newErrors.pujaType = 'Puja type is required';
    }
    if (!formData.devoteeName.trim()) {
      newErrors.devoteeName = 'Devotee name is required';
    }
    if (!formData.preferredDate) {
      newErrors.preferredDate = 'Preferred date is required';
    } else {
      const selectedDate = new Date(formData.preferredDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.preferredDate = 'Preferred date cannot be in the past';
      }
    }
    if (!formData.timeSlot) {
      newErrors.timeSlot = 'Time slot is required';
    }
    if (!formData.intention.trim()) {
      newErrors.intention = 'Prayer/Intention is required';
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
      // TODO: Move to central API service and add proper error handling and auth if needed
      const response = await createSpecialPuja({
        pujaType: formData.pujaType,
        devoteeName: formData.devoteeName,
        gotra: formData.gotra || null,
        city: formData.city || null,
        preferredDate: formData.preferredDate,
        timeSlot: formData.timeSlot,
        intention: formData.intention
      });

      setSuccessMessage('Thank you. Your special puja request has been submitted. Mandir team will contact you for confirmation.');
      
      // Reset form
      setFormData({
        pujaType: '',
        devoteeName: '',
        gotra: '',
        city: '',
        preferredDate: '',
        timeSlot: '',
        intention: ''
      });
    } catch (error) {
      console.error('Error submitting special puja request:', error);
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
          <h1 className="hero-title">Special Puja</h1>
          <p className="hero-subtitle">Book a special puja for your wishes</p>
        </div>
      </section>

      <section className="temple-info">
        <h2>About Special Puja</h2>
        <p>
          Special Puja ceremonies are performed for specific purposes such as health, education, 
          new home blessings, career success, or any personal wish. Our experienced priests 
          conduct these pujas with devotion and proper rituals to seek blessings from Maa Durga 
          for your specific needs.
        </p>
      </section>

      <section className="temple-info">
        <h2>Available Special Pujas</h2>
        <div className="features">
          {pujaTypes.map((puja) => (
            <div key={puja.id} className="feature-card" style={{ cursor: 'default' }}>
              <h3>{puja.label}</h3>
              <p style={{ marginBottom: '10px' }}>{puja.description}</p>
              <p style={{ color: '#FF9933', fontWeight: 'bold' }}>
                Suggested Donation: {puja.suggestedDonation}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="temple-info">
        <h2>Book a Special Puja</h2>
        
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
              Puja Type *
            </label>
            <select
              name="pujaType"
              value={formData.pujaType}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '12px',
                border: errors.pujaType ? '2px solid #dc3545' : '2px solid #ddd',
                borderRadius: '5px',
                fontSize: '16px',
                backgroundColor: 'white'
              }}
            >
              <option value="">Select a puja type</option>
              {pujaTypes.map((puja) => (
                <option key={puja.id} value={puja.id}>
                  {puja.label}
                </option>
              ))}
            </select>
            {errors.pujaType && (
              <span style={{ color: '#dc3545', fontSize: '14px', display: 'block', marginTop: '5px' }}>
                {errors.pujaType}
              </span>
            )}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: 'bold' }}>
              Devotee Name *
            </label>
            <input
              type="text"
              name="devoteeName"
              value={formData.devoteeName}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '12px',
                border: errors.devoteeName ? '2px solid #dc3545' : '2px solid #ddd',
                borderRadius: '5px',
                fontSize: '16px'
              }}
              placeholder="Enter your name"
            />
            {errors.devoteeName && (
              <span style={{ color: '#dc3545', fontSize: '14px', display: 'block', marginTop: '5px' }}>
                {errors.devoteeName}
              </span>
            )}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: 'bold' }}>
              Gotra (Optional)
            </label>
            <input
              type="text"
              name="gotra"
              value={formData.gotra}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #ddd',
                borderRadius: '5px',
                fontSize: '16px'
              }}
              placeholder="Enter your gotra"
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: 'bold' }}>
              City (Optional)
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #ddd',
                borderRadius: '5px',
                fontSize: '16px'
              }}
              placeholder="Enter your city"
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: 'bold' }}>
              Preferred Date *
            </label>
            <input
              type="date"
              name="preferredDate"
              value={formData.preferredDate}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              style={{
                width: '100%',
                padding: '12px',
                border: errors.preferredDate ? '2px solid #dc3545' : '2px solid #ddd',
                borderRadius: '5px',
                fontSize: '16px'
              }}
            />
            {errors.preferredDate && (
              <span style={{ color: '#dc3545', fontSize: '14px', display: 'block', marginTop: '5px' }}>
                {errors.preferredDate}
              </span>
            )}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: 'bold' }}>
              Preferred Time Slot *
            </label>
            <select
              name="timeSlot"
              value={formData.timeSlot}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '12px',
                border: errors.timeSlot ? '2px solid #dc3545' : '2px solid #ddd',
                borderRadius: '5px',
                fontSize: '16px',
                backgroundColor: 'white'
              }}
            >
              <option value="">Select a time slot</option>
              {timeSlots.map((slot) => (
                <option key={slot.value} value={slot.value}>
                  {slot.label}
                </option>
              ))}
            </select>
            {errors.timeSlot && (
              <span style={{ color: '#dc3545', fontSize: '14px', display: 'block', marginTop: '5px' }}>
                {errors.timeSlot}
              </span>
            )}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: 'bold' }}>
              Prayer / Intention *
            </label>
            <textarea
              name="intention"
              value={formData.intention}
              onChange={handleChange}
              rows={4}
              style={{
                width: '100%',
                padding: '12px',
                border: errors.intention ? '2px solid #dc3545' : '2px solid #ddd',
                borderRadius: '5px',
                fontSize: '16px',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
              placeholder="Please share your prayer, wish, or intention for this puja"
            />
            {errors.intention && (
              <span style={{ color: '#dc3545', fontSize: '14px', display: 'block', marginTop: '5px' }}>
                {errors.intention}
              </span>
            )}
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
            {isSubmitting ? 'Submitting...' : 'Submit Booking Request'}
          </button>
        </form>

        <p style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: '#fff3cd', 
          border: '1px solid #ffc107', 
          borderRadius: '5px',
          color: '#856404',
          fontSize: '14px'
        }}>
          <strong>Note:</strong> Online payment via UPI/QR will be integrated in the next phase.
        </p>
      </section>
    </div>
  );
};

export default SpecialPujaPage;





