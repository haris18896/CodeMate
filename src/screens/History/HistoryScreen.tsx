import React, { useCallback, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { AppInput } from '../../components/AppInput/AppInput';
import { CodeListItem } from '../../components/CodeListItem/CodeListItem';
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
      { label: t('history.generated'), value: 'GENERATED' as const },
      { label: t('history.scanned'), value: 'SCANNED' as const },
    ],
    [t],
  );

  const typeOptions = useMemo(
    () => [
      { label: t('history.all'), value: 'ALL' as const },
      { label: t('history.qr'), value: 'QR' as const },
      { label: t('history.barcode'), value: 'BARCODE' as const },
    ],
    [t],
  );

  return (
    <Screen scroll>
      <Text
        style={[
          theme.typography.title,
          { color: theme.colors.textPrimary, marginBottom: 12 },
        ]}>
        {t('history.title')}
      </Text>

      <SegmentedControl
        options={sourceOptions}
        value={source}
        onChange={setSource}
      />
      <View style={{ height: 10 }} />
      <SegmentedControl options={typeOptions} value={type} onChange={setType} />

      <View style={{ marginTop: 12 }}>
        <AppInput
          label={t('history.search')}
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
        items.map(item => (
          <CodeListItem
            key={item.id}
            item={item}
            showStatus
            onPress={() =>
              navigation.navigate('CodeDetails', { codeId: item.id })
            }
          />
        ))
      )}
    </Screen>
  );
}
