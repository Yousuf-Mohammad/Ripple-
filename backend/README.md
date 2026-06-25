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

| Method | Path      | Auth | Returns             |
| ------ | --------- | ---- | ------------------- |
| GET    | `/health` | —    | `{ status: "ok" }`  |

> Full endpoint docs (auth, posts, feed, interactions, fcm-token) are added as those
> phases land. See `CLAUDE.md §5.3` for the complete contract.
