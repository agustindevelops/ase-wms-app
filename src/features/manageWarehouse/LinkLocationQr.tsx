import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CatalogScanLocationView } from '@/features/catalog/ui/CatalogScanLocationView';
import type { MainStackParamList } from '@/navigation/types';
import { useLinkLocationQr } from './hook/useLinkLocationQr';

type Route = NativeStackScreenProps<
  MainStackParamList,
  'LinkLocationQr'
>['route'];
type Navigation = NativeStackScreenProps<
  MainStackParamList,
  'LinkLocationQr'
>['navigation'];

export function LinkLocationQr() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Navigation>();
  const scan = useLinkLocationQr({
    warehouseId: params.warehouseId,
    locationUnitId: params.locationUnitId,
    onLinked: () => navigation.goBack(),
  });

  return (
    <CatalogScanLocationView
      config={{
        ...scan.config,
        title: 'Link existing QR',
        hint: `Point at the printed label for ${params.locationName}.`,
      }}
      permission={scan.permission}
      requestPermission={scan.requestPermission}
      result={scan.result}
      onBarcodeScanned={scan.onBarcodeScanned}
      scanAgain={scan.scanAgain}
      binding={scan.binding}
      error={scan.error}
      itemName={params.locationName}
      onClose={() => navigation.goBack()}
    />
  );
}

export default LinkLocationQr;
