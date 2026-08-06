# ASE WMS — D110 barcode print PoC

Minimal React Native (Expo) Android app for a JADENS / NIIMBOT D110:

1. Request Bluetooth permissions and connect over BLE
2. Verify negotiation (`modelId`, metadata, print task)
3. Print a diagnostic black line (`96×240` landscape)
4. Print a UUID QR + short Code 128 asset code

D110 config: 15×30 mm stock, `LabelType.WithGaps`, density `2`, printable `96×240`, packet interval `15 ms`.

`react-native-niimblue-lib` hard-requires `@shopify/react-native-skia` at import time.
This PoC stubs that package in `metro.config.js` / `stubs/` so QR/barcodes work without native Skia.

## Stack

| Package | Version | Role |
|---|---|---|
| `react-native-niimblue-lib` | `1.2.1` (pinned) | Label encode + print task |
| `react-native-ble-plx` | `3.5.1` (pinned) | BLE transport |
| `expo-dev-client` | Expo 57 | Native BLE (not Expo Go) |

## Requirements

- Node 20+
- Android device with USB debugging (or wireless ADB)
- JADENS / NIIMBOT D110 powered on
- Expo development build (BLE will not work in Expo Go)

## Run on Android

**BLE printing does not work in Expo Go.** Use a development build:

```bash
yarn
yarn android
```

That generates the native project, installs a development build on the device, and launches the app.

On later runs:

```bash
yarn start:dev-client
# then open the installed "ase-wms-app" / Expo Dev Client on the phone
```

`yarn start` opens the normal Expo Go flow (UI only — no printer).

## Test steps

1. Enable Bluetooth and Location on the phone (Android needs location for BLE scan).
2. Power on the D110.
3. Tap **Connect printer**.
4. Grant Bluetooth / location prompts.
5. Tap **Print barcode**.

Default barcode value: `A7K4P9X2` (short Code 128 for a 30×15 mm label).

## Notes

- Change `DEMO_BARCODE` in `App.tsx` to print a different value.
- Label canvas is `240×120` px (~30×15 mm @ 203 DPI).
- This library is unofficial; versions are pinned on purpose.
