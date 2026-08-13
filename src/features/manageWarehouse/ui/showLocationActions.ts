import { ActionSheetIOS, Alert, Platform } from 'react-native';
import { hasLocationQr, type LocationUnit } from '@/api/warehouse';

type Args = {
  unit: LocationUnit;
  onEdit: (unit: LocationUnit) => void;
  onDelete: (unit: LocationUnit) => void;
  onPrint: (unit: LocationUnit) => void;
};

/** Long-press menu: edit / print label / delete. */
export function showLocationActions({
  unit,
  onEdit,
  onDelete,
  onPrint,
}: Args) {
  const title = unit.name;
  const message = hasLocationQr(unit)
    ? `${unit.type.name} · has QR`
    : unit.type.name;

  if (Platform.OS === 'ios') {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        title,
        message,
        options: ['Edit', 'Print label', 'Delete', 'Cancel'],
        cancelButtonIndex: 3,
        destructiveButtonIndex: 2,
      },
      (index) => {
        if (index === 0) onEdit(unit);
        if (index === 1) onPrint(unit);
        if (index === 2) onDelete(unit);
      },
    );
    return;
  }

  Alert.alert(title, message, [
    { text: 'Edit', onPress: () => onEdit(unit) },
    { text: 'Print label', onPress: () => onPrint(unit) },
    { text: 'Delete', style: 'destructive', onPress: () => onDelete(unit) },
    { text: 'Cancel', style: 'cancel' },
  ]);
}
