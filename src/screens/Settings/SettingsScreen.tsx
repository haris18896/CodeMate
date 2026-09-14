import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { AppCard } from '../../components/AppCard/AppCard';
import { AppInput } from '../../components/AppInput/AppInput';
import { Screen } from '../../components/Screen/Screen';
import { SegmentedControl } from '../../components/SegmentedControl/SegmentedControl';
import { APP_NAME, APP_TAGLINE } from '../../constants';
import { SettingsStackParamList } from '../../navigation/navigationTypes';
import { codeService } from '../../services/codeService';
import { permissionService } from '../../services/permissionService';
import { useAppContext, useAppTheme } from '../../store/AppContext';
import { AppLanguage, ThemePreference } from '../../types/code';

type Props = NativeStackScreenProps<SettingsStackParamList, 'SettingsMain'>;

export function SettingsScreen({ navigation }: Props) {
  const theme = useAppTheme();
  const { t } = useTranslation();
  const {
    language,
    setLanguage,
    themePreference,
    setThemePreference,
    displayName,
    setDisplayName,
    appVersion,
  } = useAppContext();
  const [cameraStatus, setCameraStatus] = useState(
    permissionService.getCameraPermissionStatus(),
  );
  const [nameDraft, setNameDraft] = useState(displayName);

  useEffect(() => {
    setCameraStatus(permissionService.getCameraPermissionStatus());
  }, []);

  const clearHistory = () => {
    Alert.alert(t('history.clearConfirmTitle'), t('history.clearConfirmBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.confirm'),
        style: 'destructive',
        onPress: async () => {
          await codeService.clearCodes();
          Alert.alert(t('common.success'), t('common.success'));
        },
      },
    ]);
  };

  return (
    <Screen scroll>
      <Text
        style={[
          theme.typography.title,
          { color: theme.colors.textPrimary, marginBottom: 16 },
        ]}>
        {t('settings.title')}
      </Text>

      <Section title={t('settings.general')}>
        <Text
          style={[
            theme.typography.label,
            { color: theme.colors.textSecondary, marginBottom: 8 },
          ]}>
          {t('settings.language')}
        </Text>
        <SegmentedControl<AppLanguage>
          options={[
            { label: 'English', value: 'en' },
            { label: 'اردو', value: 'ur' },
          ]}
          value={language}
          onChange={value => void setLanguage(value)}
        />

        <View style={{ height: 16 }} />
        <Text
          style={[
            theme.typography.label,
            { color: theme.colors.textSecondary, marginBottom: 8 },
          ]}>
          {t('settings.appearance')}
        </Text>
        <SegmentedControl<ThemePreference>
          options={[
            { label: t('settings.system'), value: 'system' },
            { label: t('settings.light'), value: 'light' },
            { label: t('settings.dark'), value: 'dark' },
          ]}
          value={themePreference}
          onChange={value => void setThemePreference(value)}
        />

        <View style={{ height: 16 }} />
        <AppInput
          label={t('settings.displayName')}
          value={nameDraft}
          onChangeText={setNameDraft}
          onBlur={() => void setDisplayName(nameDraft)}
        />
      </Section>

      <Section title={t('settings.forms')}>
        <SettingsRow
          icon="clipboard-list-outline"
          label={t('templates.title')}
          onPress={() => navigation.navigate('FormTemplates')}
        />
      </Section>

      <Section title={t('settings.data')}>
        <SettingsRow
          icon="delete-outline"
          label={t('settings.clearHistory')}
          onPress={clearHistory}
          danger
        />
      </Section>

      <Section title={t('settings.permissions')}>
        <SettingsRow
          icon="camera-outline"
          label={`${t('settings.cameraPermission')}: ${
            cameraStatus === 'authorized'
              ? t('settings.granted')
              : cameraStatus === 'not-determined'
                ? t('settings.notDetermined')
                : t('settings.denied')
          }`}
          onPress={() => {
            if (cameraStatus === 'not-determined') {
              void permissionService.requestCameraPermission().then(granted => {
                setCameraStatus(
                  granted ? 'authorized' : permissionService.getCameraPermissionStatus(),
                );
              });
            } else if (cameraStatus !== 'authorized') {
              void permissionService.openAppSettings();
            }
          }}
        />
      </Section>

      <Section title={t('settings.about')}>
        <AppCard style={{ alignItems: 'center' }}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text
            style={[
              theme.typography.subtitle,
              { color: theme.colors.textPrimary },
            ]}>
            {APP_NAME}
          </Text>
          <Text
            style={[
              theme.typography.caption,
              {
                color: theme.colors.textSecondary,
                marginTop: 4,
                textAlign: 'center',
              },
            ]}>
            {APP_TAGLINE}
          </Text>
          <Text
            style={[
              theme.typography.caption,
              { color: theme.colors.textSecondary, marginTop: 8 },
            ]}>
            {t('settings.version')}: {appVersion}
          </Text>
        </AppCard>
      </Section>
    </Screen>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const theme = useAppTheme();
  return (
    <View style={{ marginBottom: 22 }}>
      <Text
        style={[
          theme.typography.label,
          { color: theme.colors.textSecondary, marginBottom: 10 },
        ]}>
        {title}
      </Text>
      {children}
    </View>
  );
}

function SettingsRow({
  icon,
  label,
  onPress,
  danger,
}: {
  icon: React.ComponentProps<typeof MaterialDesignIcons>['name'];
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  const theme = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          opacity: pressed ? 0.9 : 1,
        },
      ]}>
      <MaterialDesignIcons
        name={icon}
        size={22}
        color={danger ? theme.colors.danger : theme.colors.primary}
      />
      <Text
        style={[
          theme.typography.body,
          {
            color: danger ? theme.colors.danger : theme.colors.textPrimary,
            flex: 1,
            marginLeft: 12,
          },
        ]}>
        {label}
      </Text>
      <MaterialDesignIcons
        name="chevron-right"
        size={20}
        color={theme.colors.textSecondary}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 52,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 72,
    height: 72,
    marginBottom: 10,
  },
});
