import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CatalogScanLocationView } from '@/features/catalog/ui/CatalogScanLocationView';
import type { MainStackParamList } from '@/navigation/types';
import { remainingForMode } from './hook/useOrderDetail';
import { useOrderScanItem } from './hook/useOrderScanItem';

type Route = NativeStackScreenProps<MainStackParamList, 'OrderScanItem'>['route'];
type Navigation = NativeStackScreenProps<
  MainStackParamList,
  'OrderScanItem'
>['navigation'];

export function OrderScanItem() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Navigation>();
  const scan = useOrderScanItem({
    orderId: params.orderId,
    mode: params.mode,
    onLine: (line) => {
      navigation.replace('OrderQty', {
        orderId: params.orderId,
        mode: params.mode,
        itemId: line.itemId,
        itemName: line.item.name,
        remaining: remainingForMode(line, params.mode),
        locationLabel: line.item.locationLabel,
      });
    },
  });

  return (
    <CatalogScanLocationView
      config={{
        ...scan.config,
        title: 'Scan item QR',
        hint:
          params.mode === 'pickup'
            ? 'Point at the item QR for a line on this order.'
            : 'Point at the item QR being returned.',
      }}
      permission={scan.permission}
      requestPermission={scan.requestPermission}
      result={scan.result}
      onBarcodeScanned={scan.onBarcodeScanned}
      scanAgain={scan.scanAgain}
      binding={scan.binding}
      error={scan.error}
      itemName="item"
      onClose={() => navigation.goBack()}
    />
  );
}

export default OrderScanItem;
