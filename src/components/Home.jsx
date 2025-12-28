import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
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
        <div className="feature-card">
          <div className="feature-icon">🕉️</div>
          <h3>{t('home.dailyPuja')}</h3>
          <p>{t('home.dailyPujaDesc')}</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">📿</div>
          <h3>{t('home.specialEvents')}</h3>
          <p>{t('home.specialEventsDesc')}</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🙏</div>
          <h3>{t('home.sevaBooking')}</h3>
          <p>{t('home.sevaBookingDesc')}</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🕯️</div>
          <h3>{t('home.prasadDistribution')}</h3>
          <p>{t('home.prasadDistributionDesc')}</p>
        </div>
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
    </div>
  );
};

export default Home;
