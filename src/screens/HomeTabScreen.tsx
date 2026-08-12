import { StatusBar } from 'expo-status-bar';
import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

export function HomeTabScreen() {
  return (
    <Box className="flex-1 bg-cream px-6 pt-12">
      <StatusBar style="dark" />
      <VStack className="gap-2">
        <Heading size="2xl" className="text-brown-900">
          Home
        </Heading>
        <Text size="sm" className="text-brown-500">
          Placeholder for inventory catalog. Use the Print tab for the D110 PoC.
        </Text>
      </VStack>
    </Box>
  );
}
