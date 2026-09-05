import { StatusBar } from 'expo-status-bar';
import { AppHeader } from '@/components/AppHeader';
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

export type CatalogMenuViewProps = {
  onCreate: () => void;
  onEdit: () => void;
  onLabel: () => void;
  onAdd: () => void;
  onMove: () => void;
  onRemove: () => void;
};

export function CatalogMenuView({
  onCreate,
  onEdit,
  onLabel,
  onAdd,
  onMove,
  onRemove,
}: CatalogMenuViewProps) {
  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['top', 'bottom', 'left', 'right']}>
      <StatusBar style="dark" />
      <AppHeader />
      <VStack className="flex-1 px-6 pt-4 pb-8 gap-3.5">
        <Heading size="2xl">
          Catalog
        </Heading>
        <Text size="sm" className="text-brown-500 mb-2">
          Create or edit inventory, print a label, then attach, move, or remove
          warehouse locations.
        </Text>

        <Button onPress={onCreate}>
          <ButtonText>Create Item</ButtonText>
        </Button>
        <Button onPress={onEdit}>
          <ButtonText>Edit Inventory</ButtonText>
        </Button>
        <Button onPress={onLabel}>
          <ButtonText>Create Label</ButtonText>
        </Button>
        <Button onPress={onAdd}>
          <ButtonText>Add Item to Warehouse</ButtonText>
        </Button>
        <Button onPress={onMove}>
          <ButtonText>Move Item</ButtonText>
        </Button>
        <Button variant="destructive" onPress={onRemove}>
          <ButtonText>Remove Item from Location</ButtonText>
        </Button>
      </VStack>
    </SafeAreaView>
  );
}
