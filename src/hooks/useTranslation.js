/**
 * Backward compatibility hook - now uses react-i18next
 * This allows existing components to continue working without changes
 * New components should import directly from 'react-i18next'
 */
import { useTranslation as useI18nextTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';

export const useTranslation = () => {
  // Use i18next's useTranslation for the actual translation function
  const { t: i18nextT, i18n } = useI18nextTranslation();
  
  // Get language from LanguageContext (which now uses i18next)
  const { language } = useLanguage();
  
  // Wrapper function to match old API
  const t = (key) => {
    return i18nextT(key) || key; // Fallback to key if translation missing
  };

  return { t, language };
};


