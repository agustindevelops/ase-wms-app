import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { MainStackParamList } from '@/navigation/types';
import { useWarehouseForm } from './hook/useWarehouseForm';
import { WarehouseFormView } from './ui/WarehouseFormView';

type Route = NativeStackScreenProps<MainStackParamList, 'WarehouseForm'>['route'];
type Navigation = NativeStackNavigationProp<MainStackParamList, 'WarehouseForm'>;

export function WarehouseForm() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Navigation>();
  const form = useWarehouseForm({
    warehouseId: params.warehouseId,
    initialName: params.initialName,
  });

  const { submit, ...fields } = form;

  return (
    <WarehouseFormView
      {...fields}
      onCancel={() => navigation.goBack()}
      onSubmit={async () => {
        const savedName = await submit();
        if (!savedName) {
          return;
        }
        navigation.goBack();
      }}
    />
  );
}

export default WarehouseForm;
