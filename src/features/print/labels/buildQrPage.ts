import { PrintPage } from 'react-native-niimblue-lib';
import {
  LABEL_HEIGHT,
  LABEL_ID,
  LABEL_WIDTH,
} from '@/config/printer';
import { addBitmapText } from './bitmapText';
import { assertEncodedSize, type EncodedImage } from './assertEncodedSize';

function digitsForLabel(text: string): string {
  return text.replace(/\D/g, '').slice(0, 12);
}

/**
 * Max-height QR at design left; digits just to its right when the payload or
 * label contains digits. Remaining space further right is free for a name.
 */
export function buildQrPage(
  payload: string = LABEL_ID,
  options?: { digitText?: string },
): EncodedImage {
  const page = new PrintPage(LABEL_WIDTH, LABEL_HEIGHT, 'landscape');
  const qrSize = 96;
  const gap = 6;

  page.addQR(payload, {
    x: 0,
    y: 48,
    width: qrSize,
    height: qrSize,
    align: 'left',
    vAlign: 'middle',
    ecl: 'M',
  });

  const digitText = digitsForLabel(options?.digitText ?? payload);
  if (digitText.length > 0) {
    addBitmapText(page, digitText, {
      x: qrSize + gap,
      y: 48,
      scale: 2.5,
      align: 'left',
      vAlign: 'middle',
    });
  }

  return assertEncodedSize(page.toEncodedImage(), LABEL_WIDTH, LABEL_HEIGHT);
}
