import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import './Home.css';

const Services = () => {
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
          <h1 className="hero-title">{t('services.title')}</h1>
          <p className="hero-subtitle">{t('services.subtitle')}</p>
        </div>
      </section>

      <section className="temple-info">
        <h2>{t('services.availableSeva')}</h2>
        <div className="features">
          <div className="feature-card">
            <div className="feature-icon">🕉️</div>
            <h3>{t('services.morningAarti')}</h3>
            <p>{t('services.morningAartiDesc')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🕯️</div>
            <h3>{t('services.specialPuja')}</h3>
            <p>{t('services.specialPujaDesc')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📿</div>
            <h3>{t('services.abhishekam')}</h3>
            <p>{t('services.abhishekamDesc')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌺</div>
            <h3>{t('services.flowerOffering')}</h3>
            <p>{t('services.flowerOfferingDesc')}</p>
          </div>
        </div>
      </section>

      <section className="temple-info">
        <h2>{t('services.bookSeva')}</h2>
        <p style={{ textAlign: 'center', color: '#666', marginTop: '20px' }}>
          {t('services.bookSevaDesc')}
        </p>
      </section>
    </div>
  );
};

export default Services;
