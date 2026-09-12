import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { CodePreviewActions } from '../../components/CodeCard/CodePreviewActions';
import { Screen } from '../../components/Screen/Screen';
import { HomeStackParamList } from '../../navigation/navigationTypes';
import { codeService } from '../../services/codeService';
import { useAppTheme } from '../../store/AppContext';
import { CodeRecord } from '../../types/code';

type Props = NativeStackScreenProps<HomeStackParamList, 'QRPreview'>;

export function QRPreviewScreen({ route }: Props) {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const [record, setRecord] = useState<CodeRecord | null>(null);

  useEffect(() => {
    void codeService.getCodeById(route.params.codeId).then(setRecord);
  }, [route.params.codeId]);

  if (!record) {
    return (
      <Screen>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll edges={['left', 'right', 'bottom']}>
      <CodePreviewActions record={record} title={t('preview.qrTitle')} />
    </Screen>
  );
}
