import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage } from '../contexts/LanguageContext';
import { getEvents, getEventMedia } from '../services/api';

// Default events structure for fallback
const defaultEventsStructure = [
  {
    id: 1,
    name: 'Navratri Utsav',
    dateRange: 'October 15 - October 24, 2024',
    shortDescription: 'Nine days of devotion and celebration dedicated to Goddess Durga.',
    schedule: {
      morning: 'Morning Puja: 6:00 AM - 8:00 AM',
      afternoon: 'Afternoon Bhog: 12:00 PM - 1:00 PM',
      evening: 'Evening Aarti & Bhajans: 6:00 PM - 8:00 PM'
    }
  },
  {
    id: 2,
    name: 'Durga Puja Mahotsav',
    dateRange: 'October 20 - October 24, 2024',
    shortDescription: 'Grand celebration of Durga Puja with special rituals and cultural programs.',
    schedule: {
      morning: 'Morning Puja: 6:00 AM - 9:00 AM',
      afternoon: 'Afternoon Bhog: 12:00 PM - 2:00 PM',
      evening: 'Evening Aarti & Bhajans: 6:00 PM - 9:00 PM'
    }
  },
  {
    id: 3,
    name: 'Diwali Celebrations',
    dateRange: 'November 1, 2024',
    shortDescription: 'Festival of lights with special Lakshmi Puja and evening celebrations.',
    schedule: {
      morning: 'Morning Puja: 6:00 AM - 8:00 AM',
      afternoon: 'Afternoon Bhog: 12:00 PM - 1:00 PM',
      evening: 'Evening Aarti & Bhajans: 6:00 PM - 8:00 PM'
    }
  },
  {
    id: 4,
    name: 'Maha Shivaratri',
    dateRange: 'March 8, 2025',
    shortDescription: 'Night-long vigil and special prayers dedicated to Lord Shiva.',
    schedule: {
      morning: 'Morning Puja: 6:00 AM - 8:00 AM',
      afternoon: 'Afternoon Bhog: 12:00 PM - 1:00 PM',
      evening: 'Evening Aarti & Bhajans: 6:00 PM - 8:00 PM'
    }
  }
];

const SpecialEvents = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [eventMedia, setEventMedia] = useState({}); // { eventId: [media items] }
  const [lightboxMedia, setLightboxMedia] = useState(null); // { media, index, allMedia }
  const [showLightbox, setShowLightbox] = useState(false);

  useEffect(() => {
    loadEvents();
  }, [language]); // Reload events when language changes

  const loadEvents = async () => {
    try {
      const data = await getEvents();
      const isHindi = language === 'hi';
      
      // Transform backend response to match frontend structure with language support
      // Show selected language if available, otherwise fall back to the other language
      const transformedEvents = data.map(event => {
        // Helper function to get value in preferred language with fallback
        const getValue = (en, hi) => {
          if (isHindi) {
            return (hi && hi.trim()) ? hi : (en && en.trim() ? en : '');
          } else {
            return (en && en.trim()) ? en : (hi && hi.trim() ? hi : '');
          }
        };
        
        // Extract schedule values from Maps
        const scheduleEn = event.schedule || {};
        const scheduleHi = event.scheduleHi || {};
        
        return {
          id: event.id,
          name: getValue(event.name, event.nameHi),
          nameEn: event.name || '',
          nameHi: event.nameHi || '',
          dateRange: getValue(event.dateRange, event.dateRangeHi),
          dateRangeEn: event.dateRange || '',
          dateRangeHi: event.dateRangeHi || '',
          shortDescription: getValue(event.shortDescription, event.shortDescriptionHi),
          shortDescriptionEn: event.shortDescription || '',
          shortDescriptionHi: event.shortDescriptionHi || '',
          schedule: {
            morning: getValue(scheduleEn.morning, scheduleHi.morning),
            afternoon: getValue(scheduleEn.afternoon, scheduleHi.afternoon),
            evening: getValue(scheduleEn.evening, scheduleHi.evening)
          },
          scheduleEn: scheduleEn,
          scheduleHi: scheduleHi
        };
      });
      setEvents(transformedEvents);
      
      // Load media for all events
      const mediaPromises = transformedEvents.map(async (event) => {
        try {
          const media = await getEventMedia(event.id);
          return { eventId: event.id, media };
        } catch (error) {
          console.error(`Error loading media for event ${event.id}:`, error);
          return { eventId: event.id, media: [] };
        }
      });
      
      const mediaResults = await Promise.all(mediaPromises);
      const mediaMap = {};
      mediaResults.forEach(({ eventId, media }) => {
        mediaMap[eventId] = media;
      });
      setEventMedia(mediaMap);
    } catch (error) {
      console.error('Error loading events:', error);
      // Fallback to empty array if API fails
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };
  
  const getFullMediaUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
      const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8082/api';
    const backendBaseUrl = apiBaseUrl.replace('/api', '');
    return backendBaseUrl + (url.startsWith('/') ? url : '/' + url);
  };

  const handleViewDetails = (event) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

  const handleNotifyMe = () => {
    alert(t('specialEvents.notifyMessage'));
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedEvent(null);
  };
  
  const openLightbox = (media, allMedia, index) => {
    setLightboxMedia({ media, index, allMedia });
    setShowLightbox(true);
  };
  
  const closeLightbox = () => {
    setShowLightbox(false);
    setLightboxMedia(null);
  };
  
  const navigateLightbox = (direction) => {
    if (!lightboxMedia) return;
    const { index, allMedia } = lightboxMedia;
    let newIndex;
    if (direction === 'next') {
      newIndex = (index + 1) % allMedia.length;
    } else {
      newIndex = (index - 1 + allMedia.length) % allMedia.length;
    }
    setLightboxMedia({ media: allMedia[newIndex], index: newIndex, allMedia });
  };
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!showLightbox) return;
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowRight') {
        navigateLightbox('next');
      } else if (e.key === 'ArrowLeft') {
        navigateLightbox('prev');
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showLightbox, lightboxMedia]);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-saffron-600 mb-6 md:mb-8 text-center">
          {t('specialEvents.title')}
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-6 md:mb-8">
          <p className="text-gray-700 text-base md:text-lg leading-relaxed">
            {t('specialEvents.intro')}
          </p>
        </div>

        {/* Upcoming Events Section */}
        <div className="mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-saffron-600 mb-4 md:mb-6">
            {t('specialEvents.upcomingTitle')}
          </h2>
          {loading ? (
            <div className="text-center text-gray-500 py-8">Loading events...</div>
          ) : events.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No events available at this time.</div>
          ) : (
            <div className="space-y-4 md:space-y-6">
              {events.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-lg shadow-lg p-6 md:p-8 hover:shadow-xl transition-shadow"
              >
                <h3 className="text-xl md:text-2xl font-bold text-saffron-600 mb-2">
                  {event.name || event.nameEn || event.nameHi || 'Untitled Event'}
                </h3>
                {event.nameEn && event.nameHi && event.nameEn.trim() && event.nameHi.trim() && (
                  <p className="text-lg md:text-xl font-semibold text-saffron-500 mb-1">
                    {language === 'hi' ? event.nameEn : event.nameHi}
                  </p>
                )}
                <p className="text-saffron-500 font-semibold mb-3 text-sm md:text-base">
                  {event.dateRange || event.dateRangeEn || event.dateRangeHi || 'No date range'}
                </p>
                {event.dateRangeEn && event.dateRangeHi && event.dateRangeEn.trim() && event.dateRangeHi.trim() && (
                  <p className="text-saffron-400 font-semibold mb-3 text-sm md:text-base">
                    {language === 'hi' ? event.dateRangeEn : event.dateRangeHi}
                  </p>
                )}
                <p className="text-gray-700 mb-4 text-base md:text-lg">
                  {event.shortDescription || event.shortDescriptionEn || event.shortDescriptionHi || 'No description'}
                </p>
                {event.shortDescriptionEn && event.shortDescriptionHi && event.shortDescriptionEn.trim() && event.shortDescriptionHi.trim() && (
                  <p className="text-gray-600 mb-4 text-base md:text-lg">
                    {language === 'hi' ? event.shortDescriptionEn : event.shortDescriptionHi}
                  </p>
                )}
                
                {/* Event Media Preview */}
                {eventMedia[event.id] && eventMedia[event.id].length > 0 && (
                  <div className="mb-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {eventMedia[event.id].slice(0, 3).map((media, index) => (
                        <div 
                          key={media.id} 
                          className="relative rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => openLightbox(media, eventMedia[event.id], index)}
                        >
                          {media.mediaType === 'IMAGE' ? (
                            <img
                              src={getFullMediaUrl(media.mediaUrl)}
                              alt={media.originalName || 'Event image'}
                              className="w-full h-24 md:h-32 object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <video
                              src={getFullMediaUrl(media.mediaUrl)}
                              className="w-full h-24 md:h-32 object-cover"
                              muted
                            >
                              Your browser does not support the video tag.
                            </video>
                          )}
                        </div>
                      ))}
                    </div>
                    {eventMedia[event.id].length > 3 && (
                      <p className="text-sm text-gray-500 mt-2">
                        +{eventMedia[event.id].length - 3} more
                      </p>
                    )}
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => handleViewDetails(event)}
                    className="flex-1 bg-saffron-500 text-white px-6 py-3 rounded-lg hover:bg-saffron-600 text-base md:text-lg font-semibold transition-colors min-h-[44px]"
                  >
                    {t('specialEvents.viewDetails')}
                  </button>
                  <button
                    onClick={handleNotifyMe}
                    className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 text-base md:text-lg font-semibold transition-colors min-h-[44px]"
                  >
                    {t('specialEvents.notifyMe')}
                  </button>
                </div>
              </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal for Event Details */}
        {showModal && selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 md:p-8">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h2 className="text-2xl md:text-3xl font-bold text-saffron-600">
                      {selectedEvent.name || selectedEvent.nameEn || selectedEvent.nameHi || 'Untitled Event'}
                    </h2>
                    {selectedEvent.nameEn && selectedEvent.nameHi && selectedEvent.nameEn.trim() && selectedEvent.nameHi.trim() && (
                      <p className="text-xl md:text-2xl font-semibold text-saffron-500 mt-1">
                        {language === 'hi' ? selectedEvent.nameEn : selectedEvent.nameHi}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={closeModal}
                    className="text-gray-500 hover:text-gray-700 text-2xl md:text-3xl font-bold min-w-[44px] min-h-[44px]"
                  >
                    ×
                  </button>
                </div>
                <p className="text-saffron-500 font-semibold mb-4 text-sm md:text-base">
                  {selectedEvent.dateRange || selectedEvent.dateRangeEn || selectedEvent.dateRangeHi || 'No date range'}
                </p>
                {selectedEvent.dateRangeEn && selectedEvent.dateRangeHi && selectedEvent.dateRangeEn.trim() && selectedEvent.dateRangeHi.trim() && (
                  <p className="text-saffron-400 font-semibold mb-4 text-sm md:text-base">
                    {language === 'hi' ? selectedEvent.dateRangeEn : selectedEvent.dateRangeHi}
                  </p>
                )}
                <p className="text-gray-700 mb-6 text-base md:text-lg">
                  {selectedEvent.shortDescription || selectedEvent.shortDescriptionEn || selectedEvent.shortDescriptionHi || 'No description'}
                </p>
                {selectedEvent.shortDescriptionEn && selectedEvent.shortDescriptionHi && selectedEvent.shortDescriptionEn.trim() && selectedEvent.shortDescriptionHi.trim() && (
                  <p className="text-gray-600 mb-6 text-base md:text-lg">
                    {language === 'hi' ? selectedEvent.shortDescriptionEn : selectedEvent.shortDescriptionHi}
                  </p>
                )}
                <div className="bg-saffron-50 rounded-lg p-4 md:p-6 mb-4">
                  <h3 className="text-xl md:text-2xl font-bold text-saffron-600 mb-4">
                    {t('specialEvents.scheduleTitle')}
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-gray-700 text-base md:text-lg">
                        <strong>{t('specialEvents.morning')}:</strong> {selectedEvent.schedule?.morning || selectedEvent.scheduleEn?.morning || selectedEvent.scheduleHi?.morning || 'Not specified'}
                      </p>
                      {selectedEvent.scheduleEn?.morning && selectedEvent.scheduleHi?.morning && 
                       selectedEvent.scheduleEn.morning.trim() && selectedEvent.scheduleHi.morning.trim() && (
                        <p className="text-gray-600 text-base md:text-lg ml-4">
                          {language === 'hi' ? selectedEvent.scheduleEn.morning : selectedEvent.scheduleHi.morning}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-gray-700 text-base md:text-lg">
                        <strong>{t('specialEvents.afternoon')}:</strong> {selectedEvent.schedule?.afternoon || selectedEvent.scheduleEn?.afternoon || selectedEvent.scheduleHi?.afternoon || 'Not specified'}
                      </p>
                      {selectedEvent.scheduleEn?.afternoon && selectedEvent.scheduleHi?.afternoon && 
                       selectedEvent.scheduleEn.afternoon.trim() && selectedEvent.scheduleHi.afternoon.trim() && (
                        <p className="text-gray-600 text-base md:text-lg ml-4">
                          {language === 'hi' ? selectedEvent.scheduleEn.afternoon : selectedEvent.scheduleHi.afternoon}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-gray-700 text-base md:text-lg">
                        <strong>{t('specialEvents.evening')}:</strong> {selectedEvent.schedule?.evening || selectedEvent.scheduleEn?.evening || selectedEvent.scheduleHi?.evening || 'Not specified'}
                      </p>
                      {selectedEvent.scheduleEn?.evening && selectedEvent.scheduleHi?.evening && 
                       selectedEvent.scheduleEn.evening.trim() && selectedEvent.scheduleHi.evening.trim() && (
                        <p className="text-gray-600 text-base md:text-lg ml-4">
                          {language === 'hi' ? selectedEvent.scheduleEn.evening : selectedEvent.scheduleHi.evening}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Event Media Gallery in Modal */}
                {eventMedia[selectedEvent.id] && eventMedia[selectedEvent.id].length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-xl md:text-2xl font-bold text-saffron-600 mb-4">
                      Event Gallery
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {eventMedia[selectedEvent.id].map((media, index) => (
                        <div 
                          key={media.id} 
                          className="relative bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => openLightbox(media, eventMedia[selectedEvent.id], index)}
                        >
                          {media.mediaType === 'IMAGE' ? (
                            <img
                              src={getFullMediaUrl(media.mediaUrl)}
                              alt={media.originalName || 'Event image'}
                              className="w-full h-48 md:h-64 object-cover"
                              onError={(e) => {
                                e.target.src = '/placeholder-image.png';
                              }}
                            />
                          ) : (
                            <video
                              src={getFullMediaUrl(media.mediaUrl)}
                              controls
                              className="w-full h-48 md:h-64 object-cover"
                            >
                              Your browser does not support the video tag.
                            </video>
                          )}
                          {media.originalName && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 truncate">
                              {media.originalName}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <button
                  onClick={closeModal}
                  className="w-full bg-saffron-500 text-white px-6 py-3 rounded-lg hover:bg-saffron-600 text-base md:text-lg font-semibold transition-colors min-h-[44px]"
                >
                  {t('specialEvents.close')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lightbox for Full-Size Image/Video View */}
        {showLightbox && lightboxMedia && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 p-4"
            onClick={closeLightbox}
          >
            <div className="relative max-w-7xl max-h-full w-full h-full flex items-center justify-center">
              {/* Close Button */}
              <button
                onClick={closeLightbox}
                className="absolute top-4 right-4 text-white hover:text-gray-300 text-4xl md:text-5xl font-bold z-10 bg-black bg-opacity-50 rounded-full w-12 h-12 md:w-14 md:h-14 flex items-center justify-center min-w-[44px] min-h-[44px]"
              >
                ×
              </button>
              
              {/* Navigation Buttons */}
              {lightboxMedia.allMedia.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateLightbox('prev');
                    }}
                    className="absolute left-4 text-white hover:text-gray-300 text-3xl md:text-4xl font-bold z-10 bg-black bg-opacity-50 rounded-full w-12 h-12 md:w-14 md:h-14 flex items-center justify-center min-w-[44px] min-h-[44px]"
                  >
                    ‹
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateLightbox('next');
                    }}
                    className="absolute right-4 text-white hover:text-gray-300 text-3xl md:text-4xl font-bold z-10 bg-black bg-opacity-50 rounded-full w-12 h-12 md:w-14 md:h-14 flex items-center justify-center min-w-[44px] min-h-[44px]"
                  >
                    ›
                  </button>
                </>
              )}
              
              {/* Media Display */}
              <div 
                className="max-w-full max-h-full flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                {lightboxMedia.media.mediaType === 'IMAGE' ? (
                  <img
                    src={getFullMediaUrl(lightboxMedia.media.mediaUrl)}
                    alt={lightboxMedia.media.originalName || 'Event image'}
                    className="max-w-full max-h-[90vh] object-contain"
                    onError={(e) => {
                      e.target.src = '/placeholder-image.png';
                    }}
                  />
                ) : (
                  <video
                    src={getFullMediaUrl(lightboxMedia.media.mediaUrl)}
                    controls
                    autoPlay
                    className="max-w-full max-h-[90vh]"
                  >
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
              
              {/* Image Counter */}
              {lightboxMedia.allMedia.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-50 px-4 py-2 rounded-lg text-sm md:text-base">
                  {lightboxMedia.index + 1} / {lightboxMedia.allMedia.length}
                </div>
              )}
              
              {/* Image Name */}
              {lightboxMedia.media.originalName && (
                <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-50 px-4 py-2 rounded-lg text-sm md:text-base max-w-md truncate">
                  {lightboxMedia.media.originalName}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpecialEvents;

