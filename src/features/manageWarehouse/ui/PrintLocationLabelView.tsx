import { Platform, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Box } from '@/components/ui/box';
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import type { UsePrintLocationLabelResult } from '../hook/usePrintLocationLabel';

export type PrintLocationLabelViewProps = UsePrintLocationLabelResult;

export function PrintLocationLabelView({
  unit,
  qrPayload,
  error,
  loading,
  ensuring,
  sharing,
  printerBusy,
  printerMessage,
  deviceName,
  printerSummary,
  load,
  ensureQr,
  shareLabel,
  connectPrinter,
  printLabel,
}: PrintLocationLabelViewProps) {
  const busy = loading || ensuring || sharing || printerBusy;

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['bottom', 'left', 'right']}>
      <StatusBar style="dark" />
      <ScrollView className="flex-1">
        <VStack className="px-6 pt-4 pb-8 gap-3.5">
          {unit ? (
            <Text size="sm" className="text-brown-500">
              {[unit.name, unit.label, unit.type.name]
                .filter(Boolean)
                .join(' · ')}
            </Text>
          ) : null}

          {loading ? (
            <Box className="py-8 items-center">
              <Spinner />
            </Box>
          ) : null}

          {error ? (
            <VStack className="gap-2">
              <Text size="sm" bold className="text-destructive">
                {error}
              </Text>
              <Button
                variant="secondary"
                onPress={() => void load()}
                disabled={busy}
              >
                {loading ? <ButtonSpinner /> : null}
                <ButtonText>Retry</ButtonText>
              </Button>
            </VStack>
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
                ? `Printer: ${deviceName}`
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

          {busy && !loading ? <Spinner size="large" color="#7e9570" /> : null}

          {!qrPayload ? (
            <Button onPress={() => void ensureQr()} disabled={busy || !unit}>
              {ensuring ? <ButtonSpinner /> : null}
              <ButtonText>Create QR code</ButtonText>
            </Button>
          ) : null}

          <Button
            variant="secondary"
            onPress={() => void connectPrinter()}
            disabled={busy}
          >
            <ButtonText>
              {deviceName ? 'Reconnect printer' : 'Connect printer'}
            </ButtonText>
          </Button>

          <Button
            onPress={() => void printLabel()}
            disabled={busy || !unit}
          >
            {printerBusy ? <ButtonSpinner /> : null}
            <ButtonText>Print QR label</ButtonText>
          </Button>

          <Button
            variant="outline"
            onPress={() => void shareLabel()}
            disabled={busy || !unit}
          >
            {sharing ? <ButtonSpinner /> : null}
            <ButtonText>Share label</ButtonText>
          </Button>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}
