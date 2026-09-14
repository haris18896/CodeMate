import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { useTranslation } from 'react-i18next';
import { AppButton } from '../../components/AppButton/AppButton';
import { AppInput } from '../../components/AppInput/AppInput';
import { Screen } from '../../components/Screen/Screen';
import { SegmentedControl } from '../../components/SegmentedControl/SegmentedControl';
import { SettingsStackParamList } from '../../navigation/navigationTypes';
import { formTemplateService } from '../../services/codeService';
import { useAppTheme } from '../../store/AppContext';
import {
  FormFieldType,
  FormTemplate,
  FormTemplateField,
} from '../../types/code';
import { createId } from '../../utils/id';

type Props = NativeStackScreenProps<SettingsStackParamList, 'EditFormTemplate'>;

export function EditFormTemplateScreen({ navigation, route }: Props) {
  const theme = useAppTheme();
  const { t } = useTranslation();
  const [template, setTemplate] = useState<FormTemplate | null>(null);
  const [name, setName] = useState('');
  const [fields, setFields] = useState<FormTemplateField[]>([]);
  const [busy, setBusy] = useState(false);
  const [draftLabel, setDraftLabel] = useState('');
  const [draftType, setDraftType] = useState<FormFieldType>('text');
  const [draftRequired, setDraftRequired] = useState(true);

  const load = useCallback(async () => {
    const row = await formTemplateService.getTemplateById(
      route.params.templateId,
    );
    if (!row) {
      Alert.alert(t('common.error'), t('templates.notFound'));
      navigation.goBack();
      return;
    }
    setTemplate(row);
    setName(row.name);
    setFields(row.fields);
  }, [navigation, route.params.templateId, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const addField = () => {
    const label = draftLabel.trim();
    if (!label) {
      Alert.alert(t('common.error'), t('templates.fieldLabelRequired'));
      return;
    }
    const key = formTemplateService.slugifyFieldKey(label);
    const uniqueKey = fields.some(field => field.key === key)
      ? `${key}_${createId().slice(0, 4)}`
      : key;
    setFields(prev => [
      ...prev,
      {
        id: createId(),
        key: uniqueKey,
        label,
        type: draftType,
        required: draftRequired,
      },
    ]);
    setDraftLabel('');
    setDraftType('text');
    setDraftRequired(false);
  };

  const removeField = (id: string) => {
    setFields(prev => prev.filter(field => field.id !== id));
  };

  const onSave = async () => {
    if (!template) {
      return;
    }
    try {
      setBusy(true);
      await formTemplateService.updateTemplate(template.id, {
        name: name.trim() || t('templates.newTemplate'),
        fields,
      });
      navigation.goBack();
    } catch {
      Alert.alert(t('common.error'), t('common.error'));
    } finally {
      setBusy(false);
    }
  };

  if (!template) {
    return <Screen edges={['left', 'right', 'bottom']} />;
  }

  return (
    <Screen scroll edges={['left', 'right', 'bottom']}>
      <AppInput
        label={t('templates.templateName')}
        value={name}
        onChangeText={setName}
      />

      <Text
        style={[
          theme.typography.subtitle,
          { color: theme.colors.textPrimary, marginTop: 8, marginBottom: 8 },
        ]}
      >
        {t('templates.customFields')}
      </Text>
      <Text
        style={[
          theme.typography.caption,
          { color: theme.colors.textSecondary, marginBottom: 12 },
        ]}
      >
        {t('templates.coreFieldsHint')}
      </Text>

      {fields.map(field => (
        <View
          key={field.id}
          style={[
            styles.fieldRow,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={[
                theme.typography.bodyBold,
                { color: theme.colors.textPrimary },
              ]}
            >
              {field.label}
            </Text>
            <Text
              style={[
                theme.typography.caption,
                { color: theme.colors.textSecondary, marginTop: 2 },
              ]}
            >
              {t(`templates.type.${field.type}`)}
              {field.required ? ` · ${t('templates.required')}` : ''}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => removeField(field.id)}
            hitSlop={8}
          >
            <MaterialDesignIcons
              name="close-circle-outline"
              size={22}
              color={theme.colors.danger}
            />
          </Pressable>
        </View>
      ))}

      <View
        style={[
          styles.addPanel,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <Text
          style={[
            theme.typography.label,
            { color: theme.colors.textSecondary, marginBottom: 10 },
          ]}
        >
          {t('templates.addField')}
        </Text>
        <AppInput
          label={t('templates.fieldLabel')}
          value={draftLabel}
          onChangeText={setDraftLabel}
          placeholder={t('templates.fieldLabelPlaceholder')}
        />
        <Text
          style={[
            theme.typography.caption,
            { color: theme.colors.textSecondary, marginBottom: 8 },
          ]}
        >
          {t('templates.fieldType')}
        </Text>
        <SegmentedControl<FormFieldType>
          options={[
            { label: t('templates.type.text'), value: 'text' },
            { label: t('templates.type.date'), value: 'date' },
            { label: t('templates.type.number'), value: 'number' },
          ]}
          value={draftType}
          onChange={setDraftType}
        />
        <View style={styles.requiredRow}>
          <Text
            style={[
              theme.typography.body,
              { color: theme.colors.textPrimary, flex: 1 },
            ]}
          >
            {t('templates.required')}
          </Text>
          <Switch
            value={draftRequired}
            onValueChange={setDraftRequired}
            trackColor={{
              false: theme.colors.border,
              true: theme.colors.primaryLight,
            }}
            thumbColor={
              draftRequired ? theme.colors.primary : theme.colors.surface
            }
          />
        </View>
        <AppButton
          label={t('templates.addField')}
          icon="plus"
          variant="secondary"
          onPress={addField}
        />
      </View>

      <AppButton
        label={t('common.save')}
        icon="content-save-outline"
        loading={busy}
        onPress={() => void onSave()}
        style={{ marginTop: 8, marginBottom: 16 }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  fieldRow: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  addPanel: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    padding: 14,
    marginTop: 8,
    marginBottom: 12,
  },
  requiredRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 12,
  },
});
