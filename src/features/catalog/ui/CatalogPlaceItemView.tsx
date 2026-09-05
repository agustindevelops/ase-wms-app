import { Image, RefreshControl, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

export type CatalogPlaceItemViewProps = {
  itemName: string;
  printed: boolean;
  photoUrl: string | null;
  loading: boolean;
  refreshing: boolean;
  load: (refresh?: boolean) => void | Promise<void>;
  onAddLocation: () => void;
  onSkip: () => void;
};

export function CatalogPlaceItemView({
  itemName,
  printed,
  photoUrl,
  loading,
  refreshing,
  load,
  onAddLocation,
  onSkip,
}: CatalogPlaceItemViewProps) {
  return (
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
        <VStack className="flex-1 px-6 pt-4 pb-8 gap-3.5 justify-center">
          <Heading size="xl">
            Add to warehouse?
          </Heading>

          {loading ? (
            <Box className="w-full aspect-square rounded-2xl border border-brown-200 bg-white/70 items-center justify-center">
              <Spinner color="#7e9570" />
            </Box>
          ) : photoUrl ? (
            <Box className="w-full aspect-square rounded-2xl overflow-hidden border border-brown-200 bg-white/70">
              <Image
                source={{ uri: photoUrl }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
                accessibilityLabel={`Photo of ${itemName}`}
              />
            </Box>
          ) : (
            <Box className="w-full aspect-square rounded-2xl border border-dashed border-brown-200 bg-white/70 items-center justify-center px-6">
              <Text size="sm" className="text-brown-500 text-center">
                No photo available.
              </Text>
            </Box>
          )}

          <Text size="md" bold className="text-brown-800">
            {itemName}
          </Text>
          <Text size="md" className="text-brown-500 leading-6">
            {printed
              ? 'Attach the printed label, then scan a location — or skip and place it later.'
              : 'Scan a location now, or skip and add it later. You can still print a label anytime.'}
          </Text>
          <Button className="mt-2" onPress={onAddLocation}>
            <ButtonText>Add to warehouse location</ButtonText>
          </Button>
          <Button variant="outline" onPress={onSkip}>
            <ButtonText>Skip adding to location</ButtonText>
          </Button>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}
