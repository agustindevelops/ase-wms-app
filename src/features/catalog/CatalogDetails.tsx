import { useEffect } from 'react';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
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

function persistCreatedItemId(navigation: Navigation, itemId: string) {
  navigation.setParams({ itemId });
  const photoRoute = navigation
    .getState()
    .routes.find((route) => route.name === 'CatalogPhoto');
  if (photoRoute) {
    navigation.dispatch({
      ...CommonActions.setParams({ itemId }),
      source: photoRoute.key,
    });
  }
}

export function CatalogDetails() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Navigation>();
  const details = useCatalogDetails({
    warehouseId: params.warehouseId,
    photoFileIds: params.photoFileIds,
    itemId: params.itemId,
  });

  useEffect(() => {
    void details.loadCategories();
  }, [details.loadCategories]);

  useEffect(() => {
    if (!params.itemId) return;
    void details.loadItem(params.itemId);
    // Hydrate once when returning to an item that was already created.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount only
  }, []);

  return (
    <CatalogDetailsView
      {...details}
      onSubmit={async () => {
        const item = await details.submit();
        if (!item) return;
        persistCreatedItemId(navigation, item.id);
        navigation.navigate('CatalogPrintQr', {
          warehouseId: params.warehouseId,
          itemId: item.id,
          itemName: item.name,
          qrCodeId: item.qrCodeId,
          offerLocation: !item.locationUnitId,
        });
      }}
    />
  );
}

export default CatalogDetails;
