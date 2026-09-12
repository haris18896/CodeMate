import React, { useRef, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppButton } from '../AppButton/AppButton';
import { ExportableCodeCard } from '../CodeCard/ExportableCodeCard';
import { StatusBadge } from '../StatusBadge/StatusBadge';
import { useAppTheme } from '../../store/AppContext';
import { CodeRecord } from '../../types/code';
import { getCodeStatus, formatDisplayDate } from '../../utils/date';
import { formatPrice } from '../../utils/price';
import { imageService } from '../../services/imageService';
import { shareService } from '../../services/shareService';
import { LoadingOverlay } from '../LoadingOverlay/LoadingOverlay';
import { BarcodeCard } from '../BarcodeCard/BarcodeCard';
import { QRCodeCard } from '../QRCodeCard/QRCodeCard';

type Props = {
  record: CodeRecord;
  title: string;
};

export function CodePreviewActions({ record, title }: Props) {
  const theme = useAppTheme();
  const { t, i18n } = useTranslation();
  const exportRef = useRef<View>(null);
  const [busy, setBusy] = useState(false);

  const capture = async () => {
    if (!exportRef.current) {
      throw new Error('Export view unavailable');
    }
    return imageService.captureCodeCard(exportRef);
  };

  const onSave = async () => {
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
  };

  const onShare = async () => {
    try {
      setBusy(true);
      const uri = await capture();
      await shareService.shareImage({
        uri,
        message: `${record.englishName || 'CodeMate'} — ${formatPrice(
          record.price,
          record.currency,
          i18n.language,
        )}`,
      });
    } catch {
      Alert.alert(t('common.error'), t('preview.unableShare'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <View>
      <Text
        style={[
          theme.typography.title,
          { color: theme.colors.textPrimary, marginBottom: 16 },
        ]}>
        {title}
      </Text>

      {record.type === 'QR' ? (
        <QRCodeCard value={record.payload} />
      ) : (
        <BarcodeCard value={record.payload} />
      )}

      <View style={{ marginTop: 16, gap: 8 }}>
        <Meta label={t('preview.name')} value={record.englishName || '—'} />
        {record.urduName ? (
          <Meta label={t('preview.urduName')} value={record.urduName} rtl />
        ) : null}
        <Meta
          label={t('preview.price')}
          value={formatPrice(record.price, record.currency, i18n.language)}
        />
        <Meta
          label={t('preview.created')}
          value={formatDisplayDate(record.createdDate, i18n.language)}
        />
        <Meta
          label={t('preview.expiry')}
          value={formatDisplayDate(record.expiryDate, i18n.language)}
        />
        <StatusBadge status={getCodeStatus(record.expiryDate)} />
      </View>

      <View style={styles.actions}>
        <AppButton
          label={t('common.saveToGallery')}
          icon="download-outline"
          onPress={onSave}
          style={styles.half}
        />
        <AppButton
          label={t('common.share')}
          icon="share-variant-outline"
          variant="secondary"
          onPress={onShare}
          style={styles.half}
        />
      </View>

      <View style={styles.offscreen} pointerEvents="none">
        <ExportableCodeCard ref={exportRef} record={record} />
      </View>
      <LoadingOverlay visible={busy} />
    </View>
  );
}

function Meta({
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
    <View style={styles.metaRow}>
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
            flex: 1,
          },
        ]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  half: {
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  offscreen: {
    position: 'absolute',
    left: -9999,
    top: 0,
    opacity: 0,
  },
});
