import { createContext, useContext, useState, useEffect, useCallback } from "react";
import id from "@/locales/id.json";
import en from "@/locales/en.json";

const LanguageContext = createContext();

const languages = { id, en };

export function LanguageProvider({ children, defaultLanguage = "en", storageKey = "vite-ui-language" }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem(storageKey) || defaultLanguage;
  });

  useEffect(() => {
    localStorage.setItem(storageKey, language);
  }, [language]);

  const t = useCallback((key, params) => {
    let str = languages[language][key] || key;
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        str = str.replace(`{${key}}`, value);
      });
    }
    return str;
  }, [language]);

  const value = {
    language,
    setLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined)
    throw new Error("useLanguage must be used within a LanguageProvider");
  return context;
};
