import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import id from "@/locales/id.json";
import en from "@/locales/en.json";

export type LanguageCode = "id" | "en";

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const languages: Record<LanguageCode, Record<string, string>> = { id, en };

interface LanguageProviderProps {
  children: ReactNode;
  defaultLanguage?: LanguageCode;
  storageKey?: string;
}

export function LanguageProvider({
  children,
  defaultLanguage = "en",
  storageKey = "vite-ui-language",
}: LanguageProviderProps) {
  const [language, setLanguage] = useState<LanguageCode>(() => {
    return (localStorage.getItem(storageKey) as LanguageCode) || defaultLanguage;
  });

  useEffect(() => {
    localStorage.setItem(storageKey, language);
  }, [language, storageKey]);

  const t = useCallback((key: string, params?: Record<string, string | number>) => {
    let str = languages[language]?.[key] || key;
    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        str = str.replace(`{${paramKey}}`, String(value));
      });
    }
    return str;
  }, [language]);

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined)
    throw new Error("useLanguage must be used within a LanguageProvider");
  return context;
};
