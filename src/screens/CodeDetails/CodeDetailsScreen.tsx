import React, { useEffect, useRef, useState } from 'react';
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
import { ExportableCodeCard } from '../../components/CodeCard/ExportableCodeCard';
import { LoadingOverlay } from '../../components/LoadingOverlay/LoadingOverlay';
import { QRCodeCard } from '../../components/QRCodeCard/QRCodeCard';
import { Screen } from '../../components/Screen/Screen';
import { StatusBadge } from '../../components/StatusBadge/StatusBadge';
import { HomeStackParamList } from '../../navigation/navigationTypes';
import { codeService } from '../../services/codeService';
import { imageService } from '../../services/imageService';
import { shareService } from '../../services/shareService';
import { useAppTheme } from '../../store/AppContext';
import { CodeRecord } from '../../types/code';
import { formatDisplayDate, getCodeStatus } from '../../utils/date';
import { formatPrice } from '../../utils/price';

type Props = NativeStackScreenProps<HomeStackParamList, 'CodeDetails'>;

export function CodeDetailsScreen({ navigation, route }: Props) {
  const theme = useAppTheme();
  const { t, i18n } = useTranslation();
  const [record, setRecord] = useState<CodeRecord | null>(null);
  const [busy, setBusy] = useState(false);
  const exportRef = useRef<View>(null);

  useEffect(() => {
    void codeService.getCodeById(route.params.codeId).then(setRecord);
  }, [route.params.codeId]);

  if (!record) {
    return <Screen />;
  }

  const capture = async () => {
    if (!exportRef.current) {
      throw new Error('Missing export view');
    }
    return imageService.captureCodeCard(exportRef);
  };

  const onDelete = () => {
    Alert.alert(t('history.deleteConfirmTitle'), t('history.deleteConfirmBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          await codeService.deleteCode(record.id);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <Screen scroll edges={['left', 'right', 'bottom']}>
      <View style={styles.header}>
        <Text
          style={[theme.typography.title, { color: theme.colors.textPrimary }]}>
          {t('details.title')}
        </Text>
        <AppButton
          label={t('common.delete')}
          icon="delete-outline"
          variant="danger"
          onPress={onDelete}
          style={{ minWidth: 120 }}
        />
      </View>

      <AppCard>
        {record.type === 'QR' ? (
          <QRCodeCard value={record.payload} size={200} />
        ) : (
          <BarcodeCard value={record.payload} />
        )}
      </AppCard>

      <AppCard style={{ marginTop: 14, gap: 8 }}>
        <Row label={t('preview.name')} value={record.englishName || '—'} />
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
        <Row
          label={t('details.source')}
          value={
            record.source === 'GENERATED'
              ? t('common.generated')
              : t('common.scanned')
          }
        />
        <View>
          <Text
            style={[
              theme.typography.caption,
              { color: theme.colors.textSecondary, marginBottom: 4 },
            ]}>
            {t('details.status')}
          </Text>
          <StatusBadge status={getCodeStatus(record.expiryDate)} />
        </View>
      </AppCard>

      <View style={{ marginTop: 16, gap: 10 }}>
        <AppButton
          label={t('common.share')}
          icon="share-variant-outline"
          onPress={async () => {
            try {
              setBusy(true);
              if (record.source === 'GENERATED' || record.englishName) {
                const uri = await capture();
                await shareService.shareImage({ uri });
              } else {
                await shareService.shareText(
                  record.rawScannedValue || record.payload,
                );
              }
            } catch {
              Alert.alert(t('common.error'), t('preview.unableShare'));
            } finally {
              setBusy(false);
            }
          }}
        />
        <AppButton
          label={t('common.saveToGallery')}
          icon="image-outline"
          variant="secondary"
          onPress={async () => {
            try {
              setBusy(true);
              const uri = await capture();
              await imageService.saveCapturedImage(uri);
              Alert.alert(t('common.success'), t('preview.savedGallery'));
            } catch {
              Alert.alert(t('common.error'), t('preview.unableSave'));
            } finally {
              setBusy(false);
            }
          }}
        />
        {record.source === 'GENERATED' ? (
          <AppButton
            label={t('common.regenerate')}
            icon="refresh"
            variant="ghost"
            onPress={() => {
              navigation.navigate(
                record.type === 'QR' ? 'GenerateQR' : 'GenerateBarcode',
              );
            }}
          />
        ) : null}
      </View>

      <View style={styles.offscreen} pointerEvents="none">
        <ExportableCodeCard ref={exportRef} record={record} />
      </View>
      <LoadingOverlay visible={busy} />
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
    <View>
      <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
        {label}
      </Text>
      <Text
        style={[
          theme.typography.bodyBold,
          {
            color: theme.colors.textPrimary,
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  offscreen: {
    position: 'absolute',
    left: -9999,
    opacity: 0,
  },
});
