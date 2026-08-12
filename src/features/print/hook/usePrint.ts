import { useMemo, useState } from 'react';
import {
  LabelType,
  NiimbotBluetoothClient,
} from 'react-native-niimblue-lib';
import {
  DEVICE_SCAN_TIMEOUT_MS,
  LABEL_ID,
  PRINT_DENSITY,
  REQUESTED_MTU,
} from '@/config/printer';
import type { ScannerKind } from '@/features/scan/hook/useScan';
import { buildBarcodePage } from '../labels/buildBarcodePage';
import { buildQrPage } from '../labels/buildQrPage';
import { requestBluetoothPermissions } from './permissions';

export type PrintStatus = 'idle' | 'working' | 'connected' | 'error';
export type PrintMode = 'barcode' | 'qr';

/** Optional MTU helpers (present on patched builds; not in upstream types). */
type PrinterWithMtu = NiimbotBluetoothClient & {
  setRequestedMtu?: (mtu: number) => void;
  getRequestedMtu?: () => number;
  getDeviceMtu?: () => number | null | undefined;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function usePrint() {
  const printer = useMemo(
    () => new NiimbotBluetoothClient() as PrinterWithMtu,
    [],
  );
  const [scannerKind, setScannerKind] = useState<ScannerKind | null>(null);
  const [status, setStatus] = useState<PrintStatus>('idle');
  const [message, setMessage] = useState('Turn on the D110, then connect.');
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [printerSummary, setPrinterSummary] = useState<string | null>(null);
  const busy = status === 'working';

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
      const devices = await printer.listDevices(DEVICE_SCAN_TIMEOUT_MS);

      if (devices.length === 0) {
        throw new Error('No printer found. Power on the D110 and try again.');
      }

      const device = devices[0];
      setMessage(`Connecting to ${device.name ?? device.id}…`);
      printer.setDebug(true);
      printer.setRequestedMtu?.(REQUESTED_MTU);
      const connection = await printer.connect(device);

      printer.stopHeartbeat();

      const info = printer.getPrinterInfo();
      const metadata = printer.getModelMetadata();
      const printTaskType = printer.getPrintTaskType();
      const deviceMtu = printer.getDeviceMtu?.();

      console.log(
        'NIIMBOT CONNECTION DIAGNOSTIC',
        JSON.stringify(
          {
            connection,
            info,
            metadata,
            printTaskType,
            bleConnected: printer.isConnected(),
            requestedMtu: printer.getRequestedMtu?.(),
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
        density: PRINT_DENSITY,
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

  return {
    labelId: LABEL_ID,
    scannerKind,
    status,
    message,
    deviceName,
    printerSummary,
    busy,
    connect,
    printBarcode: () => print('barcode'),
    printQr: () => print('qr'),
    openBarcodeScanner: () => setScannerKind('barcode'),
    openQrScanner: () => setScannerKind('qr'),
    closeScanner: () => setScannerKind(null),
  };
}

export type UsePrintResult = ReturnType<typeof usePrint>;
