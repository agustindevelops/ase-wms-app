import { PrintPage } from 'react-native-niimblue-lib';
import {
  LABEL_HEIGHT,
  LABEL_ID,
  LABEL_WIDTH,
} from '@/config/printer';
import { addFittedBitmapText } from './bitmapText';
import { assertEncodedSize, type EncodedImage } from './assertEncodedSize';

/** Landscape canvas is LABEL_HEIGHT × LABEL_WIDTH (240×96). */
const QR_SIZE = 96;
const TEXT_GAP = 8;

/**
 * Max-height QR at design left, with the location's label name filling the
 * space to its right. The QR carries the id; the text is for humans.
 */
export function buildQrPage(
  payload: string = LABEL_ID,
  options?: { text?: string },
): EncodedImage {
  const page = new PrintPage(LABEL_WIDTH, LABEL_HEIGHT, 'landscape');
  const centerY = Math.round(LABEL_WIDTH / 2);

  page.addQR(payload, {
    x: 0,
    y: centerY,
    width: QR_SIZE,
    height: QR_SIZE,
    align: 'left',
    vAlign: 'middle',
    ecl: 'M',
  });

  const text = options?.text?.trim();
  if (text) {
    const textX = QR_SIZE + TEXT_GAP;
    addFittedBitmapText(page, text, {
      x: textX,
      y: centerY,
      maxWidth: LABEL_HEIGHT - textX - TEXT_GAP,
      maxHeight: LABEL_WIDTH - TEXT_GAP,
      align: 'left',
      maxLines: 3,
    });
  }

  return assertEncodedSize(page.toEncodedImage(), LABEL_WIDTH, LABEL_HEIGHT);
}
