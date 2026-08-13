import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainStackParamList } from '@/navigation/types';
import { useCatalogPhoto } from './hook/useCatalogPhoto';
import { CatalogPhotoView } from './ui/CatalogPhotoView';

type Route = NativeStackScreenProps<MainStackParamList, 'CatalogPhoto'>['route'];
type Navigation = NativeStackScreenProps<
  MainStackParamList,
  'CatalogPhoto'
>['navigation'];

export function CatalogPhoto() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Navigation>();
  const photo = useCatalogPhoto();

  return (
    <CatalogPhotoView
      {...photo}
      onContinue={() => {
        if (photo.photoFileIds.length === 0) return;
        navigation.navigate('CatalogDetails', {
          warehouseId: params.warehouseId,
          photoFileIds: photo.photoFileIds,
        });
      }}
    />
  );
}

export default CatalogPhoto;
