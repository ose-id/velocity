import { createContext, useContext, useState, useEffect } from "react";
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

  const t = (key) => {
    // Basic key lookup, can be expanded for nested objects if needed
    return languages[language][key] || key;
  };

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
