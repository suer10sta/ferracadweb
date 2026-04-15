import { createContext, useContext, useState } from 'react';
import en from './en.json';
import fr from './fr.json';
import fl from './fl.json';
import type { ReactNode } from 'react';

// Define supported languages
type Language = 'en' | 'fr' | 'fl';

// Use the keys from one language file as the type for all translations
type TranslationKeys = keyof typeof en;

// All available translations
const translationData: any = {
  en,
  fr,
  fl,
};

interface LanguageContextProps {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKeys) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  // 🧠 Load the saved language from localStorage (default: 'fr')
  const getInitialLang = (): Language => {
    const stored = localStorage.getItem('lang');
    if (stored === 'en' || stored === 'fr' || stored === 'fl') {
      return stored;
    }
    return 'fr';
  };

  const [lang, setLangState] = useState<Language>(getInitialLang);

  // 🪣 When language changes, save it to localStorage
  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('lang', newLang);
  };

  const t = (key: TranslationKeys) => {
    return translationData[lang]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextProps => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};