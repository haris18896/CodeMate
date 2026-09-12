import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../store/AppContext';
import { CodeStatus } from '../../types/code';

export function StatusBadge({ status }: { status: CodeStatus }) {
  const theme = useAppTheme();
  const { t } = useTranslation();

  const config = {
    ACTIVE: {
      label: t('common.active'),
      bg: theme.colors.badgeActive,
      color: theme.colors.success,
    },
    EXPIRES_TODAY: {
      label: t('common.expiresToday'),
      bg: theme.colors.badgeToday,
      color: theme.colors.warning,
    },
    EXPIRED: {
      label: t('common.expired'),
      bg: theme.colors.badgeExpired,
      color: theme.colors.danger,
    },
  }[status];

  return (
    <View
      accessibilityLabel={config.label}
      style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[theme.typography.caption, { color: config.color }]}>
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
});
