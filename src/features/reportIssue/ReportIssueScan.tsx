import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CatalogScanLocationView } from '@/features/catalog/ui/CatalogScanLocationView';
import type { MainStackParamList } from '@/navigation/types';
import { useReportIssueScan } from './hook/useReportIssueScan';

type Route = NativeStackScreenProps<
  MainStackParamList,
  'ReportIssueScan'
>['route'];
type Navigation = NativeStackScreenProps<
  MainStackParamList,
  'ReportIssueScan'
>['navigation'];

export function ReportIssueScan() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Navigation>();
  const scan = useReportIssueScan({
    warehouseId: params.warehouseId,
    onItem: (item) => {
      navigation.replace('ReportIssueForm', {
        warehouseId: params.warehouseId,
        itemId: item.id,
        itemName: item.name,
      });
    },
  });

  return (
    <CatalogScanLocationView
      config={{
        ...scan.config,
        title: 'Scan item QR',
        hint: 'Point at the item QR to report Missing or Broken.',
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

export default ReportIssueScan;
