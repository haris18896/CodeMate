import React from 'react';
import { Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { GenerateCodeForm } from '../../components/GenerateCodeForm/GenerateCodeForm';
import { Screen } from '../../components/Screen/Screen';
import { DEFAULT_CURRENCY } from '../../constants';
import { HomeStackParamList } from '../../navigation/navigationTypes';
import { codeService } from '../../services/codeService';

type Props = NativeStackScreenProps<HomeStackParamList, 'GenerateBarcode'>;

export function GenerateBarcodeScreen({ navigation }: Props) {
  const { t } = useTranslation();

  return (
    <Screen scroll>
      <GenerateCodeForm
        submitLabel={t('generate.generateBarcodeCta')}
        onSubmit={async values => {
          try {
            const record = await codeService.generateBarcode({
              englishName: values.englishName ?? '',
              urduName: values.urduName,
              price: Number(values.price),
              currency: DEFAULT_CURRENCY,
              createdDate: values.createdDate,
              expiryDate: values.expiryDate,
            });
            Alert.alert(t('common.success'), t('generate.successBarcode'));
            navigation.replace('BarcodePreview', { codeId: record.id });
          } catch {
            Alert.alert(t('common.error'), t('common.error'));
          }
        }}
      />
    </Screen>
  );
}
