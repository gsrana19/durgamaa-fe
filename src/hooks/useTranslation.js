import { useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import enTranslations from '../translations/en.json';
import hiTranslations from '../translations/hi.json';

const translations = {
  en: enTranslations,
  hi: hiTranslations
};

export const useTranslation = () => {
  const { language } = useLanguage();

  const t = useMemo(() => {
    return (key) => {
      const keys = key.split('.');
      let value = translations[language] || translations.en;
      
      for (const k of keys) {
        if (value && typeof value === 'object') {
          value = value[k];
        } else {
          // Fallback to English if translation not found
          value = translations.en;
          for (const k2 of keys) {
            if (value && typeof value === 'object') {
              value = value[k2];
            } else {
              value = undefined;
              break;
            }
          }
          break;
        }
      }
      
      return value || key;
    };
  }, [language]);

  return { t, language };
};

