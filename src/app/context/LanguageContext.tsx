'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Messages = Record<string, any>;

type LanguageContextType = {
  lang: string;
  setLang: (lang: string) => void;
  messages: Messages;
  isRTL: boolean;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLangState] = useState<string>('fr');
  const [messages, setMessages] = useState<Messages>({});
  const [isRTL, setIsRTL] = useState<boolean>(false); // Default to LTR for French

  // Set language in state + localStorage + HTML lang attr + direction
  const setLang = (newLang: string) => {
    const isRTL = newLang === 'ar';
    localStorage.setItem('lang', newLang);
    setLangState(newLang);
    setIsRTL(isRTL);
    document.documentElement.lang = newLang;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  };

  // Load language from localStorage on first mount
  useEffect(() => {
    const stored = localStorage.getItem('lang') || 'fr';
    const isRTL = stored === 'ar';
    setLangState(stored);
    setIsRTL(isRTL);
    document.documentElement.lang = stored;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  }, []);

  // Load translation files when language changes
  useEffect(() => {
    const loadMessages = async () => {
      try {
        // Import translation files dynamically
        const frontendModule = await import(`../i18n/frontend/${lang}.json`);
        const backendModule = await import(`../i18n/backend/${lang}.json`);
        
        // Extract the default export or use the module directly
        const frontend = frontendModule.default || frontendModule;
        const backend = backendModule.default || backendModule;
        
        setMessages({ ...frontend, ...backend });
      } catch (error) {
        console.error(`Failed to load translations for language: ${lang}`, error);
        // Fallback to empty messages to prevent crashes
        setMessages({});
      }
    };

    if (lang) {
      loadMessages();
    }
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, messages, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
