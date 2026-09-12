import React, { forwardRef } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { APP_NAME } from '../../constants';
import { CodeRecord } from '../../types/code';
import { formatDisplayDate } from '../../utils/date';
import { formatPrice } from '../../utils/price';
import { BarcodeCard } from '../BarcodeCard/BarcodeCard';
import { QRCodeCard } from '../QRCodeCard/QRCodeCard';

type Props = {
  record: CodeRecord;
  locale?: string;
};

export const ExportableCodeCard = forwardRef<View, Props>(
  function ExportableCodeCard({ record, locale = 'en' }, ref) {
    return (
      <View ref={ref as never} collapsable={false} style={styles.card}>
        <View style={styles.header}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.brand}>{APP_NAME}</Text>
        </View>

        <View style={styles.codeWrap}>
          {record.type === 'QR' ? (
            <QRCodeCard value={record.payload} size={200} />
          ) : (
            <BarcodeCard value={record.payload} />
          )}
        </View>

        <View style={styles.meta}>
          <MetaRow
            label="Name"
            value={record.englishName || record.rawScannedValue || '—'}
          />
          {record.urduName ? (
            <MetaRow label="Urdu" value={record.urduName} rtl />
          ) : null}
          <MetaRow
            label="Price"
            value={formatPrice(record.price, record.currency, locale)}
          />
          <MetaRow
            label="Created"
            value={formatDisplayDate(record.createdDate, locale)}
          />
          <MetaRow
            label="Expiry"
            value={formatDisplayDate(record.expiryDate, locale)}
          />
        </View>
      </View>
    );
  },
);

function MetaRow({
  label,
  value,
  rtl,
}: {
  label: string;
  value: string;
  rtl?: boolean;
}) {
  return (
    <View style={styles.metaRow}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text
        style={[
          styles.metaValue,
          rtl ? { textAlign: 'right', writingDirection: 'rtl' } : null,
        ]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E4E7EC',
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 56,
    height: 56,
    marginBottom: 8,
  },
  brand: {
    fontSize: 20,
    fontWeight: '700',
    color: '#047A46',
  },
  codeWrap: {
    alignItems: 'center',
    marginBottom: 16,
  },
  meta: {
    gap: 8,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  metaLabel: {
    color: '#667085',
    fontSize: 13,
    fontWeight: '600',
  },
  metaValue: {
    color: '#111827',
    fontSize: 13,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },
});
