import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';
import { en } from './en';
import { ur } from './ur';
import type { AppLanguage } from '../types/code';

void i18n.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  resources: {
    en: { translation: en },
    ur: { translation: ur },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export function isRtlLanguage(language: AppLanguage): boolean {
  return language === 'ur';
}

/**
 * Applies i18n language and syncs native RTL flags for the next cold start.
 * UI direction is driven in JS via language state (no app restart required).
 */
export async function applyLanguage(language: AppLanguage): Promise<void> {
  const shouldBeRTL = isRtlLanguage(language);
  await i18n.changeLanguage(language);

  I18nManager.allowRTL(true);
  if (I18nManager.isRTL !== shouldBeRTL) {
    I18nManager.forceRTL(shouldBeRTL);
  }
}

export default i18n;
