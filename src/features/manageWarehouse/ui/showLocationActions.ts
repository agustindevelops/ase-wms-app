import { ActionSheetIOS, Alert, Platform } from 'react-native';
import { hasLocationQr, type LocationUnit } from '@/api/warehouse';

type Args = {
  unit: LocationUnit;
  onEdit: (unit: LocationUnit) => void;
  onDelete: (unit: LocationUnit) => void;
  onPrint: (unit: LocationUnit) => void;
  onLinkQr: (unit: LocationUnit) => void;
};

/** Long-press menu: edit / print label / link existing QR / delete. */
export function showLocationActions({
  unit,
  onEdit,
  onDelete,
  onPrint,
  onLinkQr,
}: Args) {
  const title = unit.name;
  const canLinkQr = !hasLocationQr(unit);
  const message = canLinkQr ? unit.type.name : `${unit.type.name} · has QR`;

  const actions: {
    label: string;
    destructive?: boolean;
    run: () => void;
  }[] = [
    { label: 'Edit', run: () => onEdit(unit) },
    { label: 'Print label', run: () => onPrint(unit) },
  ];
  if (canLinkQr) {
    actions.push({
      label: 'Link existing QR',
      run: () => onLinkQr(unit),
    });
  }
  actions.push({
    label: 'Delete',
    destructive: true,
    run: () => onDelete(unit),
  });

  if (Platform.OS === 'ios') {
    const options = [...actions.map((action) => action.label), 'Cancel'];
    ActionSheetIOS.showActionSheetWithOptions(
      {
        title,
        message,
        options,
        cancelButtonIndex: options.length - 1,
        destructiveButtonIndex: actions.findIndex((action) => action.destructive),
      },
      (index) => {
        actions[index]?.run();
      },
    );
    return;
  }

  Alert.alert(title, message, [
    ...actions.map((action) => ({
      text: action.label,
      style: action.destructive ? ('destructive' as const) : ('default' as const),
      onPress: action.run,
    })),
    { text: 'Cancel', style: 'cancel' as const },
  ]);
}
