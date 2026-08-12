import { PrintPage } from 'react-native-niimblue-lib';
import { DIGIT_GLYPHS } from './glyphs';

export function addBitmapText(
  page: PrintPage,
  text: string,
  options: {
    x: number;
    y: number;
    scale?: number;
    align?: 'left' | 'center' | 'right';
    vAlign?: 'top' | 'middle' | 'bottom';
  },
): void {
  const scale = options.scale ?? 2;
  const glyphW = 5;
  const glyphH = 7;
  const gap = 1;
  const cellW = glyphW + gap;
  const width = Math.round(text.length * cellW * scale - gap * scale);
  const height = Math.round(glyphH * scale);

  let originX = options.x;
  if (options.align === 'center') originX -= Math.floor(width / 2);
  if (options.align === 'right') originX -= width;

  let originY = options.y;
  if (options.vAlign === 'middle') originY -= Math.floor(height / 2);
  if (options.vAlign === 'bottom') originY -= height;

  const pixels: number[] = [];
  for (let row = 0; row < glyphH; row++) {
    for (let col = 0; col < text.length * cellW - gap; col++) {
      const charIndex = Math.floor(col / cellW);
      const bit = col % cellW;
      const ch = text[charIndex];
      const glyph = DIGIT_GLYPHS[ch];
      const on =
        glyph !== undefined && bit < glyphW && (glyph[row] & (1 << (4 - bit))) !== 0
          ? 1
          : 0;
      pixels.push(on);
    }
  }

  page.addPixelData({
    data: pixels,
    imageWidth: text.length * cellW - gap,
    imageHeight: glyphH,
    x: originX,
    y: originY,
    width,
    height,
    align: 'left',
    vAlign: 'top',
  });
}
