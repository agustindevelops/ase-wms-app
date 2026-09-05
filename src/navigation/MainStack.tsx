import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MeSession } from '@/auth/MeSession';
import { ActivityList } from '@/features/dashboard/ActivityList';
import {
  ReportIssueFind,
  ReportIssueForm,
  ReportIssueScan,
} from '@/features/reportIssue';
import { PrinterProvider } from '@/features/print/PrinterProvider';
import { brandHeaderOptions } from './headerOptions';
import { MainTabs } from './MainTabs';
import type { RootMainParamList } from './types';

const Stack = createNativeStackNavigator<RootMainParamList>();

export function MainStack() {
  return (
    <MeSession>
      <PrinterProvider>
        <Stack.Navigator screenOptions={brandHeaderOptions}>
          <Stack.Screen
            name="MainTabs"
            component={MainTabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ActivityList"
            component={ActivityList}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ReportIssueFind"
            component={ReportIssueFind}
            options={{ title: 'Report issue' }}
          />
          <Stack.Screen
            name="ReportIssueScan"
            component={ReportIssueScan}
            options={{ title: 'Scan item', headerShown: false }}
          />
          <Stack.Screen
            name="ReportIssueForm"
            component={ReportIssueForm}
            options={{ title: 'Report issue' }}
          />
        </Stack.Navigator>
      </PrinterProvider>
    </MeSession>
  );
}
