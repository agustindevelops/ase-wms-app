import { useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useMe } from '@/auth/MeContext';
import { signOut } from '@/firebase/auth/signOut';

/** Compact avatar + drawer for stack headers (Report Issue / Sign out). */
export function ProfileMenuButton() {
  const navigation = useNavigation();
  const { me } = useMe();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const initial = (me?.user.email?.[0] ?? '?').toUpperCase();

  const onReportIssue = () => {
    setOpen(false);
    if (!me) return;
    navigation.navigate('ReportIssueFind', { warehouseId: me.warehouse.id });
  };

  const onSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      setSigningOut(false);
      setOpen(false);
    }
  };

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Profile menu"
        className="h-9 w-9 rounded-full bg-green-700 items-center justify-center mr-1"
      >
        <Text className="text-white font-inter-bold">{initial}</Text>
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          className="flex-1 bg-black/30"
          onPress={() => setOpen(false)}
        >
          <View className="absolute right-4 top-16 w-56 rounded-2xl border border-brown-200 bg-cream p-3">
            <Pressable onPress={(e) => e.stopPropagation()}>
              <VStack className="gap-2">
                {me ? (
                  <Text size="xs" className="text-brown-500 px-1">
                    {me.user.email}
                  </Text>
                ) : null}
                <Button variant="destructive" onPress={onReportIssue}>
                  <ButtonText>Report Issue</ButtonText>
                </Button>
                <Button
                  variant="destructive"
                  onPress={() => void onSignOut()}
                  disabled={signingOut}
                >
                  {signingOut ? <ButtonSpinner /> : null}
                  <ButtonText>Sign out</ButtonText>
                </Button>
              </VStack>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
