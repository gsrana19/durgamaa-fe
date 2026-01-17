import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { openGoogleMaps, getEmbeddedMapUrl } from '../utils/mapsHelper';
import './Home.css';

const Home = () => {
  const { t } = useTranslation();

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
          <h1 className="hero-title">{t('home.title')}</h1>
          <p className="hero-subtitle">{t('home.subtitle')}</p>
          <Link to="/services" className="btn btn-primary">{t('home.bookSeva')}</Link>
        </div>
      </section>
      
      <section className="temple-info">
        <h2>{t('home.aboutTemple')}</h2>
        <p>{t('home.templeDescription')}</p>
        <p><strong>{t('home.location')}</strong> {t('home.locationValue')}</p>
      </section>
      
      <section className="features">
        <Link to="/daily-puja" className="feature-card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="feature-icon">🕉️</div>
          <h3>{t('home.dailyPuja')}</h3>
          <p>{t('home.dailyPujaDesc')}</p>
        </Link>
        <Link to="/special-events" className="feature-card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="feature-icon">📿</div>
          <h3>{t('home.specialEvents')}</h3>
          <p>{t('home.specialEventsDesc')}</p>
        </Link>
        <Link to="/seva-booking" className="feature-card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="feature-icon">🙏</div>
          <h3>{t('home.sevaBooking')}</h3>
          <p>{t('home.sevaBookingDesc')}</p>
        </Link>
        <Link to="/prasad-distribution" className="feature-card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="feature-icon">🕯️</div>
          <h3>{t('home.prasadDistribution')}</h3>
          <p>{t('home.prasadDistributionDesc')}</p>
        </Link>
      </section>

      <section className="timings">
        <h2>{t('home.prayerTimings')}</h2>
        <div className="timings-grid">
          <div className="timing-item">
            <h4>{t('home.morningAarti')}</h4>
            <p>6:00 AM - 7:00 AM</p>
          </div>
          <div className="timing-item">
            <h4>{t('home.afternoonPuja')}</h4>
            <p>12:00 PM - 1:00 PM</p>
          </div>
          <div className="timing-item">
            <h4>{t('home.eveningAarti')}</h4>
            <p>6:00 PM - 7:00 PM</p>
          </div>
        </div>
      </section>

      <section className="temple-location">
        <h2>📍 Temple Location</h2>
        <div className="location-content">
          <div className="map-container">
            <iframe
              src={getEmbeddedMapUrl('3FFH+GP4,Kariyatpur,Mangura,Jharkhand,India')}
              width="100%"
              height="450"
              style={{ border: 0, borderRadius: '10px' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Durga Maa Temple Location"
            ></iframe>
          </div>
          <div className="location-address">
            <p className="address-text">
              <strong>Address:</strong><br />
              3FFH+GP4, Kariyatpur, Mangura,<br />
              Jharkhand 825402, India
            </p>
            <button 
              className="btn btn-primary maps-btn"
              onClick={() => openGoogleMaps('3FFH+GP4,Kariyatpur,Mangura,Jharkhand,India')}
            >
              🗺️ Open in Google Maps
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
