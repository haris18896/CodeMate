import React, { useCallback, useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { Screen } from '../../components/Screen/Screen';
import { SettingsStackParamList } from '../../navigation/navigationTypes';
import { formTemplateService } from '../../services/codeService';
import { useAppTheme } from '../../store/AppContext';
import { FormTemplate } from '../../types/code';

type Props = NativeStackScreenProps<SettingsStackParamList, 'FormTemplates'>;

export function FormTemplatesScreen({ navigation }: Props) {
  const theme = useAppTheme();
  const { t } = useTranslation();
  const [templates, setTemplates] = useState<FormTemplate[]>([]);

  const load = useCallback(async () => {
    const rows = await formTemplateService.listTemplates();
    setTemplates(rows);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const onCreate = async () => {
    const created = await formTemplateService.createTemplate({
      name: t('templates.newTemplate'),
      fields: [],
      makeDefault: templates.length === 0,
    });
    navigation.navigate('EditFormTemplate', { templateId: created.id });
  };

  const onDelete = (template: FormTemplate) => {
    if (templates.length <= 1) {
      Alert.alert(t('common.error'), t('templates.keepOne'));
      return;
    }
    Alert.alert(
      t('templates.deleteTitle'),
      t('templates.deleteBody', { name: template.name }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            await formTemplateService.deleteTemplate(template.id);
            await load();
          },
        },
      ],
    );
  };

  return (
    <Screen scroll edges={['left', 'right', 'bottom']}>
      <View style={styles.header}>
        <Text
          style={[theme.typography.title, { color: theme.colors.textPrimary }]}>
          {t('templates.title')}
        </Text>
        <Text
          style={[
            theme.typography.caption,
            { color: theme.colors.textSecondary, marginTop: 4 },
          ]}>
          {t('templates.subtitle')}
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => void onCreate()}
        style={({ pressed }) => [
          styles.createBtn,
          {
            backgroundColor: theme.colors.primary,
            opacity: pressed ? 0.9 : 1,
          },
        ]}>
        <MaterialDesignIcons
          name="plus"
          size={20}
          color={theme.colors.textInverse}
        />
        <Text
          style={[
            theme.typography.button,
            { color: theme.colors.textInverse, marginLeft: 8 },
          ]}>
          {t('templates.create')}
        </Text>
      </Pressable>

      {templates.length === 0 ? (
        <EmptyState
          icon="clipboard-list-outline"
          title={t('templates.emptyTitle')}
          subtitle={t('templates.emptySubtitle')}
        />
      ) : (
        templates.map(template => (
          <Pressable
            key={template.id}
            accessibilityRole="button"
            onPress={() =>
              navigation.navigate('EditFormTemplate', {
                templateId: template.id,
              })
            }
            style={({ pressed }) => [
              styles.card,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                opacity: pressed ? 0.92 : 1,
              },
            ]}>
            <View style={{ flex: 1 }}>
              <View style={styles.cardTitleRow}>
                <Text
                  style={[
                    theme.typography.bodyBold,
                    { color: theme.colors.textPrimary },
                  ]}>
                  {template.name}
                </Text>
                {template.isDefault ? (
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: theme.colors.primaryLight },
                    ]}>
                    <Text
                      style={[
                        theme.typography.caption,
                        { color: theme.colors.primaryDark, fontWeight: '700' },
                      ]}>
                      {t('templates.default')}
                    </Text>
                  </View>
                ) : null}
              </View>
              <Text
                style={[
                  theme.typography.caption,
                  { color: theme.colors.textSecondary, marginTop: 4 },
                ]}>
                {t('templates.fieldCount', { count: template.fields.length })}
              </Text>
            </View>
            {!template.isDefault ? (
              <Pressable
                accessibilityRole="button"
                hitSlop={8}
                onPress={() =>
                  void formTemplateService
                    .setDefaultTemplate(template.id)
                    .then(load)
                }
                style={styles.iconBtn}>
                <MaterialDesignIcons
                  name="star-outline"
                  size={22}
                  color={theme.colors.primary}
                />
              </Pressable>
            ) : null}
            <Pressable
              accessibilityRole="button"
              hitSlop={8}
              onPress={() => onDelete(template)}
              style={styles.iconBtn}>
              <MaterialDesignIcons
                name="delete-outline"
                size={22}
                color={theme.colors.danger}
              />
            </Pressable>
            <MaterialDesignIcons
              name="chevron-right"
              size={22}
              color={theme.colors.textSecondary}
            />
          </Pressable>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 16,
  },
  createBtn: {
    minHeight: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  iconBtn: {
    padding: 6,
  },
});
