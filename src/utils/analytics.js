// Google Analytics 4 Integration

// Initialize Google Analytics
export const initGA = (measurementId) => {
  if (!measurementId) {
    console.warn('Google Analytics Measurement ID not provided');
    return;
  }

  // Load gtag.js script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;
  
  gtag('js', new Date());
  gtag('config', measurementId, {
    send_page_view: false // We'll handle page views manually in React
  });

  console.log('Google Analytics initialized with ID:', measurementId);
};

// Track page view
export const trackPageView = (path, title) => {
  if (window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: path,
      page_title: title || document.title
    });
    console.log('Page view tracked:', path);
  }
};

// Track custom events
export const trackEvent = (eventName, eventParams = {}) => {
  if (window.gtag) {
    window.gtag('event', eventName, eventParams);
    console.log('Event tracked:', eventName, eventParams);
  }
};

// Track donation
export const trackDonation = (amount, donorName, category) => {
  trackEvent('donation_made', {
    value: amount,
    currency: 'INR',
    donor_name: donorName,
    category: category
  });
};

// Track event viewing
export const trackEventView = (eventName, eventId) => {
  trackEvent('view_event', {
    event_name: eventName,
    event_id: eventId
  });
};

// Track contact page view
export const trackContactView = () => {
  trackEvent('contact_page_view');
};

// Track admin login
export const trackAdminLogin = (userId) => {
  trackEvent('admin_login', {
    user_id: userId
  });
};

// Track service booking
export const trackServiceBooking = (serviceName, amount) => {
  trackEvent('service_booking', {
    service_name: serviceName,
    value: amount,
    currency: 'INR'
  });
};

