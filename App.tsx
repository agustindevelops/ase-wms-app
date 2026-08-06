import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  LabelType,
  NiimbotBluetoothClient,
  PrintPage,
} from 'react-native-niimblue-lib';
import ScannerScreen, { type ScannerKind } from './ScannerScreen';

/** Shared ID for Code 128 and QR label tests. */
const LABEL_ID = '12345678';
/** Android BLE default is 23 (20-byte payload) — too small for bitmap rows. */
const REQUESTED_MTU = 128;

type Status = 'idle' | 'working' | 'connected' | 'error';
type PrintMode = 'barcode' | 'qr';
type Screen = 'home' | ScannerKind;

type EncodedImage = ReturnType<PrintPage['toEncodedImage']>;

/**
 * 5×7 digit glyphs (rows of 5 bits, MSB = left). Used because addText()
 * needs Skia and this PoC stubs Skia for barcode/QR-only builds.
 */
const DIGIT_GLYPHS: Record<string, number[]> = {
  '0': [0b01110, 0b10001, 0b10011, 0b10101, 0b11001, 0b10001, 0b01110],
  '1': [0b00100, 0b01100, 0b00100, 0b00100, 0b00100, 0b00100, 0b01110],
  '2': [0b01110, 0b10001, 0b00001, 0b00010, 0b00100, 0b01000, 0b11111],
  '3': [0b01110, 0b10001, 0b00001, 0b00110, 0b00001, 0b10001, 0b01110],
  '4': [0b00010, 0b00110, 0b01010, 0b10010, 0b11111, 0b00010, 0b00010],
  '5': [0b11111, 0b10000, 0b11110, 0b00001, 0b00001, 0b10001, 0b01110],
  '6': [0b00110, 0b01000, 0b10000, 0b11110, 0b10001, 0b10001, 0b01110],
  '7': [0b11111, 0b00001, 0b00010, 0b00100, 0b01000, 0b01000, 0b01000],
  '8': [0b01110, 0b10001, 0b10001, 0b01110, 0b10001, 0b10001, 0b01110],
  '9': [0b01110, 0b10001, 0b10001, 0b01111, 0b00001, 0b00010, 0b01100],
};

function addBitmapText(
  page: PrintPage,
  text: string,
  options: {
    x: number;
    y: number;
    scale?: number;
    align?: 'left' | 'center' | 'right';
    vAlign?: 'top' | 'middle' | 'bottom';
  },
): void {
  const scale = options.scale ?? 2;
  const glyphW = 5;
  const glyphH = 7;
  const gap = 1;
  const cellW = glyphW + gap;
  const width = Math.round(text.length * cellW * scale - gap * scale);
  const height = Math.round(glyphH * scale);

  let originX = options.x;
  if (options.align === 'center') originX -= Math.floor(width / 2);
  if (options.align === 'right') originX -= width;

  let originY = options.y;
  if (options.vAlign === 'middle') originY -= Math.floor(height / 2);
  if (options.vAlign === 'bottom') originY -= height;

  const pixels: number[] = [];
  for (let row = 0; row < glyphH; row++) {
    for (let col = 0; col < text.length * cellW - gap; col++) {
      const charIndex = Math.floor(col / cellW);
      const bit = col % cellW;
      const ch = text[charIndex];
      const glyph = DIGIT_GLYPHS[ch];
      const on =
        glyph !== undefined && bit < glyphW && (glyph[row] & (1 << (4 - bit))) !== 0
          ? 1
          : 0;
      pixels.push(on);
    }
  }

  page.addPixelData({
    data: pixels,
    imageWidth: text.length * cellW - gap,
    imageHeight: glyphH,
    x: originX,
    y: originY,
    width,
    height,
    align: 'left',
    vAlign: 'top',
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestBluetoothPermissions(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }

  if (Platform.Version >= 31) {
    const result = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    ]);

    return (
      result[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] ===
        PermissionsAndroid.RESULTS.GRANTED &&
      result[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] ===
        PermissionsAndroid.RESULTS.GRANTED &&
      result[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] ===
        PermissionsAndroid.RESULTS.GRANTED
    );
  }

  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  );
  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

function assertEncodedSize(
  encoded: EncodedImage,
  cols: number,
  rows: number,
): EncodedImage {
  if (encoded.cols !== cols || encoded.rows !== rows) {
    throw new Error(
      `Incorrect image size: ${encoded.cols}×${encoded.rows}; expected ${cols}×${rows}`,
    );
  }
  return encoded;
}

/**
 * Full-length Code 128 with human-readable digits underneath.
 * Landscape canvas is 240×96 — barcode uses most of the height; digits sit below.
 */
function buildBarcodePage(): EncodedImage {
  const page = new PrintPage(96, 240, 'landscape');

  page.addBarcode(LABEL_ID, {
    encoding: 'CODE128',
    x: 120,
    y: 34,
    width: 240,
    height: 68,
    align: 'center',
    vAlign: 'middle',
  });

  addBitmapText(page, LABEL_ID, {
    x: 120,
    y: 84,
    scale: 2,
    align: 'center',
    vAlign: 'middle',
  });

  return assertEncodedSize(page.toEncodedImage(), 96, 240);
}

/**
 * Max-height QR at design left; digits just to its right.
 * Remaining space further right is free for a future product name.
 */
function buildQrPage(): EncodedImage {
  const page = new PrintPage(96, 240, 'landscape');
  const qrSize = 96;
  const gap = 6;

  page.addQR(LABEL_ID, {
    x: 0,
    y: 48,
    width: qrSize,
    height: qrSize,
    align: 'left',
    vAlign: 'middle',
    ecl: 'M',
  });

  // Slightly under the original scale 3 so digits fit without crowding.
  addBitmapText(page, LABEL_ID, {
    x: qrSize + gap,
    y: 48,
    scale: 2.5,
    align: 'left',
    vAlign: 'middle',
  });

  return assertEncodedSize(page.toEncodedImage(), 96, 240);
}

export default function App() {
  const printer = useMemo(() => new NiimbotBluetoothClient(), []);
  const [screen, setScreen] = useState<Screen>('home');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('Turn on the D110, then connect.');
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [printerSummary, setPrinterSummary] = useState<string | null>(null);
  const busy = status === 'working';

  if (screen === 'barcode' || screen === 'qr') {
    return (
      <ScannerScreen kind={screen} onClose={() => setScreen('home')} />
    );
  }

  const connect = async () => {
    setStatus('working');
    setMessage('Requesting Bluetooth permissions…');
    setPrinterSummary(null);

    try {
      const allowed = await requestBluetoothPermissions();
      if (!allowed) {
        throw new Error('Bluetooth permissions were denied');
      }

      setMessage('Scanning for NIIMBOT / D110 printers…');
      const devices = await printer.listDevices(8_000);

      if (devices.length === 0) {
        throw new Error('No printer found. Power on the D110 and try again.');
      }

      const device = devices[0];
      setMessage(`Connecting to ${device.name ?? device.id}…`);
      printer.setDebug(true);
      printer.setRequestedMtu(REQUESTED_MTU);
      const connection = await printer.connect(device);

      printer.stopHeartbeat();

      const info = printer.getPrinterInfo();
      const metadata = printer.getModelMetadata();
      const printTaskType = printer.getPrintTaskType();
      const deviceMtu = printer.getDeviceMtu();

      console.log(
        'NIIMBOT CONNECTION DIAGNOSTIC',
        JSON.stringify(
          {
            connection,
            info,
            metadata,
            printTaskType,
            bleConnected: printer.isConnected(),
            requestedMtu: printer.getRequestedMtu(),
            deviceMtu,
          },
          null,
          2,
        ),
      );

      if (!info.modelId || !metadata || !printTaskType) {
        await printer.disconnect();
        throw new Error(
          'Bluetooth connected, but NIIMBOT protocol negotiation failed.',
        );
      }

      setPrinterSummary(
        `${metadata.model} · head ${metadata.printheadPixels}px · task ${printTaskType} · MTU ${deviceMtu ?? '?'}`,
      );
      setDeviceName(device.name ?? device.id);
      setStatus('connected');
      setMessage('Connected. Choose Code 128 or QR.');
    } catch (error) {
      setStatus('error');
      setDeviceName(null);
      setPrinterSummary(null);
      setMessage(error instanceof Error ? error.message : String(error));
      console.error('Connect failed', error);
    }
  };

  const print = async (mode: PrintMode) => {
    setStatus('working');
    setMessage(
      mode === 'barcode'
        ? `Printing Code 128 + digits: ${LABEL_ID}…`
        : `Printing max QR + digits: ${LABEL_ID}…`,
    );

    let task: ReturnType<typeof printer.createPrintTask> | undefined;

    try {
      if (!printer.isConnected()) {
        throw new Error('Printer BLE connection is not active');
      }

      printer.setDebug(true);
      printer.stopHeartbeat();
      await sleep(300);

      const encoded =
        mode === 'barcode' ? buildBarcodePage() : buildQrPage();

      const totalBlackPixels = encoded.rowsData.reduce(
        (total, row) => total + row.blackPixelsCount * row.repeat,
        0,
      );
      console.log('Encoded image', {
        cols: encoded.cols,
        rows: encoded.rows,
        totalBlackPixels,
      });

      if (totalBlackPixels <= 0) {
        throw new Error(
          'Encoded image has 0 black pixels — printer would correctly feed a blank label.',
        );
      }

      task = printer.createPrintTask({
        totalPages: 1,
        density: 2,
        labelType: LabelType.WithGaps,
        statusPollIntervalMs: 300,
        statusTimeoutMs: 10_000,
        pageTimeoutMs: 15_000,
      });

      if (!task) {
        throw new Error('Printer connected but no D110 print task was selected');
      }

      setMessage('printInit…');
      await task.printInit();

      setMessage(`printPage (${encoded.cols}×${encoded.rows})…`);
      await task.printPage(encoded, 1);

      setMessage('Waiting for printer…');
      await task.waitForFinished();

      setStatus('connected');
      setMessage(
        mode === 'barcode'
          ? `Code 128 + digits printed: ${LABEL_ID}`
          : `Max QR + digits printed: ${LABEL_ID}`,
      );
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : String(error));
      console.error('Print failed', error);
    } finally {
      try {
        await task?.printEnd?.();
      } catch (error) {
        console.warn('Print-end cleanup failed:', error);
      }
      printer.stopHeartbeat();
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <Text style={styles.title}>D110 Print PoC</Text>
        <Text style={styles.subtitle}>
          Print · scan Code 128 · scan QR · ID {LABEL_ID}
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>Status</Text>
          <Text style={styles.value}>
            {deviceName ? `Connected: ${deviceName}` : 'Not connected'}
          </Text>
          {printerSummary ? (
            <Text style={styles.meta}>{printerSummary}</Text>
          ) : null}
          <Text style={styles.message}>{message}</Text>
          <Text style={styles.id}>ID: {LABEL_ID}</Text>
        </View>

        {busy ? <ActivityIndicator size="large" color="#111" /> : null}

        <Pressable
          style={[styles.button, busy && styles.buttonDisabled]}
          onPress={connect}
          disabled={busy}
        >
          <Text style={styles.buttonText}>
            {deviceName ? 'Reconnect printer' : 'Connect printer'}
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.button,
            styles.buttonPrimary,
            (busy || !deviceName) && styles.buttonDisabled,
          ]}
          onPress={() => print('barcode')}
          disabled={busy || !deviceName}
        >
          <Text style={styles.buttonText}>Print Code 128 + digits</Text>
        </Pressable>

        <Pressable
          style={[
            styles.button,
            styles.buttonPrimary,
            (busy || !deviceName) && styles.buttonDisabled,
          ]}
          onPress={() => print('qr')}
          disabled={busy || !deviceName}
        >
          <Text style={styles.buttonText}>Print max QR + digits</Text>
        </Pressable>

        <View style={styles.divider} />

        <Pressable
          style={[styles.button, styles.buttonScan, busy && styles.buttonDisabled]}
          onPress={() => setScreen('barcode')}
          disabled={busy}
        >
          <Text style={styles.buttonText}>Scan barcode</Text>
        </Pressable>

        <Pressable
          style={[styles.button, styles.buttonScan, busy && styles.buttonDisabled]}
          onPress={() => setScreen('qr')}
          disabled={busy}
        >
          <Text style={styles.buttonText}>Scan QR code</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f4f4f5',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    gap: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111',
  },
  subtitle: {
    fontSize: 14,
    color: '#52525b',
    marginBottom: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#e4e4e7',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#71717a',
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#18181b',
  },
  meta: {
    fontSize: 13,
    color: '#3f3f46',
  },
  message: {
    fontSize: 14,
    color: '#3f3f46',
    lineHeight: 20,
  },
  id: {
    fontSize: 14,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
    color: '#111',
  },
  button: {
    backgroundColor: '#3f3f46',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#18181b',
  },
  buttonScan: {
    backgroundColor: '#14532d',
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#e4e4e7',
    marginVertical: 4,
  },
});
