import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import { Heading } from '@/components/ui/heading';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import type { UsePrintResult } from '../hook/usePrint';

export type PrintViewProps = Omit<
  UsePrintResult,
  'scannerKind' | 'closeScanner' | 'status'
>;

export function PrintView({
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
}: PrintViewProps) {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar style="dark" />
      <VStack className="flex-1 px-6 pt-8 gap-3.5">
        <Heading size="2xl" className="text-foreground">
          D110 Print PoC
        </Heading>
        <Text size="sm" className="text-muted-foreground mb-1">
          Print · scan Code 128 · scan QR · ID {labelId}
        </Text>

        <Card className="p-4 gap-2 border border-border bg-card">
          <Text size="xs" bold className="text-muted-foreground uppercase">
            Status
          </Text>
          <Text size="md" bold className="text-foreground">
            {deviceName ? `Connected: ${deviceName}` : 'Not connected'}
          </Text>
          {printerSummary ? (
            <Text size="sm" className="text-muted-foreground">
              {printerSummary}
            </Text>
          ) : null}
          <Text size="sm" className="text-muted-foreground leading-5">
            {message}
          </Text>
          <Text
            size="sm"
            className="text-foreground"
            style={{
              fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
            }}
          >
            ID: {labelId}
          </Text>
        </Card>

        {busy ? <Spinner size="large" /> : null}

        <Button variant="secondary" onPress={connect} disabled={busy}>
          <ButtonText>
            {deviceName ? 'Reconnect printer' : 'Connect printer'}
          </ButtonText>
        </Button>

        <Button
          variant="default"
          onPress={printBarcode}
          disabled={busy || !deviceName}
        >
          <ButtonText>Print Code 128 + digits</ButtonText>
        </Button>

        <Button
          variant="default"
          onPress={printQr}
          disabled={busy || !deviceName}
        >
          <ButtonText>Print max QR + digits</ButtonText>
        </Button>

        <Divider className="my-1" />

        <Button
          className="bg-green-900 data-[hover=true]:bg-green-900/90 data-[active=true]:bg-green-900/90"
          onPress={openBarcodeScanner}
          disabled={busy}
        >
          <ButtonText>Scan barcode</ButtonText>
        </Button>

        <Button
          className="bg-green-900 data-[hover=true]:bg-green-900/90 data-[active=true]:bg-green-900/90"
          onPress={openQrScanner}
          disabled={busy}
        >
          <ButtonText>Scan QR code</ButtonText>
        </Button>
      </VStack>
    </SafeAreaView>
  );
}
