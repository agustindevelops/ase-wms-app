import { StatusBar } from 'expo-status-bar';
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Input, InputField } from '@/components/ui/input';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import type { UseLoginResult } from '../hook/useLogin';

export type LoginViewProps = UseLoginResult;

export function LoginView({
  email,
  password,
  error,
  busy,
  setEmail,
  setPassword,
  submit,
}: LoginViewProps) {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar style="dark" />
      <VStack className="flex-1 px-6 pt-12 gap-3.5">
        <Heading size="2xl" className="text-foreground">
          ASE WMS
        </Heading>
        <Text size="sm" className="text-muted-foreground mb-2">
          Sign in to continue
        </Text>

        <Input>
          <InputField
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            editable={!busy}
          />
        </Input>

        <Input>
          <InputField
            autoCapitalize="none"
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!busy}
          />
        </Input>

        {error ? (
          <Text size="sm" className="text-destructive">
            {error}
          </Text>
        ) : null}

        <Button className="mt-1" onPress={submit} disabled={busy}>
          {busy ? <ButtonSpinner /> : null}
          <ButtonText>Sign in</ButtonText>
        </Button>

        <Text size="sm" className="text-muted-foreground mt-2">
          Stub login — any email and password works until Firebase (ASE-10).
        </Text>
      </VStack>
    </SafeAreaView>
  );
}
