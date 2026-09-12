import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  AppState,
  LayoutChangeEvent,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { useTranslation } from 'react-i18next';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, Mask, Rect } from 'react-native-svg';
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
import { CodeRecord } from '../../types/code';
import { formatDisplayDate } from '../../utils/date';
import { formatPrice } from '../../utils/price';

type Props = NativeStackScreenProps<ScanStackParamList, 'ScannerMain'>;

const FRAME_SIZE = 268;
const FRAME_RADIUS = 28;
const MASK = 'rgba(6, 12, 10, 0.78)';
const ACCENT = '#16A864';

export function ScannerScreen({ navigation }: Props) {
  const theme = useAppTheme();
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const { hasPermission, requestPermission, canRequestPermission, status } =
    useCameraPermission();
  const device = useCameraDevice('back');
  const [torchOn, setTorchOn] = useState(false);
  const [appActive, setAppActive] = useState(
    AppState.currentState === 'active',
  );
  const [detected, setDetected] = useState<CodeRecord | null>(null);
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const lockRef = useRef(false);

  const scanLine = useSharedValue(0);

  const frameLeft = Math.max(0, (layout.width - FRAME_SIZE) / 2);
  const frameTop = Math.max(0, (layout.height - FRAME_SIZE) / 2);

  const onContainerLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setLayout(prev =>
      prev.width === width && prev.height === height
        ? prev
        : { width, height },
    );
  }, []);

  useEffect(() => {
    scanLine.value = withRepeat(
      withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [scanLine]);

  const scanLineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanLine.value * (FRAME_SIZE - 36) }],
    opacity: 0.35 + scanLine.value * 0.45,
  }));

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

  useEffect(() => {
    if (!isFocused) {
      setTorchOn(false);
      lockRef.current = false;
    }
  }, [isFocused]);

  const resetScan = useCallback(() => {
    setDetected(null);
    lockRef.current = false;
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      resetScan();
    });
    return unsubscribe;
  }, [navigation, resetScan]);

  const handleBarcodes = useCallback(async (barcodes: Barcode[]) => {
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
      setDetected(record);
      setTorchOn(false);
    } catch {
      lockRef.current = false;
    }
  }, []);

  const barcodeOutput = useBarcodeScannerOutput({
    barcodeFormats: [...SCAN_FORMATS],
    onBarcodeScanned: barcodes => {
      void handleBarcodes(barcodes);
    },
    onError: () => {
      // Ignore transient decode errors.
    },
  });

  const isActive =
    isFocused && appActive && hasPermission && device != null && !detected;

  const detectedTitle = useMemo(() => {
    if (!detected) {
      return '';
    }
    return (
      detected.englishName ||
      detected.urduName ||
      detected.rawScannedValue ||
      detected.payload
    );
  }, [detected]);

  if (!hasPermission) {
    return (
      <View
        style={[
          styles.permission,
          { backgroundColor: theme.colors.background },
        ]}>
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
      <View
        style={[
          styles.permission,
          { backgroundColor: theme.colors.background },
        ]}>
        <EmptyState
          icon="alert-circle-outline"
          title={t('scanner.unavailable')}
          subtitle={t('scanner.permissionBody')}
        />
      </View>
    );
  }

  return (
    <View style={styles.container} onLayout={onContainerLayout}>
      <StatusBar barStyle="light-content" />

      {isFocused ? (
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={isActive}
          outputs={detected ? [] : [barcodeOutput]}
          torchMode={isActive ? (torchOn ? 'on' : 'off') : undefined}
          onError={error => {
            if (
              error.message.includes('not active') ||
              error.message.includes('OperationCanceled')
            ) {
              return;
            }
          }}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: '#000' }]} />
      )}

      {layout.width > 0 && layout.height > 0 ? (
        <Svg
          pointerEvents="none"
          width={layout.width}
          height={layout.height}
          style={StyleSheet.absoluteFill}>
          <Defs>
            <Mask id="scanHole">
              <Rect width={layout.width} height={layout.height} fill="#fff" />
              <Rect
                x={frameLeft}
                y={frameTop}
                width={FRAME_SIZE}
                height={FRAME_SIZE}
                rx={FRAME_RADIUS}
                ry={FRAME_RADIUS}
                fill="#000"
              />
            </Mask>
          </Defs>
          <Rect
            width={layout.width}
            height={layout.height}
            fill={MASK}
            mask="url(#scanHole)"
          />
        </Svg>
      ) : null}

      <View
        pointerEvents="box-none"
        style={[styles.header, { paddingTop: Math.max(insets.top, 12) + 8 }]}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{t('scanner.title')}</Text>
          <Text style={styles.subtitle}>{t('scanner.subtitle')}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            torchOn ? t('scanner.flashOn') : t('scanner.flashOff')
          }
          disabled={!isActive}
          onPress={() => setTorchOn(value => !value)}
          style={({ pressed }) => [
            styles.flashBtn,
            torchOn && styles.flashBtnActive,
            (!isActive || pressed) && { opacity: 0.7 },
          ]}>
          <MaterialDesignIcons
            name={torchOn ? 'flash' : 'flash-off'}
            size={22}
            color={torchOn ? '#0B1210' : '#FFFFFF'}
          />
        </Pressable>
      </View>

      <View
        pointerEvents="none"
        style={[
          styles.frame,
          {
            top: frameTop,
            left: frameLeft,
            width: FRAME_SIZE,
            height: FRAME_SIZE,
            borderRadius: FRAME_RADIUS,
          },
        ]}>
        <Corner position="tl" />
        <Corner position="tr" />
        <Corner position="bl" />
        <Corner position="br" />
        {!detected ? (
          <Animated.View style={[styles.scanLine, scanLineStyle]}>
            <View style={styles.scanLineCore} />
          </Animated.View>
        ) : null}
      </View>

      <View
        style={[
          styles.bottomPanel,
          {
            paddingBottom: Math.max(insets.bottom, 12) + 8,
          },
        ]}>
        {detected ? (
          <View style={styles.detectedCard}>
            <View style={styles.detectedHeader}>
              <View style={styles.detectedBadge}>
                <MaterialDesignIcons
                  name="check-circle"
                  size={18}
                  color={ACCENT}
                />
                <Text style={styles.detectedBadgeText}>
                  {t('scanner.detected')}
                </Text>
              </View>
              <Text style={styles.detectedType}>
                {detected.type === 'QR' ? t('common.qr') : t('common.barcode')}
              </Text>
            </View>

            <Text style={styles.detectedTitle} numberOfLines={2}>
              {detectedTitle}
            </Text>

            {detected.price != null ? (
              <InfoRow
                label={t('preview.price')}
                value={formatPrice(
                  detected.price,
                  detected.currency,
                  i18n.language,
                )}
              />
            ) : null}
            {detected.createdDate ? (
              <InfoRow
                label={t('preview.created')}
                value={formatDisplayDate(detected.createdDate, i18n.language)}
              />
            ) : null}
            {detected.expiryDate ? (
              <InfoRow
                label={t('preview.expiry')}
                value={formatDisplayDate(detected.expiryDate, i18n.language)}
              />
            ) : null}
            {!detected.englishName && !detected.urduName && !detected.price ? (
              <InfoRow
                label={t('scanResult.rawValue')}
                value={detected.rawScannedValue || detected.payload}
              />
            ) : null}

            <View style={styles.detectedActions}>
              <Pressable
                accessibilityRole="button"
                onPress={resetScan}
                style={({ pressed }) => [
                  styles.secondaryBtn,
                  pressed && { opacity: 0.85 },
                ]}>
                <Text style={styles.secondaryBtnText}>
                  {t('common.scanAgain')}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  navigation.navigate('ScanResult', { codeId: detected.id })
                }
                style={({ pressed }) => [
                  styles.primaryBtn,
                  pressed && { opacity: 0.9 },
                ]}>
                <Text style={styles.primaryBtnText}>
                  {t('scanner.viewDetails')}
                </Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={styles.waitingCard}>
            <View style={styles.waitingIcon}>
              <MaterialDesignIcons
                name="qrcode-scan"
                size={22}
                color="rgba(255,255,255,0.85)"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.waitingTitle}>
                {t('scanner.notDetected')}
              </Text>
              <Text style={styles.waitingDetail}>{t('scanner.align')}</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

function Corner({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) {
  const size = 36;
  const thickness = 3.5;
  const radius = 14;
  const common = {
    position: 'absolute' as const,
    width: size,
    height: size,
    borderColor: ACCENT,
  };
  const map = {
    tl: {
      top: 10,
      left: 10,
      borderTopWidth: thickness,
      borderLeftWidth: thickness,
      borderTopLeftRadius: radius,
    },
    tr: {
      top: 10,
      right: 10,
      borderTopWidth: thickness,
      borderRightWidth: thickness,
      borderTopRightRadius: radius,
    },
    bl: {
      bottom: 10,
      left: 10,
      borderBottomWidth: thickness,
      borderLeftWidth: thickness,
      borderBottomLeftRadius: radius,
    },
    br: {
      bottom: 10,
      right: 10,
      borderBottomWidth: thickness,
      borderRightWidth: thickness,
      borderBottomRightRadius: radius,
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
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    gap: 16,
  },
  titleBlock: {
    flex: 1,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 14,
    marginTop: 4,
  },
  flashBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flashBtnActive: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
  },
  frame: {
    position: 'absolute',
    zIndex: 2,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(22, 168, 100, 0.45)',
  },
  scanLine: {
    position: 'absolute',
    left: 22,
    right: 22,
    top: 18,
    height: 2,
  },
  scanLineCore: {
    height: 2,
    borderRadius: 2,
    backgroundColor: ACCENT,
  },
  bottomPanel: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 0,
    zIndex: 3,
  },
  waitingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: 'rgba(17, 24, 39, 0.92)',
    borderColor: 'rgba(255,255,255,0.12)',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  waitingIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waitingTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  waitingDetail: {
    color: 'rgba(255,255,255,0.62)',
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  detectedCard: {
    backgroundColor: 'rgba(17, 24, 39, 0.96)',
    borderColor: 'rgba(22, 168, 100, 0.45)',
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
  },
  detectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detectedBadgeText: {
    color: ACCENT,
    fontSize: 13,
    fontWeight: '700',
  },
  detectedType: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
    fontWeight: '600',
  },
  detectedTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  infoRow: {
    marginBottom: 8,
  },
  infoLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginBottom: 2,
  },
  infoValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  detectedActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  secondaryBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  secondaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  primaryBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: ACCENT,
  },
  primaryBtnText: {
    color: '#0B1210',
    fontWeight: '700',
    fontSize: 14,
  },
});
