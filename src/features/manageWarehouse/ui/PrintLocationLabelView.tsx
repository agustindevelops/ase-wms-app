import { Platform, RefreshControl, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Box } from '@/components/ui/box';
import { ButtonSpinner, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { ActionLockProvider } from '../hook/useActionLock';
import type { UsePrintLocationLabelResult } from '../hook/usePrintLocationLabel';
import { CONNECT_PRINTER_CLASS } from './buttonStyles';
import { OnceButton } from './OnceButton';
import { QrPreview } from './QrPreview';

export type PrintLocationLabelViewProps = UsePrintLocationLabelResult & {
  onScanExisting?: () => void;
};

export function PrintLocationLabelView({
  unit,
  qrPayload,
  error,
  loading,
  refreshing,
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
  onScanExisting,
}: PrintLocationLabelViewProps) {
  const busy = loading || ensuring || sharing || printerBusy;

  return (
    <ActionLockProvider>
    <SafeAreaView className="flex-1 bg-cream" edges={['bottom', 'left', 'right']}>
      <StatusBar style="dark" />
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void load(true)}
            tintColor="#7e9570"
          />
        }
      >
        <VStack className="px-6 pt-4 pb-8 gap-3.5">
          {unit ? (
            <HStack className="items-start gap-3">
              <VStack className="flex-1 min-w-0 gap-1">
                <Text size="sm" className="text-brown-500">
                  {[unit.name, unit.label, unit.type.name]
                    .filter(Boolean)
                    .join(' · ')}
                </Text>
                <Text size="sm" className="text-brown-500">
                  {qrPayload
                    ? 'This location already has a QR. Print uses the same code.'
                    : 'Create a location QR (type 1) to print, or scan an existing label to link it.'}
                </Text>
              </VStack>
              {qrPayload ? <QrPreview value={qrPayload} size={72} /> : null}
            </HStack>
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
              <OnceButton
                variant="secondary"
                onPress={() => load()}
                disabled={busy}
              >
                {loading ? <ButtonSpinner /> : null}
                <ButtonText>Retry</ButtonText>
              </OnceButton>
            </VStack>
          ) : null}

          <Card className="p-4 gap-2">
            <Text size="xs" bold className="text-brown-500 uppercase">
              QR payload
            </Text>
            <Text
              size="sm"
              className="text-brown-800"
              style={{
                fontFamily: Platform.select({
                  ios: 'Menlo',
                  android: 'monospace',
                }),
              }}
            >
              {qrPayload ?? 'Not created yet'}
            </Text>
            <Text size="sm" className="text-brown-500 leading-5">
              {deviceName
                ? `Print to ${deviceName}`
                : 'Connect a D110 to print, or share the payload.'}
            </Text>
            {printerSummary ? (
              <Text size="sm" className="text-brown-500">
                {printerSummary}
              </Text>
            ) : null}
            <Text size="sm" className="text-brown-500 leading-5">
              {printerMessage}
            </Text>
          </Card>

          {busy && !loading ? <Spinner size="large" color="#7e9570" /> : null}

          {!qrPayload ? (
            <OnceButton onPress={() => ensureQr()} disabled={busy || !unit}>
              {ensuring ? <ButtonSpinner /> : null}
              <ButtonText>Create QR code</ButtonText>
            </OnceButton>
          ) : null}

          {!qrPayload && onScanExisting ? (
            <OnceButton
              variant="outline"
              onPress={onScanExisting}
              disabled={busy || !unit}
            >
              <ButtonText>Scan existing label</ButtonText>
            </OnceButton>
          ) : null}

          <OnceButton
            variant={deviceName ? 'outline' : 'default'}
            className={deviceName ? undefined : CONNECT_PRINTER_CLASS}
            onPress={() => connectPrinter()}
            disabled={busy}
          >
            <ButtonText>
              {deviceName ? 'Reconnect printer' : 'Connect printer'}
            </ButtonText>
          </OnceButton>

          {deviceName ? (
            <OnceButton
              variant="secondary"
              onPress={() => printLabel()}
              disabled={busy || !unit}
            >
              {printerBusy ? <ButtonSpinner /> : null}
              <ButtonText>{`Print to ${deviceName}`}</ButtonText>
            </OnceButton>
          ) : null}

          <OnceButton
            variant="outline"
            onPress={() => shareLabel()}
            disabled={busy || !unit}
          >
            {sharing ? <ButtonSpinner /> : null}
            <ButtonText>Share label</ButtonText>
          </OnceButton>
        </VStack>
      </ScrollView>
    </SafeAreaView>
    </ActionLockProvider>
  );
}
