import { Image, RefreshControl, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import type { CatalogItem } from '@/api/catalog';
import { Box } from '@/components/ui/box';
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { Input, InputField } from '@/components/ui/input';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { locationLabel } from '../hook/useReportIssueFind';
import type { UseReportIssueFindResult } from '../hook/useReportIssueFind';

export type ReportIssueFindViewProps = UseReportIssueFindResult & {
  onScanItem: () => void;
  onSelect: (item: CatalogItem) => void;
};

export function ReportIssueFindView({
  query,
  setQuery,
  items,
  loading,
  refreshing,
  error,
  load,
  onScanItem,
  onSelect,
}: ReportIssueFindViewProps) {
  const busy = loading;

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['bottom', 'left', 'right']}>
      <StatusBar style="dark" />
      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void load(true)}
          />
        }
      >
        <VStack className="px-6 pt-4 pb-8 gap-3.5">
          <Text size="sm" className="text-brown-500">
            Search or scan an item, then record Missing or Broken.
          </Text>

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

          <Button onPress={onScanItem} disabled={busy}>
            <ButtonText>Scan item QR</ButtonText>
          </Button>

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
              No items match that search.
            </Text>
          ) : null}

          {items.map((item) => {
            const photo = item.files.find((file) => file.publicUrl)?.publicUrl;
            const place = locationLabel(item);
            const available = Math.min(
              item.quantityOwned,
              item.quantityAvailable,
            );
            return (
              <Button
                key={item.id}
                variant="outline"
                className="h-auto py-3 justify-start"
                disabled={busy}
                onPress={() => onSelect(item)}
              >
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
                      `${available} available`,
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
