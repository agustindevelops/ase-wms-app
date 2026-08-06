/**
 * Stub for @shopify/react-native-skia.
 * react-native-niimblue-lib requires Skia at import time, but barcodes/QR
 * do not use it. Real Skia is only needed for PrintPage.addText().
 */
const FontStyle = {
  Normal: 0,
  Bold: 1,
  Italic: 2,
  BoldItalic: 3,
};

const Skia = {
  FontMgr: {
    System: () => ({
      matchFamilyStyle: () => null,
    }),
  },
  Font: () => ({
    getMetrics: () => ({ ascent: 0, descent: 0, leading: 0 }),
    measureText: () => ({ width: 0 }),
  }),
  Surface: {
    Make: () => null,
  },
  Paint: () => ({
    setColor: () => {},
  }),
  Color: () => 0,
};

module.exports = {
  FontStyle,
  Skia,
};
