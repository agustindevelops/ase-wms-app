import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  CatalogDetails,
  CatalogGlue,
  CatalogItemList,
  CatalogMenu,
  CatalogPhoto,
  CatalogPlaceItem,
  CatalogPrintQr,
  CatalogScanItem,
  CatalogScanLocation,
} from '@/features/catalog';
import { useMe } from '@/auth/MeContext';
import { Box } from '@/components/ui/box';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { PrinterHeaderTitle } from '@/features/print/ui/PrinterHeaderTitle';
import { brandHeaderOptions } from './headerOptions';
import type { CatalogStackParamList } from './types';

const Stack = createNativeStackNavigator<CatalogStackParamList>();

const headerOptions = {
  ...brandHeaderOptions,
} as const;

export function CatalogStack() {
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
        name="CatalogMenu"
        component={CatalogMenu}
        initialParams={{ warehouseId: me.warehouse.id }}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CatalogPhoto"
        component={CatalogPhoto}
        options={({ route }) => ({
          title: route.params.itemId ? 'Edit photos' : 'Catalog · Photo',
        })}
      />
      <Stack.Screen
        name="CatalogItemList"
        component={CatalogItemList}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CatalogScanItem"
        component={CatalogScanItem}
        options={{ title: 'Scan item', headerShown: false }}
      />
      <Stack.Screen
        name="CatalogDetails"
        component={CatalogDetails}
        options={({ route }) => ({
          title: route.params.itemId ? 'Edit item' : 'Catalog · Details',
        })}
      />
      <Stack.Screen
        name="CatalogPrintQr"
        component={CatalogPrintQr}
        options={{
          headerTitle: () => <PrinterHeaderTitle title="Create Label" />,
        }}
      />
      <Stack.Screen
        name="CatalogPlaceItem"
        component={CatalogPlaceItem}
        options={{ title: 'Add to warehouse' }}
      />
      <Stack.Screen
        name="CatalogGlue"
        component={CatalogGlue}
        options={{ title: 'Catalog · Attach QR' }}
      />
      <Stack.Screen
        name="CatalogScanLocation"
        component={CatalogScanLocation}
        options={{ title: 'Catalog · Location', headerShown: false }}
      />
    </Stack.Navigator>
  );
}
