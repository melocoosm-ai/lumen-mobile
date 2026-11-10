# Lumen for iOS and Android

The mobile version of [Lumen](https://github.com/melocoosm-ai/lumen): a fast, private web browser with
tabs, a smart address bar and bookmarks. Built with Expo (SDK 58) and React Native.

- iOS uses the system WebKit engine (`WKWebView`), as the App Store requires for browsers.
- Android uses the system WebView (Chromium).
- No accounts, analytics or ads. Tabs and bookmarks are stored only on the device. See [PRIVACY.md](PRIVACY.md).

## Features

Tabs and tab switcher · address bar that tells URLs from searches (DuckDuckGo) · back/forward
(plus swipe on iOS and the Android back button) · pull to refresh · progress bar · bookmarks on the
new-tab page · share sheet · `tel:`/`mailto:`/map links open in the right app · `target=_blank` opens a
new tab · session restore · light/dark mode · third-party cookies blocked.

## Develop

```bash
npm install
npx expo start          # scan the QR code with Expo Go, or press i / a for a simulator
npm test                # unit tests (address bar rules, tab state, bookmarks)
npm run typecheck
npm run lint
```

## Publish to the stores

You need an [Expo account](https://expo.dev/signup) (free), an
[Apple Developer Program](https://developer.apple.com/programs/) membership ($99/year) and a
[Google Play Console](https://play.google.com/console/signup) account ($25 once).

```bash
npx eas-cli@latest login
npx eas-cli@latest build --platform all --profile production   # cloud builds: .ipa + .aab, signing handled for you
npx eas-cli@latest submit --platform ios                        # uploads to App Store Connect / TestFlight
npx eas-cli@latest submit --platform android                    # uploads to Google Play (first upload must be manual)
```

Store text, privacy answers and screenshot sizes are in [STORE_LISTING.md](STORE_LISTING.md).
Version numbers are managed remotely by EAS (`appVersionSource: remote`, `autoIncrement`).

For a quick install on your own Android phone without the store: `npx eas-cli@latest build -p android --profile preview` (APK).
