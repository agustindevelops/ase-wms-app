import { useCallback } from 'react';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainStackParamList } from '@/navigation/types';
import { remainingForMode, useOrderDetail } from './hook/useOrderDetail';
import { OrderDetailView } from './ui/OrderDetailView';

type Route = NativeStackScreenProps<MainStackParamList, 'OrderDetail'>['route'];
type Navigation = NativeStackScreenProps<
  MainStackParamList,
  'OrderDetail'
>['navigation'];

export function OrderDetail() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Navigation>();
  const detail = useOrderDetail({
    mode: params.mode,
    orderId: params.orderId,
  });

  useFocusEffect(
    useCallback(() => {
      void detail.load(true);
    }, [detail.load]),
  );

  return (
    <OrderDetailView
      {...detail}
      mode={params.mode}
      onScanItem={() =>
        navigation.navigate('OrderScanItem', {
          orderId: params.orderId,
          mode: params.mode,
        })
      }
      onSelectLine={(line) =>
        navigation.navigate('OrderQty', {
          orderId: params.orderId,
          mode: params.mode,
          itemId: line.itemId,
          itemName: line.item.name,
          remaining: remainingForMode(line, params.mode),
          locationLabel: line.item.locationLabel,
        })
      }
      onReportIssue={(line) =>
        navigation.navigate('OrderIssue', {
          orderId: params.orderId,
          itemId: line.itemId,
          itemName: line.item.name,
          remaining: line.qtyOutstanding,
          mode: params.mode,
        })
      }
    />
  );
}

export default OrderDetail;
