'use client';
import { useCallback } from 'react';
import { View } from 'react-native';
import { createToastHook } from '@gluestack-ui/core/toast/creator';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';

export const useToast = createToastHook(View);

type ToastAction = 'error' | 'success';

const toastClassName: Record<ToastAction, string> = {
  error: 'bg-peach-500',
  success: 'bg-green-500',
};

export function useAppToast() {
  const toast = useToast();

  const show = useCallback(
    (message: string, action: ToastAction) => {
      toast.show({
        placement: 'bottom',
        duration: 4500,
        render: () => (
          <Box
            className={`mx-4 mb-8 max-w-[92%] rounded-xl px-4 py-3 ${toastClassName[action]}`}
          >
            <Text size="sm" bold className="text-white">
              {message}
            </Text>
          </Box>
        ),
      });
    },
    [toast],
  );

  const error = useCallback(
    (message: string) => show(message, 'error'),
    [show],
  );
  const success = useCallback(
    (message: string) => show(message, 'success'),
    [show],
  );

  return { error, success };
}
