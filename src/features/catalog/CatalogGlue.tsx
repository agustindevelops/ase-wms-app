import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainStackParamList } from '@/navigation/types';
import { CatalogGlueView } from './ui/CatalogGlueView';

type Route = NativeStackScreenProps<MainStackParamList, 'CatalogGlue'>['route'];
type Navigation = NativeStackScreenProps<
  MainStackParamList,
  'CatalogGlue'
>['navigation'];

export function CatalogGlue() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Navigation>();

  return (
    <CatalogGlueView
      itemName={params.itemName}
      onConfirm={() => {
        navigation.navigate('CatalogScanLocation', {
          warehouseId: params.warehouseId,
          itemId: params.itemId,
          itemName: params.itemName,
        });
      }}
    />
  );
}

export default CatalogGlue;
