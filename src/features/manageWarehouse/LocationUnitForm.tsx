import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { MainStackParamList } from '@/navigation/types';
import { useLocationUnitForm } from './hook/useLocationUnitForm';
import { LocationUnitFormView } from './ui/LocationUnitFormView';

type Route = NativeStackScreenProps<MainStackParamList, 'LocationUnitForm'>['route'];
type Navigation = NativeStackNavigationProp<MainStackParamList, 'LocationUnitForm'>;

export function LocationUnitForm() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Navigation>();
  const form = useLocationUnitForm({
    warehouseId: params.warehouseId,
    parentLocationUnitId: params.parentLocationUnitId,
    locationUnitId: params.locationUnitId,
    initialName: params.initialName,
    initialLabel: params.initialLabel,
  });

  const { submit, ...fields } = form;

  return (
    <LocationUnitFormView
      {...fields}
      level={params.level}
      onCancel={() => navigation.goBack()}
      onSubmit={() => {
        void (async () => {
          const saved = await submit();
          if (saved) {
            navigation.goBack();
          }
        })();
      }}
    />
  );
}

export default LocationUnitForm;
