import { useFocusEffect } from '@react-navigation/native';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

type ActionLock = {
  locked: boolean;
  run: (action: () => void | Promise<unknown>) => void;
};

const ActionLockContext = createContext<ActionLock | null>(null);

function isPromise(value: unknown): value is Promise<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'then' in value &&
    typeof value.then === 'function'
  );
}

/** Locks all OnceButtons on a screen until the action settles or the screen is focused again. */
export function ActionLockProvider({ children }: { children: ReactNode }) {
  const lockedRef = useRef(false);
  const focusedRef = useRef(true);
  const [locked, setLocked] = useState(false);

  useFocusEffect(
    useCallback(() => {
      focusedRef.current = true;
      lockedRef.current = false;
      setLocked(false);
      return () => {
        focusedRef.current = false;
      };
    }, []),
  );

  const run = useCallback((action: () => void | Promise<unknown>) => {
    if (lockedRef.current) return;
    lockedRef.current = true;
    setLocked(true);

    try {
      const result = action();
      if (isPromise(result)) {
        void result.finally(() => {
          if (!focusedRef.current) return;
          lockedRef.current = false;
          setLocked(false);
        });
      }
    } catch {
      lockedRef.current = false;
      setLocked(false);
    }
  }, []);

  const value = useMemo(() => ({ locked, run }), [locked, run]);

  return (
    <ActionLockContext.Provider value={value}>
      {children}
    </ActionLockContext.Provider>
  );
}

export function useActionLock(): ActionLock {
  const value = useContext(ActionLockContext);
  if (!value) {
    throw new Error('useActionLock must be used within ActionLockProvider');
  }
  return value;
}
