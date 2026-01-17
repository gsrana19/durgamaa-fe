/**
 * Helper functions for Donate feature
 * Handles UPI deep links, copy to clipboard, and payment confirmation
 */

/**
 * Generate UPI deep link (generic)
 * @param {string} upiId - UPI ID (e.g., "boism-9931690581@boi")
 * @param {string} payeeName - Payee name (e.g., "Durga Maa Temple")
 * @param {number|string} amount - Amount to pay
 * @param {string} note - Transaction note (optional)
 * @returns {string} UPI deep link URL
 */
export const generateUpiLink = (upiId, payeeName, amount, note = '') => {
  const params = new URLSearchParams({
    pa: upiId,
    pn: payeeName,
    am: amount.toString(),
    cu: 'INR'
  });
  
  if (note) {
    params.append('tn', note);
  }
  
  return `upi://pay?${params.toString()}`;
};

/**
 * Generate app-specific UPI link
 * @param {string} app - UPI app name ('phonepe', 'gpay', 'paytm', 'bhim', 'generic')
 * @param {string} upiId - UPI ID
 * @param {string} payeeName - Payee name
 * @param {number|string} amount - Amount to pay
 * @param {string} note - Transaction note (optional)
 * @returns {string} App-specific UPI link
 */
export const generateAppSpecificUpiLink = (app, upiId, payeeName, amount, note = '') => {
  const params = new URLSearchParams({
    pa: upiId,
    pn: payeeName,
    am: amount.toString(),
    cu: 'INR'
  });
  
  if (note) {
    params.append('tn', note);
  }
  
  const queryString = params.toString();
  
  switch (app.toLowerCase()) {
    case 'phonepe':
      // PhonePe specific intent URL
      return `phonepe://pay?${queryString}`;
    case 'gpay':
    case 'googlepay':
      // Google Pay specific intent URL
      return `tez://upi/pay?${queryString}`;
    case 'paytm':
      // Paytm specific intent URL
      return `paytmmp://pay?${queryString}`;
    case 'bhim':
      // BHIM UPI specific
      return `bhim://pay?${queryString}`;
    default:
      // Generic UPI link (but more specific to avoid WhatsApp)
      return `upi://pay?${queryString}`;
  }
};

/**
 * Generate Android Intent URL for UPI payment (more reliable)
 * @param {string} app - UPI app package name or 'any'
 * @param {string} upiId - UPI ID
 * @param {string} payeeName - Payee name
 * @param {number|string} amount - Amount to pay
 * @param {string} note - Transaction note (optional)
 * @returns {string} Android Intent URL
 */
export const generateUpiIntentUrl = (app, upiId, payeeName, amount, note = '') => {
  const params = new URLSearchParams({
    pa: upiId,
    pn: payeeName,
    am: amount.toString(),
    cu: 'INR'
  });
  
  if (note) {
    params.append('tn', note);
  }
  
  const queryString = params.toString();
  const fallbackUrl = `https://pay.google.com/gp/v/save/${encodeURIComponent(upiId)}`;
  
  // App package names
  const appPackages = {
    phonepe: 'com.phonepe.app',
    gpay: 'com.google.android.apps.nfc.payment',
    paytm: 'net.one97.paytm',
    bhim: 'in.org.npci.upiapp',
    any: null // Let Android choose
  };
  
  const packageName = appPackages[app.toLowerCase()] || null;
  
  // Build the UPI URL first
  const upiUrl = `upi://pay?${queryString}`;
  
  if (packageName) {
    // App-specific intent URL
    return `intent://pay?${queryString}#Intent;scheme=upi;package=${packageName};S.browser_fallback_url=${encodeURIComponent(upiUrl)};end`;
  } else {
    // Generic intent that should open any UPI app
    return `intent://pay?${queryString}#Intent;scheme=upi;S.browser_fallback_url=${encodeURIComponent(upiUrl)};end`;
  }
};

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

/**
 * Open UPI payment link
 * @param {string} upiLink - UPI deep link URL
 * @param {string} app - Preferred UPI app ('phonepe', 'gpay', 'paytm', 'bhim', 'any')
 * @returns {Promise<boolean>} True if link was opened, false if failed
 */
export const openUpiPayment = (upiLink, app = 'any') => {
  try {
    // For Android WebView, try intent URL first (more reliable)
    const isAndroidWebView = () => {
      if (typeof window === 'undefined' || !window.navigator) return false;
      const userAgent = window.navigator.userAgent || '';
      return (userAgent.includes('wv') && /Android/i.test(userAgent)) || 
             (/Android/i.test(userAgent) && /Version\/\d+\.\d+/.test(userAgent));
    };
    
    if (isAndroidWebView() && app !== 'any') {
      // Extract parameters from upiLink and create intent URL
      const url = new URL(upiLink.replace('upi://', 'http://'));
      const params = {};
      url.searchParams.forEach((value, key) => {
        params[key] = value;
      });
      
      const intentUrl = generateUpiIntentUrl(
        app,
        params.pa,
        params.pn,
        params.am,
        params.tn
      );
      
      window.location.href = intentUrl;
    } else {
      // Use the provided UPI link
      window.location.href = upiLink;
    }
    
    return true;
  } catch (error) {
    console.error('Error opening UPI payment:', error);
    return false;
  }
};

/**
 * Format amount for display
 * @param {number|string} amount - Amount to format
 * @returns {string} Formatted amount string
 */
export const formatAmount = (amount) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return '0';
  return numAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 });
};

