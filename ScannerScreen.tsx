import { useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  CameraView,
  useCameraPermissions,
  type BarcodeScanningResult,
  type BarcodeType,
} from 'expo-camera';
import { StatusBar } from 'expo-status-bar';

export type ScannerKind = 'barcode' | 'qr';

type Props = {
  kind: ScannerKind;
  onClose: () => void;
};

const SCANNER_CONFIG: Record<
  ScannerKind,
  { title: string; hint: string; barcodeTypes: BarcodeType[] }
> = {
  barcode: {
    title: 'Scan Code 128',
    hint: 'Point at the printed barcode',
    barcodeTypes: ['code128'],
  },
  qr: {
    title: 'Scan QR code',
    hint: 'Point at the printed QR code',
    barcodeTypes: ['qr'],
  },
};

export default function ScannerScreen({ kind, onClose }: Props) {
  const config = SCANNER_CONFIG[kind];
  const [permission, requestPermission] = useCameraPermissions();
  const [result, setResult] = useState<BarcodeScanningResult | null>(null);
  const locked = useRef(false);

  const onBarcodeScanned = (scan: BarcodeScanningResult) => {
    if (locked.current) return;
    locked.current = true;
    setResult(scan);
  };

  const scanAgain = () => {
    locked.current = false;
    setResult(null);
  };

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
            Camera access is required to scan {kind === 'qr' ? 'QR codes' : 'barcodes'}.
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

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f4f4f5',
    justifyContent: 'center',
    padding: 24,
  },
  permissionBox: {
    gap: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111',
  },
  message: {
    fontSize: 15,
    color: '#3f3f46',
    lineHeight: 22,
  },
  cameraRoot: {
    flex: 1,
    backgroundColor: '#000',
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
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  overlayHint: {
    color: '#d4d4d8',
    fontSize: 14,
  },
  frame: {
    alignSelf: 'center',
    width: '72%',
    aspectRatio: 1,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.85)',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    gap: 10,
  },
  resultLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#71717a',
    textTransform: 'uppercase',
  },
  resultData: {
    fontSize: 20,
    fontWeight: '700',
    color: '#18181b',
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
  },
  resultActions: {
    gap: 10,
    marginTop: 4,
  },
  button: {
    backgroundColor: '#18181b',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSecondary: {
    backgroundColor: '#e4e4e7',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonSecondaryText: {
    color: '#18181b',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSecondaryLight: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonSecondaryTextLight: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
