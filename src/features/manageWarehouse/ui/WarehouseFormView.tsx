import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ButtonSpinner, ButtonText } from '@/components/ui/button';
import { Input, InputField } from '@/components/ui/input';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { ActionLockProvider } from '../hook/useActionLock';
import type { UseWarehouseFormResult } from '../hook/useWarehouseForm';
import { OnceButton } from './OnceButton';

export type WarehouseFormViewProps = Omit<UseWarehouseFormResult, 'submit'> & {
  onCancel: () => void;
  onSubmit: () => void | Promise<void>;
};

export function WarehouseFormView({
  name,
  error,
  busy,
  setName,
  onCancel,
  onSubmit,
}: WarehouseFormViewProps) {
  return (
    <ActionLockProvider>
      <SafeAreaView className="flex-1 bg-cream" edges={['bottom', 'left', 'right']}>
        <StatusBar style="dark" />
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
            <VStack className="px-6 pt-4 pb-8 gap-3.5">
              <Text size="sm" className="text-brown-500 mb-1">
                Update this warehouse.
              </Text>

              <Text size="sm" bold className="text-brown-800">
                Name
              </Text>
              <Input>
                <InputField
                  placeholder="Warehouse name"
                  value={name}
                  onChangeText={setName}
                  editable={!busy}
                />
              </Input>

              {error ? (
                <Text size="sm" bold className="text-destructive">
                  {error}
                </Text>
              ) : null}

              <OnceButton className="mt-1" onPress={onSubmit} disabled={busy}>
                {busy ? <ButtonSpinner /> : null}
                <ButtonText>Save</ButtonText>
              </OnceButton>
              <OnceButton variant="outline" onPress={onCancel} disabled={busy}>
                <ButtonText>Cancel</ButtonText>
              </OnceButton>
            </VStack>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ActionLockProvider>
  );
}
