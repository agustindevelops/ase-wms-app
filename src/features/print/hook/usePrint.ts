import { useMemo, useState } from 'react';
import {
  LabelType,
  NiimbotBluetoothClient,
} from 'react-native-niimblue-lib';
import { useAppToast } from '@/components/ui/toast';
import {
  DEVICE_SCAN_TIMEOUT_MS,
  PRINT_DENSITY,
  REQUESTED_MTU,
} from '@/config/printer';
import { buildQrPage } from '../labels/buildQrPage';
import { requestBluetoothPermissions } from './permissions';

function toMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export type PrintStatus = 'idle' | 'working' | 'connected' | 'error';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function usePrint() {
  const toast = useAppToast();
  const printer = useMemo(() => new NiimbotBluetoothClient(), []);
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
      // Requires patches/react-native-niimblue-lib+1.2.1.patch; without the
      // larger MTU the printer accepts commands but never receives bitmap rows.
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
      setMessage('Connected.');
    } catch (error) {
      const message = toMessage(error);
      setStatus('error');
      setDeviceName(null);
      setPrinterSummary(null);
      setMessage(message);
      toast.error(message);
    }
  };

  const printQrPayload = async (payload: string, labelText?: string) => {
    setStatus('working');
    setMessage(`Printing label: ${labelText?.trim() || payload}…`);

    let task: ReturnType<typeof printer.createPrintTask> | undefined;

    try {
      if (!printer.isConnected()) {
        throw new Error('Printer BLE connection is not active');
      }

      printer.setDebug(true);
      printer.stopHeartbeat();
      await sleep(300);

      const encoded = buildQrPage(payload, { text: labelText });

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
      setMessage(`Printed: ${labelText?.trim() || payload}`);
    } catch (error) {
      const message = toMessage(error);
      setStatus('error');
      setMessage(message);
      toast.error(message);
      throw error;
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
    status,
    message,
    deviceName,
    printerSummary,
    busy,
    connect,
    printQrPayload,
  };
}

export type UsePrintResult = ReturnType<typeof usePrint>;
