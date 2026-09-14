import React, { forwardRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CodeRecord } from '../../types/code';
import { formatDisplayDate } from '../../utils/date';
import { BarcodeCard } from '../BarcodeCard/BarcodeCard';
import { QRCodeCard } from '../QRCodeCard/QRCodeCard';

type Props = {
  record: CodeRecord;
};

/** Off-screen card captured for download / save / share. */
export const ExportableCodeCard = forwardRef<View, Props>(
  function ExportableCodeCard({ record }, ref) {
    const title = record.englishName || record.urduName || '';
    const secondary =
      record.englishName && record.urduName ? record.urduName : '';

    return (
      <View ref={ref as never} collapsable={false} style={styles.card}>
        {record.type === 'QR' ? (
          <QRCodeCard value={record.payload} size={220} />
        ) : (
          <View style={styles.barcodeBlock}>
            <BarcodeCard value={record.payload} showValue />
            {title ? (
              <Text
                style={[
                  styles.productName,
                  !record.englishName && record.urduName
                    ? styles.rtl
                    : undefined,
                ]}
                numberOfLines={2}>
                {title}
              </Text>
            ) : null}
            {secondary ? (
              <Text style={[styles.productSecondary, styles.rtl]} numberOfLines={1}>
                {secondary}
              </Text>
            ) : null}
            {record.expiryDate ? (
              <Text style={styles.expiry}>
                Exp: {formatDisplayDate(record.expiryDate, 'en')}
              </Text>
            ) : null}
          </View>
        )}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  card: {
    width: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barcodeBlock: {
    width: '100%',
    alignItems: 'center',
  },
  productName: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  productSecondary: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  expiry: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
    textAlign: 'center',
  },
  rtl: {
    writingDirection: 'rtl',
    textAlign: 'center',
  },
});
