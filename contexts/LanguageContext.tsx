import React, { createContext, useState, useContext, ReactNode, useCallback, useMemo } from 'react';
import { translations, TranslationKey } from '../utils/translations';

type Language = 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, vars?: { [key: string]: string | number }) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const savedLang = localStorage.getItem('language');
    return (savedLang === 'ar' || savedLang === 'en') ? savedLang : 'ar';
  });

  const setLanguage = useCallback((lang: Language) => {
    localStorage.setItem('language', lang);
    setLanguageState(lang);
  }, []);

  const t = useCallback((key: TranslationKey, vars?: { [key: string]: string | number }): string => {
    let text = translations[language][key] || key;
    if (vars) {
        Object.keys(vars).forEach(varKey => {
            const regex = new RegExp(`{{${varKey}}}`, 'g');
            text = text.replace(regex, String(vars[varKey]));
        });
    }
    return text;
  }, [language]);
  
  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};