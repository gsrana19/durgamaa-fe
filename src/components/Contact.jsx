import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import './Home.css';

const Contact = () => {
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
          <h1 className="hero-title">{t('contact.title')}</h1>
          <p className="hero-subtitle">{t('contact.subtitle')}</p>
        </div>
      </section>

      <section className="temple-info">
        <div className="features">
          <div className="feature-card">
            <div className="feature-icon">📍</div>
            <h3>{t('contact.address')}</h3>
            <p style={{ whiteSpace: 'pre-line' }}>{t('contact.addressValue')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📞</div>
            <h3>{t('contact.phone')}</h3>
            <p style={{ whiteSpace: 'pre-line' }}>
              {t('contact.phoneMain')}<br />
              {t('contact.phoneOffice')}
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">✉️</div>
            <h3>{t('contact.email')}</h3>
            <p style={{ whiteSpace: 'pre-line' }}>
              {t('contact.emailInfo')}<br />
              {t('contact.emailSupport')}
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🕐</div>
            <h3>{t('contact.timings')}</h3>
            <p style={{ whiteSpace: 'pre-line' }}>{t('contact.timingsValue')}</p>
          </div>
        </div>
      </section>

      <section className="temple-info">
        <h2>{t('contact.visitUs')}</h2>
        <p>{t('contact.visitUsDesc')}</p>
        <p style={{ marginTop: '15px' }}>{t('contact.visitUsDesc2')}</p>
      </section>
    </div>
  );
};

export default Contact;
