import { useCallback } from 'react';
import { useLanguage } from "@/app/context/LanguageContext";

const getNested = (obj: any, path: string): any =>
  path.split(".").reduce((acc, part) => acc && acc[part], obj);

export const useTranslations = () => {
  const { messages } = useLanguage();

  return useCallback(
    (key: string, params?: Record<string, any>): string => {
      let translation = getNested(messages, key) || key;

      if (params) {
        Object.entries(params).forEach(([paramKey, value]) => {
          translation = translation.replace(`{${paramKey}}`, String(value));
        });
      }

      return translation;
    },
    [messages]
  );
};
