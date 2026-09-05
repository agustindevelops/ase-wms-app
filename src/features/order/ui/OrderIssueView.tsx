import { KeyboardAvoidingView, Platform, Pressable, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { Input, InputField } from '@/components/ui/input';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import type { UseOrderIssueResult } from '../hook/useOrderIssue';

export type OrderIssueViewProps = UseOrderIssueResult & {
  itemName: string;
  onSubmit: () => void | Promise<void>;
};

export function OrderIssueView({
  itemName,
  type,
  setType,
  qtyText,
  setQtyText,
  notes,
  setNotes,
  busy,
  error,
  remaining,
  onSubmit,
}: OrderIssueViewProps) {
  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['bottom', 'left', 'right']}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
          <VStack className="px-6 pt-4 pb-8 gap-3.5">
            <Text size="sm" className="text-brown-500">
              {itemName} · {remaining} outstanding. Owned quantity is reduced; available is not restored.
            </Text>

            <Text size="sm" bold className="text-brown-800">
              Type
            </Text>
            <Pressable
              onPress={() => setType('MISSING')}
              disabled={busy}
              className={`rounded-lg border px-3 py-2.5 ${
                type === 'MISSING'
                  ? 'border-green-700 bg-green-700/15'
                  : 'border-brown-200 bg-white/70'
              }`}
            >
              <Text size="sm" className="text-brown-800">
                Missing
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setType('BROKEN')}
              disabled={busy}
              className={`rounded-lg border px-3 py-2.5 ${
                type === 'BROKEN'
                  ? 'border-green-700 bg-green-700/15'
                  : 'border-brown-200 bg-white/70'
              }`}
            >
              <Text size="sm" className="text-brown-800">
                Broken
              </Text>
            </Pressable>

            <Text size="sm" bold className="text-brown-800">
              Quantity
            </Text>
            <Input>
              <InputField
                keyboardType="number-pad"
                value={qtyText}
                onChangeText={setQtyText}
                editable={!busy}
              />
            </Input>

            <Text size="sm" bold className="text-brown-800">
              Notes (optional)
            </Text>
            <Input>
              <InputField
                value={notes}
                onChangeText={setNotes}
                editable={!busy}
                placeholder="Optional detail"
              />
            </Input>

            {error ? (
              <Text size="sm" bold className="text-destructive">
                {error}
              </Text>
            ) : null}

            <Button
              variant="destructive"
              onPress={() => void onSubmit()}
              disabled={busy}
            >
              {busy ? <ButtonSpinner /> : null}
              <ButtonText>Record issue</ButtonText>
            </Button>
          </VStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
