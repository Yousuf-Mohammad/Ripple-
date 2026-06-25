# Ripple API (`ripple-api`)

Node.js + Express + TypeScript REST API for the Ripple social feed (MongoDB/Mongoose,
JWT auth, FCM push notifications).

## Requirements

- Node.js LTS (≥ 18)
- A MongoDB instance (local `mongod` or MongoDB Atlas)

## Setup

```bash
cd backend
cp .env.example .env     # then fill in values (at minimum MONGODB_URI, JWT_SECRET)
npm install
npm run dev              # live-reload dev server (tsx watch)
```

The server starts on `http://localhost:<PORT>` (default `4000`).

### Scripts

| Script          | What it does                                      |
| --------------- | ------------------------------------------------- |
| `npm run dev`   | Dev server with live reload (`tsx watch`)         |
| `npm run build` | Type-check and compile to `dist/` (`tsc`)         |
| `npm start`     | Run the compiled output (`node dist/server.js`)   |
| `npm run lint`  | Lint `src/` with ESLint                           |
| `npm run format`| Format the project with Prettier                  |

## Environment

See [`.env.example`](./.env.example). Notes:

- `FIREBASE_PRIVATE_KEY` keeps literal `\n`; they are converted to real newlines at load time.
- Firebase vars are optional until push notifications are wired up (phase P4). Without
  them the server boots normally and logs that FCM is disabled.
- `CORS_ORIGIN` is an optional comma-separated allowlist; leave empty for permissive dev.

## Conventions

- **Error envelope** — all errors return `{ "error": { "code", "message", "details" } }`.
- **Expected failures** throw `ApiError(statusCode, code, message, details?)`; the central
  `errorHandler` formats them. Unexpected errors become a generic 500 (no stack leaks in prod).
- **Validation** uses `zod` schemas via the `validate(schema)` middleware (422 on failure).
- **Async handlers** are wrapped in `asyncHandler` so rejections reach the error handler.

## API

All errors use the envelope `{ "error": { "code", "message", "details" } }`.
Protected routes (🔒) require `Authorization: Bearer <jwt>`.

| Method | Path           | Auth | Body / Query                          | Returns               |
| ------ | -------------- | ---- | ------------------------------------- | --------------------- |
| GET    | `/health`      | —    | —                                     | `{ status: "ok" }`    |
| POST   | `/auth/signup` | —    | `{ username, email, password }`       | `201 { user, token }` |
| POST   | `/auth/login`  | —    | `{ emailOrUsername, password }`       | `{ user, token }`     |
| GET    | `/auth/me`     | 🔒   | —                                     | `{ user }`            |

**Auth notes**

- `username`: 3–20 chars, lowercase `a–z`, `0–9`, `_`. `email`: valid email. `password`: min 8 chars.
- `user` objects never include the password hash.
- Errors: `422 VALIDATION_ERROR` (bad body), `409 USER_EXISTS` (duplicate signup),
  `401 INVALID_CREDENTIALS` (bad login), `401 UNAUTHORIZED` / `INVALID_TOKEN` (missing/invalid bearer).
- `/auth/*` is rate-limited more tightly than other routes.

> Endpoint docs for posts, feed, interactions, and fcm-token are added as those phases
> land. See `CLAUDE.md §5.3` for the complete contract.
