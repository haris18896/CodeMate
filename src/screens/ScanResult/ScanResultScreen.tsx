import React, { useEffect, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { AppButton } from '../../components/AppButton/AppButton';
import { AppCard } from '../../components/AppCard/AppCard';
import { BarcodeCard } from '../../components/BarcodeCard/BarcodeCard';
import { QRCodeCard } from '../../components/QRCodeCard/QRCodeCard';
import { Screen } from '../../components/Screen/Screen';
import { StatusBadge } from '../../components/StatusBadge/StatusBadge';
import { ScanStackParamList } from '../../navigation/navigationTypes';
import { codeService } from '../../services/codeService';
import { shareService } from '../../services/shareService';
import { useAppTheme } from '../../store/AppContext';
import { CodeRecord } from '../../types/code';
import { formatDisplayDate, getCodeStatus } from '../../utils/date';
import { formatPrice } from '../../utils/price';
import { parseScannedValue } from '../../utils/codePayload';

type Props = NativeStackScreenProps<ScanStackParamList, 'ScanResult'>;

export function ScanResultScreen({ navigation, route }: Props) {
  const theme = useAppTheme();
  const { t, i18n } = useTranslation();
  const [record, setRecord] = useState<CodeRecord | null>(null);

  useEffect(() => {
    void codeService.getCodeById(route.params.codeId).then(setRecord);
  }, [route.params.codeId]);

  if (!record) {
    return <Screen />;
  }

  const parsed = parseScannedValue(record.rawScannedValue || record.payload);
  const isStructured =
    parsed.kind === 'codemate-qr' || parsed.kind === 'codemate-barcode';

  return (
    <Screen scroll>
      <Text
        style={[
          theme.typography.title,
          { color: theme.colors.textPrimary, marginBottom: 12 },
        ]}>
        {t('scanResult.title')}
      </Text>

      <AppCard>
        {record.type === 'QR' ? (
          <QRCodeCard value={record.payload} size={180} />
        ) : (
          <BarcodeCard value={record.payload} />
        )}
      </AppCard>

      <AppCard style={{ marginTop: 14 }}>
        <Text
          style={[
            theme.typography.subtitle,
            { color: theme.colors.textPrimary, marginBottom: 10 },
          ]}>
          {isStructured
            ? t('scanResult.productInformation')
            : t('scanResult.scannedCode')}
        </Text>

        {isStructured ? (
          <>
            <Row
              label={t('preview.name')}
              value={record.englishName || '—'}
            />
            {record.urduName ? (
              <Row label={t('preview.urduName')} value={record.urduName} rtl />
            ) : null}
            <Row
              label={t('preview.price')}
              value={formatPrice(record.price, record.currency, i18n.language)}
            />
            <Row
              label={t('preview.created')}
              value={formatDisplayDate(record.createdDate, i18n.language)}
            />
            <Row
              label={t('preview.expiry')}
              value={formatDisplayDate(record.expiryDate, i18n.language)}
            />
            <StatusBadge status={getCodeStatus(record.expiryDate)} />
          </>
        ) : (
          <>
            <Row
              label={t('scanResult.type')}
              value={record.type === 'QR' ? t('common.qr') : t('common.barcode')}
            />
            <Row
              label={t('scanResult.rawValue')}
              value={record.rawScannedValue || record.payload}
            />
          </>
        )}
      </AppCard>

      <View style={styles.actions}>
        {!isStructured ? (
          <AppButton
            label={t('common.copy')}
            icon="content-copy"
            variant="secondary"
            onPress={() => {
              void shareService
                .shareText(record.rawScannedValue || record.payload)
                .then(() =>
                  Alert.alert(t('common.success'), t('scanResult.copied')),
                );
            }}
          />
        ) : null}
        <AppButton
          label={t('common.share')}
          icon="share-variant-outline"
          onPress={() =>
            void shareService.shareText(
              record.rawScannedValue || record.payload,
            )
          }
        />
        <AppButton
          label={t('common.save')}
          icon="content-save-outline"
          variant="ghost"
          onPress={() =>
            Alert.alert(t('common.success'), t('preview.savedGallery'))
          }
        />
        <AppButton
          label={t('common.scanAgain')}
          icon="line-scan"
          variant="secondary"
          onPress={() => navigation.navigate('ScannerMain')}
        />
      </View>

      <View
        style={[
          styles.toast,
          { backgroundColor: theme.colors.success },
        ]}>
        <Text style={{ color: '#FFF', fontWeight: '600' }}>
          {t('scanner.success')}
        </Text>
      </View>
    </Screen>
  );
}

function Row({
  label,
  value,
  rtl,
}: {
  label: string;
  value: string;
  rtl?: boolean;
}) {
  const theme = useAppTheme();
  return (
    <View style={styles.row}>
      <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
        {label}
      </Text>
      <Text
        style={[
          theme.typography.bodyBold,
          {
            color: theme.colors.textPrimary,
            flex: 1,
            textAlign: rtl ? 'right' : 'left',
            writingDirection: rtl ? 'rtl' : 'ltr',
          },
        ]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    marginTop: 16,
    gap: 10,
  },
  row: {
    marginBottom: 10,
    gap: 4,
  },
  toast: {
    marginTop: 20,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
});
