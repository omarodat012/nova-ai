import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { translations } from '../i18n/translations.js';

const STORAGE_KEY = 'nova-lang';
const DEFAULT_LANG = 'ar';

const LanguageContext = createContext(null);

function readStoredLang() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'en' ? 'en' : DEFAULT_LANG;
  } catch {
    return DEFAULT_LANG;
  }
}

function lookup(dictionary, path) {
  return path.split('.').reduce((node, key) => node?.[key], dictionary);
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(readStoredLang);
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    document.title = translations[lang].meta.title;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Storage can be unavailable (private mode); the choice still applies for this session.
    }
  }, [lang, dir]);

  const value = useMemo(
    () => ({
      lang,
      dir,
      isRTL: dir === 'rtl',
      toggleLanguage: () => setLang((current) => (current === 'ar' ? 'en' : 'ar')),
      // t('hero.subtitle') reads UI copy from the translations dictionary.
      t: (path) => lookup(translations[lang], path) ?? path,
      // localize({ ar, en }) picks the active language from bilingual data records.
      localize: (value) => (value && typeof value === 'object' && 'ar' in value ? value[lang] : value),
    }),
    [lang, dir],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used inside <LanguageProvider>');
  return context;
}
