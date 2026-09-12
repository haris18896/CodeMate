import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../store/AppContext';
import { CodeRecord } from '../../types/code';
import { formatDisplayDate } from '../../utils/date';
import { StatusBadge } from '../StatusBadge/StatusBadge';
import { getCodeStatus } from '../../utils/date';

type Props = {
  item: CodeRecord;
  onPress: () => void;
  showStatus?: boolean;
};

export function CodeListItem({ item, onPress, showStatus }: Props) {
  const theme = useAppTheme();
  const { t, i18n } = useTranslation();
  const title =
    item.englishName ||
    item.urduName ||
    item.rawScannedValue ||
    item.payload.slice(0, 28);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
          opacity: pressed ? 0.9 : 1,
        },
      ]}>
      <View
        style={[
          styles.icon,
          {
            backgroundColor:
              item.type === 'QR'
                ? theme.colors.primary
                : theme.colors.primaryLight,
          },
        ]}>
        <MaterialDesignIcons
          name={item.type === 'QR' ? 'qrcode' : 'barcode'}
          size={22}
          color={
            item.type === 'QR' ? theme.colors.textInverse : theme.colors.primaryDark
          }
        />
      </View>
      <View style={styles.meta}>
        <Text
          numberOfLines={1}
          style={[theme.typography.bodyBold, { color: theme.colors.textPrimary }]}>
          {title}
        </Text>
        <Text
          style={[
            theme.typography.caption,
            { color: theme.colors.textSecondary, marginTop: 2 },
          ]}>
          {item.type === 'QR' ? t('common.qr') : t('common.barcode')}
          {' • '}
          {item.source === 'GENERATED'
            ? t('common.generated')
            : t('common.scanned')}
          {' • '}
          {formatDisplayDate(item.createdDate || item.createdAt.slice(0, 10), i18n.language)}
        </Text>
        {showStatus ? (
          <View style={{ marginTop: 6 }}>
            <StatusBadge status={getCodeStatus(item.expiryDate)} />
          </View>
        ) : null}
      </View>
      <MaterialDesignIcons
        name="chevron-right"
        size={22}
        color={theme.colors.textSecondary}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 10,
    minHeight: 72,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  meta: {
    flex: 1,
  },
});
