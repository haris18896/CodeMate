import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { AppInput } from '../../components/AppInput/AppInput';
import { CodeGroupedList } from '../../components/CodeGroupedList/CodeGroupedList';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { Screen } from '../../components/Screen/Screen';
import { SegmentedControl } from '../../components/SegmentedControl/SegmentedControl';
import { HistoryStackParamList } from '../../navigation/navigationTypes';
import { codeService } from '../../services/codeService';
import { useAppTheme } from '../../store/AppContext';
import { CodeRecord, CodeSource, CodeType } from '../../types/code';

type Props = NativeStackScreenProps<HistoryStackParamList, 'HistoryMain'>;

export function HistoryScreen({ navigation }: Props) {
  const theme = useAppTheme();
  const { t } = useTranslation();
  const [items, setItems] = useState<CodeRecord[]>([]);
  const [query, setQuery] = useState('');
  const [source, setSource] = useState<CodeSource | 'ALL'>('ALL');
  const [type, setType] = useState<CodeType | 'ALL'>('ALL');

  const load = useCallback(async () => {
    const rows = await codeService.searchCodes(query, { source, type });
    setItems(rows);
  }, [query, source, type]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const sourceOptions = useMemo(
    () => [
      { label: t('history.all'), value: 'ALL' as const },
      {
        label: t('history.generated'),
        value: 'GENERATED' as const,
        icon: 'plus-box-outline' as const,
      },
      {
        label: t('history.scanned'),
        value: 'SCANNED' as const,
        icon: 'line-scan' as const,
      },
    ],
    [t],
  );

  const typeOptions = useMemo(
    () => [
      { label: t('history.all'), value: 'ALL' as const },
      {
        label: t('history.qr'),
        value: 'QR' as const,
        icon: 'qrcode' as const,
      },
      {
        label: t('history.barcode'),
        value: 'BARCODE' as const,
        icon: 'barcode' as const,
      },
    ],
    [t],
  );

  const countLabel = t('history.recordCount', { count: items.length });

  return (
    <Screen scroll>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text
            style={[
              theme.typography.title,
              { color: theme.colors.textPrimary },
            ]}>
            {t('history.title')}
          </Text>
          <Text
            style={[
              theme.typography.caption,
              { color: theme.colors.textSecondary, marginTop: 4 },
            ]}>
            {countLabel}
          </Text>
        </View>
        <View
          style={[
            styles.headerBadge,
            { backgroundColor: theme.colors.primaryLight },
          ]}>
          <MaterialDesignIcons
            name="history"
            size={22}
            color={theme.colors.primary}
          />
        </View>
      </View>

      <View
        style={[
          styles.filterPanel,
          theme.shadows.soft,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            borderRadius: theme.radius.lg,
          },
        ]}>
        <FilterRow label={t('history.filterBySource')}>
          <SegmentedControl
            options={sourceOptions}
            value={source}
            onChange={setSource}
          />
        </FilterRow>

        <View
          style={[styles.divider, { backgroundColor: theme.colors.border }]}
        />

        <FilterRow label={t('history.filterByType')}>
          <SegmentedControl
            options={typeOptions}
            value={type}
            onChange={setType}
          />
        </FilterRow>
      </View>

      <View style={styles.searchWrap}>
        <AppInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('history.search')}
          leftIcon="magnify"
          onSubmitEditing={() => void load()}
        />
      </View>

      {items.length === 0 ? (
        <EmptyState
          icon="history"
          title={t('history.emptyTitle')}
          subtitle={t('history.emptySubtitle')}
        />
      ) : (
        <CodeGroupedList
          items={items}
          showStatus
          onPressItem={item =>
            navigation.navigate('CodeDetails', { codeId: item.id })
          }
        />
      )}
    </Screen>
  );
}

function FilterRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const theme = useAppTheme();
  return (
    <View style={styles.filterRow}>
      <Text
        style={[
          styles.filterLabel,
          {
            color: theme.colors.textSecondary,
          },
        ]}>
        {label}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  headerText: {
    flex: 1,
    paddingRight: 12,
  },
  headerBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterPanel: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    marginBottom: 4,
  },
  filterRow: {
    marginVertical: 2,
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 14,
  },
  searchWrap: {
    marginTop: 8,
  },
});
