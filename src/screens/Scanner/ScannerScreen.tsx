import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AppState,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { useTranslation } from 'react-i18next';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import {
  useBarcodeScannerOutput,
  type Barcode,
} from 'react-native-vision-camera-barcode-scanner';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { SCAN_FORMATS } from '../../constants';
import { ScanStackParamList } from '../../navigation/navigationTypes';
import { codeService } from '../../services/codeService';
import { permissionService } from '../../services/permissionService';
import { useAppTheme } from '../../store/AppContext';

type Props = NativeStackScreenProps<ScanStackParamList, 'ScannerMain'>;

export function ScannerScreen({ navigation }: Props) {
  const theme = useAppTheme();
  const { t } = useTranslation();
  const isFocused = useIsFocused();
  const { hasPermission, requestPermission, canRequestPermission, status } =
    useCameraPermission();
  const device = useCameraDevice('back');
  const [torchOn, setTorchOn] = useState(false);
  const [appActive, setAppActive] = useState(AppState.currentState === 'active');
  const lockRef = useRef(false);

  useEffect(() => {
    const sub = AppState.addEventListener('change', next => {
      setAppActive(next === 'active');
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!hasPermission && canRequestPermission) {
      void requestPermission();
    }
  }, [hasPermission, canRequestPermission, requestPermission]);

  const handleBarcodes = useCallback(
    async (barcodes: Barcode[]) => {
      if (lockRef.current || barcodes.length === 0) {
        return;
      }
      const first = barcodes[0];
      const value = first.rawValue || first.displayValue;
      if (!value) {
        return;
      }
      lockRef.current = true;
      try {
        const record = await codeService.saveScannedValue({
          rawValue: value,
          formatHint: first.format,
        });
        navigation.navigate('ScanResult', { codeId: record.id });
      } catch {
        lockRef.current = false;
      }
    },
    [navigation],
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      lockRef.current = false;
    });
    return unsubscribe;
  }, [navigation]);

  const barcodeOutput = useBarcodeScannerOutput({
    barcodeFormats: [...SCAN_FORMATS],
    onBarcodeScanned: barcodes => {
      void handleBarcodes(barcodes);
    },
    onError: () => {
      // Keep scanner alive; surface nothing fatal for transient decode errors.
    },
  });

  if (!hasPermission) {
    return (
      <View style={[styles.permission, { backgroundColor: theme.colors.background }]}>
        <EmptyState
          icon="camera-outline"
          title={t('scanner.permissionTitle')}
          subtitle={t('scanner.permissionBody')}
          actionLabel={
            canRequestPermission
              ? t('common.grantPermission')
              : t('common.openSettings')
          }
          onAction={() => {
            if (canRequestPermission) {
              void requestPermission();
            } else {
              void permissionService.openAppSettings();
            }
          }}
        />
        <Text
          style={[
            theme.typography.caption,
            {
              color: theme.colors.textSecondary,
              textAlign: 'center',
              marginTop: 8,
            },
          ]}>
          {status}
        </Text>
      </View>
    );
  }

  if (device == null) {
    return (
      <View style={[styles.permission, { backgroundColor: theme.colors.background }]}>
        <EmptyState
          icon="alert-circle-outline"
          title={t('scanner.unavailable')}
          subtitle={t('scanner.permissionBody')}
        />
      </View>
    );
  }

  const isActive = isFocused && appActive && !lockRef.current;

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isActive}
        outputs={[barcodeOutput]}
        torchMode={torchOn ? 'on' : 'off'}
      />

      <View style={styles.overlay}>
        <View style={styles.topBar}>
          <Text style={styles.title}>{t('scanner.title')}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Toggle flashlight"
            onPress={() => setTorchOn(value => !value)}
            style={styles.flashBtn}>
            <MaterialDesignIcons
              name={torchOn ? 'flash' : 'flash-off'}
              size={24}
              color="#FFFFFF"
            />
          </Pressable>
        </View>

        <View style={styles.frameWrap}>
          <View style={styles.frame}>
            <Corner position="tl" color={theme.colors.success} />
            <Corner position="tr" color={theme.colors.success} />
            <Corner position="bl" color={theme.colors.success} />
            <Corner position="br" color={theme.colors.success} />
          </View>
        </View>

        <Text style={styles.hint}>{t('scanner.align')}</Text>
      </View>
    </View>
  );
}

function Corner({
  position,
  color,
}: {
  position: 'tl' | 'tr' | 'bl' | 'br';
  color: string;
}) {
  const size = 28;
  const thickness = 4;
  const common = {
    position: 'absolute' as const,
    width: size,
    height: size,
    borderColor: color,
  };
  const map = {
    tl: {
      top: 0,
      left: 0,
      borderTopWidth: thickness,
      borderLeftWidth: thickness,
    },
    tr: {
      top: 0,
      right: 0,
      borderTopWidth: thickness,
      borderRightWidth: thickness,
    },
    bl: {
      bottom: 0,
      left: 0,
      borderBottomWidth: thickness,
      borderLeftWidth: thickness,
    },
    br: {
      bottom: 0,
      right: 0,
      borderBottomWidth: thickness,
      borderRightWidth: thickness,
    },
  };
  return <View style={[common, map[position]]} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permission: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingBottom: 48,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  flashBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  frameWrap: {
    alignItems: 'center',
  },
  frame: {
    width: 260,
    height: 260,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  hint: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 15,
    paddingHorizontal: 24,
  },
});
