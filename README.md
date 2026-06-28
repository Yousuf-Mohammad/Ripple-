# Ripple

A lightweight, text-only social feed. Every interaction sends a *ripple* back to the
author — a push notification (via Firebase Cloud Messaging) when their post is liked or
commented on.

This is a monorepo with two apps:

- **[`backend/`](./backend/README.md)** — Node.js + Express + TypeScript REST API
  (MongoDB/Mongoose, JWT auth, FCM push). **Status: implemented.** See the backend
  README for setup and the full API reference.
- **[`mobile/`](./mobile/README.md)** — React Native (Expo, TypeScript) app, shipped as
  an installable Android APK. **Status: implemented** (auth, feed, create post,
  like/comment, push). See the mobile README for setup and the APK build steps.

## What it does

- **Auth** — signup / login with JWT (token kept in `expo-secure-store`, never plain storage).
- **Posts** — create text posts; view a shared paginated feed (newest first); filter by username.
- **Interactions** — like / unlike (optimistic) and comment on posts.
- **Notifications** — the post author gets a push notification when someone likes or
  comments on their post (never for their own actions).

## Download the app

**Android APK (download):**
<https://drive.google.com/file/d/1A_03mfFbRlXdgO5Lxkgo4CPBIGUmKBsc/view?usp=drive_link>

**Build details (Expo):**
<https://expo.dev/accounts/yousuf_mohammad/projects/ripple/builds/14ad1a3f-80ef-475f-b4da-5ac26981e705>

Download and open the APK on an Android device to install. The build talks to the
backend at the URL baked into the `preview` profile (`eas.json` →
`EXPO_PUBLIC_API_BASE_URL`), so the backend must be running and reachable at that address
on the same network. To point it elsewhere, change that value and rebuild (see the
[mobile README](./mobile/README.md#building-the-apk)).

> Push notifications require native Firebase messaging and therefore an EAS/dev build —
> they do **not** work in Expo Go.

## API at a glance

Full request/response docs live in [`backend/README.md`](./backend/README.md#api-reference).
Protected routes (🔒) require `Authorization: Bearer <jwt>`.

| Method | Path                  | Auth | Purpose                                  |
| ------ | --------------------- | ---- | ---------------------------------------- |
| GET    | `/health`             | —    | Liveness probe                           |
| POST   | `/auth/signup`        | —    | Create an account, get a JWT             |
| POST   | `/auth/login`         | —    | Log in by email or username              |
| GET    | `/auth/me`            | 🔒   | Current user                             |
| POST   | `/users/fcm-token`    | 🔒   | Register a device token for push         |
| POST   | `/posts`              | 🔒   | Create a text post                       |
| GET    | `/posts`              | 🔒   | Paginated feed (`?page&limit&username`)  |
| POST   | `/posts/:id/like`     | 🔒   | Toggle like (notifies the author)        |
| POST   | `/posts/:id/comment`  | 🔒   | Comment (notifies the author)            |
| GET    | `/posts/:id/comments` | 🔒   | Paginated comments (oldest first)        |

## Quick start

### Backend

```bash
cd backend
cp .env.example .env   # then fill in values (at minimum MONGODB_URI and JWT_SECRET)
npm install
npm run dev            # starts the API with live reload
curl http://localhost:4000/health   # { "status": "ok" }
```

Requires Node.js (≥ 18) and a MongoDB instance. Firebase credentials are optional — without
them the API runs normally with push notifications disabled. See
[`backend/README.md`](./backend/README.md) for environment variables, project structure, and
the complete API reference.

### Mobile

```bash
cd mobile
npm install
# point the app at your backend (LAN IP for a physical device):
echo "EXPO_PUBLIC_API_BASE_URL=http://<your-LAN-IP>:4000" > .env
npm start              # Expo dev server (JS only — no push)
```

For a real APK (and for push to work), build with EAS — see the
[mobile README](./mobile/README.md).

## Tech stack

| Layer    | Choice                                                              |
| -------- | ------------------------------------------------------------------ |
| Backend  | Node.js, Express, TypeScript, MongoDB + Mongoose                    |
| Auth     | JWT (`jsonwebtoken`) + `bcrypt`                                     |
| Push     | `firebase-admin` (server) · `@react-native-firebase/messaging` (client) |
| Mobile   | React Native + Expo (SDK 54), TypeScript, React Navigation, axios  |
| Build    | EAS Build → Android APK                                             |

## License

MIT
