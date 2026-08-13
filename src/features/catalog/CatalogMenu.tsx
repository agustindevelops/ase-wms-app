import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainStackParamList } from '@/navigation/types';
import { CatalogMenuView } from './ui/CatalogMenuView';

type Route = NativeStackScreenProps<MainStackParamList, 'CatalogMenu'>['route'];
type Navigation = NativeStackScreenProps<
  MainStackParamList,
  'CatalogMenu'
>['navigation'];

export function CatalogMenu() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Navigation>();
  const warehouseId = params.warehouseId;

  return (
    <CatalogMenuView
      onCreate={() => navigation.navigate('CatalogPhoto', { warehouseId })}
      onAdd={() =>
        navigation.navigate('CatalogItemList', { warehouseId, mode: 'add' })
      }
      onMove={() =>
        navigation.navigate('CatalogItemList', { warehouseId, mode: 'move' })
      }
      onRemove={() =>
        navigation.navigate('CatalogItemList', { warehouseId, mode: 'remove' })
      }
    />
  );
}

export default CatalogMenu;
