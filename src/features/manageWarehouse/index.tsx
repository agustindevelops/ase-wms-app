import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { apiErrorMessage } from '@/api/client';
import {
  ensureLocationQrPayload,
  locationQrPayload,
  type LocationUnit,
} from '@/api/warehouse';
import { usePrinter } from '@/features/print/PrinterProvider';
import type { MainStackParamList } from '@/navigation/types';
import { useWarehouseLevel } from './hook/useWarehouseLevel';
import { WarehouseLevelView } from './ui/WarehouseLevelView';

type Route = NativeStackScreenProps<MainStackParamList, 'WarehouseLevel'>['route'];
type Navigation = NativeStackNavigationProp<MainStackParamList, 'WarehouseLevel'>;

export function WarehouseLevel() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Navigation>();
  const printer = usePrinter();
  const level = useWarehouseLevel({
    warehouseId: params.warehouseId,
    parentLocationUnitId: params.parentLocationUnitId,
  });
  const [printing, setPrinting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      void level.load('refresh');
    }, [level.load]),
  );

  useEffect(() => {
    if (level.warehouse && level.warehouse.name !== params.warehouseName) {
      navigation.setParams({ warehouseName: level.warehouse.name });
    }
    if (level.currentUnit && level.currentUnit.name !== params.parentName) {
      navigation.setParams({ parentName: level.currentUnit.name });
    }
  }, [
    level.currentUnit,
    level.warehouse,
    navigation,
    params.parentName,
    params.warehouseName,
  ]);

  const onOpen = (unit: LocationUnit) => {
    const ancestorNames = params.parentName
      ? [...(params.ancestorNames ?? []), params.parentName]
      : [params.warehouseName];

    navigation.push('WarehouseLevel', {
      warehouseId: params.warehouseId,
      warehouseName: params.warehouseName,
      level: params.level + 1,
      parentLocationUnitId: unit.id,
      parentName: unit.name,
      ancestorNames,
    });
  };

  const onAdd = () => {
    navigation.navigate('LocationUnitForm', {
      warehouseId: params.warehouseId,
      warehouseName: params.warehouseName,
      level: params.level,
      parentLocationUnitId: params.parentLocationUnitId,
    });
  };

  const onEdit = (unit: LocationUnit) => {
    navigation.navigate('LocationUnitForm', {
      warehouseId: params.warehouseId,
      warehouseName: params.warehouseName,
      level: params.level,
      parentLocationUnitId: params.parentLocationUnitId,
      locationUnitId: unit.id,
      initialName: unit.name,
      initialLabel: unit.label ?? '',
    });
  };

  const onEditCurrent = () => {
    if (params.parentLocationUnitId) {
      const unit = level.currentUnit;
      if (!unit) return;
      navigation.navigate('LocationUnitForm', {
        warehouseId: params.warehouseId,
        warehouseName: params.warehouseName,
        level: Math.max(1, params.level - 1),
        parentLocationUnitId: unit.parentLocationUnitId ?? undefined,
        locationUnitId: unit.id,
        initialName: unit.name,
        initialLabel: unit.label ?? '',
      });
      return;
    }

    navigation.navigate('WarehouseForm', {
      warehouseId: params.warehouseId,
      initialName: level.warehouse?.name ?? params.warehouseName,
    });
  };

  const onPrint = async (unit: LocationUnit) => {
    if (!printer.deviceName) return;
    setPrinting(true);
    try {
      const hadQr = Boolean(locationQrPayload(unit));
      const payload = await ensureLocationQrPayload(
        params.warehouseId,
        unit,
      );
      await printer.printQrPayload(payload, unit.label ?? undefined);
      if (!hadQr) {
        await level.load('refresh');
      }
    } catch (cause) {
      level.setError(apiErrorMessage(cause));
    } finally {
      setPrinting(false);
    }
  };

  return (
    <WarehouseLevelView
      {...level}
      warehouseName={params.warehouseName}
      parentName={params.parentName}
      ancestorNames={params.ancestorNames ?? []}
      level={params.level}
      isRoot={!params.parentLocationUnitId}
      printerConnected={Boolean(printer.deviceName)}
      printerBusy={printer.busy}
      printerMessage={printer.message}
      deviceName={printer.deviceName}
      printing={printing}
      onAdd={onAdd}
      onEdit={onEdit}
      onEditCurrent={onEditCurrent}
      onPrint={(unit) => {
        void onPrint(unit);
      }}
      onOpen={onOpen}
      onConnectPrinter={() => {
        void printer.connect();
      }}
    />
  );
}

export default WarehouseLevel;
