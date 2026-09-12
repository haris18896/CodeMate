import React, { useState } from 'react';
import { Platform, Pressable, View } from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { AppButton } from '../AppButton/AppButton';
import { AppInput } from '../AppInput/AppInput';
import {
  GenerateCodeFormValues,
  generateCodeSchema,
} from '../../utils/validation';
import { toDateOnly, parseDateOnly } from '../../utils/date';

type Props = {
  submitLabel: string;
  onSubmit: (values: GenerateCodeFormValues) => Promise<void>;
};

export function GenerateCodeForm({ submitLabel, onSubmit }: Props) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);
  const [pickerField, setPickerField] = useState<
    'createdDate' | 'expiryDate' | null
  >(null);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<GenerateCodeFormValues>({
    // zodResolver typing is loose across zod v4 + RHF versions
    resolver: zodResolver(generateCodeSchema) as never,
    defaultValues: {
      englishName: '',
      urduName: '',
      price: undefined as unknown as number,
      createdDate: toDateOnly(),
      expiryDate: toDateOnly(
        new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      ),
    },
  });

  const createdDate = watch('createdDate');
  const expiryDate = watch('expiryDate');

  const onChangeDate = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setPickerField(null);
    }
    if (event.type === 'dismissed' || !date || !pickerField) {
      return;
    }
    setValue(pickerField, toDateOnly(date), { shouldValidate: true });
    if (Platform.OS === 'ios') {
      // keep open until user taps elsewhere; close on next field open
    }
  };

  const submit = handleSubmit(async (values: GenerateCodeFormValues) => {
    try {
      setBusy(true);
      await onSubmit({
        ...values,
        urduName: values.urduName?.trim() || '',
      });
    } finally {
      setBusy(false);
    }
  });

  return (
    <View>
      <Controller
        control={control}
        name="englishName"
        render={({ field: { onChange, value } }) => (
          <AppInput
            label={`${t('generate.englishName')} *`}
            value={value}
            onChangeText={onChange}
            placeholder="Sample Product"
            error={errors.englishName?.message}
            autoCapitalize="words"
          />
        )}
      />
      <Controller
        control={control}
        name="urduName"
        render={({ field: { onChange, value } }) => (
          <AppInput
            label={t('generate.urduName')}
            value={value}
            onChangeText={onChange}
            placeholder="نمونہ پروڈکٹ"
            isRTL
            error={errors.urduName?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="price"
        render={({ field: { onChange, value } }) => (
          <AppInput
            label={`${t('generate.price')} (PKR) *`}
            value={value != null && !Number.isNaN(value) ? String(value) : ''}
            onChangeText={text => {
              const cleaned = text.replace(/[^0-9.]/g, '');
              onChange(cleaned);
            }}
            keyboardType="decimal-pad"
            placeholder="2500"
            error={errors.price?.message}
          />
        )}
      />

      <Pressable onPress={() => setPickerField('createdDate')}>
        <View pointerEvents="none">
          <AppInput
            label={`${t('generate.createdDate')} *`}
            value={createdDate}
            editable={false}
            rightIcon="calendar-outline"
            error={errors.createdDate?.message}
          />
        </View>
      </Pressable>

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
          value={
            parseDateOnly(
              pickerField === 'createdDate' ? createdDate : expiryDate,
            ) || new Date()
          }
          mode="date"
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
