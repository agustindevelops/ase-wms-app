import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Scan } from '@/features/scan';
import { useTheme } from '@/theme';
import { usePrint } from './hook/usePrint';
import { PrintView } from './ui/PrintView';

/** Print feature container — wires hook handlers into dumb UI. */
export function Print() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const {
    scannerKind,
    closeScanner,
    labelId,
    message,
    deviceName,
    printerSummary,
    busy,
    connect,
    printBarcode,
    printQr,
    openBarcodeScanner,
    openQrScanner,
  } = usePrint();

  useEffect(() => {
    const parent = navigation.getParent();
    if (!parent) return;

    parent.setOptions({
      tabBarStyle: scannerKind
        ? { display: 'none' }
        : {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
          },
    });

    return () => {
      parent.setOptions({
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
      });
    };
  }, [scannerKind, navigation, colors.surface, colors.border]);

  if (scannerKind) {
    return <Scan kind={scannerKind} onClose={closeScanner} />;
  }

  return (
    <PrintView
      labelId={labelId}
      message={message}
      deviceName={deviceName}
      printerSummary={printerSummary}
      busy={busy}
      connect={connect}
      printBarcode={printBarcode}
      printQr={printQr}
      openBarcodeScanner={openBarcodeScanner}
      openQrScanner={openQrScanner}
    />
  );
}

export default Print;
