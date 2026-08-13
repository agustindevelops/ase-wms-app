import { useEffect } from 'react';
import { useRoute } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainStackParamList } from '@/navigation/types';
import { usePrintLocationLabel } from './hook/usePrintLocationLabel';
import { PrintLocationLabelView } from './ui/PrintLocationLabelView';

type Route = NativeStackScreenProps<
  MainStackParamList,
  'PrintLocationLabel'
>['route'];

export function PrintLocationLabel() {
  const { params } = useRoute<Route>();
  const label = usePrintLocationLabel({
    warehouseId: params.warehouseId,
    locationUnitId: params.locationUnitId,
  });

  useEffect(() => {
    void label.load();
  }, [label.load]);

  return <PrintLocationLabelView {...label} />;
}

export default PrintLocationLabel;
