import { ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Box } from '@/components/ui/box';
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { QrPreview } from '@/features/manageWarehouse/ui/QrPreview';
import { CONNECT_PRINTER_CLASS } from '@/features/manageWarehouse/ui/buttonStyles';
import type { UseCatalogPrintQrResult } from '../hook/useCatalogPrintQr';

export type CatalogPrintQrViewProps = UseCatalogPrintQrResult & {
  onPrinted: () => void;
  onSkip: () => void;
};

export function CatalogPrintQrView({
  itemName,
  qrPayload,
  error,
  ensuring,
  replacing,
  showPrinterSetup,
  printerBusy,
  printerMessage,
  deviceName,
  printerSummary,
  connectPrinter,
  printLabel,
  replaceQr,
  onPrinted,
  onSkip,
}: CatalogPrintQrViewProps) {
  const busy = ensuring || replacing || printerBusy;
  const hasQr = Boolean(qrPayload);

  const onPrint = async () => {
    const ok = await printLabel();
    if (ok) onPrinted();
  };

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['bottom', 'left', 'right']}>
      <StatusBar style="dark" />
      <ScrollView className="flex-1">
        <VStack className="px-6 pt-4 pb-8 gap-3.5">
          <Text size="sm" className="text-brown-500">
            {hasQr
              ? `${itemName} already has a QR. Print the same code, or replace it and print a new label.`
              : `${itemName} is saved. Print a label now, or skip and print later.`}
          </Text>

          {hasQr ? (
            <Box className="self-start">
              <QrPreview value={qrPayload!} size={88} />
            </Box>
          ) : null}

          {error ? (
            <Text size="sm" bold className="text-destructive">
              {error}
            </Text>
          ) : null}

          {showPrinterSetup || deviceName ? (
            <Card className="p-4 gap-2">
              <Text size="xs" bold className="text-brown-500 uppercase">
                Printer
              </Text>
              <Text size="sm" className="text-brown-800">
                {deviceName
                  ? `Connected to ${deviceName}`
                  : 'A D110 printer is required to create a label.'}
              </Text>
              {printerSummary ? (
                <Text size="sm" className="text-brown-500">
                  {printerSummary}
                </Text>
              ) : null}
              {printerMessage ? (
                <Text size="sm" className="text-brown-500 leading-5">
                  {printerMessage}
                </Text>
              ) : null}
              {!deviceName ? (
                <Button
                  className={`mt-1 ${CONNECT_PRINTER_CLASS}`}
                  onPress={() => void connectPrinter()}
                  disabled={busy}
                >
                  {printerBusy ? <ButtonSpinner /> : null}
                  <ButtonText>Connect printer</ButtonText>
                </Button>
              ) : null}
            </Card>
          ) : null}

          {busy ? (
            <Box className="items-center py-2">
              <Spinner size="large" color="#7e9570" />
            </Box>
          ) : null}

          <Button
            className="mt-2"
            onPress={() => void onPrint()}
            disabled={busy}
          >
            {printerBusy ? <ButtonSpinner /> : null}
            <ButtonText>
              {deviceName ? `Print to ${deviceName}` : 'Print label'}
            </ButtonText>
          </Button>
          {hasQr ? (
            <Button
              variant="destructive"
              onPress={replaceQr}
              disabled={busy}
            >
              {replacing ? <ButtonSpinner /> : null}
              <ButtonText>Replace QR code</ButtonText>
            </Button>
          ) : null}
          <Button variant="outline" onPress={onSkip} disabled={busy}>
            <ButtonText>Skip printing</ButtonText>
          </Button>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}
