import type { ComponentProps } from 'react';
import { Button } from '@/components/ui/button';
import { Pressable } from '@/components/ui/pressable';
import { useActionLock } from '../hook/useActionLock';

type OnceButtonProps = Omit<ComponentProps<typeof Button>, 'onPress'> & {
  onPress?: () => void | Promise<unknown>;
};

/** Disables itself (and sibling OnceButtons) on the first press. */
export function OnceButton({
  onPress,
  disabled,
  ...props
}: OnceButtonProps) {
  const { locked, run } = useActionLock();

  return (
    <Button
      {...props}
      disabled={disabled || locked}
      onPress={() => {
        if (disabled) return;
        run(() => onPress?.());
      }}
    />
  );
}

type OncePressableProps = Omit<ComponentProps<typeof Pressable>, 'onPress'> & {
  onPress?: () => void | Promise<unknown>;
};

export function OncePressable({
  onPress,
  disabled,
  ...props
}: OncePressableProps) {
  const { locked, run } = useActionLock();

  return (
    <Pressable
      {...props}
      disabled={disabled || locked}
      onPress={() => {
        if (disabled) return;
        run(() => onPress?.());
      }}
    />
  );
}
