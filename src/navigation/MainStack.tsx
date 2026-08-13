import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LocationUnitForm } from '@/features/manageWarehouse/LocationUnitForm';
import { PrintLocationLabel } from '@/features/manageWarehouse/PrintLocationLabel';
import { WarehouseForm } from '@/features/manageWarehouse/WarehouseForm';
import { WarehouseLevel } from '@/features/manageWarehouse';
import { MainMenu } from '@/features/mainMenu';
import { PrinterProvider } from '@/features/print/PrinterProvider';
import { ImgUploadTabScreen } from '@/screens/ImgUploadTabScreen';
import { PrintTabScreen } from '@/screens/PrintTabScreen';
import type { MainStackParamList } from './types';

const Stack = createNativeStackNavigator<MainStackParamList>();

const headerOptions = {
  headerStyle: { backgroundColor: '#FFFCF9' },
  headerTintColor: '#3d2c1e',
  headerShadowVisible: false,
  headerBackTitle: 'Back',
  contentStyle: { backgroundColor: '#FFFCF9' },
} as const;

export function MainStack() {
  return (
    <PrinterProvider>
      <Stack.Navigator screenOptions={headerOptions}>
      <Stack.Screen
        name="MainMenu"
        component={MainMenu}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="WarehouseLevel"
        component={WarehouseLevel}
        options={({ route }) => ({
          title: route.params.parentName
            ? `Level ${route.params.level}`
            : 'Manage Warehouse',
        })}
      />
      <Stack.Screen
        name="WarehouseForm"
        component={WarehouseForm}
        options={{ title: 'Edit warehouse' }}
      />
      <Stack.Screen
        name="LocationUnitForm"
        component={LocationUnitForm}
        options={({ route }) => ({
          title: route.params.locationUnitId
            ? `Edit Level ${route.params.level}`
            : `Add Level ${route.params.level}`,
        })}
      />
      <Stack.Screen
        name="PrintLocationLabel"
        component={PrintLocationLabel}
        options={{ title: 'Print Label' }}
      />
      <Stack.Screen
        name="PrintPoC"
        component={PrintTabScreen}
        options={{ title: 'Print PoC' }}
      />
      <Stack.Screen
        name="ImgUploadPoC"
        component={ImgUploadTabScreen}
        options={{ title: 'Image upload' }}
      />
      </Stack.Navigator>
    </PrinterProvider>
  );
}
