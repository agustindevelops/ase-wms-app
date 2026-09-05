import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  OrderDetail,
  OrderIssue,
  OrderList,
  OrderQty,
  OrderScanItem,
  OrderScanLocation,
} from '@/features/order';
import { ProfileMenuButton } from '@/components/ProfileMenuButton';
import { brandHeaderOptions } from './headerOptions';
import type { OrderStackParamList } from './types';

const Stack = createNativeStackNavigator<OrderStackParamList>();

const headerOptions = {
  ...brandHeaderOptions,
  headerRight: () => <ProfileMenuButton />,
} as const;

export function PickupStack() {
  return (
    <Stack.Navigator screenOptions={headerOptions}>
      <Stack.Screen
        name="OrderList"
        component={OrderList}
        initialParams={{ mode: 'pickup' }}
        options={{ title: 'Pickup Order' }}
      />
      <Stack.Screen
        name="OrderDetail"
        component={OrderDetail}
        options={{ title: 'Pickup' }}
      />
      <Stack.Screen
        name="OrderScanItem"
        component={OrderScanItem}
        options={{ title: 'Scan item', headerShown: false }}
      />
      <Stack.Screen
        name="OrderQty"
        component={OrderQty}
        options={{ title: 'Quantity' }}
      />
      <Stack.Screen
        name="OrderScanLocation"
        component={OrderScanLocation}
        options={{ title: 'Scan location', headerShown: false }}
      />
      <Stack.Screen
        name="OrderIssue"
        component={OrderIssue}
        options={{ title: 'Report issue' }}
      />
    </Stack.Navigator>
  );
}

export function ReturnStack() {
  return (
    <Stack.Navigator screenOptions={headerOptions}>
      <Stack.Screen
        name="OrderList"
        component={OrderList}
        initialParams={{ mode: 'return' }}
        options={{ title: 'Return Order' }}
      />
      <Stack.Screen
        name="OrderDetail"
        component={OrderDetail}
        options={{ title: 'Return' }}
      />
      <Stack.Screen
        name="OrderScanItem"
        component={OrderScanItem}
        options={{ title: 'Scan item', headerShown: false }}
      />
      <Stack.Screen
        name="OrderQty"
        component={OrderQty}
        options={{ title: 'Quantity' }}
      />
      <Stack.Screen
        name="OrderScanLocation"
        component={OrderScanLocation}
        options={{ title: 'Scan location', headerShown: false }}
      />
      <Stack.Screen
        name="OrderIssue"
        component={OrderIssue}
        options={{ title: 'Report issue' }}
      />
    </Stack.Navigator>
  );
}
