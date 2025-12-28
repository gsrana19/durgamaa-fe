import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import './Footer.css';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Durga Mandir</h3>
            <p>{t('footer.tagline')}</p>
          </div>
          <div className="footer-section">
            <h4>{t('footer.quickLinks')}</h4>
            <ul>
              <li><Link to="/">{t('header.home')}</Link></li>
              <li><Link to="/about">{t('header.about')}</Link></li>
              <li><Link to="/services">{t('header.services')}</Link></li>
              <li><Link to="/contact">{t('header.contact')}</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>{t('footer.contact')}</h4>
            <p>{t('footer.email')} info@durgamandir.com</p>
            <p>{t('footer.phone')} +91-XXXX-XXXXXX</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>{t('footer.copyright')}</p>
          <p className="footer-blessing">{t('footer.blessing')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
