import { useCallback } from 'react';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { deleteOrder } from '@/api/order';
import { apiErrorMessage } from '@/api/client';
import { useMe } from '@/auth/MeContext';
import { useModal } from '@/components/modal/ModalContext';
import { Text } from '@/components/ui/text';
import { useAppToast } from '@/components/ui/toast';
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
  const { me } = useMe();
  const modal = useModal();
  const toast = useAppToast();
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
      canDelete={me?.role.code === 'ADMIN'}
      onDelete={() => {
        const orderName = detail.order?.name ?? 'this order';
        modal.showModal({
          title: 'Delete order?',
          content: (
            <Text size="sm" className="text-brown-800">
              Delete “{orderName}”? This permanently removes the order and
              cannot be undone.
            </Text>
          ),
          confirmationLabel: 'Delete order',
          onConfirm: async () => {
            try {
              await deleteOrder(params.orderId);
              toast.success('Order deleted.');
              navigation.goBack();
            } catch (cause) {
              toast.error(apiErrorMessage(cause));
              throw cause;
            }
          },
        });
      }}
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
