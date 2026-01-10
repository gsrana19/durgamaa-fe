import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { getTeamMembers } from '../services/api';
import './Home.css';

const Contact = () => {
  const { t } = useTranslation();
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeamMembers();
  }, []);

  const loadTeamMembers = async () => {
    try {
      const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8082/api';
      const backendBaseUrl = apiBaseUrl.replace('/api', '');
      
      const data = await getTeamMembers();
      // Map image URLs to include backend base URL
      const membersWithFullUrls = data.map(member => ({
        ...member,
        imageUrl: member.imageUrl.startsWith('http') 
          ? member.imageUrl 
          : `${backendBaseUrl}${member.imageUrl}`
      }));
      
      // Sort team members: priests first (position contains "priest" case-insensitive), then others by displayOrder
      const sortedMembers = membersWithFullUrls.sort((a, b) => {
        const aIsPriest = a.position && a.position.toLowerCase().includes('priest');
        const bIsPriest = b.position && b.position.toLowerCase().includes('priest');
        
        // If one is priest and other is not, priest comes first
        if (aIsPriest && !bIsPriest) return -1;
        if (!aIsPriest && bIsPriest) return 1;
        
        // If both are priests or both are not, sort by displayOrder
        const orderA = a.displayOrder || 0;
        const orderB = b.displayOrder || 0;
        return orderA - orderB;
      });
      
      setTeamMembers(sortedMembers);
    } catch (error) {
      console.error('Error loading team members:', error);
      setTeamMembers([]);
    } finally {
      setLoading(false);
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

      {/* Team Members Section */}
      {teamMembers.length > 0 && (
        <section className="temple-info">
          <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#FF9933' }}>
            {t('contact.teamMembers') || 'Our Team'}
          </h2>
          
          {/* First Team Member (Index 0) - First Row Only */}
          {teamMembers[0] && (
            <div className="team-members-priests-grid">
              <div key={teamMembers[0].id} className="team-member-card">
                <div className="team-member-image-container">
                  <img 
                    src={teamMembers[0].imageUrl} 
                    alt={teamMembers[0].name}
                    className="team-member-image"
                    onError={(e) => {
                      e.target.src = '/temple-hero.jpeg'; // Fallback image
                    }}
                  />
                </div>
                <div className="team-member-info">
                  <h3 className="team-member-name">{teamMembers[0].name}</h3>
                  <p className="team-member-position">{teamMembers[0].position}</p>
                  {teamMembers[0].mobileNumber && (
                    <p className="team-member-mobile">📞 {teamMembers[0].mobileNumber}</p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Remaining Team Members (Index 1+) - 3 per Row */}
          {teamMembers.length > 1 && (
            <div className="team-members-grid">
              {teamMembers.slice(1).map((member) => (
                <div key={member.id} className="team-member-card">
                  <div className="team-member-image-container">
                    <img 
                      src={member.imageUrl} 
                      alt={member.name}
                      className="team-member-image"
                      onError={(e) => {
                        e.target.src = '/temple-hero.jpeg'; // Fallback image
                      }}
                    />
                  </div>
                  <div className="team-member-info">
                    <h3 className="team-member-name">{member.name}</h3>
                    <p className="team-member-position">{member.position}</p>
                    {member.mobileNumber && (
                      <p className="team-member-mobile">📞 {member.mobileNumber}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <section className="temple-info">
        <h2>{t('contact.visitUs')}</h2>
        <p>{t('contact.visitUsDesc')}</p>
        <p style={{ marginTop: '15px' }}>{t('contact.visitUsDesc2')}</p>
      </section>
    </div>
  );
};

export default Contact;
