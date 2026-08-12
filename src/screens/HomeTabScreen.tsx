import { useCallback, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { fetchMe, type MeUser } from '@/api/me';
import { WmsApiError } from '@/api/wmsFetch';
import { Box } from '@/components/ui/box';
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { signOut } from '@/firebase/auth/signOut';
import { getFirebaseAuth } from '@/firebase/config';

export function HomeTabScreen() {
  const email = getFirebaseAuth().currentUser?.email ?? null;
  const [me, setMe] = useState<MeUser | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const runMeSmoke = useCallback(async () => {
    setBusy(true);
    setStatus(null);
    try {
      const { user } = await fetchMe();
      setMe(user);
      setStatus(`OK — Prisma user ${user.email} (${user.id})`);
    } catch (error) {
      setMe(null);
      if (error instanceof WmsApiError && error.status === 401) {
        setStatus(`401 — ${error.message}`);
        await signOut();
        return;
      }
      setStatus(error instanceof Error ? error.message : String(error));
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
            Role {me.role} · uid {me.firebaseUid}
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
