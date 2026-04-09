import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import hy from './locales/hy.json';
import ru from './locales/ru.json';
import en from './locales/en.json';

const savedLang = localStorage.getItem('language');
const browserLang = navigator.language.slice(0, 2);
const defaultLang = savedLang || (['hy', 'ru', 'en'].includes(browserLang) ? browserLang : 'hy');

i18n.use(initReactI18next).init({
  resources: {
    hy: { translation: hy },
    ru: { translation: ru },
    en: { translation: en },
  },
  lng: defaultLang,
  fallbackLng: 'hy',
  interpolation: { escapeValue: false },
});

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('language', lng);
});

export default i18n;
