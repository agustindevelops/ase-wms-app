import { View } from 'react-native';
import type { PrinterSignal } from '../hook/usePrint';

const COLOR: Record<PrinterSignal, string> = {
  connected: '#5a8a4a',
  error: '#c45c4a',
  off: '#c4b5a5',
  idle: '#d4a017',
};

const LABEL: Record<PrinterSignal, string> = {
  connected: 'Printer connected',
  error: 'Printer error',
  off: 'Bluetooth off',
  idle: 'Printer not connected yet',
};

export function PrinterStatusIcon({ signal }: { signal: PrinterSignal }) {
  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={LABEL[signal]}
      style={{
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: COLOR[signal],
        opacity: signal === 'off' ? 0.55 : 1,
      }}
    />
  );
}
