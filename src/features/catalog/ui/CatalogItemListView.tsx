import { Image, RefreshControl, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import type { CatalogItem } from '@/api/catalog';
import { Box } from '@/components/ui/box';
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import type { CatalogItemListMode } from '../hook/useCatalogItemList';
import { locationLabel } from '../hook/useCatalogItemList';

const copy: Record<
  CatalogItemListMode,
  { title: string; hint: string; empty: string }
> = {
  add: {
    title: 'Add item to warehouse',
    hint: 'Items with no location yet. Tap one, then scan the location QR.',
    empty: 'Every item already has a location.',
  },
  move: {
    title: 'Move item',
    hint: 'Scan an item QR or pick a located item, then scan the new location.',
    empty: 'No items are attached to a location yet.',
  },
  remove: {
    title: 'Remove from location',
    hint: 'Scan an item QR or pick a located item to detach it.',
    empty: 'No items are attached to a location yet.',
  },
};

export type CatalogItemListViewProps = {
  mode: CatalogItemListMode;
  items: CatalogItem[];
  loading: boolean;
  refreshing: boolean;
  busyId: string | null;
  error: string | null;
  load: (refresh?: boolean) => void | Promise<void>;
  onScanItem?: () => void;
  onSelect: (item: CatalogItem) => void;
};

export function CatalogItemListView({
  mode,
  items,
  loading,
  refreshing,
  busyId,
  error,
  load,
  onScanItem,
  onSelect,
}: CatalogItemListViewProps) {
  const labels = copy[mode];
  const busy = loading || busyId !== null;

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['bottom', 'left', 'right']}>
      <StatusBar style="dark" />
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void load(true)}
          />
        }
      >
        <VStack className="px-6 pt-4 pb-8 gap-3.5">
          <Text size="sm" className="text-brown-500">
            {labels.hint}
          </Text>

          {onScanItem ? (
            <Button onPress={onScanItem} disabled={busy}>
              <ButtonText>Scan item QR</ButtonText>
            </Button>
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
              <Button variant="secondary" onPress={() => void load()} disabled={busy}>
                {loading ? <ButtonSpinner /> : null}
                <ButtonText>Retry</ButtonText>
              </Button>
            </VStack>
          ) : null}

          {!loading && items.length === 0 && !error ? (
            <Text size="sm" className="text-brown-500">
              {labels.empty}
            </Text>
          ) : null}

          {items.map((item) => {
            const photo = item.files.find((file) => file.publicUrl)?.publicUrl;
            const place = locationLabel(item);
            const selectedBusy = busyId === item.id;
            return (
              <Button
                key={item.id}
                variant="outline"
                className="h-auto py-3 justify-start"
                disabled={busy}
                onPress={() => onSelect(item)}
              >
                {selectedBusy ? <ButtonSpinner /> : null}
                {photo ? (
                  <Box className="w-12 h-12 rounded-lg overflow-hidden mr-2">
                    <Image
                      source={{ uri: photo }}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode="cover"
                    />
                  </Box>
                ) : null}
                <VStack className="flex-1 items-start gap-0.5">
                  <ButtonText className="text-left">{item.name}</ButtonText>
                  <Text size="xs" className="text-brown-500">
                    {[
                      item.category?.name,
                      `qty ${item.quantityOwned}`,
                      place,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </Text>
                </VStack>
              </Button>
            );
          })}
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}
