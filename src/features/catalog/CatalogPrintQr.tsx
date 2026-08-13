import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainStackParamList } from '@/navigation/types';
import { useCatalogPrintQr } from './hook/useCatalogPrintQr';
import { CatalogPrintQrView } from './ui/CatalogPrintQrView';

type Route = NativeStackScreenProps<
  MainStackParamList,
  'CatalogPrintQr'
>['route'];
type Navigation = NativeStackScreenProps<
  MainStackParamList,
  'CatalogPrintQr'
>['navigation'];

export function CatalogPrintQr() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Navigation>();
  const printQr = useCatalogPrintQr({
    warehouseId: params.warehouseId,
    itemId: params.itemId,
    itemName: params.itemName,
    initialQrCodeId: params.qrCodeId,
  });

  return (
    <CatalogPrintQrView
      {...printQr}
      onContinue={() => {
        navigation.navigate('CatalogGlue', {
          warehouseId: params.warehouseId,
          itemId: params.itemId,
          itemName: params.itemName,
        });
      }}
      onSkip={() => {
        navigation.navigate('CatalogScanLocation', {
          warehouseId: params.warehouseId,
          itemId: params.itemId,
          itemName: params.itemName,
        });
      }}
    />
  );
}

export default CatalogPrintQr;
