import React from 'react';
import { Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { GenerateCodeForm } from '../../components/GenerateCodeForm/GenerateCodeForm';
import { Screen } from '../../components/Screen/Screen';
import { HomeStackParamList } from '../../navigation/navigationTypes';
import { codeService } from '../../services/codeService';
import { DEFAULT_CURRENCY } from '../../constants';

type Props = NativeStackScreenProps<HomeStackParamList, 'GenerateQR'>;

export function GenerateQRScreen({ navigation }: Props) {
  const { t } = useTranslation();

  return (
    <Screen scroll edges={['left', 'right', 'bottom']}>
      <GenerateCodeForm
        submitLabel={t('generate.generateQrCta')}
        onSubmit={async values => {
          try {
            const record = await codeService.generateQrCode({
              englishName: values.englishName ?? '',
              urduName: values.urduName,
              price: Number(values.price),
              currency: DEFAULT_CURRENCY,
              createdDate: values.createdDate,
              expiryDate: values.expiryDate,
            });
            Alert.alert(t('common.success'), t('generate.successQr'));
            navigation.replace('QRPreview', { codeId: record.id });
          } catch {
            Alert.alert(t('common.error'), t('common.error'));
          }
        }}
      />
    </Screen>
  );
}
