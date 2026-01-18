import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { createAbhishekamBooking } from '../../services/api';
import '../Home.css';

const AbhishekamPage = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    gotra: '',
    preferredDate: '',
    familyMembers: ''
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Abhishekam schedule - easy to edit later
  const abhishekamSchedule = [
    { day: 'Every Monday & Friday', time: '7:30 AM' },
    { day: 'Special Festival Abhishekam', time: 'As announced' }
  ];

  // Items used in Abhishekam
  const abhishekamItems = [
    'Milk (दूध)',
    'Curd (दही)',
    'Honey (शहद)',
    'Ghee (घी)',
    'Sugar (चीनी)',
    'Water (जल)',
    'Rose Water (गुलाब जल)',
    'Sandalwood Paste (चंदन)'
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
      await createAbhishekamBooking({
        name: formData.name,
        gotra: formData.gotra || null,
        preferredDate: formData.preferredDate,
        familyMembers: formData.familyMembers ? parseInt(formData.familyMembers) : null
      });
      
      setSuccessMessage('Your abhishekam booking request has been recorded. Mandir team will contact you for confirmation.');
      setFormData({
        name: '',
        gotra: '',
        preferredDate: '',
        familyMembers: ''
      });
    } catch (error) {
      console.error('Error submitting abhishekam booking:', error);
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
          <h1 className="hero-title">Abhishekam</h1>
          <p className="hero-subtitle">Sacred bathing ceremony of the deity</p>
        </div>
      </section>

      <section className="temple-info">
        <h2>About Abhishekam</h2>
        <p>
          Abhishekam is a sacred ritual where the deity is bathed with various pure substances 
          like milk, honey, ghee, and water while chanting mantras. This ceremony is performed 
          to invoke divine blessings, purify the environment, and seek the grace of Maa Durga. 
          It is believed to bring peace, prosperity, and spiritual upliftment to the devotees.
        </p>
      </section>

      <section className="temple-info">
        <h2>Abhishekam Schedule</h2>
        <div className="timings-grid">
          {abhishekamSchedule.map((schedule, index) => (
            <div key={index} className="timing-item">
              <h4>{schedule.day}</h4>
              <p>{schedule.time}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="temple-info">
        <h2>Items Used in Abhishekam</h2>
        <ul style={{ listStyle: 'disc', paddingLeft: '20px', color: '#666', lineHeight: '1.8' }}>
          {abhishekamItems.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="temple-info">
        <h2>Book Abhishekam</h2>
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
            {isSubmitting ? 'Submitting...' : 'Submit Booking Request'}
          </button>
        </form>
      </section>
    </div>
  );
};

export default AbhishekamPage;


