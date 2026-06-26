# Ripple — Mobile (Expo / React Native)

The Android app for Ripple. Built with Expo (SDK 56) + TypeScript.

> Status: **P5 — App shell.** Build/config, theme, authenticated axios client,
> secure token storage, `AuthContext`, and the Auth ↔ App navigation are in place.
> Feature screens (real auth forms, feed, create post, interactions, push) land
> in P6–P10.

## Prerequisites

- Node.js ≥ 18, npm
- The backend (`../backend`) running and reachable (default `:4000`)
- Android emulator or a physical device with **Expo Go** (push is NOT testable in
  Expo Go — that comes with a dev/EAS build in P10, see CLAUDE.md §4.1)

## Setup

```bash
cd mobile
npm install
cp .env.example .env        # then set EXPO_PUBLIC_API_BASE_URL
npm start                   # then press "a" for Android
```

### API base URL

`localhost` from the device points at the device itself, not your dev machine.
Set `EXPO_PUBLIC_API_BASE_URL` accordingly:

| Target            | Value                       |
| ----------------- | --------------------------- |
| Android emulator  | `http://10.0.2.2:4000`      |
| Physical device   | `http://<your-LAN-IP>:4000` |

(The value is read in `src/config/env.ts` and falls back to the emulator host.)

## Scripts

| Command         | What it does                         |
| --------------- | ------------------------------------ |
| `npm start`     | Expo dev server (JS-only; no push)   |
| `npm run android` | Open on a connected Android device  |
| `npx tsc --noEmit` | Type-check                         |

## Structure

```
src/
├── config/env.ts        # resolves API base URL
├── theme/               # colors, spacing — single source of style tokens
├── api/                 # axios client (+interceptors), typed auth calls, types
├── auth/                # SecureStore token store, AuthContext, useAuth
├── navigation/          # RootNavigator → Auth stack vs App stack
└── screens/             # Login / Signup / Feed (P5 placeholders)
```

## Building the APK

EAS build profiles live in `eas.json` (`preview` = APK). Full build + Firebase
setup steps are documented in P12. Native Firebase messaging plugins are added in
P10 (until then the app runs in Expo Go).
