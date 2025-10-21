import { useLanguage } from "@/app/context/LanguageContext";

export const useTranslations = () => {
  const { messages } = useLanguage();

  const getNested = (obj: any, path: string): any =>
    path.split(".").reduce((acc, part) => acc && acc[part], obj);

  const t = (key: string, params?: Record<string, any>): string => {
    let translation = getNested(messages, key) || key;

    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        translation = translation.replace(`{${paramKey}}`, String(value));
      });
    }

    return translation;
  };

  return t;
};
