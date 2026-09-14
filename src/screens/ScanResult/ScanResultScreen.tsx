import React, { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { useTranslation } from 'react-i18next';
import { AppButton } from '../../components/AppButton/AppButton';
import { BarcodeCard } from '../../components/BarcodeCard/BarcodeCard';
import { CustomFieldsList } from '../../components/CustomFieldsList/CustomFieldsList';
import { LinkableText } from '../../components/LinkableText/LinkableText';
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

  const parsed = useMemo(
    () =>
      record
        ? parseScannedValue(record.rawScannedValue || record.payload)
        : null,
    [record],
  );

  if (!record || !parsed) {
    return <Screen />;
  }

  const isStructured =
    parsed.kind === 'codemate-qr' || parsed.kind === 'codemate-barcode';
  const title =
    record.englishName ||
    record.urduName ||
    (record.type === 'QR' ? t('common.qr') : t('common.barcode'));
  const rawValue = record.rawScannedValue || record.payload;

  return (
    <Screen scroll edges={['left', 'right', 'bottom']}>
      <View
        style={[
          styles.hero,
          {
            backgroundColor: theme.colors.primaryLight,
            borderColor: theme.colors.border,
          },
        ]}>
        <View
          style={[
            styles.heroIcon,
            { backgroundColor: theme.colors.primary },
          ]}>
          <MaterialDesignIcons
            name="check-bold"
            size={28}
            color={theme.colors.textInverse}
          />
        </View>
        <Text
          style={[
            theme.typography.subtitle,
            { color: theme.colors.primaryDark, marginTop: 12 },
          ]}>
          {t('scanner.success')}
        </Text>
        <Text
          style={[
            theme.typography.caption,
            {
              color: theme.colors.textSecondary,
              textAlign: 'center',
              marginTop: 4,
              paddingHorizontal: 12,
            },
          ]}>
          {t('scanResult.savedHint')}
        </Text>
      </View>

      <View
        style={[
          styles.previewCard,
          theme.shadows.card,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            borderRadius: theme.radius.lg,
          },
        ]}>
        <View style={styles.previewMeta}>
          <View
            style={[
              styles.typeChip,
              { backgroundColor: theme.colors.primaryLight },
            ]}>
            <MaterialDesignIcons
              name={record.type === 'QR' ? 'qrcode' : 'barcode'}
              size={16}
              color={theme.colors.primaryDark}
            />
            <Text
              style={[
                theme.typography.caption,
                { color: theme.colors.primaryDark, fontWeight: '700' },
              ]}>
              {record.type === 'QR' ? t('common.qr') : t('common.barcode')}
            </Text>
          </View>
          <View
            style={[
              styles.sourceChip,
              { backgroundColor: theme.colors.surfaceMuted },
            ]}>
            <Text
              style={[
                theme.typography.caption,
                { color: theme.colors.textSecondary, fontWeight: '600' },
              ]}>
              {t('common.scanned')}
            </Text>
          </View>
        </View>

        <View style={styles.codeWrap}>
          {record.type === 'QR' ? (
            <QRCodeCard value={record.payload} size={200} />
          ) : (
            <BarcodeCard value={record.payload} />
          )}
        </View>

        <LinkableText
          value={title}
          numberOfLines={2}
          style={[
            theme.typography.subtitle,
            {
              color: theme.colors.textPrimary,
              textAlign: 'center',
              marginTop: 4,
            },
          ]}
        />
        {isStructured && record.price != null ? (
          <Text
            style={[
              theme.typography.bodyBold,
              {
                color: theme.colors.primary,
                textAlign: 'center',
                marginTop: 4,
              },
            ]}>
            {formatPrice(record.price, record.currency, i18n.language)}
          </Text>
        ) : null}
      </View>

      <View
        style={[
          styles.infoCard,
          theme.shadows.soft,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            borderRadius: theme.radius.lg,
          },
        ]}>
        <Text
          style={[
            theme.typography.label,
            {
              color: theme.colors.textSecondary,
              letterSpacing: 0.6,
              textTransform: 'uppercase',
              marginBottom: 4,
            },
          ]}>
          {isStructured
            ? t('scanResult.productInformation')
            : t('scanResult.scannedCode')}
        </Text>

        {isStructured ? (
          <>
            <InfoRow
              icon="tag-outline"
              label={t('preview.name')}
              value={record.englishName || record.urduName || '—'}
            />
            {record.urduName && record.englishName ? (
              <InfoRow
                icon="translate"
                label={t('preview.name')}
                value={record.urduName}
                rtl
              />
            ) : null}
            {record.price != null ? (
              <InfoRow
                icon="currency-usd"
                label={t('preview.price')}
                value={formatPrice(
                  record.price,
                  record.currency,
                  i18n.language,
                )}
              />
            ) : null}
            {record.createdDate ? (
              <InfoRow
                icon="calendar-plus"
                label={t('preview.created')}
                value={formatDisplayDate(record.createdDate, i18n.language)}
              />
            ) : null}
            <InfoRow
              icon="calendar-end"
              label={t('preview.expiry')}
              value={formatDisplayDate(record.expiryDate, i18n.language)}
              last={!record.fields || Object.keys(record.fields).length === 0}
            />
            {record.fields && Object.keys(record.fields).length > 0 ? (
              <View style={{ marginTop: 4, marginBottom: 8 }}>
                <CustomFieldsList fields={record.fields} />
              </View>
            ) : null}
            <View style={styles.statusWrap}>
              <StatusBadge status={getCodeStatus(record.expiryDate)} />
            </View>
          </>
        ) : (
          <>
            <InfoRow
              icon="shape-outline"
              label={t('scanResult.type')}
              value={record.type === 'QR' ? t('common.qr') : t('common.barcode')}
            />
            <InfoRow
              icon="text-box-outline"
              label={t('scanResult.rawValue')}
              value={rawValue}
              last
            />
          </>
        )}
      </View>

      <View style={styles.actions}>
        <View style={styles.actionRow}>
          {!isStructured ? (
            <AppButton
              label={t('common.copy')}
              icon="content-copy"
              variant="secondary"
              style={styles.halfBtn}
              onPress={() => {
                void shareService
                  .shareText(rawValue)
                  .then(() =>
                    Alert.alert(t('common.success'), t('scanResult.copied')),
                  );
              }}
            />
          ) : null}
          <AppButton
            label={t('common.share')}
            icon="share-variant-outline"
            variant={isStructured ? 'primary' : 'secondary'}
            style={isStructured ? undefined : styles.halfBtn}
            onPress={() => void shareService.shareText(rawValue)}
          />
        </View>
        <AppButton
          label={t('common.scanAgain')}
          icon="line-scan"
          variant="secondary"
          onPress={() => navigation.navigate('ScannerMain')}
        />
      </View>
    </Screen>
  );
}

function InfoRow({
  icon,
  label,
  value,
  rtl,
  last,
}: {
  icon: React.ComponentProps<typeof MaterialDesignIcons>['name'];
  label: string;
  value: string;
  rtl?: boolean;
  last?: boolean;
}) {
  const theme = useAppTheme();
  return (
    <View
      style={[
        styles.infoRow,
        !last && {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: theme.colors.border,
        },
      ]}>
      <View
        style={[
          styles.infoIcon,
          { backgroundColor: theme.colors.surfaceMuted },
        ]}>
        <MaterialDesignIcons
          name={icon}
          size={18}
          color={theme.colors.primary}
        />
      </View>
      <View style={styles.infoText}>
        <Text
          style={[
            theme.typography.caption,
            { color: theme.colors.textSecondary },
          ]}>
          {label}
        </Text>
        <LinkableText
          value={value}
          style={[
            theme.typography.bodyBold,
            {
              color: theme.colors.textPrimary,
              marginTop: 2,
              textAlign: rtl ? 'right' : 'left',
              writingDirection: rtl ? 'rtl' : 'ltr',
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 22,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewCard: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    marginBottom: 14,
  },
  previewMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  sourceChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  codeWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  infoCard: {
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 8,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  infoText: {
    flex: 1,
  },
  statusWrap: {
    paddingBottom: 10,
    paddingTop: 2,
  },
  actions: {
    marginTop: 10,
    gap: 10,
    paddingBottom: 8,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  halfBtn: {
    flex: 1,
  },
});
