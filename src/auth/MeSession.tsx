import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { apiErrorMessage } from '@/api/client';
import { fetchMe, type MeResponse } from '@/api/me';
import { MeProvider } from '@/auth/MeContext';

export function MeSession({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
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

  useEffect(() => {
    void reload();
  }, [reload]);

  return (
    <MeProvider value={{ me, busy, error, reload }}>{children}</MeProvider>
  );
}
