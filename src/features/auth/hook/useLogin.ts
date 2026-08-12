import { useState } from 'react';
import { signIn } from '@/firebase/auth/signIn';

export function useLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      await signIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  return {
    email,
    password,
    error,
    busy,
    setEmail,
    setPassword,
    submit,
  };
}

export type UseLoginResult = ReturnType<typeof useLogin>;
