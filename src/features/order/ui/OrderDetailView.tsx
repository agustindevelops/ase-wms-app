import { Pressable, RefreshControl, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import type { FulfillmentLine, OrderFulfillmentMode } from '@/api/order';
import {
  canMutateFulfillment,
  canReportOrderIssue,
  isFulfillmentComplete,
} from '@/lib/orderStatus';
import { Box } from '@/components/ui/box';
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import {
  remainingForMode,
  type UseOrderDetailResult,
} from '../hook/useOrderDetail';
import { formatEventDate } from '../hook/useOrderList';

export type OrderDetailViewProps = UseOrderDetailResult & {
  mode: OrderFulfillmentMode;
  canDelete: boolean;
  onDelete: () => void;
  onScanItem: () => void;
  onSelectLine: (line: FulfillmentLine) => void;
  onReportIssue: (line: FulfillmentLine) => void;
};

export function OrderDetailView({
  mode,
  order,
  loading,
  refreshing,
  error,
  load,
  canDelete,
  onDelete,
  onScanItem,
  onSelectLine,
  onReportIssue,
}: OrderDetailViewProps) {
  const completed = !!order && isFulfillmentComplete(order, mode);
  const canEdit = !!order && canMutateFulfillment(order, mode);
  const canReport = !!order && canReportOrderIssue(order);
  const remainingLines =
    order?.lines.filter(
      (line) =>
        canEdit &&
        !line.item.archived &&
        remainingForMode(line, mode) > 0,
    ) ?? [];
  const sortedLines = order
    ? [...order.lines].sort((a, b) => {
        const aDone = remainingForMode(a, mode) === 0 ? 1 : 0;
        const bDone = remainingForMode(b, mode) === 0 ? 1 : 0;
        return aDone - bDone;
      })
    : [];

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['bottom', 'left', 'right']}>
      <StatusBar style="dark" />
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void load(true)}
          />
        }
      >
        <VStack className="px-6 pt-4 pb-8 gap-3.5">
          {order ? (
            <Text size="sm" className="text-brown-500">
              {[
                completed ? 'Completed' : order.status.name,
                formatEventDate(order.eventDate),
              ]
                .filter(Boolean)
                .join(' · ')}
            </Text>
          ) : null}

          {completed ? (
            <Box className="rounded-lg border border-green-200 bg-green-50 px-3 py-2.5">
              <Text size="sm" bold className="text-green-800">
                {mode === 'pickup' ? 'Pickup complete' : 'Return complete'}
              </Text>
              <Text size="sm" className="text-brown-500">
                {mode === 'pickup'
                  ? 'Review the checklist or report a problem. Picks cannot be changed.'
                  : 'This order is fully returned. Review the items below.'}
              </Text>
            </Box>
          ) : (
            <Text size="sm" className="text-brown-500">
              {mode === 'pickup'
                ? 'Scan an item QR or tap a remaining line, then enter quantity.'
                : 'Scan or tap a line, enter qty, then scan its assigned location QR.'}
            </Text>
          )}

          {canEdit ? (
            <Button
              onPress={onScanItem}
              disabled={loading || remainingLines.length === 0}
            >
              <ButtonText>Scan item QR</ButtonText>
            </Button>
          ) : null}

          {loading ? (
            <Box className="py-8 items-center">
              <Spinner />
            </Box>
          ) : null}

          {error ? (
            <VStack className="gap-2">
              <Text size="sm" bold className="text-destructive">
                {error}
              </Text>
              <Button variant="secondary" onPress={() => void load()}>
                {loading ? <ButtonSpinner /> : null}
                <ButtonText>Retry</ButtonText>
              </Button>
            </VStack>
          ) : null}

          {!loading && order && remainingLines.length === 0 && !error && canEdit ? (
            <Text size="sm" className="text-brown-500">
              {mode === 'pickup'
                ? 'All items on this order are picked.'
                : 'No outstanding return quantity on this order.'}
            </Text>
          ) : null}

          {sortedLines.map((line) => {
            const remaining = remainingForMode(line, mode);
            const done = remaining === 0;
            return (
              <HStack
                key={line.id}
                className={`rounded-2xl border px-3 py-3 items-start ${
                  done
                    ? 'border-green-200 bg-green-50'
                    : 'border-brown-200 bg-white/60'
                }`}
              >
                <Pressable
                  className="flex-1"
                  disabled={!canEdit || done || loading}
                  onPress={() => onSelectLine(line)}
                >
                  <VStack className="gap-0.5 pr-2">
                    <Text size="sm" bold className="text-brown-800">
                      {done ? `✓ ${line.item.name}` : line.item.name}
                    </Text>
                    <Text size="xs" className="text-brown-500">
                      {mode === 'pickup'
                        ? `Picked ${line.qtyPicked} / ${line.qtyRequested}${
                            done ? '' : ` · ${remaining} left`
                          }`
                        : `Returned ${line.qtyReturned} / ${line.qtyPicked} picked${
                            done ? '' : ` · ${remaining} outstanding`
                          }`}
                    </Text>
                    {line.item.locationLabel ? (
                      <Text size="xs" className="text-brown-500">
                        {mode === 'return'
                          ? `Return to ${line.item.locationLabel}`
                          : line.item.locationLabel}
                      </Text>
                    ) : null}
                  </VStack>
                </Pressable>
                <VStack className="items-end gap-1.5 pt-0.5">
                  {done ? (
                    <Text size="xs" bold className="text-green-700">
                      Done
                    </Text>
                  ) : null}
                  {canReport && line.qtyOutstanding > 0 ? (
                    <Pressable
                      disabled={loading}
                      onPress={() => onReportIssue(line)}
                      hitSlop={8}
                    >
                      <Text size="xs" bold className="text-destructive">
                        Missing / Broken
                      </Text>
                    </Pressable>
                  ) : null}
                </VStack>
              </HStack>
            );
          })}

          {order && canDelete ? (
            <Button
              variant="destructive"
              className="mt-3"
              disabled={loading}
              onPress={onDelete}
            >
              <ButtonText>Delete order</ButtonText>
            </Button>
          ) : null}
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}
