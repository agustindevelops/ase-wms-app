import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CatalogStackParamList } from '@/navigation/types';
import { useCatalogPrintQr } from './hook/useCatalogPrintQr';
import { CatalogPrintQrView } from './ui/CatalogPrintQrView';

type Route = NativeStackScreenProps<
  CatalogStackParamList,
  'CatalogPrintQr'
>['route'];
type Navigation = NativeStackScreenProps<
  CatalogStackParamList,
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

  const goNext = (printed: boolean) => {
    if (params.offerLocation === false) {
      navigation.popTo('CatalogMenu', {
        warehouseId: params.warehouseId,
      });
      return;
    }
    navigation.navigate('CatalogPlaceItem', {
      warehouseId: params.warehouseId,
      itemId: params.itemId,
      itemName: params.itemName,
      printed,
    });
  };

  return (
    <CatalogPrintQrView
      {...printQr}
      onPrinted={() => goNext(true)}
      onSkip={() => goNext(false)}
    />
  );
}

export default CatalogPrintQr;
