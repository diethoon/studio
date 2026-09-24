import React, { useState, useCallback, createContext, useContext, ReactNode } from "react";
import ko from "@/src/i18n/locales/ko.json";
import en from "@/src/i18n/locales/en.json";
import ja from "@/src/i18n/locales/ja.json";
import zh from "@/src/i18n/locales/zh.json";

export type Language = "ko" | "en" | "ja" | "zh";

const locales: Record<Language, any> = { ko, en, ja, zh };

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem("diet_language");
    if (saved && (saved === "ko" || saved === "en" || saved === "ja" || saved === "zh")) {
      return saved as Language;
    }
    return "ko";
  });

  const setLang = (nextLang: Language) => {
    setLangState(nextLang);
    localStorage.setItem("diet_language", nextLang);
  };

  const t = useCallback(
    (keyPath: string, params?: Record<string, string>): string => {
      const keys = keyPath.split(".");
      let current = locales[lang] || locales.ko;
      for (const k of keys) {
        if (current && typeof current === "object" && k in current) {
          current = current[k];
        } else {
          let fallback = locales.ko;
          for (const fk of keys) {
            if (fallback && typeof fallback === "object" && fk in fallback) {
              fallback = fallback[fk];
            } else {
              return keyPath;
            }
          }
          current = fallback;
          break;
        }
      }

      if (typeof current !== "string") return keyPath;

      let result = current;
      if (params) {
        Object.entries(params).forEach(([pKey, pVal]) => {
          result = result.replaceAll(`{${pKey}}`, pVal);
        });
      }
      return result;
    },
    [lang]
  );

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return ctx;
};
