import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LocationUnitForm } from '@/features/manageWarehouse/LocationUnitForm';
import { LinkLocationQr } from '@/features/manageWarehouse/LinkLocationQr';
import { PrintLocationLabel } from '@/features/manageWarehouse/PrintLocationLabel';
import { WarehouseForm } from '@/features/manageWarehouse/WarehouseForm';
import { WarehouseLevel } from '@/features/manageWarehouse';
import { useMe } from '@/auth/MeContext';
import { Box } from '@/components/ui/box';
import { ProfileMenuButton } from '@/components/ProfileMenuButton';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { brandHeaderOptions } from './headerOptions';
import type { WarehouseStackParamList } from './types';

const Stack = createNativeStackNavigator<WarehouseStackParamList>();

const headerOptions = {
  ...brandHeaderOptions,
  headerRight: () => <ProfileMenuButton />,
} as const;

export function WarehouseStack() {
  const { me, busy, error, reload } = useMe();

  if (busy && !me) {
    return (
      <Box className="flex-1 items-center justify-center bg-cream">
        <Spinner />
      </Box>
    );
  }

  if (!me) {
    return (
      <Box className="flex-1 items-center justify-center bg-cream px-6">
        <Text className="text-destructive text-center mb-2">
          {error ?? 'Unable to load warehouse'}
        </Text>
        <Text className="text-green-700" onPress={() => void reload()}>
          Retry
        </Text>
      </Box>
    );
  }

  return (
    <Stack.Navigator screenOptions={headerOptions}>
      <Stack.Screen
        name="WarehouseLevel"
        component={WarehouseLevel}
        initialParams={{
          warehouseId: me.warehouse.id,
          warehouseName: me.warehouse.name,
          level: 1,
          ancestorNames: [],
        }}
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
        options={({ route }) => ({
          title: route.params.locationName
            ? `Print ${route.params.locationName}`
            : 'Print Label',
        })}
      />
      <Stack.Screen
        name="LinkLocationQr"
        component={LinkLocationQr}
        options={{ title: 'Link existing QR', headerShown: false }}
      />
    </Stack.Navigator>
  );
}
