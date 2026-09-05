import { Image, Pressable, RefreshControl, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { itemPhotoUrl, type CatalogItem } from '@/api/catalog';
import { AppHeader } from '@/components/AppHeader';
import { Box } from '@/components/ui/box';
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Input, InputField } from '@/components/ui/input';
import { HStack } from '@/components/ui/hstack';
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
    title: 'Add Item to Warehouse',
    hint: 'Items with no location yet. Tap one, then scan the location QR.',
    empty: 'Every item already has a location.',
  },
  label: {
    title: 'Create Label',
    hint: 'Tap an item to print a label. Existing labels can be reprinted or replaced.',
    empty: 'No items in this warehouse yet.',
  },
  move: {
    title: 'Move Item',
    hint: 'Scan an item QR or pick a located item, then scan the new location.',
    empty: 'No items are attached to a location yet.',
  },
  remove: {
    title: 'Remove from Location',
    hint: 'Scan an item QR or pick a located item to detach it.',
    empty: 'No items are attached to a location yet.',
  },
  edit: {
    title: 'Inventory',
    hint: 'Search or scan an item, then update photos, details, label, or location.',
    empty: 'No items in this warehouse yet.',
  },
};

export type CatalogItemListViewProps = {
  mode: CatalogItemListMode;
  query: string;
  setQuery: (value: string) => void;
  items: CatalogItem[];
  loading: boolean;
  refreshing: boolean;
  busyId: string | null;
  error: string | null;
  load: (refresh?: boolean) => void | Promise<void>;
  onBack: () => void;
  onScanItem?: () => void;
  onSelect: (item: CatalogItem) => void;
};

export function CatalogItemListView({
  mode,
  query,
  setQuery,
  items,
  loading,
  refreshing,
  busyId,
  error,
  load,
  onBack,
  onScanItem,
  onSelect,
}: CatalogItemListViewProps) {
  const labels = copy[mode];
  const busy = loading || busyId !== null;

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      <AppHeader />
      <ScrollView
        contentContainerClassName="px-6 pt-4 pb-8"
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void load(true)}
            tintColor="#7e9570"
          />
        }
      >
        <VStack className="gap-4">
          <HStack className="items-center justify-between gap-3">
            <Box className="flex-1 min-w-0">
              <Heading size="2xl">{labels.title}</Heading>
            </Box>
            <Button variant="outline" size="sm" onPress={onBack}>
              <ButtonText>Back</ButtonText>
            </Button>
          </HStack>
          <Text size="sm" className="text-brown-500">
            {labels.hint}
          </Text>

          {mode === 'edit' || mode === 'label' ? (
            <Input>
              <InputField
                value={query}
                onChangeText={setQuery}
                placeholder="Search by name"
                autoCorrect={false}
                autoCapitalize="none"
                returnKeyType="search"
                editable={!refreshing}
              />
            </Input>
          ) : null}

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
              {query.trim() ? 'No items match that search.' : labels.empty}
            </Text>
          ) : null}

          {items.map((item) => {
            const photo = itemPhotoUrl(item);
            const place = locationLabel(item);
            const selectedBusy = busyId === item.id;
            return (
              <Pressable
                key={item.id}
                disabled={busy}
                onPress={() => onSelect(item)}
                className="rounded-2xl border border-brown-200 bg-white/60 px-3 py-2.5"
                accessibilityRole="button"
                accessibilityLabel={item.name}
              >
                <HStack className="items-center gap-3">
                  <Box className="w-11 h-11 rounded-lg overflow-hidden bg-brown-100 shrink-0">
                    {photo ? (
                      <Image
                        source={{ uri: photo }}
                        style={{ width: 44, height: 44 }}
                        resizeMode="cover"
                      />
                    ) : null}
                  </Box>
                  <VStack className="flex-1 items-start gap-0.5 min-w-0">
                    <Text size="sm" bold className="text-brown-800">
                      {item.name}
                    </Text>
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
                  {selectedBusy ? <Spinner size="small" /> : null}
                </HStack>
              </Pressable>
            );
          })}
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}
