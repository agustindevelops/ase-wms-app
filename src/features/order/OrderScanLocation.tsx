import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CatalogScanLocationView } from '@/features/catalog/ui/CatalogScanLocationView';
import type { MainStackParamList } from '@/navigation/types';
import { remainingForMode, returnLocationText } from './hook/useOrderDetail';
import { useOrderScanLocation } from './hook/useOrderScanLocation';

type Route = NativeStackScreenProps<
  MainStackParamList,
  'OrderScanLocation'
>['route'];
type Navigation = NativeStackScreenProps<
  MainStackParamList,
  'OrderScanLocation'
>['navigation'];

export function OrderScanLocation() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Navigation>();
  const scan = useOrderScanLocation({
    orderId: params.orderId,
    itemId: params.itemId,
    qty: params.qty,
    locationLabel: params.locationLabel,
    onDone: (order) => {
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
    },
  });

  const returnTo = returnLocationText(params.locationLabel);

  return (
    <CatalogScanLocationView
      config={{
        ...scan.config,
        title: 'Scan location QR',
        hint: returnTo
          ? `Put away ${params.qty} of ${params.itemName} at ${returnTo}.`
          : `Put away ${params.qty} of ${params.itemName}. Scan a warehouse location QR.`,
      }}
      permission={scan.permission}
      requestPermission={scan.requestPermission}
      result={scan.result}
      onBarcodeScanned={scan.onBarcodeScanned}
      scanAgain={scan.scanAgain}
      binding={scan.binding}
      error={scan.error}
      itemName={params.itemName}
      onClose={() => navigation.goBack()}
    />
  );
}

export default OrderScanLocation;
