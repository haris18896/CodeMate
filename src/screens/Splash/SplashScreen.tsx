import React, { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { APP_NAME, APP_TAGLINE } from '../../constants';
import { useAppContext, useAppTheme } from '../../store/AppContext';
import { RootStackParamList } from '../../navigation/navigationTypes';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export function SplashScreen({ navigation }: Props) {
  const theme = useAppTheme();
  const { ready, onboardingComplete } = useAppContext();
  const { t } = useTranslation();

  useEffect(() => {
    if (!ready) {
      return;
    }
    const timer = setTimeout(() => {
      if (onboardingComplete) {
        navigation.replace('Main', {
          screen: 'HomeTab',
          params: { screen: 'HomeMain' },
        });
      } else {
        navigation.replace('Onboarding');
      }
    }, 700);
    return () => clearTimeout(timer);
  }, [ready, onboardingComplete, navigation]);

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.primaryDark }]}
    >
      <Image
        source={require('../../assets/images/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>
        {t('common.appName', { defaultValue: APP_NAME })}
      </Text>
      <Text style={styles.tagline}>
        {t('common.tagline', { defaultValue: APP_TAGLINE })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '700',
  },
  tagline: {
    color: '#DDF5E8',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
});
