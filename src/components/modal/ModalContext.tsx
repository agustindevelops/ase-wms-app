import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Modal, Pressable, View } from 'react-native';
import { Box } from '@/components/ui/box';
import {
  Button,
  ButtonSpinner,
  ButtonText,
} from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

export type ModalOptions = {
  title: ReactNode;
  content: ReactNode;
  confirmationLabel: string;
  onConfirm: () => void | Promise<void>;
};

type ModalContextValue = {
  showModal: (options: ModalOptions) => void;
  hideModal: () => void;
};

const ModalContext = createContext<ModalContextValue | null>(null);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ModalOptions | null>(null);
  const [confirming, setConfirming] = useState(false);

  const hideModal = useCallback(() => {
    if (confirming) return;
    setOptions(null);
  }, [confirming]);

  const showModal = useCallback((nextOptions: ModalOptions) => {
    setConfirming(false);
    setOptions(nextOptions);
  }, []);

  const confirm = useCallback(async () => {
    if (!options || confirming) return;
    setConfirming(true);
    try {
      await options.onConfirm();
      setOptions(null);
    } catch {
      // The caller owns error reporting. Keep the modal open so they can retry.
    } finally {
      setConfirming(false);
    }
  }, [confirming, options]);

  const value = useMemo(
    () => ({ showModal, hideModal }),
    [hideModal, showModal],
  );

  return (
    <ModalContext.Provider value={value}>
      {children}
      <Modal
        animationType="fade"
        transparent
        visible={options !== null}
        onRequestClose={hideModal}
        statusBarTranslucent
      >
        <View className="flex-1 items-center justify-center px-6">
          <Pressable
            className="absolute inset-0 bg-black/40"
            accessibilityRole="button"
            accessibilityLabel="Close modal"
            disabled={confirming}
            onPress={hideModal}
          />
          <Box className="w-full max-w-md rounded-2xl border border-brown-200 bg-cream p-5">
            <HStack className="items-start gap-3">
              <Heading size="lg" className="flex-1 text-coral">
                {options?.title}
              </Heading>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close modal"
                disabled={confirming}
                hitSlop={10}
                onPress={hideModal}
              >
                <Text size="xl" className="text-brown-500">
                  ×
                </Text>
              </Pressable>
            </HStack>

            <VStack className="mt-3 gap-5">
              <Box>{options?.content}</Box>
              <HStack className="justify-end gap-2">
                <Button
                  variant="secondary"
                  disabled={confirming}
                  onPress={hideModal}
                >
                  <ButtonText>Cancel</ButtonText>
                </Button>
                <Button
                  variant="destructive"
                  disabled={confirming}
                  onPress={() => void confirm()}
                >
                  {confirming ? <ButtonSpinner /> : null}
                  <ButtonText>{options?.confirmationLabel}</ButtonText>
                </Button>
              </HStack>
            </VStack>
          </Box>
        </View>
      </Modal>
    </ModalContext.Provider>
  );
}

export function useModal(): ModalContextValue {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within ModalProvider');
  }
  return context;
}
