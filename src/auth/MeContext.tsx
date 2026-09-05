import { createContext, useContext, type ReactNode } from 'react';
import type { MeResponse } from '@/api/me';

type MeContextValue = {
  me: MeResponse | null;
  busy: boolean;
  error: string | null;
  reload: () => Promise<void>;
};

const MeContext = createContext<MeContextValue | null>(null);

export function MeProvider({
  value,
  children,
}: {
  value: MeContextValue;
  children: ReactNode;
}) {
  return <MeContext.Provider value={value}>{children}</MeContext.Provider>;
}

export function useMe(): MeContextValue {
  const ctx = useContext(MeContext);
  if (!ctx) {
    throw new Error('useMe must be used within MeProvider');
  }
  return ctx;
}
