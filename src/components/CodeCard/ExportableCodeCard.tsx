import React, { forwardRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CodeRecord } from '../../types/code';
import { parseBarcodePayload } from '../../utils/codePayload';
import { BarcodeCard } from '../BarcodeCard/BarcodeCard';
import { QRCodeCard } from '../QRCodeCard/QRCodeCard';

type Props = {
  record: CodeRecord;
};

function barcodeDisplayId(record: CodeRecord): string {
  const parsed = parseBarcodePayload(record.payload);
  if (parsed?.id) {
    return parsed.id;
  }
  const match = record.payload.match(/(?:^|\|)ID=([A-Za-z0-9]+)/);
  if (match?.[1]) {
    return match[1].toUpperCase();
  }
  return record.id.replace(/-/g, '').slice(0, 12).toUpperCase();
}

/** Off-screen card captured for download / save / share — code only, no branding or metadata. */
export const ExportableCodeCard = forwardRef<View, Props>(
  function ExportableCodeCard({ record }, ref) {
    return (
      <View ref={ref as never} collapsable={false} style={styles.card}>
        {record.type === 'QR' ? (
          <QRCodeCard value={record.payload} size={220} />
        ) : (
          <View style={styles.barcodeBlock}>
            <BarcodeCard value={record.payload} showValue={false} />
            <Text style={styles.barcodeId}>{barcodeDisplayId(record)}</Text>
          </View>
        )}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  card: {
    width: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barcodeBlock: {
    width: '100%',
    alignItems: 'center',
  },
  barcodeId: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#111827',
    textAlign: 'center',
  },
});
