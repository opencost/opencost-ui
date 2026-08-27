import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en.json";
import ru from "./locales/ru.json";
import zhCN from "./locales/zh-CN.json";
import zhTW from "./locales/zh-TW.json";

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "zh-CN", label: "简体中文 (Simplified)", flag: "🇨🇳" },
  { code: "zh-TW", label: "繁體中文 (Traditional)", flag: "🇹🇼" },
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]["code"];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ru: { translation: ru },
      "zh-CN": { translation: zhCN },
      "zh-TW": { translation: zhTW },
    },
    fallbackLng: "en",
    supportedLngs: ["en", "ru", "zh-CN", "zh-TW"],
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "opencost_language",
      caches: ["localStorage"],
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
