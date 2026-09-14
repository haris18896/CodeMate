import React, { useEffect, useState } from 'react';
import { Alert, Platform, Pressable, Text, View } from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { AppButton } from '../AppButton/AppButton';
import { AppInput } from '../AppInput/AppInput';
import { formTemplateService } from '../../services/codeService';
import { useAppContext, useAppTheme } from '../../store/AppContext';
import {
  CustomFieldValues,
  FormTemplate,
  FormTemplateField,
} from '../../types/code';
import {
  GenerateCodeFormValues,
  generateCodeSchema,
} from '../../utils/validation';
import { defaultExpiryDate, parseDateOnly, toDateOnly } from '../../utils/date';

type Props = {
  submitLabel: string;
  onSubmit: (values: GenerateCodeFormValues) => Promise<void>;
  /** CODE128 cannot store Urdu — collect an English/ASCII name too. */
  requireEnglishName?: boolean;
};

export function GenerateCodeForm({
  submitLabel,
  onSubmit,
  requireEnglishName = false,
}: Props) {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const { language } = useAppContext();
  const isUrdu = language === 'ur';
  const showEnglishName = !isUrdu || requireEnglishName;
  const showUrduName = isUrdu;
  const [busy, setBusy] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<FormTemplate | null>(
    null,
  );
  const [pickerField, setPickerField] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<GenerateCodeFormValues>({
    resolver: zodResolver(generateCodeSchema) as never,
    defaultValues: {
      englishName: '',
      urduName: '',
      expiryDate: defaultExpiryDate(),
      customFields: {},
    },
  });

  const expiryDate = watch('expiryDate');
  const customFields = watch('customFields') ?? {};

  useEffect(() => {
    void (async () => {
      const preferred = await formTemplateService.getDefaultTemplate();
      if (preferred) {
        setActiveTemplate(preferred);
      }
    })();
  }, []);

  const onChangeDate = (event: DateTimePickerEvent, date?: Date) => {
    const fieldKey = pickerField;
    if (Platform.OS === 'android') {
      setPickerField(null);
    }
    if (event.type === 'dismissed' || !date || !fieldKey) {
      return;
    }
    const value = toDateOnly(date);
    if (fieldKey === 'expiryDate') {
      setValue('expiryDate', value, { shouldValidate: true });
      return;
    }
    setValue(
      'customFields',
      { ...customFields, [fieldKey]: value },
      { shouldValidate: true },
    );
  };

  const setCustomValue = (key: string, value: string) => {
    setValue(
      'customFields',
      { ...customFields, [key]: value },
      { shouldValidate: true },
    );
  };

  const submit = handleSubmit(async (values: GenerateCodeFormValues) => {
    const missing = (activeTemplate?.fields ?? []).filter(
      field => field.required && !String(values.customFields?.[field.key] ?? '').trim(),
    );
    if (missing.length > 0) {
      Alert.alert(
        t('common.error'),
        t('templates.requiredFieldsMissing', {
          fields: missing.map(field => field.label).join(', '),
        }),
      );
      return;
    }

    try {
      setBusy(true);
      const englishName = showEnglishName
        ? values.englishName?.trim() || ''
        : '';
      const urduName = showUrduName ? values.urduName?.trim() || '' : '';
      const cleanedFields: CustomFieldValues = {};
      for (const field of activeTemplate?.fields ?? []) {
        const value = String(values.customFields?.[field.key] ?? '').trim();
        if (value) {
          cleanedFields[field.label] = value;
        }
      }
      if (requireEnglishName && !englishName) {
        Alert.alert(
          t('common.error'),
          t('generate.barcodeNeedsEnglishBody'),
        );
        return;
      }

      await onSubmit({
        englishName,
        urduName,
        expiryDate: values.expiryDate,
        customFields: cleanedFields,
      });
    } finally {
      setBusy(false);
    }
  });

  const pickerValue = (() => {
    if (!pickerField) {
      return new Date();
    }
    if (pickerField === 'expiryDate') {
      return parseDateOnly(expiryDate) || new Date();
    }
    return parseDateOnly(customFields[pickerField]) || new Date();
  })();

  return (
    <View>
      {activeTemplate ? (
        <View style={{ marginBottom: 12 }}>
          <Text
            style={[
              theme.typography.label,
              { color: theme.colors.textSecondary, marginBottom: 8 },
            ]}>
            {t('templates.useTemplate')}
          </Text>
          <View
            style={{
              minHeight: 44,
              borderRadius: 12,
              borderWidth: 1.5,
              borderColor: theme.colors.primary,
              backgroundColor: theme.colors.primaryLight,
              paddingHorizontal: 12,
              justifyContent: 'center',
            }}>
            <Text
              style={[
                theme.typography.bodyBold,
                { color: theme.colors.primaryDark },
              ]}>
              {activeTemplate.name}
              {activeTemplate.isDefault
                ? ` · ${t('templates.default')}`
                : ''}
            </Text>
          </View>
        </View>
      ) : null}

      {showEnglishName ? (
        <Controller
          control={control}
          name="englishName"
          render={({ field: { onChange, value } }) => (
            <AppInput
              label={`${t('generate.englishName')} *`}
              value={value ?? ''}
              onChangeText={onChange}
              placeholder="Sample Product"
              error={errors.englishName?.message}
              autoCapitalize="words"
            />
          )}
        />
      ) : null}

      {showUrduName ? (
        <Controller
          control={control}
          name="urduName"
          render={({ field: { onChange, value } }) => (
            <AppInput
              label={`${t('generate.name')}${requireEnglishName ? '' : ' *'}`}
              value={value ?? ''}
              onChangeText={onChange}
              placeholder="نمونہ پروڈکٹ"
              isRTL
              error={errors.urduName?.message}
            />
          )}
        />
      ) : null}

      {requireEnglishName ? (
        <Text
          style={[
            theme.typography.caption,
            { color: theme.colors.textSecondary, marginBottom: 12 },
          ]}>
          {t('generate.barcodeAsciiHint')}
        </Text>
      ) : null}

      {(activeTemplate?.fields ?? []).map(field => (
        <DynamicField
          key={field.id}
          field={field}
          value={customFields[field.key] ?? ''}
          onChangeText={text => setCustomValue(field.key, text)}
          onOpenDate={() => setPickerField(field.key)}
        />
      ))}

      <Pressable onPress={() => setPickerField('expiryDate')}>
        <View pointerEvents="none">
          <AppInput
            label={`${t('generate.expiryDate')} *`}
            value={expiryDate}
            editable={false}
            rightIcon="calendar-outline"
            error={errors.expiryDate?.message}
          />
        </View>
      </Pressable>

      {pickerField ? (
        <DateTimePicker
          value={pickerValue}
          mode="date"
          minimumDate={pickerField === 'expiryDate' ? new Date() : undefined}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onChangeDate}
        />
      ) : null}

      <AppButton
        label={submitLabel}
        onPress={submit}
        loading={busy}
        icon="check-circle"
        style={{ marginTop: 8 }}
      />
    </View>
  );
}

function DynamicField({
  field,
  value,
  onChangeText,
  onOpenDate,
}: {
  field: FormTemplateField;
  value: string;
  onChangeText: (text: string) => void;
  onOpenDate: () => void;
}) {
  const label = `${field.label}${field.required ? ' *' : ''}`;

  if (field.type === 'date') {
    return (
      <Pressable onPress={onOpenDate}>
        <View pointerEvents="none">
          <AppInput
            label={label}
            value={value}
            editable={false}
            rightIcon="calendar-outline"
          />
        </View>
      </Pressable>
    );
  }

  return (
    <AppInput
      label={label}
      value={value}
      onChangeText={text => {
        if (field.type === 'number') {
          onChangeText(text.replace(/[^0-9.]/g, ''));
          return;
        }
        onChangeText(text);
      }}
      keyboardType={field.type === 'number' ? 'decimal-pad' : 'default'}
    />
  );
}
