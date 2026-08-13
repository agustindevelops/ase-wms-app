import { useCallback, useEffect } from 'react';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { apiErrorMessage } from '@/api/client';
import {
  ensureLocationQrPayload,
  locationLabelText,
  type EnsuredLocationQr,
  type LocationUnit,
} from '@/api/warehouse';
import { useAppToast } from '@/components/ui/toast';
import { usePrinter } from '@/features/print/PrinterProvider';
import type { MainStackParamList } from '@/navigation/types';
import { useWarehouseLevel } from './hook/useWarehouseLevel';
import { confirmPrintAll } from './ui/confirmPrintAll';
import { WarehouseLevelView } from './ui/WarehouseLevelView';

type Route = NativeStackScreenProps<MainStackParamList, 'WarehouseLevel'>['route'];
type Navigation = NativeStackNavigationProp<MainStackParamList, 'WarehouseLevel'>;

export function WarehouseLevel() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Navigation>();
  const printer = usePrinter();
  const toast = useAppToast();
  const level = useWarehouseLevel({
    warehouseId: params.warehouseId,
    parentLocationUnitId: params.parentLocationUnitId,
  });

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

  const printUnitQr = async (unit: LocationUnit) => {
    let resolved;
    try {
      resolved = await ensureLocationQrPayload(params.warehouseId, unit);
    } catch (cause) {
      toast.error(apiErrorMessage(cause));
      return;
    }

    level.applyLocationUnit(resolved.unit);

    try {
      await printer.printQrPayload(
        resolved.payload,
        locationLabelText(resolved.unit),
      );
      toast.success('Printed location label.');
    } catch {
      // usePrint already toasted the printer error
    }
  };

  /**
   * Batch print: QR creation runs in parallel (independent POSTs), printing
   * stays sequential because the printer handles one page at a time.
   */
  const printAllChildren = async () => {
    if (!printer.deviceName) {
      await printer.connect();
      return;
    }

    const targets = level.units;
    if (targets.length === 0) {
      toast.error('No locations at this level to print.');
      return;
    }

    if (!(await confirmPrintAll(targets.length, printer.deviceName))) {
      return;
    }

    const settled = await Promise.allSettled(
      targets.map((unit) => ensureLocationQrPayload(params.warehouseId, unit)),
    );

    const ready: EnsuredLocationQr[] = [];
    let firstFailure: unknown;

    settled.forEach((outcome) => {
      if (outcome.status === 'fulfilled') {
        ready.push(outcome.value);
        level.applyLocationUnit(outcome.value.unit);
        return;
      }
      firstFailure ??= outcome.reason;
    });

    if (firstFailure !== undefined) {
      toast.error(
        `${settled.length - ready.length} QR code(s) failed: ${apiErrorMessage(firstFailure)}`,
      );
    }

    let printed = 0;
    for (const item of ready) {
      try {
        await printer.printQrPayload(item.payload, locationLabelText(item.unit));
        printed += 1;
      } catch {
        // usePrint toasted the printer error; stop instead of failing every page
        break;
      }
    }

    if (printed === targets.length) {
      toast.success(`Printed ${printed} location labels.`);
    } else if (printed > 0) {
      toast.error(`Printed ${printed} of ${targets.length} labels.`);
    }
  };

  const onPrinterPress = async () => {
    if (!printer.deviceName) {
      await printer.connect();
      return;
    }

    const unit = level.currentUnit;
    if (!unit) {
      await printer.connect();
      return;
    }

    await printUnitQr(unit);
  };

  const onPrint = (unit: LocationUnit) => {
    if (printer.deviceName) {
      void printUnitQr(unit);
      return;
    }

    navigation.navigate('PrintLocationLabel', {
      warehouseId: params.warehouseId,
      locationUnitId: unit.id,
      locationName: unit.name,
    });
  };

  return (
    <WarehouseLevelView
      {...level}
      warehouseName={params.warehouseName}
      parentName={params.parentName}
      ancestorNames={params.ancestorNames ?? []}
      level={params.level}
      isRoot={!params.parentLocationUnitId}
      printerBusy={printer.busy}
      printerMessage={printer.message}
      deviceName={printer.deviceName}
      onAdd={onAdd}
      onEdit={onEdit}
      onEditCurrent={onEditCurrent}
      onPrint={onPrint}
      onPrintAll={printAllChildren}
      onOpen={onOpen}
      onPrinterPress={onPrinterPress}
    />
  );
}

export default WarehouseLevel;
