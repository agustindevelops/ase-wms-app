import { Image, Pressable, RefreshControl, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import type { CatalogItem } from '@/api/catalog';
import { Box } from '@/components/ui/box';
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
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
            const subtitle = [
              item.category?.name,
              `qty ${item.quantityOwned}`,
              place,
            ]
              .filter(Boolean)
              .join(' · ');
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
                      {subtitle}
                    </Text>
                  </VStack>
                </HStack>
              </Pressable>
            );
          })}
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}
