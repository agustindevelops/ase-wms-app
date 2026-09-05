import { StatusBar } from 'expo-status-bar';
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

export type CatalogGlueViewProps = {
  itemName: string;
  onConfirm: () => void;
};

export function CatalogGlueView({ itemName, onConfirm }: CatalogGlueViewProps) {
  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['bottom', 'left', 'right']}>
      <StatusBar style="dark" />
      <VStack className="flex-1 px-6 pt-4 pb-8 gap-3.5 justify-center">
        <Heading size="xl">
          Attach the QR
        </Heading>
        <Text size="md" className="text-brown-500 leading-6">
          Glue or stick the printed QR onto{' '}
          <Text size="md" bold className="text-brown-800">
            {itemName}
          </Text>{' '}
          (or its container), then continue to scan the warehouse location.
        </Text>
        <Button className="mt-4" onPress={onConfirm}>
          <ButtonText>I've attached the QR</ButtonText>
        </Button>
      </VStack>
    </SafeAreaView>
  );
}
