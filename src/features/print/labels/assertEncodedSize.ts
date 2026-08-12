import type { PrintPage } from 'react-native-niimblue-lib';

export type EncodedImage = ReturnType<PrintPage['toEncodedImage']>;

export function assertEncodedSize(
  encoded: EncodedImage,
  cols: number,
  rows: number,
): EncodedImage {
  if (encoded.cols !== cols || encoded.rows !== rows) {
    throw new Error(
      `Incorrect image size: ${encoded.cols}×${encoded.rows}; expected ${cols}×${rows}`,
    );
  }
  return encoded;
}
