import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootMainParamList } from '@/navigation/types';
import { useDashboard } from './hook/useDashboard';
import { DashboardView } from './ui/DashboardView';

type Nav = NativeStackNavigationProp<RootMainParamList>;

export function Dashboard() {
  const navigation = useNavigation<Nav>();
  const dash = useDashboard();

  return (
    <DashboardView
      {...dash}
      onSeeAll={() => navigation.navigate('ActivityList', {})}
    />
  );
}

export default Dashboard;
