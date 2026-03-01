import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';

// Import translation files natively since they are small enough
import translationEN from './locales/en/translation.json';
import translationHI from './locales/hi/translation.json';
import translationKN from './locales/kn/translation.json';
import translationTA from './locales/ta/translation.json';

const resources = {
    en: { translation: translationEN },
    hi: { translation: translationHI },
    kn: { translation: translationKN },
    ta: { translation: translationTA }
};

i18n
    .use(HttpApi)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        supportedLngs: ['en', 'hi', 'kn', 'ta'],
        fallbackLng: 'en',
        detection: {
            order: ['localStorage', 'cookie', 'htmlTag', 'path', 'subdomain'],
            caches: ['localStorage', 'cookie'],
        },
        interpolation: {
            escapeValue: false, // react already safes from xss
        },
    });

export default i18n;
