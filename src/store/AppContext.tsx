import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';
import {
  APP_VERSION,
  DEFAULT_DISPLAY_NAME,
  STORAGE_KEYS,
} from '../constants';
import { applyLanguage } from '../localization';
import { createTheme, AppTheme } from '../theme';
import { AppLanguage, ThemePreference } from '../types/code';
import { getDatabase } from '../database/database';

type AppContextValue = {
  ready: boolean;
  onboardingComplete: boolean;
  completeOnboarding: () => Promise<void>;
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => Promise<void>;
  themePreference: ThemePreference;
  setThemePreference: (preference: ThemePreference) => Promise<void>;
  displayName: string;
  setDisplayName: (name: string) => Promise<void>;
  theme: AppTheme;
  appVersion: string;
  refreshDb: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProviders({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [ready, setReady] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [language, setLanguageState] = useState<AppLanguage>('en');
  const [themePreference, setThemePreferenceState] =
    useState<ThemePreference>('system');
  const [displayName, setDisplayNameState] = useState(DEFAULT_DISPLAY_NAME);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await getDatabase();
        const [onboarding, lang, theme, name] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.onboardingComplete),
          AsyncStorage.getItem(STORAGE_KEYS.language),
          AsyncStorage.getItem(STORAGE_KEYS.themePreference),
          AsyncStorage.getItem(STORAGE_KEYS.displayName),
        ]);
        if (!mounted) {
          return;
        }
        setOnboardingComplete(onboarding === '1');
        if (lang === 'en' || lang === 'ur') {
          setLanguageState(lang);
          await applyLanguage(lang);
        }
        if (theme === 'system' || theme === 'light' || theme === 'dark') {
          setThemePreferenceState(theme);
        }
        if (name) {
          setDisplayNameState(name);
        }
      } finally {
        if (mounted) {
          setReady(true);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const completeOnboarding = useCallback(async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.onboardingComplete, '1');
    setOnboardingComplete(true);
  }, []);

  const setLanguage = useCallback(async (next: AppLanguage) => {
    await AsyncStorage.setItem(STORAGE_KEYS.language, next);
    setLanguageState(next);
    await applyLanguage(next);
  }, []);

  const setThemePreference = useCallback(async (next: ThemePreference) => {
    await AsyncStorage.setItem(STORAGE_KEYS.themePreference, next);
    setThemePreferenceState(next);
  }, []);

  const setDisplayName = useCallback(async (name: string) => {
    const trimmed = name.trim() || DEFAULT_DISPLAY_NAME;
    await AsyncStorage.setItem(STORAGE_KEYS.displayName, trimmed);
    setDisplayNameState(trimmed);
  }, []);

  const refreshDb = useCallback(async () => {
    await getDatabase();
  }, []);

  const isDark =
    themePreference === 'dark' ||
    (themePreference === 'system' && systemScheme === 'dark');

  const theme = useMemo(() => createTheme(isDark), [isDark]);

  const value = useMemo(
    () => ({
      ready,
      onboardingComplete,
      completeOnboarding,
      language,
      setLanguage,
      themePreference,
      setThemePreference,
      displayName,
      setDisplayName,
      theme,
      appVersion: APP_VERSION,
      refreshDb,
    }),
    [
      ready,
      onboardingComplete,
      completeOnboarding,
      language,
      setLanguage,
      themePreference,
      setThemePreference,
      displayName,
      setDisplayName,
      theme,
      refreshDb,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext(): AppContextValue {
  const value = useContext(AppContext);
  if (!value) {
    throw new Error('useAppContext must be used within AppProviders');
  }
  return value;
}

export function useAppTheme(): AppTheme {
  return useAppContext().theme;
}
