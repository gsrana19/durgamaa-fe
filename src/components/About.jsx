import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import './Home.css';

const About = () => {
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
          <h1 className="hero-title">{t('about.title')}</h1>
          <p className="hero-subtitle">{t('about.subtitle')}</p>
        </div>
      </section>
      
      <section className="temple-info">
        <h2>{t('about.history')}</h2>
        <p>{t('about.historyDesc')}</p>
        
        <h2 style={{ marginTop: '30px' }}>{t('about.mission')}</h2>
        <p>{t('about.missionDesc')}</p>
        
        <h2 style={{ marginTop: '30px' }}>{t('about.whatWeOffer')}</h2>
        <ul style={{ marginLeft: '20px', color: '#666', lineHeight: '2' }}>
          <li>{t('about.offer1')}</li>
          <li>{t('about.offer2')}</li>
          <li>{t('about.offer3')}</li>
          <li>{t('about.offer4')}</li>
          <li>{t('about.offer5')}</li>
          <li>{t('about.offer6')}</li>
        </ul>
      </section>
    </div>
  );
};

export default About;
