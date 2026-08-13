import { ActionSheetIOS, Alert, Platform } from 'react-native';
import { hasLocationQr, type LocationUnit } from '@/api/warehouse';

type Args = {
  unit: LocationUnit;
  printerConnected: boolean;
  onEdit: (unit: LocationUnit) => void;
  onDelete: (unit: LocationUnit) => void;
  onPrint: (unit: LocationUnit) => void;
};

/** Long-press menu: edit / delete, plus print only after the D110 is connected. */
export function showLocationActions({
  unit,
  printerConnected,
  onEdit,
  onDelete,
  onPrint,
}: Args) {
  const title = unit.name;
  const message = hasLocationQr(unit)
    ? `${unit.type.name} · has QR`
    : unit.type.name;

  if (Platform.OS === 'ios') {
    const options = printerConnected
      ? ['Edit', 'Print label', 'Delete', 'Cancel']
      : ['Edit', 'Delete', 'Cancel'];
    const cancelButtonIndex = options.length - 1;
    const destructiveButtonIndex = printerConnected ? 2 : 1;

    ActionSheetIOS.showActionSheetWithOptions(
      { title, message, options, cancelButtonIndex, destructiveButtonIndex },
      (index) => {
        if (printerConnected) {
          if (index === 0) onEdit(unit);
          if (index === 1) onPrint(unit);
          if (index === 2) onDelete(unit);
          return;
        }
        if (index === 0) onEdit(unit);
        if (index === 1) onDelete(unit);
      },
    );
    return;
  }

  const buttons = [
    { text: 'Edit', onPress: () => onEdit(unit) },
    ...(printerConnected
      ? [{ text: 'Print label', onPress: () => onPrint(unit) }]
      : []),
    { text: 'Delete', style: 'destructive' as const, onPress: () => onDelete(unit) },
    { text: 'Cancel', style: 'cancel' as const },
  ];

  Alert.alert(title, message, buttons);
}
