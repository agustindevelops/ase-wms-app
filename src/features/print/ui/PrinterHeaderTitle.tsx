import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { usePrinter } from '../PrinterProvider';
import { PrinterStatusIcon } from './PrinterStatusIcon';

export function PrinterHeaderTitle({ title }: { title: string }) {
  const { signal } = usePrinter();

  return (
    <HStack className="items-center gap-2">
      <Text className="text-coral font-nickainley text-[22px]">{title}</Text>
      <PrinterStatusIcon signal={signal} />
    </HStack>
  );
}
