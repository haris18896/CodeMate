# CodeMate

Create. Scan. Share. Everywhere.

Production React Native (CLI) TypeScript app for generating, scanning, saving, and sharing QR codes and barcodes offline.

## Requirements

- Node.js >= 22.11
- JDK 17
- Android Studio / Android SDK
- Xcode 16+ (macOS), CocoaPods via Bundler
- iOS 15.5+

## Setup

```bash
cd CodeMate
npm install
cd ios && bundle install && bundle exec pod install && cd ..
```

## Run

```bash
# Metro
npm start

# Android
npm run android

# iOS
npm run ios
```

## Quality checks

```bash
npm run typecheck
npm run lint
npm test
```

## Brand assets

Place branding under:

- `src/assets/images/logo.png`
- `src/assets/images/app-icon.png` (optional)

A logo is already included for splash / onboarding / about.
