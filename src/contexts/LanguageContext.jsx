import React, { createContext, useContext } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageContext = createContext();

/**
 * Backward compatibility hook for existing components
 * Now uses i18next internally
 */
export const useLanguage = () => {
  const { i18n } = useTranslation();
  
  return {
    language: i18n.language || 'en',
    changeLanguage: (lang) => {
      if (lang === 'en' || lang === 'hi') {
        i18n.changeLanguage(lang);
        // i18next's LanguageDetector automatically saves to localStorage as 'durgamaa_lang'
      }
    }
  };
};

/**
 * LanguageProvider - Wraps children (no-op now, but kept for backward compatibility)
 * i18next is initialized in src/i18n.js and imported in src/index.js
 */
export const LanguageProvider = ({ children }) => {
  return <>{children}</>;
};






