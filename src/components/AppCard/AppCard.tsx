import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { useAppTheme } from '../../store/AppContext';

export function AppCard({ style, children, ...rest }: ViewProps) {
  const theme = useAppTheme();
  return (
    <View
      {...rest}
      style={[
        styles.card,
        theme.shadows.card,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.lg,
          borderColor: theme.colors.border,
          padding: theme.spacing.md,
        },
        style,
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: StyleSheet.hairlineWidth,
  },
});
