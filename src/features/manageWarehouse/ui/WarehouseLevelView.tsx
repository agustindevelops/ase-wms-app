import { RefreshControl, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  locationQrPayload,
  type LocationUnit,
} from '@/api/warehouse';
import { Box } from '@/components/ui/box';
import { ButtonSpinner, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { ActionLockProvider } from '../hook/useActionLock';
import type { UseWarehouseLevelResult } from '../hook/useWarehouseLevel';
import { CONNECT_PRINTER_CLASS } from './buttonStyles';
import { OnceButton, OncePressable } from './OnceButton';
import { QrPreview } from './QrPreview';
import { showLocationActions } from './showLocationActions';

export type WarehouseLevelViewProps = UseWarehouseLevelResult & {
  warehouseName: string;
  parentName?: string;
  ancestorNames: string[];
  level: number;
  printerBusy: boolean;
  printerMessage: string;
  deviceName: string | null;
  isRoot: boolean;
  onAdd: () => void;
  onEdit: (unit: LocationUnit) => void;
  onEditCurrent: () => void;
  onPrint: (unit: LocationUnit) => void | Promise<void>;
  onLinkQr: (unit: LocationUnit) => void;
  onPrintAll: () => void | Promise<void>;
  onOpen: (unit: LocationUnit) => void;
  onPrinterPress: () => void | Promise<void>;
};

export function WarehouseLevelView({
  warehouseName,
  parentName,
  ancestorNames,
  currentUnit,
  warehouse,
  level,
  units,
  addressText,
  error,
  loading,
  refreshing,
  deletingId,
  load,
  confirmDelete,
  printerBusy,
  printerMessage,
  deviceName,
  isRoot,
  onAdd,
  onEdit,
  onEditCurrent,
  onPrint,
  onLinkQr,
  onPrintAll,
  onOpen,
  onPrinterPress,
}: WarehouseLevelViewProps) {
  const title = currentUnit?.name ?? parentName ?? warehouse?.name ?? warehouseName;
  const currentQr = currentUnit ? locationQrPayload(currentUnit) : null;
  const canEditCurrent = isRoot || Boolean(currentUnit);
  const busy = loading || deletingId !== null || printerBusy;
  const breadcrumb = ancestorNames.length > 0 ? ancestorNames.join(' · ') : null;

  const onLongPress = (unit: LocationUnit) => {
    if (busy) return;
    showLocationActions({
      unit,
      onEdit,
      onDelete: confirmDelete,
      onPrint,
      onLinkQr,
    });
  };

  return (
    <ActionLockProvider>
      <SafeAreaView className="flex-1 bg-cream" edges={['bottom', 'left', 'right']}>
      <StatusBar style="dark" />
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void load('refresh')}
            tintColor="#7e9570"
          />
        }
      >
        <VStack className="px-6 pt-4 pb-8 gap-3">
          <HStack className="items-start gap-3">
            <VStack className="flex-1 min-w-0 gap-1">
              <Heading size="xl" className="text-brown-900">
                {title}
              </Heading>
              {breadcrumb ? (
                <Text
                  size="sm"
                  className="text-brown-500"
                  numberOfLines={4}
                >
                  {breadcrumb}
                </Text>
              ) : null}
            </VStack>
            {currentQr ? <QrPreview value={currentQr} size={56} /> : null}
          </HStack>

          {addressText ? (
            <Text size="sm" className="text-brown-700">
              {addressText}
            </Text>
          ) : null}

          <OnceButton
            size="sm"
            variant="outline"
            onPress={onEditCurrent}
            disabled={busy || !canEditCurrent}
          >
            <ButtonText>
              {isRoot ? 'Edit warehouse' : 'Edit'}
            </ButtonText>
          </OnceButton>

          {currentUnit && !currentQr ? (
            <OnceButton
              size="sm"
              variant="outline"
              onPress={() => onLinkQr(currentUnit)}
              disabled={busy}
            >
              <ButtonText>Link existing QR</ButtonText>
            </OnceButton>
          ) : null}

          <Text size="xs" className="text-brown-500">
            Tap a row to open the next level. Hold for edit, print, link QR, or delete.
          </Text>

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

          <OnceButton onPress={onAdd} disabled={busy}>
            <ButtonText>Add Level {level}</ButtonText>
          </OnceButton>

          <OnceButton
            variant={deviceName ? 'secondary' : 'default'}
            onPress={onPrinterPress}
            disabled={busy}
            className={deviceName ? undefined : CONNECT_PRINTER_CLASS}
          >
            {printerBusy ? <ButtonSpinner /> : null}
            <ButtonText>
              {!deviceName
                ? 'Connect printer'
                : currentUnit
                  ? `Print to ${deviceName}`
                  : `Connected to ${deviceName}`}
            </ButtonText>
          </OnceButton>

          {deviceName && units.length > 0 ? (
            <OnceButton
              variant="outline"
              onPress={onPrintAll}
              disabled={busy}
            >
              <ButtonText>
                {`Print all ${units.length} labels`}
              </ButtonText>
            </OnceButton>
          ) : null}

          {printerMessage ? (
            <Text size="sm" className="text-brown-500">
              {printerMessage}
            </Text>
          ) : null}

          {loading && units.length === 0 ? (
            <Box className="py-8 items-center">
              <Spinner />
            </Box>
          ) : null}

          {!loading && units.length === 0 && !error ? (
            <Text size="sm" className="text-brown-500">
              No locations at this level yet. Add one to get started.
            </Text>
          ) : null}

          {units.map((unit) => {
            const qrPayload = locationQrPayload(unit);
            return (
              <HStack
                key={unit.id}
                className="items-center gap-2 rounded-xl border border-border bg-card px-2 py-2"
              >
                <OncePressable
                  onPress={() => onOpen(unit)}
                  onLongPress={() => onLongPress(unit)}
                  delayLongPress={280}
                  disabled={busy}
                  className="flex-1 min-w-0"
                >
                  <HStack className="items-center gap-2.5">
                    {qrPayload ? (
                      <QrPreview value={qrPayload} size={28} />
                    ) : null}
                    <Text
                      size="md"
                      bold
                      isTruncated
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      className="flex-1 min-w-0 text-brown-900"
                    >
                      {unit.name}
                    </Text>
                    <Text
                      size="sm"
                      isTruncated
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      className="shrink-0 max-w-[32%] text-brown-500"
                    >
                      {unit.type.name}
                    </Text>
                  </HStack>
                </OncePressable>
                {!qrPayload ? (
                  <OnceButton
                    size="sm"
                    variant="ghost"
                    onPress={() => onLinkQr(unit)}
                    disabled={busy}
                    className="shrink-0"
                  >
                    <ButtonText>Link QR</ButtonText>
                  </OnceButton>
                ) : null}
                <OnceButton
                  size="sm"
                  variant="ghost"
                  onPress={() => onEdit(unit)}
                  disabled={busy}
                  className="shrink-0"
                >
                  <ButtonText>Edit</ButtonText>
                </OnceButton>
              </HStack>
            );
          })}
        </VStack>
      </ScrollView>
      </SafeAreaView>
    </ActionLockProvider>
  );
}
