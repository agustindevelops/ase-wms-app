import { StatusBar } from 'expo-status-bar';
import { Image } from 'react-native';
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Input, InputField } from '@/components/ui/input';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import type { UseLoginResult } from '../hook/useLogin';

const logo = require('../../../../assets/aniah-social-events-logo.png');

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
    <SafeAreaView className="flex-1 bg-cream">
      <StatusBar style="dark" />
      <VStack className="flex-1 px-6 pt-12 gap-3.5">
        <Image
          source={logo}
          style={{ width: 120, height: 120, alignSelf: 'center' }}
          resizeMode="contain"
        />
        <Heading size="2xl" className="text-center">
          Warehouse Inventory System
        </Heading>
        <Text size="sm" className="text-brown-500 mb-2 text-center">
          Warehouse Inventory System — sign in to continue
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
          <Text size="sm" bold className="text-destructive">
            {error}
          </Text>
        ) : null}

        <Button className="mt-1" onPress={submit} disabled={busy}>
          {busy ? <ButtonSpinner /> : null}
          <ButtonText>Sign in</ButtonText>
        </Button>
      </VStack>
    </SafeAreaView>
  );
}
