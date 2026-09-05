import { Pressable, RefreshControl, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import type { FulfillmentOrder, OrderFulfillmentMode } from '@/api/order';
import { Box } from '@/components/ui/box';
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import {
  canOpenFulfillment,
  isFulfillmentComplete,
} from '@/lib/orderStatus';
import { formatEventDate } from '../hook/useOrderList';
import type { UseOrderListResult } from '../hook/useOrderList';

export type OrderListViewProps = UseOrderListResult & {
  mode: OrderFulfillmentMode;
  onSelect: (order: FulfillmentOrder) => void;
};

export function OrderListView({
  mode,
  orders,
  loading,
  refreshing,
  error,
  load,
  onSelect,
}: OrderListViewProps) {
  const hint =
    mode === 'pickup'
      ? 'Orders scheduled for today. Green means pickup is done — open to review or report a problem.'
      : 'Orders scheduled for today. Paid orders stay visible but cannot be opened until pickup is done.';

  const sorted = [...orders].sort((a, b) => {
    const aDone = isFulfillmentComplete(a, mode) ? 1 : 0;
    const bDone = isFulfillmentComplete(b, mode) ? 1 : 0;
    return aDone - bDone;
  });

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
          <Text size="sm" className="text-brown-500">
            {hint}
          </Text>

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

          {!loading && sorted.length === 0 && !error ? (
            <Text size="sm" className="text-brown-500">
              No orders scheduled for today.
            </Text>
          ) : null}

          {sorted.map((order) => {
            const remaining = order.lines.reduce(
              (sum, line) =>
                sum +
                (mode === 'pickup' ? line.qtyRemaining : line.qtyOutstanding),
              0,
            );
            const date = formatEventDate(order.eventDate);
            const completed = isFulfillmentComplete(order, mode);
            const locked = !canOpenFulfillment(order, mode);
            return (
              <Pressable
                key={order.id}
                onPress={() => onSelect(order)}
                disabled={locked}
                accessibilityRole="button"
                accessibilityState={{ disabled: locked }}
                accessibilityLabel={order.name}
                className={`rounded-2xl border px-3 py-3 ${
                  completed
                    ? 'border-green-200 bg-green-50'
                    : locked
                      ? 'border-brown-200 bg-brown-50 opacity-70'
                      : 'border-brown-200 bg-white/60'
                }`}
              >
                <HStack className="items-start gap-3">
                  <VStack className="flex-1 items-start gap-0.5 min-w-0">
                    <Text size="sm" bold className="text-brown-800">
                      {completed ? `✓ ${order.name}` : order.name}
                    </Text>
                    <Text size="xs" className="text-brown-500">
                      {[
                        completed
                          ? 'Completed'
                          : locked
                            ? 'Waiting for pickup'
                            : order.status.name,
                        date,
                        `${order.lines.length} lines`,
                        completed
                          ? mode === 'pickup'
                            ? 'Picked up'
                            : 'Returned'
                          : locked
                            ? 'Not picked up yet'
                            : mode === 'pickup'
                              ? `${remaining} to pick`
                              : `${remaining} outstanding`,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </Text>
                  </VStack>
                  {completed ? (
                    <Text size="xs" bold className="text-green-700 pt-0.5">
                      Done
                    </Text>
                  ) : null}
                </HStack>
              </Pressable>
            );
          })}
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}
