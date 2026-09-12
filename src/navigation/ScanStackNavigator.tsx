import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ScanStackParamList } from './navigationTypes';
import { ScannerScreen } from '../screens/Scanner/ScannerScreen';
import { ScanResultScreen } from '../screens/ScanResult/ScanResultScreen';
import { CodeDetailsScreen } from '../screens/CodeDetails/CodeDetailsScreen';
import { useAppTheme } from '../store/AppContext';

const Stack = createNativeStackNavigator<ScanStackParamList>();

export function ScanStackNavigator() {
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
        name="ScannerMain"
        component={ScannerScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ScanResult"
        component={ScanResultScreen}
        options={{ title: 'Scan Result' }}
      />
      <Stack.Screen
        name="CodeDetails"
        component={CodeDetailsScreen as React.ComponentType}
        options={{ title: 'Details' }}
      />
    </Stack.Navigator>
  );
}
