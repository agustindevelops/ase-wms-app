import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainStackParamList } from '@/navigation/types';
import { useReportIssueForm } from './hook/useReportIssueForm';
import { ReportIssueFormView } from './ui/ReportIssueFormView';

type Route = NativeStackScreenProps<
  MainStackParamList,
  'ReportIssueForm'
>['route'];
type Navigation = NativeStackScreenProps<
  MainStackParamList,
  'ReportIssueForm'
>['navigation'];

export function ReportIssueForm() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Navigation>();
  const form = useReportIssueForm({
    itemId: params.itemId,
    warehouseId: params.warehouseId,
  });

  return (
    <ReportIssueFormView
      {...form}
      itemName={params.itemName}
      onSubmit={async () => {
        const ok = await form.submit();
        if (!ok) return;
        navigation.navigate('MainTabs', { screen: 'Dashboard' });
      }}
    />
  );
}

export default ReportIssueForm;
