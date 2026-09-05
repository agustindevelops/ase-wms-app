import { useRef } from 'react';
import { Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { unbindItemLocation } from '@/api/catalog';
import { apiErrorMessage } from '@/api/client';
import { useAppToast } from '@/components/ui/toast';
import type { MainStackParamList } from '@/navigation/types';
import { useCatalogScanItem } from './hook/useCatalogScanItem';
import { CatalogScanLocationView } from './ui/CatalogScanLocationView';

type Route = NativeStackScreenProps<
  MainStackParamList,
  'CatalogScanItem'
>['route'];
type Navigation = NativeStackScreenProps<
  MainStackParamList,
  'CatalogScanItem'
>['navigation'];

export function CatalogScanItem() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Navigation>();
  const toast = useAppToast();

  const scanAgainRef = useRef(() => {});
  const scan = useCatalogScanItem({
    warehouseId: params.warehouseId,
    mode: params.mode,
    onItem: (item) => {
      if (params.mode === 'edit') {
        navigation.replace('CatalogPhoto', {
          warehouseId: params.warehouseId,
          itemId: item.id,
        });
        return;
      }
      if (params.mode === 'move') {
        navigation.replace('CatalogScanLocation', {
          warehouseId: params.warehouseId,
          itemId: item.id,
          itemName: item.name,
          doneTarget: 'hub',
        });
        return;
      }

      const place =
        item.locationUnit?.label?.trim() ||
        item.locationUnit?.name?.trim() ||
        'its location';
      Alert.alert(
        'Remove from location?',
        `Detach "${item.name}" from ${place}? The item stays in the catalog.`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => scanAgainRef.current(),
          },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: () => {
              void (async () => {
                try {
                  await unbindItemLocation(params.warehouseId, item.id);
                  toast.success(`Removed ${item.name} from its location.`);
                  navigation.popTo('CatalogMenu', {
                    warehouseId: params.warehouseId,
                  });
                } catch (cause) {
                  toast.error(apiErrorMessage(cause));
                  scanAgainRef.current();
                }
              })();
            },
          },
        ],
      );
    },
  });
  scanAgainRef.current = scan.scanAgain;

  return (
    <CatalogScanLocationView
      config={{
        ...scan.config,
        title: 'Scan item QR',
        hint:
          params.mode === 'edit'
            ? 'Point at the item QR to edit photos, details, or its label.'
            : params.mode === 'move'
              ? 'Point at the item QR, then scan the new location.'
              : 'Point at the item QR to detach it from its location.',
      }}
      permission={scan.permission}
      requestPermission={scan.requestPermission}
      result={scan.result}
      onBarcodeScanned={scan.onBarcodeScanned}
      scanAgain={scan.scanAgain}
      binding={scan.binding}
      error={scan.error}
      itemName="item"
      onClose={() => navigation.goBack()}
    />
  );
}

export default CatalogScanItem;
