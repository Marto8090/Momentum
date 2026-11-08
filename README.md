# Momentum

Momentum is a mobile diary for reflecting on postponed tasks and choosing one small next step. The project includes an Expo app in `apps/mobile` and a TypeScript Express API in `apps/api`.

## Run locally

Install Node.js 24 and run `npm ci` from the repository root.

**Mobile:** Run `npm run dev:mobile` with your phone and computer on the same Wi-Fi network. Scan the QR code in Expo Go on Android or with Camera on iOS. The app should display the Momentum welcome screen. If Expo Go reports a version mismatch, select SDK 58 on the [Expo Go download page](https://expo.dev/go) and follow the steps for your device.

**API:** In a separate terminal, run `npm run dev:api` and open [http://127.0.0.1:3001/](http://127.0.0.1:3001/). The response should be `{"name":"Momentum API"}`. Set `PORT` in the terminal environment if port 3001 is already in use.

## Check changes

Run `npm run typecheck` for both apps, `npm run build:api` to compile the API, and `npm run build:mobile` to export Android and iOS bundles.
