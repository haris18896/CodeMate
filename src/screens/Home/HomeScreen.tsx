import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { useTranslation } from 'react-i18next';
import { AppCard } from '../../components/AppCard/AppCard';
import { CodeListItem } from '../../components/CodeListItem/CodeListItem';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { Screen } from '../../components/Screen/Screen';
import { RECENT_CODES_LIMIT } from '../../constants';
import { HomeStackParamList } from '../../navigation/navigationTypes';
import { codeService } from '../../services/codeService';
import { useAppContext, useAppTheme } from '../../store/AppContext';
import { CodeRecord } from '../../types/code';

type Props = NativeStackScreenProps<HomeStackParamList, 'HomeMain'>;

export function HomeScreen({ navigation }: Props) {
  const theme = useAppTheme();
  const { t } = useTranslation();
  const { displayName } = useAppContext();
  const [recent, setRecent] = useState<CodeRecord[]>([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        const rows = await codeService.getRecentCodes(RECENT_CODES_LIMIT);
        if (active) {
          setRecent(rows);
        }
      })();
      return () => {
        active = false;
      };
    }, []),
  );

  return (
    <Screen scroll>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text
            style={[
              theme.typography.title,
              { color: theme.colors.textPrimary },
            ]}>
            {t('home.greeting', { name: displayName })} 👋
          </Text>
          <Text
            style={[
              theme.typography.body,
              { color: theme.colors.textSecondary, marginTop: 4 },
            ]}>
            {t('home.subtitle')}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('tabs.settings')}
          onPress={() =>
            navigation.getParent()?.navigate('SettingsTab' as never)
          }
          style={[
            styles.settingsBtn,
            { backgroundColor: theme.colors.surfaceMuted },
          ]}>
          <MaterialDesignIcons
            name="cog-outline"
            size={22}
            color={theme.colors.textPrimary}
          />
        </Pressable>
      </View>

      <View style={styles.actionsRow}>
        <ActionTile
          title={t('home.generateQr')}
          icon="qrcode"
          dark
          onPress={() => navigation.navigate('GenerateQR')}
        />
        <ActionTile
          title={t('home.generateBarcode')}
          icon="barcode"
          onPress={() => navigation.navigate('GenerateBarcode')}
        />
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => navigation.getParent()?.navigate('ScanTab' as never)}
        style={({ pressed }) => [
          styles.scanCard,
          theme.shadows.soft,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            opacity: pressed ? 0.92 : 1,
          },
        ]}>
        <View
          style={[
            styles.scanIcon,
            { backgroundColor: theme.colors.primaryLight },
          ]}>
          <MaterialDesignIcons
            name="line-scan"
            size={28}
            color={theme.colors.primary}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={[
              theme.typography.subtitle,
              { color: theme.colors.textPrimary },
            ]}>
            {t('home.scanCode')}
          </Text>
          <Text
            style={[
              theme.typography.caption,
              { color: theme.colors.textSecondary, marginTop: 4 },
            ]}>
            {t('home.scanDescription')}
          </Text>
        </View>
      </Pressable>

      <View style={styles.recentHeader}>
        <Text
          style={[
            theme.typography.subtitle,
            { color: theme.colors.textPrimary },
          ]}>
          {t('home.recentCodes')}
        </Text>
        <Pressable
          onPress={() => navigation.getParent()?.navigate('HistoryTab' as never)}>
          <Text style={[theme.typography.label, { color: theme.colors.primary }]}>
            {t('common.seeAll')}
          </Text>
        </Pressable>
      </View>

      {recent.length === 0 ? (
        <AppCard>
          <EmptyState
            icon="qrcode"
            title={t('home.emptyTitle')}
            subtitle={t('home.emptySubtitle')}
          />
        </AppCard>
      ) : (
        recent.map(item => (
          <CodeListItem
            key={item.id}
            item={item}
            onPress={() =>
              navigation.navigate('CodeDetails', { codeId: item.id })
            }
          />
        ))
      )}
    </Screen>
  );
}

function ActionTile({
  title,
  icon,
  onPress,
  dark,
}: {
  title: string;
  icon: React.ComponentProps<typeof MaterialDesignIcons>['name'];
  onPress: () => void;
  dark?: boolean;
}) {
  const theme = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        theme.shadows.card,
        {
          backgroundColor: dark ? theme.colors.primary : theme.colors.primaryLight,
          opacity: pressed ? 0.9 : 1,
        },
      ]}>
      <MaterialDesignIcons
        name={icon}
        size={34}
        color={dark ? theme.colors.textInverse : theme.colors.primaryDark}
      />
      <Text
        style={[
          theme.typography.bodyBold,
          {
            color: dark ? theme.colors.textInverse : theme.colors.primaryDark,
            marginTop: 14,
          },
        ]}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    gap: 12,
  },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  tile: {
    flex: 1,
    minHeight: 140,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'space-between',
  },
  scanCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    minHeight: 84,
  },
  scanIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
});
