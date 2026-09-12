import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { useAppTheme } from '../../store/AppContext';
import { AppButton } from '../AppButton/AppButton';

type Props = {
  icon?: React.ComponentProps<typeof MaterialDesignIcons>['name'];
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({
  icon = 'inbox-outline',
  title,
  subtitle,
  actionLabel,
  onAction,
}: Props) {
  const theme = useAppTheme();
  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: theme.colors.primaryLight },
        ]}>
        <MaterialDesignIcons
          name={icon}
          size={36}
          color={theme.colors.primary}
        />
      </View>
      <Text
        style={[
          theme.typography.subtitle,
          { color: theme.colors.textPrimary, textAlign: 'center' },
        ]}>
        {title}
      </Text>
      {subtitle ? (
        <Text
          style={[
            theme.typography.body,
            {
              color: theme.colors.textSecondary,
              textAlign: 'center',
              marginTop: 8,
            },
          ]}>
          {subtitle}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <AppButton
          label={actionLabel}
          onPress={onAction}
          style={{ marginTop: 20, alignSelf: 'stretch' }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 16,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
});
