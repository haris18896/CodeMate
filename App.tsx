import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import './src/localization';
import { RootNavigator } from './src/navigation/RootNavigator';
import { AppProviders, useAppContext, useAppTheme } from './src/store/AppContext';

function Bootstrap() {
  const { ready } = useAppContext();
  const theme = useAppTheme();

  if (!ready) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.primaryDark,
        }}>
        <ActivityIndicator color="#FFFFFF" />
      </View>
    );
  }

  return <RootNavigator />;
}

function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProviders>
          <Bootstrap />
        </AppProviders>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
