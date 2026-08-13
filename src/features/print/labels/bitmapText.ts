import type { PrintPage } from 'react-native-niimblue-lib';
import { GLYPHS_5X7 } from './glyphs';

const GLYPH_W = 5;
const GLYPH_H = 7;
/** Blank columns between glyphs, and blank rows between wrapped lines. */
const GAP = 1;
const LINE_GAP = 2;
const CELL_W = GLYPH_W + GAP;

/** Largest to smallest, so fitted text keeps the biggest readable size. */
const FIT_SCALES = [8, 7, 6, 5, 4, 3.5, 3, 2.5, 2, 1.5, 1];

/** Upcases, collapses whitespace, and drops glyphs the 5×7 font lacks. */
export function printableText(text: string): string {
  const normalized = text.replace(/\s+/g, ' ').trim().toUpperCase();
  return [...normalized]
    .filter((char) => GLYPHS_5X7[char] !== undefined)
    .join('');
}

export function bitmapTextWidth(charCount: number, scale: number): number {
  return Math.round(charCount * CELL_W * scale - GAP * scale);
}

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
  if (text.length === 0) return;

  const scale = options.scale ?? 2;
  const width = bitmapTextWidth(text.length, scale);
  const height = Math.round(GLYPH_H * scale);

  let originX = options.x;
  if (options.align === 'center') originX -= Math.floor(width / 2);
  if (options.align === 'right') originX -= width;

  let originY = options.y;
  if (options.vAlign === 'middle') originY -= Math.floor(height / 2);
  if (options.vAlign === 'bottom') originY -= height;

  const pixels: number[] = [];
  for (let row = 0; row < GLYPH_H; row++) {
    for (let col = 0; col < text.length * CELL_W - GAP; col++) {
      const charIndex = Math.floor(col / CELL_W);
      const bit = col % CELL_W;
      const glyph = GLYPHS_5X7[text[charIndex]];
      const on =
        glyph !== undefined &&
        bit < GLYPH_W &&
        (glyph[row] & (1 << (GLYPH_W - 1 - bit))) !== 0
          ? 1
          : 0;
      pixels.push(on);
    }
  }

  page.addPixelData({
    data: pixels,
    imageWidth: text.length * CELL_W - GAP,
    imageHeight: GLYPH_H,
    x: originX,
    y: originY,
    width,
    height,
    align: 'left',
    vAlign: 'top',
  });
}

function charsPerLine(maxWidth: number, scale: number): number {
  return Math.max(1, Math.floor((maxWidth + GAP * scale) / (CELL_W * scale)));
}

/** Greedy word wrap; words wider than a line are hard-split. */
function wrapText(text: string, limit: number): string[] {
  const lines: string[] = [];

  for (const word of text.split(' ')) {
    if (word.length === 0) continue;

    const last = lines[lines.length - 1];
    if (last !== undefined && last.length + 1 + word.length <= limit) {
      lines[lines.length - 1] = `${last} ${word}`;
      continue;
    }

    let rest = word;
    while (rest.length > limit) {
      lines.push(rest.slice(0, limit));
      rest = rest.slice(limit);
    }
    if (rest.length > 0) lines.push(rest);
  }

  return lines;
}

/**
 * Draws text as large as it fits in maxWidth × maxHeight, wrapping on spaces
 * and shrinking the scale until the block fits. `y` is the block's centre.
 */
export function addFittedBitmapText(
  page: PrintPage,
  rawText: string,
  options: {
    x: number;
    y: number;
    maxWidth: number;
    maxHeight: number;
    align?: 'left' | 'center' | 'right';
    maxLines?: number;
  },
): void {
  const text = printableText(rawText);
  if (text.length === 0) return;

  const maxLines = options.maxLines ?? 3;
  const longestWord = text
    .split(' ')
    .reduce((longest, word) => Math.max(longest, word.length), 0);

  let scale = FIT_SCALES[FIT_SCALES.length - 1];
  let lines: string[] = [];

  for (const candidate of FIT_SCALES) {
    scale = candidate;
    const limit = charsPerLine(options.maxWidth, candidate);
    lines = wrapText(text, limit);
    const blockHeight =
      lines.length * GLYPH_H * candidate + (lines.length - 1) * LINE_GAP * candidate;
    // limit >= longestWord keeps a smaller scale over splitting a word in half.
    if (
      limit >= longestWord &&
      lines.length <= maxLines &&
      blockHeight <= options.maxHeight
    ) {
      break;
    }
  }

  const drawn = lines.slice(0, maxLines);
  const lineHeight = (GLYPH_H + LINE_GAP) * scale;
  const blockHeight = drawn.length * lineHeight - LINE_GAP * scale;
  const top = options.y - blockHeight / 2;

  drawn.forEach((line, index) => {
    addBitmapText(page, line, {
      x: options.x,
      y: Math.round(top + index * lineHeight),
      scale,
      align: options.align,
      vAlign: 'top',
    });
  });
}
