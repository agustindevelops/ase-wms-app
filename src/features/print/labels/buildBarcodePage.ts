import { PrintPage } from 'react-native-niimblue-lib';
import {
  LABEL_HEIGHT,
  LABEL_ID,
  LABEL_WIDTH,
} from '@/config/printer';
import { addBitmapText } from './bitmapText';
import { assertEncodedSize, type EncodedImage } from './assertEncodedSize';

/**
 * Full-length Code 128 with human-readable digits underneath.
 * Landscape canvas is 240×96 — barcode uses most of the height; digits sit below.
 */
export function buildBarcodePage(): EncodedImage {
  const page = new PrintPage(LABEL_WIDTH, LABEL_HEIGHT, 'landscape');

  page.addBarcode(LABEL_ID, {
    encoding: 'CODE128',
    x: 120,
    y: 34,
    width: 240,
    height: 68,
    align: 'center',
    vAlign: 'middle',
  });

  addBitmapText(page, LABEL_ID, {
    x: 120,
    y: 84,
    scale: 2,
    align: 'center',
    vAlign: 'middle',
  });

  return assertEncodedSize(page.toEncodedImage(), LABEL_WIDTH, LABEL_HEIGHT);
}
