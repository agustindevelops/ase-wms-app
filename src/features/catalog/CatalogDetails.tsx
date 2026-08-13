import { useEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainStackParamList } from '@/navigation/types';
import { useCatalogDetails } from './hook/useCatalogDetails';
import { CatalogDetailsView } from './ui/CatalogDetailsView';

type Route = NativeStackScreenProps<
  MainStackParamList,
  'CatalogDetails'
>['route'];
type Navigation = NativeStackScreenProps<
  MainStackParamList,
  'CatalogDetails'
>['navigation'];

export function CatalogDetails() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Navigation>();
  const details = useCatalogDetails({
    warehouseId: params.warehouseId,
    photoFileIds: params.photoFileIds,
  });

  useEffect(() => {
    void details.loadCategories();
  }, [details.loadCategories]);

  return (
    <CatalogDetailsView
      {...details}
      onSubmit={async () => {
        const item = await details.submit();
        if (!item) return;
        navigation.navigate('CatalogPrintQr', {
          warehouseId: params.warehouseId,
          itemId: item.id,
          itemName: item.name,
          qrCodeId: item.qrCodeId,
        });
      }}
    />
  );
}

export default CatalogDetails;
