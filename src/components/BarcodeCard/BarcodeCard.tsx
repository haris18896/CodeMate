import React from 'react';
import { Text, View } from 'react-native';
import Barcode from '@kichiyaki/react-native-barcode-generator';
import { useAppTheme } from '../../store/AppContext';

type Props = {
  value: string;
  showValue?: boolean;
};

const MAX_BARCODE_WIDTH = 280;

export function BarcodeCard({ value, showValue = true }: Props) {
  const theme = useAppTheme();
  const safeValue = value || 'CODEMATE';

  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: theme.radius.lg,
        width: '100%',
      }}>
      <Barcode
        value={safeValue}
        format="CODE128"
        width={2}
        height={100}
        maxWidth={MAX_BARCODE_WIDTH}
        lineColor="#000000"
        background="#FFFFFF"
        onError={() => undefined}
      />
      {showValue ? (
        <Text
          numberOfLines={2}
          style={[
            theme.typography.caption,
            {
              color: '#111827',
              marginTop: 10,
              textAlign: 'center',
              maxWidth: MAX_BARCODE_WIDTH,
              fontWeight: '600',
            },
          ]}>
          {safeValue}
        </Text>
      ) : null}
    </View>
  );
}
