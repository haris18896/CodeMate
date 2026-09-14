import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { SettingsStackParamList } from './navigationTypes';
import { SettingsScreen } from '../screens/Settings/SettingsScreen';
import { FormTemplatesScreen } from '../screens/FormTemplates/FormTemplatesScreen';
import { EditFormTemplateScreen } from '../screens/FormTemplates/EditFormTemplateScreen';
import { useAppTheme } from '../store/AppContext';
import { createStackScreenOptions } from './stackOptions';

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export function SettingsStackNavigator() {
  const theme = useAppTheme();
  const { t } = useTranslation();

  return (
    <Stack.Navigator screenOptions={createStackScreenOptions(theme)}>
      <Stack.Screen
        name="SettingsMain"
        component={SettingsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="FormTemplates"
        component={FormTemplatesScreen}
        options={{ title: t('templates.title') }}
      />
      <Stack.Screen
        name="EditFormTemplate"
        component={EditFormTemplateScreen}
        options={{ title: t('templates.editTitle') }}
      />
    </Stack.Navigator>
  );
}
