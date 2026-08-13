import { useEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CatalogItem } from '@/api/catalog';
import type { MainStackParamList } from '@/navigation/types';
import { useCatalogItemList } from './hook/useCatalogItemList';
import { CatalogItemListView } from './ui/CatalogItemListView';

type Route = NativeStackScreenProps<
  MainStackParamList,
  'CatalogItemList'
>['route'];
type Navigation = NativeStackScreenProps<
  MainStackParamList,
  'CatalogItemList'
>['navigation'];

export function CatalogItemList() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Navigation>();
  const list = useCatalogItemList({
    warehouseId: params.warehouseId,
    mode: params.mode,
  });

  useEffect(() => {
    void list.load();
  }, [list.load]);

  const goScanLocation = (item: CatalogItem) => {
    navigation.navigate('CatalogScanLocation', {
      warehouseId: params.warehouseId,
      itemId: item.id,
      itemName: item.name,
      doneTarget: 'hub',
    });
  };

  const onSelect = (item: CatalogItem) => {
    if (params.mode === 'remove') {
      list.confirmRemove(item, () =>
        navigation.popTo('CatalogMenu', {
          warehouseId: params.warehouseId,
        }),
      );
      return;
    }
    goScanLocation(item);
  };

  return (
    <CatalogItemListView
      mode={params.mode}
      items={list.items}
      loading={list.loading}
      refreshing={list.refreshing}
      busyId={list.busyId}
      error={list.error}
      load={list.load}
      onScanItem={
        params.mode === 'add'
          ? undefined
          : () => {
              const mode = params.mode;
              if (mode === 'add') return;
              navigation.navigate('CatalogScanItem', {
                warehouseId: params.warehouseId,
                mode,
              });
            }
      }
      onSelect={onSelect}
    />
  );
}

export default CatalogItemList;
