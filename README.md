# ASE WMS — Mobile app

Expo (SDK 57) warehouse app for Aniah Social Events. Companion to `ase-wms-web`.

## Structure

```
App.tsx                         # ThemeProvider + AuthProvider + RootNavigator
src/
  config/                       # env + printer constants
  theme/                        # colors + ThemeProvider / useTheme
  auth/                         # stub AuthContext (Firebase in ASE-10)
  navigation/                   # auth vs unauth + MainTabs (Home | Print)
  screens/                      # thin tab screens that import features
  features/
    auth/                       # index + ui/ + hook/
    print/                      # index + ui/ + hook/ + labels/
    scan/                       # index + ui/ + hook/
```

Feature paradigm: **dumb `ui/`**, **handlers in `hook/`**, **`index` container** wires them. Tabs only import the feature entry.

## Auth & navigation

- Unauthenticated → Login (stub: any email/password)
- Authenticated → bottom tabs: **Home** (placeholder) | **Print** (rightmost, D110 PoC)
- Login is not a tab

## Print PoC (Print tab)

1. Connect to JADENS / NIIMBOT D110 over BLE
2. Print Code 128 + digits or max QR + digits (`LABEL_ID` in `src/config/printer.ts`)
3. Scan barcode / QR with the camera

D110: 15×30 mm stock, `LabelType.WithGaps`, density `2`, canvas `96×240`.

`react-native-niimblue-lib` hard-requires `@shopify/react-native-skia` at import time.
This app stubs that package in `metro.config.js` / `stubs/`.

## Stack

| Package | Role |
|---|---|
| Expo 57 + `expo-dev-client` | Native BLE (not Expo Go) |
| `react-native-niimblue-lib` 1.2.1 | Label encode + print |
| `react-native-ble-plx` 3.5.1 | BLE transport |
| React Navigation | Auth stack + bottom tabs |

## Requirements

- Node 20+
- Android device with USB debugging
- JADENS / NIIMBOT D110 powered on
- Expo development build (BLE will not work in Expo Go)

## Config

Copy `.env.example` → `.env.local` for ASE-10 (`EXPO_PUBLIC_ASE_WMS_API_URL`, Firebase keys). Not required for the stub login / print PoC.

## Run on Android

```bash
npm install
npm run android
```

Later sessions:

```bash
npm run start:dev-client
```

## Test steps

1. Sign in with any email and password (stub).
2. Open the **Print** tab.
3. Enable Bluetooth and Location; power on the D110.
4. Tap **Connect printer**, then print / scan as before.
