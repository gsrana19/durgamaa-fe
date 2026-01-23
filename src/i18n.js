import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslations from './translations/en.json';
import hiTranslations from './translations/hi.json';

// Configure i18next
i18n
  // Detect user language
  // Order: localStorage -> navigator -> default
  .use(LanguageDetector)
  // Pass i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    // Translation resources
    resources: {
      en: {
        translation: enTranslations
      },
      hi: {
        translation: hiTranslations
      }
    },
    // Default language
    fallbackLng: 'en',
    // Default namespace
    defaultNS: 'translation',
    // Language detection options
    detection: {
      // Order of detection
      order: ['localStorage', 'navigator'],
      // Cache user language in localStorage
      caches: ['localStorage'],
      // localStorage key name
      lookupLocalStorage: 'durgamaa_lang',
      // Do not check HTML lang attribute
      checkWhitelist: true
    },
    // Supported languages
    supportedLngs: ['en', 'hi'],
    // Interpolation options
    interpolation: {
      escapeValue: false // React already escapes values
    },
    // React options
    react: {
      useSuspense: false // Disable suspense for better compatibility
    },
    // Debug mode (set to false in production)
    debug: process.env.NODE_ENV === 'development'
  });

// Export i18n instance
export default i18n;

