import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  CatalogDetails,
  CatalogGlue,
  CatalogItemList,
  CatalogMenu,
  CatalogPhoto,
  CatalogPrintQr,
  CatalogScanItem,
  CatalogScanLocation,
} from '@/features/catalog';
import { LocationUnitForm } from '@/features/manageWarehouse/LocationUnitForm';
import { LinkLocationQr } from '@/features/manageWarehouse/LinkLocationQr';
import { PrintLocationLabel } from '@/features/manageWarehouse/PrintLocationLabel';
import { WarehouseForm } from '@/features/manageWarehouse/WarehouseForm';
import { WarehouseLevel } from '@/features/manageWarehouse';
import {
  OrderDetail,
  OrderIssue,
  OrderList,
  OrderQty,
  OrderScanItem,
  OrderScanLocation,
} from '@/features/order';
import {
  ReportIssueFind,
  ReportIssueForm,
  ReportIssueScan,
} from '@/features/reportIssue';
import { MainMenu } from '@/features/mainMenu';
import { PrinterProvider } from '@/features/print/PrinterProvider';
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
      <Stack.Screen
        name="CatalogMenu"
        component={CatalogMenu}
        options={{ title: 'Catalog' }}
      />
      <Stack.Screen
        name="CatalogPhoto"
        component={CatalogPhoto}
        options={{ title: 'Catalog · Photo' }}
      />
      <Stack.Screen
        name="CatalogItemList"
        component={CatalogItemList}
        options={({ route }) => ({
          title:
            route.params.mode === 'add'
              ? 'Add to warehouse'
              : route.params.mode === 'move'
                ? 'Move item'
                : 'Remove from location',
        })}
      />
      <Stack.Screen
        name="CatalogScanItem"
        component={CatalogScanItem}
        options={{ title: 'Scan item', headerShown: false }}
      />
      <Stack.Screen
        name="CatalogDetails"
        component={CatalogDetails}
        options={{ title: 'Catalog · Details' }}
      />
      <Stack.Screen
        name="CatalogPrintQr"
        component={CatalogPrintQr}
        options={{ title: 'Catalog · Print QR' }}
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
      <Stack.Screen
        name="OrderList"
        component={OrderList}
        options={({ route }) => ({
          title: route.params.mode === 'pickup' ? 'Pickup Order' : 'Return Order',
        })}
      />
      <Stack.Screen
        name="OrderDetail"
        component={OrderDetail}
        options={({ route }) => ({
          title: route.params.mode === 'pickup' ? 'Pickup' : 'Return',
        })}
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
  );
}
