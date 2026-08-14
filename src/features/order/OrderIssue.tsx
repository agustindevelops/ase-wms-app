import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainStackParamList } from '@/navigation/types';
import { remainingForMode } from './hook/useOrderDetail';
import { useOrderIssue } from './hook/useOrderIssue';
import { OrderIssueView } from './ui/OrderIssueView';

type Route = NativeStackScreenProps<MainStackParamList, 'OrderIssue'>['route'];
type Navigation = NativeStackScreenProps<
  MainStackParamList,
  'OrderIssue'
>['navigation'];

export function OrderIssue() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Navigation>();
  const issue = useOrderIssue({
    orderId: params.orderId,
    itemId: params.itemId,
    remaining: params.remaining,
  });

  return (
    <OrderIssueView
      {...issue}
      itemName={params.itemName}
      onSubmit={async () => {
        const order = await issue.submit();
        if (!order) return;
        const leftover = order.lines.reduce(
          (sum, line) => sum + remainingForMode(line, 'return'),
          0,
        );
        if (leftover === 0) {
          navigation.popTo('OrderList', { mode: 'return' });
          return;
        }
        navigation.popTo('OrderDetail', {
          orderId: params.orderId,
          mode: 'return',
        });
      }}
    />
  );
}

export default OrderIssue;
