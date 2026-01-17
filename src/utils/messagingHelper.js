/**
 * Utility functions for sending messages via WhatsApp/SMS deep links
 * No paid providers - uses native app deep links
 */

/**
 * Format and normalize mobile number
 * @param {string} mobile - Mobile number (can include spaces, dashes, +, etc.)
 * @param {string} defaultCountryCode - Default country code (default: '91' for India)
 * @returns {string} Formatted mobile number with country code (e.g., '919876543210')
 */
export const formatMobile = (mobile, defaultCountryCode = '91') => {
  if (!mobile || typeof mobile !== 'string') {
    return null;
  }
  
  // Remove all non-digit characters except +
  let cleaned = mobile.replace(/[^\d+]/g, '');
  
  // If already has country code (starts with + or country code)
  if (cleaned.startsWith('+')) {
    // Remove + and return digits only
    return cleaned.substring(1);
  }
  
  // Check if starts with country code (e.g., 91 for India)
  if (cleaned.startsWith(defaultCountryCode) && cleaned.length > 10) {
    return cleaned;
  }
  
  // If 10 digits (Indian mobile), add country code
  if (cleaned.length === 10 && /^[6-9]\d{9}$/.test(cleaned)) {
    return defaultCountryCode + cleaned;
  }
  
  // If already 12+ digits, assume it has country code
  if (cleaned.length >= 12) {
    return cleaned;
  }
  
  // Default: add country code
  return defaultCountryCode + cleaned;
};

/**
 * Build WhatsApp deep link URL
 * @param {string} mobile - Mobile number (will be formatted)
 * @param {string} message - Message text
 * @returns {string} WhatsApp deep link URL
 */
export const buildWhatsAppUrl = (mobile, message) => {
  const formattedMobile = formatMobile(mobile);
  if (!formattedMobile) {
    return null;
  }
  
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${formattedMobile}?text=${encodedMessage}`;
};

/**
 * Build SMS deep link URL
 * @param {string} mobile - Mobile number (will be formatted)
 * @param {string} message - Message text
 * @returns {string} SMS deep link URL
 */
export const buildSmsUrl = (mobile, message) => {
  const formattedMobile = formatMobile(mobile);
  if (!formattedMobile) {
    return null;
  }
  
  const encodedMessage = encodeURIComponent(message);
  return `sms:+${formattedMobile}?body=${encodedMessage}`;
};

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} True if successful
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
 * Check if mobile number is valid
 * @param {string} mobile - Mobile number
 * @returns {boolean} True if valid
 */
export const isValidMobile = (mobile) => {
  if (!mobile || typeof mobile !== 'string') {
    return false;
  }
  
  const cleaned = mobile.replace(/[^\d+]/g, '');
  // At least 10 digits
  return cleaned.replace(/\+/g, '').length >= 10;
};

/**
 * Format donation verification message for WhatsApp
 * @param {object} donation - Donation confirmation object
 * @param {string} status - 'VERIFIED' or 'REJECTED'
 * @param {string} adminNote - Admin's note
 * @returns {string} Formatted message
 */
export const formatWhatsAppMessage = (donation, status, adminNote) => {
  // Format amount - handle both number and string
  let amount;
  if (typeof donation.amount === 'number') {
    amount = donation.amount.toLocaleString('en-IN');
  } else if (typeof donation.amount === 'string') {
    const numAmount = parseFloat(donation.amount);
    amount = isNaN(numAmount) ? donation.amount : numAmount.toLocaleString('en-IN');
  } else {
    amount = donation.amount || '0';
  }
  
  const method = donation.method || 'N/A';
  const utr = donation.utr || 'N/A';
  
  if (status === 'VERIFIED') {
    return `Namaste from Durga Maa Temple 🙏\n\n✅ Your donation of ₹${amount} has been verified.\nMethod: ${method}\nUTR: ${utr}\nNote: ${adminNote}\n\nThank you for your contribution!\nJai Maa Durga 🌺`;
  } else {
    return `Namaste from Durga Maa Temple 🙏\n\n❌ Your donation of ₹${amount} could not be verified.\nMethod: ${method}\nUTR: ${utr}\nNote: ${adminNote}\n\nPlease contact temple admin if needed.\nJai Maa Durga 🌺`;
  }
};

/**
 * Format donation verification message for SMS (shorter)
 * @param {object} donation - Donation confirmation object
 * @param {string} status - 'VERIFIED' or 'REJECTED'
 * @param {string} adminNote - Admin's note
 * @returns {string} Formatted message
 */
export const formatSmsMessage = (donation, status, adminNote) => {
  // Format amount - handle both number and string
  let amount;
  if (typeof donation.amount === 'number') {
    amount = donation.amount.toLocaleString('en-IN');
  } else if (typeof donation.amount === 'string') {
    const numAmount = parseFloat(donation.amount);
    amount = isNaN(numAmount) ? donation.amount : numAmount.toLocaleString('en-IN');
  } else {
    amount = donation.amount || '0';
  }
  
  const method = donation.method || 'N/A';
  const utr = donation.utr || 'N/A';
  
  if (status === 'VERIFIED') {
    return `Durga Maa Temple: Donation ₹${amount} verified. Method:${method}. UTR:${utr}. Note:${adminNote}. Jai Maa Durga`;
  } else {
    return `Durga Maa Temple: Donation ₹${amount} not verified. Method:${method}. UTR:${utr}. Note:${adminNote}. Contact admin. Jai Maa Durga`;
  }
};

