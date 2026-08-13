import { Alert } from 'react-native';

/** Guards label stock: a batch can burn through a roll in one press. */
export function confirmPrintAll(count: number, deviceName: string): Promise<boolean> {
  const labels = count === 1 ? '1 label' : `${count} labels`;

  return new Promise((resolve) => {
    Alert.alert(
      'Print all labels?',
      `Prints ${labels} on ${deviceName}, one per location at this level.`,
      [
        { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
        { text: `Print ${labels}`, onPress: () => resolve(true) },
      ],
      { onDismiss: () => resolve(false) },
    );
  });
}
