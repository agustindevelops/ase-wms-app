import { useCallback } from 'react';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainStackParamList } from '@/navigation/types';
import { usePrintLocationLabel } from './hook/usePrintLocationLabel';
import { PrintLocationLabelView } from './ui/PrintLocationLabelView';

type Route = NativeStackScreenProps<
  MainStackParamList,
  'PrintLocationLabel'
>['route'];
type Navigation = NativeStackNavigationProp<
  MainStackParamList,
  'PrintLocationLabel'
>;

export function PrintLocationLabel() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Navigation>();
  const label = usePrintLocationLabel({
    warehouseId: params.warehouseId,
    locationUnitId: params.locationUnitId,
  });

  useFocusEffect(
    useCallback(() => {
      void label.load();
    }, [label.load]),
  );

  return (
    <PrintLocationLabelView
      {...label}
      onScanExisting={
        label.qrPayload
          ? undefined
          : () =>
              navigation.navigate('LinkLocationQr', {
                warehouseId: params.warehouseId,
                locationUnitId: params.locationUnitId,
                locationName: params.locationName,
              })
      }
    />
  );
}

export default PrintLocationLabel;
