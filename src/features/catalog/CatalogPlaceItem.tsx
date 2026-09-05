import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CatalogStackParamList } from '@/navigation/types';
import { useCatalogPlaceItem } from './hook/useCatalogPlaceItem';
import { CatalogPlaceItemView } from './ui/CatalogPlaceItemView';

type Route = NativeStackScreenProps<
  CatalogStackParamList,
  'CatalogPlaceItem'
>['route'];
type Navigation = NativeStackScreenProps<
  CatalogStackParamList,
  'CatalogPlaceItem'
>['navigation'];

export function CatalogPlaceItem() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Navigation>();
  const place = useCatalogPlaceItem({ itemId: params.itemId });

  return (
    <CatalogPlaceItemView
      itemName={params.itemName}
      printed={params.printed}
      photoUrl={place.photoUrl}
      loading={place.loading}
      refreshing={place.refreshing}
      load={place.load}
      onAddLocation={() => {
        navigation.navigate('CatalogScanLocation', {
          warehouseId: params.warehouseId,
          itemId: params.itemId,
          itemName: params.itemName,
          doneTarget: 'hub',
        });
      }}
      onSkip={() => {
        navigation.popTo('CatalogMenu', {
          warehouseId: params.warehouseId,
        });
      }}
    />
  );
}

export default CatalogPlaceItem;
