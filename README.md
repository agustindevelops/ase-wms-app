# ASE WMS — Mobile app

Expo (SDK 57) warehouse app for Aniah Social Events. Companion to `ase-wms-web`.

UI: [gluestack-ui](https://gluestack.io/) v5 with **UniWind** (Tailwind CSS v4).

## Structure

```
App.tsx                         # GluestackUIProvider + RootNavigator
global.css                      # UniWind theme tokens
src/
  components/ui/                # gluestack copy-paste components
  config/                       # env + printer constants
  firebase/                     # SDK init + signIn/signOut (no auth context)
  api/                          # wmsFetch (Bearer via getIdToken) + /api/me
  navigation/                   # onAuthStateChanged gate + MainTabs (Home | Print)
  screens/                      # thin tab screens that import features
  features/
    auth/                       # index + ui/ + hook/
    print/                      # index + ui/ + hook/ + labels/
    scan/                       # index + ui/ + hook/
```

Feature paradigm: **dumb `ui/`**, **handlers in `hook/`**, **`index` container** wires them.

## Auth & navigation

- Firebase Auth (same project as `ase-wms-web`); session owned by the SDK
- Unauthenticated → Login (email/password)
- Authenticated → bottom tabs: **Home** (`GET /api/me` smoke) | **Print** (D110 PoC)

## Print PoC (Print tab)

1. Connect to JADENS / NIIMBOT D110 over BLE
2. Print Code 128 + digits or max QR + digits (`LABEL_ID` in `src/config/printer.ts`)
3. Scan barcode / QR with the camera

`react-native-niimblue-lib` hard-requires `@shopify/react-native-skia` at import time.
This app stubs that package in `metro.config.js` / `stubs/`.

## Add more gluestack components

```bash
npx gluestack-ui@latest add alert -y
```

Components land in `src/components/ui/`.

## Requirements

- Node 20+
- Android device with USB debugging
- Expo development build (BLE will not work in Expo Go)

## Config

Copy `.env.example` → `.env.local` for ASE-10. Not required for stub login / print PoC.

## Run on Android

Native modules (gesture-handler, reanimated, svg) require a rebuild after install:

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
