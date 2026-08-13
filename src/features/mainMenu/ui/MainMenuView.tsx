import { StatusBar } from 'expo-status-bar';
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import type { UseMainMenuResult } from '../hook/useMainMenu';

const upcoming = [
  { key: 'catalog', label: 'Catalog' },
  { key: 'pickup', label: 'Pickup Order' },
  { key: 'return', label: 'Return Order' },
  { key: 'issue', label: 'Report Issue' },
] as const;

export type MainMenuViewProps = UseMainMenuResult & {
  onManageWarehouse: () => void;
  onPrintPoC: () => void;
  onImgUpload: () => void;
};

export function MainMenuView({
  me,
  error,
  busy,
  signingOut,
  load,
  handleSignOut,
  onManageWarehouse,
  onPrintPoC,
  onImgUpload,
}: MainMenuViewProps) {
  const blocked = busy || signingOut || !me;

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <StatusBar style="dark" />
      <VStack className="flex-1 px-6 pt-12 gap-3.5">
        <Heading size="2xl" className="text-brown-900">
          Main Menu
        </Heading>
        {me ? (
          <Text size="sm" className="text-brown-500 mb-2">
            {me.warehouse.name} · {me.role.name}
          </Text>
        ) : busy ? (
          <Spinner />
        ) : (
          <Text size="sm" className="text-brown-500 mb-2">
            Loading warehouse…
          </Text>
        )}

        {error ? (
          <VStack className="gap-2">
            <Text size="sm" bold className="text-destructive">
              {error}
            </Text>
            <Button variant="secondary" onPress={() => void load()} disabled={busy}>
              {busy ? <ButtonSpinner /> : null}
              <ButtonText>Retry</ButtonText>
            </Button>
          </VStack>
        ) : null}

        <Button onPress={onManageWarehouse} disabled={blocked}>
          <ButtonText>Manage Warehouse</ButtonText>
        </Button>

        {upcoming.map((item) => (
          <Button key={item.key} variant="outline" disabled>
            <ButtonText>{item.label}</ButtonText>
          </Button>
        ))}

        <Button
          variant="secondary"
          className="mt-4"
          onPress={onPrintPoC}
          disabled={signingOut}
        >
          <ButtonText>Print PoC</ButtonText>
        </Button>
        <Button variant="secondary" onPress={onImgUpload} disabled={signingOut}>
          <ButtonText>Image upload</ButtonText>
        </Button>

        <Button
          variant="outline"
          className="mt-auto mb-4"
          onPress={() => void handleSignOut()}
          disabled={busy || signingOut}
        >
          {signingOut ? <ButtonSpinner /> : null}
          <ButtonText>Sign out</ButtonText>
        </Button>
      </VStack>
    </SafeAreaView>
  );
}
