/**
 * Helper functions for Google Maps integration
 * Handles opening Google Maps in both browser and Android WebView
 */

/**
 * Detect if running in Android WebView
 * @returns {boolean} True if running in Android WebView
 */
export const isAndroidWebView = () => {
  if (typeof window === 'undefined' || !window.navigator) {
    return false;
  }
  
  const userAgent = window.navigator.userAgent || '';
  
  // Check for WebView indicators
  // Android WebView typically has "wv" in user agent or "Version/X.X" pattern
  const hasWv = userAgent.includes('wv');
  const isAndroid = /Android/i.test(userAgent);
  const hasVersion = /Version\/\d+\.\d+/.test(userAgent);
  
  return (hasWv && isAndroid) || (isAndroid && hasVersion);
};

/**
 * Open Google Maps with the given location
 * Handles both browser and Android WebView scenarios
 * @param {string} locationQuery - Location query string (e.g., "3FFH+GP4,Kariyatpur,Mangura,Jharkhand,India")
 */
export const openGoogleMaps = (locationQuery) => {
  const mapsUrl = `https://www.google.com/maps?q=${encodeURIComponent(locationQuery)}`;
  
  if (isAndroidWebView()) {
    // Try to open using Android Intent URL for Google Maps app
    // The WebView's shouldOverrideUrlLoading will intercept this and handle it properly
    const intentUrl = `intent://maps.google.com/maps?q=${encodeURIComponent(locationQuery)}#Intent;scheme=https;package=com.google.android.apps.maps;end`;
    
    try {
      // Set location.href to trigger the intent URL
      // The Android WebView will intercept this in shouldOverrideUrlLoading
      window.location.href = intentUrl;
    } catch (error) {
      console.error('Error opening Google Maps intent:', error);
      // Fallback to regular URL - WebView will handle this too
      window.location.href = mapsUrl;
    }
  } else {
    // Regular browser - open in new tab
    window.open(mapsUrl, '_blank', 'noopener,noreferrer');
  }
};

/**
 * Get the embedded map URL for iframe
 * @param {string} locationQuery - Location query string
 * @returns {string} Embedded map URL
 */
export const getEmbeddedMapUrl = (locationQuery) => {
  return `https://www.google.com/maps?q=${encodeURIComponent(locationQuery)}&output=embed`;
};

