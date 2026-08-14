import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { Input, InputField } from '@/components/ui/input';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import type { UseOrderQtyResult } from '../hook/useOrderQty';
import { returnLocationText } from '../hook/useOrderDetail';

export type OrderQtyViewProps = UseOrderQtyResult & {
  itemName: string;
  locationLabel?: string | null;
  onSubmit: () => void | Promise<void>;
};

export function OrderQtyView({
  mode,
  itemName,
  locationLabel,
  qtyText,
  setQtyText,
  busy,
  error,
  remaining,
  onSubmit,
}: OrderQtyViewProps) {
  const returnTo = returnLocationText(locationLabel);

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
              {itemName}
            </Text>
            <Text size="sm" className="text-brown-500">
              {mode === 'pickup'
                ? `${remaining} remaining to pick.`
                : `${remaining} outstanding to return.`}
            </Text>
            {mode === 'return' ? (
              <Text size="sm" bold className="text-brown-900">
                {returnTo
                  ? `Return this item to ${returnTo}.`
                  : 'This item has no assigned location. After quantity, scan a warehouse location QR to store it.'}
              </Text>
            ) : null}

            <Text size="sm" bold className="text-brown-900">
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

            {error ? (
              <Text size="sm" bold className="text-destructive">
                {error}
              </Text>
            ) : null}

            <Button onPress={() => void onSubmit()} disabled={busy}>
              {busy ? <ButtonSpinner /> : null}
              <ButtonText>
                {mode === 'pickup' ? 'Confirm pick' : 'Next: scan location'}
              </ButtonText>
            </Button>
          </VStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
