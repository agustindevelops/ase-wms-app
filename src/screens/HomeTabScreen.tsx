import { useCallback, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { apiErrorMessage } from '@/api/client';
import { fetchMe, type MeResponse } from '@/api/me';
import { Box } from '@/components/ui/box';
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { signOut } from '@/firebase/auth/signOut';
import { getFirebaseAuth } from '@/firebase/config';

export function HomeTabScreen() {
  const email = getFirebaseAuth().currentUser?.email ?? null;
  const [me, setMe] = useState<MeResponse | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const runMeSmoke = useCallback(async () => {
    setBusy(true);
    setStatus(null);
    try {
      const meResponse = await fetchMe();
      setMe(meResponse);
      setStatus(
        `OK — Prisma user ${meResponse.user.email} · ${meResponse.warehouse.name}`,
      );
    } catch (error) {
      // A 401 already ended the session in the interceptor; just report it.
      setMe(null);
      setStatus(apiErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    void runMeSmoke();
  }, [runMeSmoke]);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <Box className="flex-1 bg-cream px-6 pt-12">
      <StatusBar style="dark" />
      <VStack className="gap-3">
        <Heading size="2xl" className="text-brown-900">
          Home
        </Heading>
        <Text size="sm" className="text-brown-500">
          {email ? `Signed in as ${email}` : 'Signed in'}
        </Text>

        {me ? (
          <Text size="sm" className="text-brown-700">
            {me.warehouse.name} · {me.role.name} · uid {me.user.firebaseUid}
          </Text>
        ) : null}

        {status ? (
          <Text
            size="sm"
            bold={!status.startsWith('OK')}
            className={
              status.startsWith('OK') ? 'text-brown-700' : 'text-destructive'
            }
          >
            {status}
          </Text>
        ) : null}

        <Button onPress={runMeSmoke} disabled={busy || signingOut}>
          {busy ? <ButtonSpinner /> : null}
          <ButtonText>Retry /api/me</ButtonText>
        </Button>

        <Button
          variant="secondary"
          onPress={handleSignOut}
          disabled={busy || signingOut}
        >
          {signingOut ? <ButtonSpinner /> : null}
          <ButtonText>Sign out</ButtonText>
        </Button>
      </VStack>
    </Box>
  );
}
