import { KeyboardAvoidingView, Platform, Pressable, RefreshControl, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Box } from '@/components/ui/box';
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { Input, InputField } from '@/components/ui/input';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import type { UseReportIssueFormResult } from '../hook/useReportIssueForm';

export type ReportIssueFormViewProps = UseReportIssueFormResult & {
  itemName: string;
  onSubmit: () => void | Promise<void>;
};

export function ReportIssueFormView({
  itemName,
  type,
  setType,
  qtyText,
  setQtyText,
  notes,
  setNotes,
  ownedQty,
  maxQty,
  loading,
  refreshing,
  busy,
  error,
  load,
  onSubmit,
}: ReportIssueFormViewProps) {
  const blocked = busy || loading || maxQty <= 0;

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['bottom', 'left', 'right']}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void load(true)}
              tintColor="#7e9570"
            />
          }
        >
          <VStack className="px-6 pt-4 pb-8 gap-3.5">
            {loading ? (
              <Box className="py-8 items-center">
                <Spinner />
              </Box>
            ) : (
              <Text size="sm" className="text-brown-500">
                {itemName} · qty {ownedQty}.
                Reporting reduces total inventory.
              </Text>
            )}

            <Text size="sm" bold className="text-brown-800">
              Type
            </Text>
            <Pressable
              onPress={() => setType('MISSING')}
              disabled={blocked}
              className={`rounded-lg border px-3 py-2.5 ${
                type === 'MISSING'
                  ? 'border-green-700 bg-green-700/15'
                  : 'border-brown-200 bg-white/70'
              }`}
            >
              <Text size="sm" className="text-brown-800">
                Missing
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setType('BROKEN')}
              disabled={blocked}
              className={`rounded-lg border px-3 py-2.5 ${
                type === 'BROKEN'
                  ? 'border-green-700 bg-green-700/15'
                  : 'border-brown-200 bg-white/70'
              }`}
            >
              <Text size="sm" className="text-brown-800">
                Broken
              </Text>
            </Pressable>

            <Text size="sm" bold className="text-brown-800">
              Quantity
            </Text>
            <Input>
              <InputField
                keyboardType="number-pad"
                value={qtyText}
                onChangeText={setQtyText}
                editable={!blocked}
              />
            </Input>

            <Text size="sm" bold className="text-brown-800">
              Notes (optional)
            </Text>
            <Input>
              <InputField
                value={notes}
                onChangeText={setNotes}
                editable={!blocked}
                placeholder="Optional detail"
              />
            </Input>

            {error ? (
              <VStack className="gap-2">
                <Text size="sm" bold className="text-destructive">
                  {error}
                </Text>
                {maxQty <= 0 && !loading ? (
                  <Button variant="secondary" onPress={() => void load()} disabled={busy}>
                    <ButtonText>Retry</ButtonText>
                  </Button>
                ) : null}
              </VStack>
            ) : null}

            <Button
              variant="destructive"
              onPress={() => void onSubmit()}
              disabled={blocked}
            >
              {busy ? <ButtonSpinner /> : null}
              <ButtonText>Record issue</ButtonText>
            </Button>
          </VStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
