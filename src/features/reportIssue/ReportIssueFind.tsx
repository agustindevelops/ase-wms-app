import { useEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CatalogItem } from '@/api/catalog';
import { useAppToast } from '@/components/ui/toast';
import type { MainStackParamList } from '@/navigation/types';
import { useReportIssueFind } from './hook/useReportIssueFind';
import { ReportIssueFindView } from './ui/ReportIssueFindView';

type Route = NativeStackScreenProps<
  MainStackParamList,
  'ReportIssueFind'
>['route'];
type Navigation = NativeStackScreenProps<
  MainStackParamList,
  'ReportIssueFind'
>['navigation'];

export function ReportIssueFind() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Navigation>();
  const toast = useAppToast();
  const find = useReportIssueFind({ warehouseId: params.warehouseId });

  useEffect(() => {
    void find.load();
  }, [find.load]);

  const goForm = (item: CatalogItem) => {
    const available = Math.min(item.quantityOwned, item.quantityAvailable);
    if (available <= 0) {
      toast.error(
        'No available quantity to report. Use Return Order if this item is out.',
      );
      return;
    }
    navigation.navigate('ReportIssueForm', {
      warehouseId: params.warehouseId,
      itemId: item.id,
      itemName: item.name,
    });
  };

  return (
    <ReportIssueFindView
      {...find}
      onScanItem={() =>
        navigation.navigate('ReportIssueScan', {
          warehouseId: params.warehouseId,
        })
      }
      onSelect={goForm}
    />
  );
}

export default ReportIssueFind;
