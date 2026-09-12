import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { HomeStackParamList } from './navigationTypes';
import { HomeScreen } from '../screens/Home/HomeScreen';
import { GenerateQRScreen } from '../screens/GenerateQR/GenerateQRScreen';
import { GenerateBarcodeScreen } from '../screens/GenerateBarcode/GenerateBarcodeScreen';
import { QRPreviewScreen } from '../screens/QRPreview/QRPreviewScreen';
import { BarcodePreviewScreen } from '../screens/BarcodePreview/BarcodePreviewScreen';
import { CodeDetailsScreen } from '../screens/CodeDetails/CodeDetailsScreen';
import { useAppTheme } from '../store/AppContext';
import { createStackScreenOptions } from './stackOptions';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export function HomeStackNavigator() {
  const theme = useAppTheme();
  const { t } = useTranslation();

  return (
    <Stack.Navigator screenOptions={createStackScreenOptions(theme)}>
      <Stack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="GenerateQR"
        component={GenerateQRScreen}
        options={{ title: t('nav.generateQr') }}
      />
      <Stack.Screen
        name="GenerateBarcode"
        component={GenerateBarcodeScreen}
        options={{ title: t('nav.generateBarcode') }}
      />
      <Stack.Screen
        name="QRPreview"
        component={QRPreviewScreen}
        options={{ title: t('nav.qrPreview') }}
      />
      <Stack.Screen
        name="BarcodePreview"
        component={BarcodePreviewScreen}
        options={{ title: t('nav.barcodePreview') }}
      />
      <Stack.Screen
        name="CodeDetails"
        component={CodeDetailsScreen}
        options={{ title: t('nav.details') }}
      />
    </Stack.Navigator>
  );
}
