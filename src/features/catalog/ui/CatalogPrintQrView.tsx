import { Platform, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Box } from '@/components/ui/box';
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { QrPreview } from '@/features/manageWarehouse/ui/QrPreview';
import { CONNECT_PRINTER_CLASS } from '@/features/manageWarehouse/ui/buttonStyles';
import type { UseCatalogPrintQrResult } from '../hook/useCatalogPrintQr';

export type CatalogPrintQrViewProps = UseCatalogPrintQrResult & {
  onContinue: () => void;
  onSkip: () => void;
};

export function CatalogPrintQrView({
  itemName,
  qrPayload,
  error,
  ensuring,
  replacing,
  sharing,
  printerBusy,
  printerMessage,
  deviceName,
  printerSummary,
  ensureQr,
  replaceQr,
  shareLabel,
  connectPrinter,
  printLabel,
  onContinue,
  onSkip,
}: CatalogPrintQrViewProps) {
  const busy = ensuring || replacing || sharing || printerBusy;

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['bottom', 'left', 'right']}>
      <StatusBar style="dark" />
      <ScrollView className="flex-1">
        <VStack className="px-6 pt-4 pb-8 gap-3.5">
          <HStack className="items-start gap-3">
            <VStack className="flex-1 min-w-0 gap-1">
              <Text size="sm" className="text-brown-500">
                {itemName}
              </Text>
              <Text size="sm" className="text-brown-500">
                Create and print an item QR (type 0), then glue it to the item.
              </Text>
            </VStack>
            {qrPayload ? <QrPreview value={qrPayload} size={72} /> : null}
          </HStack>

          {error ? (
            <Text size="sm" bold className="text-destructive">
              {error}
            </Text>
          ) : null}

          <Card className="p-4 gap-2 border border-border bg-card">
            <Text size="xs" bold className="text-muted-foreground uppercase">
              QR payload
            </Text>
            <Text
              size="sm"
              className="text-foreground"
              style={{
                fontFamily: Platform.select({
                  ios: 'Menlo',
                  android: 'monospace',
                }),
              }}
            >
              {qrPayload ?? 'Not created yet'}
            </Text>
            <Text size="sm" className="text-muted-foreground leading-5">
              {deviceName
                ? `Print to ${deviceName}`
                : 'Connect a D110 to print, or share the payload.'}
            </Text>
            {printerSummary ? (
              <Text size="sm" className="text-muted-foreground">
                {printerSummary}
              </Text>
            ) : null}
            <Text size="sm" className="text-muted-foreground leading-5">
              {printerMessage}
            </Text>
          </Card>

          {busy ? (
            <Box className="items-center py-2">
              <Spinner size="large" color="#7e9570" />
            </Box>
          ) : null}

          {!qrPayload ? (
            <Button onPress={() => void ensureQr()} disabled={busy}>
              {ensuring ? <ButtonSpinner /> : null}
              <ButtonText>Create QR code</ButtonText>
            </Button>
          ) : null}

          <Button
            variant={deviceName ? 'outline' : 'default'}
            className={deviceName ? undefined : CONNECT_PRINTER_CLASS}
            onPress={() => void connectPrinter()}
            disabled={busy}
          >
            <ButtonText>
              {deviceName ? 'Reconnect printer' : 'Connect printer'}
            </ButtonText>
          </Button>

          {deviceName ? (
            <Button
              variant="secondary"
              onPress={() => void printLabel()}
              disabled={busy}
            >
              {printerBusy ? <ButtonSpinner /> : null}
              <ButtonText>{`Print to ${deviceName}`}</ButtonText>
            </Button>
          ) : null}

          <Button
            variant="outline"
            onPress={() => void shareLabel()}
            disabled={busy}
          >
            {sharing ? <ButtonSpinner /> : null}
            <ButtonText>Share label</ButtonText>
          </Button>

          {qrPayload ? (
            <Button
              variant="outline"
              onPress={() => void replaceQr()}
              disabled={busy}
            >
              {replacing ? <ButtonSpinner /> : null}
              <ButtonText>Replace QR</ButtonText>
            </Button>
          ) : null}

          <Button
            className="mt-2"
            onPress={onContinue}
            disabled={busy || !qrPayload}
          >
            <ButtonText>I printed the label</ButtonText>
          </Button>
          <Button variant="outline" onPress={onSkip} disabled={busy}>
            <ButtonText>Skip printing</ButtonText>
          </Button>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}
