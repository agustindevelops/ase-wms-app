import { StatusBar } from 'expo-status-bar';
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

export type CatalogMenuViewProps = {
  onCreate: () => void;
  onAdd: () => void;
  onMove: () => void;
  onRemove: () => void;
};

export function CatalogMenuView({
  onCreate,
  onAdd,
  onMove,
  onRemove,
}: CatalogMenuViewProps) {
  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['bottom', 'left', 'right']}>
      <StatusBar style="dark" />
      <VStack className="flex-1 px-6 pt-4 pb-8 gap-3.5">
        <Heading size="2xl" className="text-brown-900">
          Catalog
        </Heading>
        <Text size="sm" className="text-brown-500 mb-2">
          Create inventory, then attach, move, or remove warehouse locations.
        </Text>

        <Button onPress={onCreate}>
          <ButtonText>Create</ButtonText>
        </Button>
        <Button onPress={onAdd}>
          <ButtonText>Add item to warehouse</ButtonText>
        </Button>
        <Button onPress={onMove}>
          <ButtonText>Move item</ButtonText>
        </Button>
        <Button variant="outline" onPress={onRemove}>
          <ButtonText>Remove item from location</ButtonText>
        </Button>
      </VStack>
    </SafeAreaView>
  );
}
