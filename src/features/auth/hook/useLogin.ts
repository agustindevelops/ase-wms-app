import { useState } from 'react';
import { useAuth } from '@/auth/AuthContext';

export function useLogin() {
  const { signIn } = useAuth();
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
