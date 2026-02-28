import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import uz from './locales/uz.json';

const LANGUAGE_KEY = 'app-language';
const savedLang = localStorage.getItem(LANGUAGE_KEY) ?? 'en';

i18n.use(initReactI18next).init({
    resources: {
        en: { translation: en },
        uz: { translation: uz },
    },
    lng: savedLang,
    fallbackLng: 'en',
    interpolation: {
        escapeValue: false, // React already escapes by default
    },
});

i18n.on('languageChanged', (lng) => {
    localStorage.setItem(LANGUAGE_KEY, lng);
});

export default i18n;
