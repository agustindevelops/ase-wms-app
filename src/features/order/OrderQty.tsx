import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainStackParamList } from '@/navigation/types';
import { remainingForMode } from './hook/useOrderDetail';
import { useOrderQty } from './hook/useOrderQty';
import { OrderQtyView } from './ui/OrderQtyView';

type Route = NativeStackScreenProps<MainStackParamList, 'OrderQty'>['route'];
type Navigation = NativeStackScreenProps<
  MainStackParamList,
  'OrderQty'
>['navigation'];

export function OrderQty() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Navigation>();
  const qty = useOrderQty({
    orderId: params.orderId,
    mode: params.mode,
    itemId: params.itemId,
    remaining: params.remaining,
  });

  const onSubmit = async () => {
    if (params.mode === 'return') {
      const parsed = qty.assertQty();
      if (parsed == null) return;
      navigation.replace('OrderScanLocation', {
        orderId: params.orderId,
        itemId: params.itemId,
        itemName: params.itemName,
        qty: parsed,
        locationLabel: params.locationLabel,
      });
      return;
    }

    const order = await qty.submitPickup();
    if (!order) return;
    const leftover = order.lines.reduce(
      (sum, line) => sum + remainingForMode(line, 'pickup'),
      0,
    );
    if (leftover === 0) {
      navigation.popTo('OrderList', { mode: 'pickup' });
      return;
    }
    navigation.popTo('OrderDetail', {
      orderId: params.orderId,
      mode: 'pickup',
    });
  };

  return (
    <OrderQtyView
      {...qty}
      itemName={params.itemName}
      locationLabel={params.locationLabel}
      onSubmit={onSubmit}
    />
  );
}

export default OrderQty;
