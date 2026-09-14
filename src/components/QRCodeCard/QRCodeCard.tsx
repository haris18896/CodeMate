import React from 'react';
import { View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useAppTheme } from '../../store/AppContext';

type Props = {
  value: string;
  size?: number;
};

export function QRCodeCard({ value, size = 220 }: Props) {
  const theme = useAppTheme();
  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: theme.radius.lg,
      }}>
      <QRCode
        value={value || 'CodeMate'}
        size={size}
        quietZone={16}
        backgroundColor="#FFFFFF"
        color="#000000"
        ecl="M"
      />
    </View>
  );
}
