import { RefreshControl, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import type { FulfillmentOrder, OrderFulfillmentMode } from '@/api/order';
import { Box } from '@/components/ui/box';
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
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
      ? 'Orders ready to pick. Tap one to open the pull list.'
      : 'Orders in teardown. Tap one to start returns.';

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

          {!loading && orders.length === 0 && !error ? (
            <Text size="sm" className="text-brown-500">
              No orders are eligible right now.
            </Text>
          ) : null}

          {orders.map((order) => {
            const remaining = order.lines.reduce(
              (sum, line) =>
                sum +
                (mode === 'pickup' ? line.qtyRemaining : line.qtyOutstanding),
              0,
            );
            const date = formatEventDate(order.eventDate);
            return (
              <Button
                key={order.id}
                variant="outline"
                className="h-auto py-3 justify-start"
                onPress={() => onSelect(order)}
              >
                <VStack className="flex-1 items-start gap-0.5">
                  <ButtonText className="text-left">{order.name}</ButtonText>
                  <Text size="xs" className="text-brown-500">
                    {[
                      order.status.name,
                      date,
                      `${order.lines.length} lines`,
                      mode === 'pickup'
                        ? `${remaining} to pick`
                        : `${remaining} outstanding`,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </Text>
                </VStack>
              </Button>
            );
          })}
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}
