import { PrintPage } from 'react-native-niimblue-lib';
import {
  LABEL_HEIGHT,
  LABEL_ID,
  LABEL_WIDTH,
} from '@/config/printer';
import { addBitmapText } from './bitmapText';
import { assertEncodedSize, type EncodedImage } from './assertEncodedSize';

/**
 * Max-height QR at design left; digits just to its right.
 * Remaining space further right is free for a future product name.
 */
export function buildQrPage(): EncodedImage {
  const page = new PrintPage(LABEL_WIDTH, LABEL_HEIGHT, 'landscape');
  const qrSize = 96;
  const gap = 6;

  page.addQR(LABEL_ID, {
    x: 0,
    y: 48,
    width: qrSize,
    height: qrSize,
    align: 'left',
    vAlign: 'middle',
    ecl: 'M',
  });

  addBitmapText(page, LABEL_ID, {
    x: qrSize + gap,
    y: 48,
    scale: 2.5,
    align: 'left',
    vAlign: 'middle',
  });

  return assertEncodedSize(page.toEncodedImage(), LABEL_WIDTH, LABEL_HEIGHT);
}
