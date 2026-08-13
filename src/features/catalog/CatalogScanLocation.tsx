import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainStackParamList } from '@/navigation/types';
import { useCatalogScanLocation } from './hook/useCatalogScanLocation';
import { CatalogScanLocationView } from './ui/CatalogScanLocationView';

type Route = NativeStackScreenProps<
  MainStackParamList,
  'CatalogScanLocation'
>['route'];
type Navigation = NativeStackScreenProps<
  MainStackParamList,
  'CatalogScanLocation'
>['navigation'];

export function CatalogScanLocation() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Navigation>();
  const scan = useCatalogScanLocation({
    warehouseId: params.warehouseId,
    itemId: params.itemId,
    onBound: () => {
      if (params.doneTarget === 'hub') {
        navigation.popTo('CatalogMenu', {
          warehouseId: params.warehouseId,
        });
        return;
      }
      navigation.popToTop();
    },
  });

  return (
    <CatalogScanLocationView
      config={{
        ...scan.config,
        title: 'Scan location QR',
        hint: `Point at the warehouse location label for ${params.itemName}.`,
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

export default CatalogScanLocation;
