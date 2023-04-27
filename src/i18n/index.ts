import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from './en.json'
import ru from "./ru.json";
import LocalStorageBackend from 'i18next-localstorage-backend'; // primary use cache
import ChainedBackend from "i18next-chained-backend";
import HttpBackend from "i18next-http-backend";
import LngDetector from "i18next-browser-languagedetector";

i18n
  .use(ChainedBackend)
  .use(LngDetector)
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources: {
      en,
      ru,
    },
    fallbackLng: "en",
    backend: {
      backends: [LocalStorageBackend, HttpBackend],
      backendOptions: [
        {
          expirationTime: 7 * 24 * 60 * 60 * 1000, // 7 days
        },
        {
          loadPath: "/locales/{{lng}}/{{ns}}.json",
        },
      ],
    },
    interpolation: {
      escapeValue: false, // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
    },
  });


  export interface Translation {
    translation: {
      selectWallet: string;
    };
  }