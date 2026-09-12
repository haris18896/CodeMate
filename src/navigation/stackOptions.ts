import { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { AppTheme } from '../theme';

export function createStackScreenOptions(
  theme: AppTheme,
): NativeStackNavigationOptions {
  return {
    headerStyle: {
      backgroundColor: theme.colors.surface,
    },
    headerShadowVisible: false,
    headerTintColor: theme.colors.primary,
    headerTitleAlign: 'center',
    headerBackButtonDisplayMode: 'minimal',
    headerTitleStyle: {
      color: theme.colors.textPrimary,
      fontSize: 17,
      fontWeight: '600',
    },
    contentStyle: {
      backgroundColor: theme.colors.background,
    },
  };
}
