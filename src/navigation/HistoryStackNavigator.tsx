import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HistoryStackParamList } from './navigationTypes';
import { HistoryScreen } from '../screens/History/HistoryScreen';
import { CodeDetailsScreen } from '../screens/CodeDetails/CodeDetailsScreen';
import { QRPreviewScreen } from '../screens/QRPreview/QRPreviewScreen';
import { BarcodePreviewScreen } from '../screens/BarcodePreview/BarcodePreviewScreen';
import { useAppTheme } from '../store/AppContext';

const Stack = createNativeStackNavigator<HistoryStackParamList>();

export function HistoryStackNavigator() {
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
        name="HistoryMain"
        component={HistoryScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CodeDetails"
        component={CodeDetailsScreen as React.ComponentType}
        options={{ title: 'Details' }}
      />
      <Stack.Screen
        name="QRPreview"
        component={QRPreviewScreen as React.ComponentType}
        options={{ title: 'QR Preview' }}
      />
      <Stack.Screen
        name="BarcodePreview"
        component={BarcodePreviewScreen as React.ComponentType}
        options={{ title: 'Barcode Preview' }}
      />
    </Stack.Navigator>
  );
}
