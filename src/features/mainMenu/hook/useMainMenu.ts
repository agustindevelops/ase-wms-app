import { useCallback, useState } from 'react';
import { apiErrorMessage } from '@/api/client';
import { fetchMe, type MeResponse } from '@/api/me';
import { signOut } from '@/firebase/auth/signOut';

export function useMainMenu() {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const load = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      setMe(await fetchMe());
    } catch (cause) {
      setMe(null);
      setError(apiErrorMessage(cause));
    } finally {
      setBusy(false);
    }
  }, []);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      setSigningOut(false);
    }
  };

  return {
    me,
    error,
    busy,
    signingOut,
    load,
    handleSignOut,
  };
}

export type UseMainMenuResult = ReturnType<typeof useMainMenu>;
