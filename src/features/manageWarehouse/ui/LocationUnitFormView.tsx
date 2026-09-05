import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ButtonSpinner, ButtonText } from '@/components/ui/button';
import { Input, InputField } from '@/components/ui/input';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { ActionLockProvider } from '../hook/useActionLock';
import type { UseLocationUnitFormResult } from '../hook/useLocationUnitForm';
import { OnceButton } from './OnceButton';

export type LocationUnitFormViewProps = Omit<UseLocationUnitFormResult, 'submit'> & {
  level: number;
  onCancel: () => void;
  onSubmit: () => void | Promise<void>;
};

export function LocationUnitFormView({
  name,
  label,
  error,
  busy,
  isEdit,
  setName,
  setLabel,
  level,
  onCancel,
  onSubmit,
}: LocationUnitFormViewProps) {
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
                {isEdit
                  ? `Update this location unit at level ${level}.`
                  : `Create a location unit at level ${level}.`}
              </Text>

              <Text size="sm" bold className="text-brown-800">
                Name
              </Text>
              <Input>
                <InputField
                  placeholder="Zone A"
                  value={name}
                  onChangeText={setName}
                  editable={!busy}
                />
              </Input>

              <Text size="sm" bold className="text-brown-800">
                Label
              </Text>
              <Input>
                <InputField
                  placeholder="Optional short label"
                  value={label}
                  onChangeText={setLabel}
                  editable={!busy}
                  autoCapitalize="characters"
                />
              </Input>

              {error ? (
                <Text size="sm" bold className="text-destructive">
                  {error}
                </Text>
              ) : null}

              <OnceButton className="mt-1" onPress={onSubmit} disabled={busy}>
                {busy ? <ButtonSpinner /> : null}
                <ButtonText>{isEdit ? 'Save' : 'Create'}</ButtonText>
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
