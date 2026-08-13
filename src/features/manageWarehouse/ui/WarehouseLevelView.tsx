import { RefreshControl, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  locationQrPayload,
  type LocationUnit,
} from '@/api/warehouse';
import { Box } from '@/components/ui/box';
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import type { UseWarehouseLevelResult } from '../hook/useWarehouseLevel';
import { QrPreview } from './QrPreview';
import { showLocationActions } from './showLocationActions';

export type WarehouseLevelViewProps = UseWarehouseLevelResult & {
  warehouseName: string;
  parentName?: string;
  ancestorNames: string[];
  level: number;
  printerConnected: boolean;
  printerBusy: boolean;
  printerMessage: string;
  deviceName: string | null;
  printing: boolean;
  isRoot: boolean;
  onAdd: () => void;
  onEdit: (unit: LocationUnit) => void;
  onEditCurrent: () => void;
  onPrint: (unit: LocationUnit) => void;
  onOpen: (unit: LocationUnit) => void;
  onConnectPrinter: () => void;
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
  printerConnected,
  printerBusy,
  printerMessage,
  deviceName,
  printing,
  isRoot,
  onAdd,
  onEdit,
  onEditCurrent,
  onPrint,
  onOpen,
  onConnectPrinter,
}: WarehouseLevelViewProps) {
  const title = currentUnit?.name ?? parentName ?? warehouse?.name ?? warehouseName;
  const currentQr = currentUnit ? locationQrPayload(currentUnit) : null;
  const canEditCurrent = isRoot || Boolean(currentUnit);
  const busy = loading || deletingId !== null || printerBusy || printing;
  const breadcrumb = ancestorNames.length > 0 ? ancestorNames.join(' · ') : null;

  const onLongPress = (unit: LocationUnit) => {
    if (busy) return;
    showLocationActions({
      unit,
      printerConnected,
      onEdit,
      onDelete: confirmDelete,
      onPrint,
    });
  };

  return (
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

          <Button
            size="sm"
            variant="outline"
            onPress={onEditCurrent}
            disabled={busy || !canEditCurrent}
          >
            <ButtonText>
              {isRoot ? 'Edit warehouse' : 'Edit'}
            </ButtonText>
          </Button>

          <Text size="xs" className="text-brown-500">
            Tap a row to open the next level. Hold for delete
            {printerConnected ? ' or print' : ''}.
          </Text>

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

          <Button onPress={onAdd} disabled={busy}>
            <ButtonText>Add Level {level}</ButtonText>
          </Button>

          <Button
            variant="secondary"
            onPress={onConnectPrinter}
            disabled={busy}
          >
            {printerBusy ? <ButtonSpinner /> : null}
            <ButtonText>
              {deviceName ? `Printer: ${deviceName}` : 'Connect printer'}
            </ButtonText>
          </Button>

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
                <Pressable
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
                </Pressable>
                <Button
                  size="sm"
                  variant="ghost"
                  onPress={() => onEdit(unit)}
                  disabled={busy}
                  className="shrink-0"
                >
                  <ButtonText>Edit</ButtonText>
                </Button>
              </HStack>
            );
          })}
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}
