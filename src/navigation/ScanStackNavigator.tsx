import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { ScanStackParamList } from './navigationTypes';
import { ScannerScreen } from '../screens/Scanner/ScannerScreen';
import { ScanResultScreen } from '../screens/ScanResult/ScanResultScreen';
import { CodeDetailsScreen } from '../screens/CodeDetails/CodeDetailsScreen';
import { useAppTheme } from '../store/AppContext';
import { createStackScreenOptions } from './stackOptions';

const Stack = createNativeStackNavigator<ScanStackParamList>();

export function ScanStackNavigator() {
  const theme = useAppTheme();
  const { t } = useTranslation();

  return (
    <Stack.Navigator screenOptions={createStackScreenOptions(theme)}>
      <Stack.Screen
        name="ScannerMain"
        component={ScannerScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ScanResult"
        component={ScanResultScreen}
        options={{ title: t('nav.scanResult') }}
      />
      <Stack.Screen
        name="CodeDetails"
        component={CodeDetailsScreen as React.ComponentType}
        options={{ title: t('nav.details') }}
      />
    </Stack.Navigator>
  );
}
