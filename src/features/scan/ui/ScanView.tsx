import { useMemo } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  CameraView,
  type BarcodeScanningResult,
  type PermissionResponse,
} from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import { useTheme, type Colors } from '@/theme';
import type { ScanConfig, ScannerKind } from '../hook/useScan';

export type ScanViewProps = {
  kind: ScannerKind;
  config: ScanConfig;
  permission: PermissionResponse | null;
  requestPermission: () => Promise<PermissionResponse>;
  result: BarcodeScanningResult | null;
  onBarcodeScanned: (scan: BarcodeScanningResult) => void;
  scanAgain: () => void;
  onClose: () => void;
};

export function ScanView({
  kind,
  config,
  permission,
  requestPermission,
  result,
  onBarcodeScanned,
  scanAgain,
  onClose,
}: ScanViewProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  if (!permission) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.message}>Checking camera permission…</Text>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar style="dark" />
        <View style={styles.permissionBox}>
          <Text style={styles.title}>{config.title}</Text>
          <Text style={styles.message}>
            Camera access is required to scan{' '}
            {kind === 'qr' ? 'QR codes' : 'barcodes'}.
          </Text>
          <Pressable style={styles.button} onPress={requestPermission}>
            <Text style={styles.buttonText}>Allow camera</Text>
          </Pressable>
          <Pressable style={styles.buttonSecondary} onPress={onClose}>
            <Text style={styles.buttonSecondaryText}>Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.cameraRoot}>
      <StatusBar style="light" />
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: config.barcodeTypes }}
        onBarcodeScanned={result ? undefined : onBarcodeScanned}
      />

      <SafeAreaView style={styles.overlay}>
        <View style={styles.topBar}>
          <Text style={styles.overlayTitle}>{config.title}</Text>
          <Text style={styles.overlayHint}>{config.hint}</Text>
        </View>

        <View style={styles.frame} />

        <View style={styles.bottomBar}>
          {result ? (
            <View style={styles.resultCard}>
              <Text style={styles.resultLabel}>Scanned ({result.type})</Text>
              <Text style={styles.resultData} selectable>
                {result.data}
              </Text>
              <View style={styles.resultActions}>
                <Pressable style={styles.button} onPress={scanAgain}>
                  <Text style={styles.buttonText}>Scan again</Text>
                </Pressable>
                <Pressable style={styles.buttonSecondaryLight} onPress={onClose}>
                  <Text style={styles.buttonSecondaryTextLight}>Done</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable style={styles.buttonSecondaryLight} onPress={onClose}>
              <Text style={styles.buttonSecondaryTextLight}>Cancel</Text>
            </Pressable>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

function createStyles(colors: Colors) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: 'center',
      padding: 24,
    },
    permissionBox: {
      gap: 14,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
    },
    message: {
      fontSize: 15,
      color: colors.textSecondary,
      lineHeight: 22,
    },
    cameraRoot: {
      flex: 1,
      backgroundColor: colors.cameraBackground,
    },
    overlay: {
      flex: 1,
      justifyContent: 'space-between',
    },
    topBar: {
      paddingHorizontal: 20,
      paddingTop: 12,
      gap: 4,
    },
    overlayTitle: {
      color: colors.buttonText,
      fontSize: 22,
      fontWeight: '700',
    },
    overlayHint: {
      color: colors.overlayHint,
      fontSize: 14,
    },
    frame: {
      alignSelf: 'center',
      width: '72%',
      aspectRatio: 1,
      borderWidth: 2,
      borderColor: colors.frameBorder,
      borderRadius: 12,
      backgroundColor: 'transparent',
    },
    bottomBar: {
      paddingHorizontal: 20,
      paddingBottom: 20,
      gap: 12,
    },
    resultCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      gap: 10,
    },
    resultLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textLabel,
      textTransform: 'uppercase',
    },
    resultData: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.textPrimary,
      fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
    },
    resultActions: {
      gap: 10,
      marginTop: 4,
    },
    button: {
      backgroundColor: colors.buttonPrimary,
      borderRadius: 10,
      paddingVertical: 14,
      alignItems: 'center',
    },
    buttonText: {
      color: colors.buttonText,
      fontSize: 16,
      fontWeight: '600',
    },
    buttonSecondary: {
      backgroundColor: colors.buttonSecondary,
      borderRadius: 10,
      paddingVertical: 14,
      alignItems: 'center',
    },
    buttonSecondaryText: {
      color: colors.textPrimary,
      fontSize: 16,
      fontWeight: '600',
    },
    buttonSecondaryLight: {
      backgroundColor: colors.buttonSecondaryLight,
      borderRadius: 10,
      paddingVertical: 14,
      alignItems: 'center',
    },
    buttonSecondaryTextLight: {
      color: colors.buttonText,
      fontSize: 16,
      fontWeight: '600',
    },
  });
}
