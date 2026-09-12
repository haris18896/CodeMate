import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { HistoryStackParamList } from './navigationTypes';
import { HistoryScreen } from '../screens/History/HistoryScreen';
import { CodeDetailsScreen } from '../screens/CodeDetails/CodeDetailsScreen';
import { QRPreviewScreen } from '../screens/QRPreview/QRPreviewScreen';
import { BarcodePreviewScreen } from '../screens/BarcodePreview/BarcodePreviewScreen';
import { useAppTheme } from '../store/AppContext';
import { createStackScreenOptions } from './stackOptions';

const Stack = createNativeStackNavigator<HistoryStackParamList>();

export function HistoryStackNavigator() {
  const theme = useAppTheme();
  const { t } = useTranslation();

  return (
    <Stack.Navigator screenOptions={createStackScreenOptions(theme)}>
      <Stack.Screen
        name="HistoryMain"
        component={HistoryScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CodeDetails"
        component={CodeDetailsScreen as React.ComponentType}
        options={{ title: t('nav.details') }}
      />
      <Stack.Screen
        name="QRPreview"
        component={QRPreviewScreen as React.ComponentType}
        options={{ title: t('nav.qrPreview') }}
      />
      <Stack.Screen
        name="BarcodePreview"
        component={BarcodePreviewScreen as React.ComponentType}
        options={{ title: t('nav.barcodePreview') }}
      />
    </Stack.Navigator>
  );
}
