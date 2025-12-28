import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isMobileLangMenuOpen, setIsMobileLangMenuOpen] = useState(false);
  const langMenuRef = useRef(null);
  const mobileLangMenuRef = useRef(null);
  const { language, changeLanguage } = useLanguage();
  const { t } = useTranslation();

  // Close language menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const target = event.target;
      if (langMenuRef.current && !langMenuRef.current.contains(target)) {
        setIsLangMenuOpen(false);
      }
      if (mobileLangMenuRef.current && !mobileLangMenuRef.current.contains(target)) {
        setIsMobileLangMenuOpen(false);
      }
    };

    // Use capture phase and add a small delay to allow button clicks to process first
    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickOutside, true);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, []);

  return (
    <header className="bg-gradient-to-r from-saffron-400 to-saffron-600 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center gap-2 text-white no-underline">
            <img 
              src="/durga-maa-logo.svg" 
              alt="Durga Maa" 
              className="w-12 h-12 md:w-14 md:h-14 object-contain rounded-full"
              onError={(e) => {
                if (e.target.src.includes('.svg')) {
                  e.target.src = '/durga-maa-logo.png';
                  return;
                }
                e.target.style.display = 'none';
              }}
            />
            <span className="text-xl md:text-2xl font-bold">Durga Mandir</span>
          </Link>
          
          {/* Mobile Language Selector - Always Visible */}
          <div className="md:hidden relative" ref={mobileLangMenuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMobileLangMenuOpen(!isMobileLangMenuOpen);
              }}
              className="px-3 py-2 rounded hover:bg-white hover:bg-opacity-20 active:bg-white active:bg-opacity-30 transition flex items-center gap-1 text-sm font-semibold"
              style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
            >
              {t('header.language')} <span className="text-xs">▾</span>
            </button>
            {isMobileLangMenuOpen && (
              <div 
                className="absolute right-0 mt-2 bg-white rounded-lg shadow-xl py-2 min-w-[180px] z-[100] border-2 border-saffron-200"
                onClick={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                style={{ touchAction: 'manipulation', pointerEvents: 'auto' }}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    changeLanguage('en');
                    setIsMobileLangMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 min-h-[44px] flex items-center active:bg-saffron-200 transition cursor-pointer ${language === 'en' ? 'bg-saffron-500 text-white font-semibold' : 'text-saffron-700 font-medium'}`}
                  style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation', pointerEvents: 'auto' }}
                >
                  {t('language.english')}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    changeLanguage('hi');
                    setIsMobileLangMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 min-h-[44px] flex items-center active:bg-saffron-200 transition cursor-pointer ${language === 'hi' ? 'bg-saffron-500 text-white font-semibold' : 'text-saffron-700 font-medium'}`}
                  style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation', pointerEvents: 'auto' }}
                >
                  {t('language.hindi')}
                </button>
              </div>
            )}
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4">
            <Link to="/" className="px-3 py-2 rounded hover:bg-white hover:bg-opacity-20 transition">{t('header.home')}</Link>
            <Link to="/about" className="px-3 py-2 rounded hover:bg-white hover:bg-opacity-20 transition">{t('header.about')}</Link>
            <Link to="/services" className="px-3 py-2 rounded hover:bg-white hover:bg-opacity-20 transition">{t('header.services')}</Link>
            <Link to="/mandir-nirmaan-seva" className="px-3 py-2 rounded hover:bg-white hover:bg-opacity-20 transition">{t('header.mandirNirmaanSeva')}</Link>
            <Link to="/contact" className="px-3 py-2 rounded hover:bg-white hover:bg-opacity-20 transition">{t('header.contact')}</Link>
            <Link to="/admin/login" className="px-3 py-2 rounded bg-white bg-opacity-20 hover:bg-opacity-30 transition">{t('header.adminLogin')}</Link>
            
            {/* Language Selector - Desktop */}
            <div className="relative" ref={langMenuRef}>
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="px-3 py-2 rounded hover:bg-white hover:bg-opacity-20 transition flex items-center gap-1"
              >
                {t('header.language')} <span className="text-xs">▾</span>
              </button>
              {isLangMenuOpen && (
                <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-lg py-2 min-w-[150px] z-50 border-2 border-saffron-200">
                  <button
                    onClick={() => {
                      changeLanguage('en');
                      setIsLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-saffron-100 transition ${language === 'en' ? 'bg-saffron-500 text-white font-semibold' : 'text-saffron-700 font-medium'}`}
                  >
                    {t('language.english')}
                  </button>
                  <button
                    onClick={() => {
                      changeLanguage('hi');
                      setIsLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-saffron-100 transition ${language === 'hi' ? 'bg-saffron-500 text-white font-semibold' : 'text-saffron-700 font-medium'}`}
                  >
                    {t('language.hindi')}
                  </button>
                </div>
              )}
            </div>
          </nav>
          
          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden flex flex-col gap-1.5 p-2 ml-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`w-6 h-0.5 bg-white transition-all ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`w-6 h-0.5 bg-white transition-all ${isMenuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`w-6 h-0.5 bg-white transition-all ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </button>
        </div>
        
        {/* Mobile Navigation */}
        <nav className={`md:hidden overflow-hidden transition-all duration-300 ${isMenuOpen ? 'max-h-96' : 'max-h-0'}`}>
          <div className="py-4 space-y-2">
            <Link to="/" className="block px-4 py-3 rounded hover:bg-white hover:bg-opacity-20 transition" onClick={() => setIsMenuOpen(false)}>{t('header.home')}</Link>
            <Link to="/about" className="block px-4 py-3 rounded hover:bg-white hover:bg-opacity-20 transition" onClick={() => setIsMenuOpen(false)}>{t('header.about')}</Link>
            <Link to="/services" className="block px-4 py-3 rounded hover:bg-white hover:bg-opacity-20 transition" onClick={() => setIsMenuOpen(false)}>{t('header.services')}</Link>
            <Link to="/mandir-nirmaan-seva" className="block px-4 py-3 rounded hover:bg-white hover:bg-opacity-20 transition" onClick={() => setIsMenuOpen(false)}>{t('header.mandirNirmaanSeva')}</Link>
            <Link to="/contact" className="block px-4 py-3 rounded hover:bg-white hover:bg-opacity-20 transition" onClick={() => setIsMenuOpen(false)}>{t('header.contact')}</Link>
            <Link to="/admin/login" className="block px-4 py-3 rounded bg-white bg-opacity-20 hover:bg-opacity-30 transition" onClick={() => setIsMenuOpen(false)}>{t('header.adminLogin')}</Link>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
