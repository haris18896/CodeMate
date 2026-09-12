import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeStackParamList } from './navigationTypes';
import { HomeScreen } from '../screens/Home/HomeScreen';
import { GenerateQRScreen } from '../screens/GenerateQR/GenerateQRScreen';
import { GenerateBarcodeScreen } from '../screens/GenerateBarcode/GenerateBarcodeScreen';
import { QRPreviewScreen } from '../screens/QRPreview/QRPreviewScreen';
import { BarcodePreviewScreen } from '../screens/BarcodePreview/BarcodePreviewScreen';
import { CodeDetailsScreen } from '../screens/CodeDetails/CodeDetailsScreen';
import { useAppTheme } from '../store/AppContext';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export function HomeStackNavigator() {
  const theme = useAppTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: theme.colors.primary,
        headerStyle: { backgroundColor: theme.colors.background },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}>
      <Stack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="GenerateQR"
        component={GenerateQRScreen}
        options={{ title: 'Generate QR' }}
      />
      <Stack.Screen
        name="GenerateBarcode"
        component={GenerateBarcodeScreen}
        options={{ title: 'Generate Barcode' }}
      />
      <Stack.Screen
        name="QRPreview"
        component={QRPreviewScreen}
        options={{ title: 'QR Preview' }}
      />
      <Stack.Screen
        name="BarcodePreview"
        component={BarcodePreviewScreen}
        options={{ title: 'Barcode Preview' }}
      />
      <Stack.Screen
        name="CodeDetails"
        component={CodeDetailsScreen}
        options={{ title: 'Details' }}
      />
    </Stack.Navigator>
  );
}
