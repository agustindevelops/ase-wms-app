import { StatusBar } from 'expo-status-bar';
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import type { UseMainMenuResult } from '../hook/useMainMenu';

export type MainMenuViewProps = UseMainMenuResult & {
  onManageWarehouse: () => void;
  onCatalog: () => void;
  onPickup: () => void;
  onReturn: () => void;
  onReportIssue: () => void;
};

export function MainMenuView({
  me,
  error,
  busy,
  signingOut,
  load,
  handleSignOut,
  onManageWarehouse,
  onCatalog,
  onPickup,
  onReturn,
  onReportIssue,
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
            {me.organization.name}
            {me.warehouse ? ` · ${me.warehouse.name}` : ''} · {me.role.name}
          </Text>
        ) : busy ? (
          <Spinner />
        ) : (
          <Text size="sm" className="text-brown-500 mb-2">
            Loading organization…
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

        <Button onPress={onCatalog} disabled={blocked}>
          <ButtonText>Catalog</ButtonText>
        </Button>

        <Button onPress={onManageWarehouse} disabled={blocked}>
          <ButtonText>Manage Warehouse</ButtonText>
        </Button>

        <Button onPress={onPickup} disabled={blocked}>
          <ButtonText>Pickup Order</ButtonText>
        </Button>
        <Button onPress={onReturn} disabled={blocked}>
          <ButtonText>Return Order</ButtonText>
        </Button>
        <Button onPress={onReportIssue} disabled={blocked}>
          <ButtonText>Report Issue</ButtonText>
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
