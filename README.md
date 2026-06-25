# Ripple 
---------------------

A lightweight, text-only social feed. Every interaction sends a *ripple* back to the
author — a push notification (via Firebase Cloud Messaging) when their post is liked or
commented on.

This is a monorepo with two apps:

- **[`backend/`](./backend/README.md)** — Node.js + Express + TypeScript REST API
  (MongoDB/Mongoose, JWT auth, FCM push). **Status: implemented** (auth, posts & feed,
  interactions, notifications). See the backend README for setup and full API docs.
- **`mobile/`** — React Native (Expo) app in TypeScript, shipped as an installable Android
  APK. _(Scaffolded in a later phase.)_

## What it does

- **Auth** — signup / login with JWT.
- **Posts** — create text posts; view a shared paginated feed (newest first); filter by username.
- **Interactions** — like / unlike and comment on posts.
- **Notifications** — the post author gets a push notification when someone likes or
  comments on their post (never for their own actions).

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

## Quick start (backend)

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

## License

MIT

