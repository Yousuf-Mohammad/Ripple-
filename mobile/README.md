# Ripple — Mobile (Expo / React Native)

The Android app for Ripple. Built with Expo (SDK 54) + TypeScript.

**Status: implemented.** Auth (login/signup), the feed (infinite scroll, pull-to-refresh,
username search), create post, like (optimistic) + comments, and Firebase Cloud Messaging
push (foreground, background, and tap-to-navigate) are all in place, along with a polished
design system (Poppins typography, avatars, shadows, press feedback).

## Download

**Latest APK:**
<https://expo.dev/accounts/yousuf_mohammad/projects/ripple/builds/14ad1a3f-80ef-475f-b4da-5ac26981e705>

Install on a device, then make sure the backend is reachable at the URL the build was
compiled with (see [API base URL](#api-base-url)).

## Prerequisites

- Node.js ≥ 18, npm
- The backend (`../backend`) running and reachable (default `:4000`)
- For day-to-day JS development: an Android emulator or a physical device with **Expo Go**
  (note: push is **not** testable in Expo Go — it needs a dev/EAS build, see CLAUDE.md §4.1)
- For push / a real APK: an [Expo](https://expo.dev) account + `eas-cli`, and a Firebase
  Android app (`google-services.json`)

## Setup

```bash
cd mobile
npm install
echo "EXPO_PUBLIC_API_BASE_URL=http://<your-LAN-IP>:4000" > .env
npm start                   # then press "a" for Android
```

### API base URL

`localhost` from the device points at the device itself, not your dev machine. Set
`EXPO_PUBLIC_API_BASE_URL` accordingly:

| Target            | Value                       |
| ----------------- | --------------------------- |
| Android emulator  | `http://10.0.2.2:4000`      |
| Physical device   | `http://<your-LAN-IP>:4000` |

Resolution order (`src/config/env.ts`): `EXPO_PUBLIC_API_BASE_URL` → `app.config.ts`
`extra.apiBaseUrl` → emulator fallback (`http://10.0.2.2:4000`). For APK builds the value
comes from the `eas.json` `preview` profile's `env`.

## Scripts

| Command            | What it does                        |
| ------------------ | ----------------------------------- |
| `npm start`        | Expo dev server (JS-only; no push)  |
| `npm run android`  | Open on a connected Android device  |
| `npx tsc --noEmit` | Type-check                          |

## Structure

```
src/
├── config/env.ts        # resolves API base URL
├── theme/               # colors, spacing, shadows, typography — style tokens
├── api/                 # axios client (+interceptors), typed auth/posts/users calls, types
├── auth/                # SecureStore token store, AuthContext, useAuth
├── hooks/               # useFeed, useComments, useToggleLike, useDebouncedValue
├── feed/                # FeedContext (shared feed + username filter state)
├── navigation/          # RootNavigator → Auth stack vs App stack
├── notifications/       # FCM token registration + foreground/background/tap handlers
├── screens/             # Login, Signup, Feed, CreatePost, Comments
├── components/          # PostCard, LikeButton, CommentItem, Avatar, FeedSearchBar,
│                        #   MakeRippleTrigger, UserMenu, FormField, EmptyState, …
└── utils/               # relativeTime, validation
```

## Push notifications (FCM)

Native Firebase messaging requires native modules, so push only works on a **dev build or
an EAS build — never Expo Go** (CLAUDE.md §4.1). On launch / after auth the app requests
notification permission, gets the device token, and registers it via
`POST /users/fcm-token`. Foreground messages show an in-app notice; tapping a background/
quit notification deep-links to the relevant post.

Provide Firebase config via `google-services.json` (gitignored) — locally in `mobile/`,
and for EAS via a file environment variable (`GOOGLE_SERVICES_JSON`).

## Building the APK

Build profiles live in `eas.json` (`preview` = installable APK; `production` = AAB).

```bash
npm i -g eas-cli
eas login
# one-time: provide google-services.json as an EAS file env var (sensitive)
eas build -p android --profile preview
```

The `preview` profile sets `EXPO_PUBLIC_API_BASE_URL` (currently a LAN IP) and outputs an
APK. **Change that value in `eas.json` to your own backend address before building**, since
it is baked into the binary. EAS prints an install link/QR when the build finishes.

> If a fresh build crashes on launch with a native `expo-modules-core` /
> `expo-font` mismatch, ensure those packages stay version-aligned — they are pinned in
> `package.json` (`expo-font` exact + an `overrides` for `expo-modules-core`) to stop EAS
> from drifting them apart during install.
