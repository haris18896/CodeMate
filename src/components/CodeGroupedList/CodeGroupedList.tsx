import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../store/AppContext';
import { CodeRecord } from '../../types/code';
import { groupCodesByDay } from '../../utils/groupCodesByDay';
import { CodeListItem } from '../CodeListItem/CodeListItem';

type Props = {
  items: CodeRecord[];
  onPressItem: (item: CodeRecord) => void;
  showStatus?: boolean;
};

export function CodeGroupedList({ items, onPressItem, showStatus }: Props) {
  const theme = useAppTheme();
  const { t, i18n } = useTranslation();

  const groups = useMemo(
    () =>
      groupCodesByDay(items, i18n.language, {
        today: t('history.today'),
        yesterday: t('history.yesterday'),
      }),
    [items, i18n.language, t],
  );

  return (
    <View>
      {groups.map(group => (
        <View key={group.dateKey} style={styles.section}>
          <Text
            style={[
              styles.sectionLabel,
              { color: theme.colors.textSecondary },
            ]}>
            {group.label}
          </Text>
          {group.items.map(item => (
            <CodeListItem
              key={item.id}
              item={item}
              showStatus={showStatus}
              onPress={() => onPressItem(item)}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 10,
    marginTop: 6,
  },
});
