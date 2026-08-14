import { useCallback } from 'react';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainStackParamList } from '@/navigation/types';
import { useOrderList } from './hook/useOrderList';
import { OrderListView } from './ui/OrderListView';

type Route = NativeStackScreenProps<MainStackParamList, 'OrderList'>['route'];
type Navigation = NativeStackScreenProps<
  MainStackParamList,
  'OrderList'
>['navigation'];

export function OrderList() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Navigation>();
  const list = useOrderList({ mode: params.mode });

  useFocusEffect(
    useCallback(() => {
      void list.load(true);
    }, [list.load]),
  );

  return (
    <OrderListView
      {...list}
      mode={params.mode}
      onSelect={(order) =>
        navigation.navigate('OrderDetail', {
          orderId: order.id,
          mode: params.mode,
        })
      }
    />
  );
}

export default OrderList;
