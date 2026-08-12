import { useRef, useState } from 'react';
import {
  useCameraPermissions,
  type BarcodeScanningResult,
  type BarcodeType,
} from 'expo-camera';

export type ScannerKind = 'barcode' | 'qr';

export type ScanConfig = {
  title: string;
  hint: string;
  barcodeTypes: BarcodeType[];
};

const SCANNER_CONFIG: Record<ScannerKind, ScanConfig> = {
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

export function useScan(kind: ScannerKind) {
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

  return {
    kind,
    config,
    permission,
    requestPermission,
    result,
    onBarcodeScanned,
    scanAgain,
  };
}

export type UseScanResult = ReturnType<typeof useScan>;
