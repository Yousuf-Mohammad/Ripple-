# Ripple API (`ripple-api`)

The backend for **Ripple** — a lightweight, text-only social feed. Every interaction sends a
*ripple* back to the author: a push notification when their post is liked or commented on.

Node.js + Express + TypeScript REST API with MongoDB/Mongoose, JWT auth, and Firebase Cloud
Messaging (FCM) push notifications.

---

## Table of contents

- [Tech stack](#tech-stack)
- [Requirements](#requirements)
- [Quick start](#quick-start)
- [Scripts](#scripts)
- [Environment variables](#environment-variables)
- [Project structure](#project-structure)
- [Architecture & conventions](#architecture--conventions)
- [Data models](#data-models)
- [API reference](#api-reference)
- [End-to-end example (golden path)](#end-to-end-example-golden-path)

---

## Tech stack

| Concern        | Choice                                             |
| -------------- | -------------------------------------------------- |
| Runtime        | Node.js (LTS) + Express                             |
| Language       | TypeScript (compiled to CommonJS via `tsc`)        |
| Database       | MongoDB + Mongoose                                 |
| Auth           | JWT (`jsonwebtoken`) + `bcryptjs` (cost 10)        |
| Validation     | `zod` (via a `validate` middleware)                |
| Security       | `helmet`, `cors`, `express-rate-limit`             |
| Push           | `firebase-admin` (FCM multicast)                   |
| Dev tooling    | `tsx` (watch/dev), ESLint, Prettier                |

---

## Requirements

- **Node.js** LTS (≥ 18)
- A **MongoDB** instance — local `mongod` on `localhost:27017`, or a MongoDB Atlas URI.
- *(Optional)* A **Firebase service account** to enable push notifications. Without it the
  server boots normally with FCM disabled (see [Notifications](#notifications)).

---

## Quick start

```bash
cd backend
cp .env.example .env     # then fill in values (at minimum MONGODB_URI and JWT_SECRET)
npm install
npm run dev              # live-reload dev server (tsx watch)
```

The server starts on `http://localhost:<PORT>` (default `4000`). Verify it's up:

```bash
curl http://localhost:4000/health
# { "status": "ok" }
```

For a production-style run:

```bash
npm run build            # type-check + compile to dist/
npm start                # node dist/server.js
```

---

## Scripts

| Script           | What it does                                      |
| ---------------- | ------------------------------------------------- |
| `npm run dev`    | Dev server with live reload (`tsx watch`)         |
| `npm run build`  | Type-check and compile to `dist/` (`tsc`)         |
| `npm start`      | Run the compiled output (`node dist/server.js`)   |
| `npm run lint`   | Lint `src/` with ESLint                           |
| `npm run format` | Format the project with Prettier                  |

---

## Environment variables

Copy [`.env.example`](./.env.example) to `.env` and fill in the values.

| Variable                | Required | Default                                       | Notes                                                            |
| ----------------------- | -------- | --------------------------------------------- | ---------------------------------------------------------------- |
| `NODE_ENV`              | no       | `development`                                 | `development` \| `test` \| `production`                          |
| `PORT`                  | no       | `4000`                                        | HTTP port                                                        |
| `MONGODB_URI`           | **yes**  | `mongodb://localhost:27017/mini_social_feed`  | Mongoose connection string                                       |
| `JWT_SECRET`            | **yes**  | —                                             | Secret used to sign JWTs                                         |
| `JWT_EXPIRES_IN`        | no       | `7d`                                          | Token lifetime (e.g. `7d`, `12h`)                                |
| `CORS_ORIGIN`           | no       | _(empty = permissive)_                        | Comma-separated allowlist of origins                             |
| `FIREBASE_PROJECT_ID`   | no\*     | —                                             | Firebase service-account project id                             |
| `FIREBASE_CLIENT_EMAIL` | no\*     | —                                             | Firebase service-account client email                           |
| `FIREBASE_PRIVATE_KEY`  | no\*     | —                                             | Private key; keeps literal `\n`, converted to newlines at load  |

\* All three Firebase vars must be present together to enable push. If any is missing — or the
credentials are invalid — the server logs a warning and runs with **FCM disabled** (it does
not crash).

> The server validates the environment on boot (`config/env.ts`) and exits with a readable
> message if a required var is missing or malformed.

---

## Project structure

```
backend/
├── src/
│   ├── config/
│   │   ├── env.ts          # zod-validated env loader; normalizes FIREBASE_PRIVATE_KEY \n
│   │   ├── db.ts           # Mongoose connect / disconnect
│   │   └── firebase.ts     # firebase-admin init; getMessaging() (null when disabled)
│   ├── controllers/        # thin request handlers (no business logic in routes)
│   │   ├── auth.controller.ts          # signup, login, me
│   │   ├── post.controller.ts          # createPost, getFeed (+ serializePost)
│   │   ├── interaction.controller.ts   # toggleLike, addComment, getComments
│   │   └── user.controller.ts          # registerFcmToken
│   ├── middleware/
│   │   ├── auth.ts         # Bearer-token verification → req.user = { id }
│   │   ├── validate.ts     # validate(schema, 'body'|'params'|'query') → 422 on failure
│   │   ├── rateLimit.ts    # defaultLimiter (all routes) + authLimiter (tighter on /auth)
│   │   ├── errorHandler.ts # central error → standard envelope (LAST middleware)
│   │   └── notFound.ts     # unknown route → 404 envelope
│   ├── models/
│   │   ├── User.ts         # username/email/password(hash)/fcmTokens
│   │   ├── Post.ts         # author/text/likes[]/commentCount
│   │   └── Comment.ts      # post/author/text
│   ├── routes/
│   │   ├── index.ts        # mounts /health, /auth, /posts, /users
│   │   ├── auth.routes.ts
│   │   ├── post.routes.ts  # posts + interactions (like/comment/comments)
│   │   └── user.routes.ts  # fcm-token
│   ├── services/
│   │   └── notification.service.ts # notifyOnLike / notifyOnComment (FCM multicast)
│   ├── utils/
│   │   ├── asyncHandler.ts # wrap async handlers so rejections reach errorHandler
│   │   ├── ApiError.ts     # typed expected-failure error (statusCode/code/message/details)
│   │   ├── jwt.ts          # signToken / verifyToken
│   │   └── pagination.ts   # getPagination(query) + buildPage(data, total, …)
│   ├── validators/         # zod schemas per feature (auth, post, comment, user, common)
│   ├── types/
│   │   └── express.d.ts    # augments Express Request with req.user
│   ├── app.ts              # express app (helmet, cors, json, rate limit, routes) — no listen
│   └── server.ts           # bootstrap: connect DB → init Firebase → app.listen + shutdown
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

**Request lifecycle:** `helmet` → `cors` → `express.json` → `defaultLimiter` → route
(`authLimiter` on `/auth/*`) → `auth` (🔒 routes) → `validate(schema)` → controller
(wrapped in `asyncHandler`) → `notFound` (no match) → `errorHandler` (any thrown error).

---

## Architecture & conventions

### Response & error envelope

**Success** returns the resource directly (e.g. `{ user, token }`, `{ post }`) or a paginated
list envelope (see below). **Every error** uses one shape:

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Human readable", "details": [] } }
```

| Code                  | Status | When                                              |
| --------------------- | ------ | ------------------------------------------------- |
| `VALIDATION_ERROR`    | 422    | Body/params/query failed zod validation           |
| `UNAUTHORIZED`        | 401    | Missing/malformed `Authorization` header          |
| `INVALID_TOKEN`       | 401    | Bearer token invalid or expired                   |
| `INVALID_CREDENTIALS` | 401    | Wrong email/username or password on login         |
| `USER_EXISTS`         | 409    | Signup with a taken username/email                |
| `NOT_FOUND`           | 404    | Resource (or unknown route) not found             |
| `RATE_LIMITED`        | 429    | Too many requests in the window                   |
| `INTERNAL_ERROR`      | 500    | Unexpected error (no stack/message leak in prod)  |

Expected failures throw `ApiError(statusCode, code, message, details?)`; the central
`errorHandler` formats them. `zod` errors become `422 VALIDATION_ERROR` with field-level
`details`. Anything else becomes a generic `500` (the real message is shown only outside
production).

### Pagination

List endpoints accept `?page` (default `1`) and `?limit` (default `20`, max `100`) and return:

```json
{ "data": [ /* … */ ], "page": 1, "limit": 20, "total": 42, "hasMore": true }
```

### Authentication

Protected routes (marked 🔒) require an `Authorization: Bearer <jwt>` header. The `auth`
middleware verifies the token and attaches `req.user = { id }`; controllers load the full user
only when needed. Tokens are signed with `JWT_SECRET` and expire per `JWT_EXPIRES_IN`.

### Rate limiting

- All routes: **300 requests / 15 min** per IP.
- `/auth/*`: **20 requests / 15 min** per IP (tighter, to slow credential stuffing).

Exceeding a limit returns `429 RATE_LIMITED`.

### Notifications

When someone **likes** or **comments** on a post, the author receives an FCM push (title +
body + a `data` payload of `{ type, postId }` for deep-linking). Key behaviors:

- **Never notify yourself** — self like/comment sends nothing.
- **Fire-and-forget** — sends run detached from the request; a notification failure never
  causes the like/comment request to fail.
- **Token hygiene** — a user's device tokens are stored as an array (multiple devices,
  deduped). Tokens FCM reports as unregistered/invalid are pruned automatically.
- **Graceful degradation** — if Firebase credentials are absent or invalid, FCM is disabled
  and these calls become no-ops.

A client registers its device token via [`POST /users/fcm-token`](#post-usersfcm-token).

---

## Data models

**User**

| Field        | Type       | Notes                                                        |
| ------------ | ---------- | ------------------------------------------------------------ |
| `username`   | string     | unique, lowercase, 3–20 chars, `[a-z0-9_]`                   |
| `email`      | string     | unique, valid email                                          |
| `password`   | string     | bcrypt hash; `select:false`, **never returned**              |
| `fcmTokens`  | string[]   | registered device tokens (deduped)                          |
| `createdAt` / `updatedAt` | Date | timestamps                                          |

**Post**

| Field          | Type        | Notes                                          |
| -------------- | ----------- | ---------------------------------------------- |
| `author`       | ObjectId    | ref `User`, indexed                            |
| `text`         | string      | 1–500 chars, trimmed                           |
| `likes`        | ObjectId[]  | user ids who liked (small-scale tradeoff)      |
| `commentCount` | number      | denormalized for cheap feed rendering          |
| `createdAt` (indexed desc) / `updatedAt` | Date | timestamps           |

**Comment**

| Field      | Type     | Notes                       |
| ---------- | -------- | --------------------------- |
| `post`     | ObjectId | ref `Post`, indexed         |
| `author`   | ObjectId | ref `User`                  |
| `text`     | string   | 1–300 chars, trimmed        |
| `createdAt` / `updatedAt` | Date | timestamps       |

> **Likes are stored on the post** (`Post.likes`). This keeps the toggle and the "did I like
> this?" check trivial for this scope. It does not scale to millions of likes per post; that
> would warrant a separate `Like` collection. Documented as a deliberate tradeoff.

---

## API reference

Base URL: `http://localhost:4000`. All protected routes (🔒) require
`Authorization: Bearer <jwt>`. All responses are JSON.

| Method | Path                    | Auth | Body / Query                          | Success           |
| ------ | ----------------------- | ---- | ------------------------------------- | ----------------- |
| GET    | `/health`               | —    | —                                     | `200`             |
| POST   | `/auth/signup`          | —    | `{ username, email, password }`       | `201 { user, token }` |
| POST   | `/auth/login`           | —    | `{ emailOrUsername, password }`       | `200 { user, token }` |
| GET    | `/auth/me`              | 🔒   | —                                     | `200 { user }`    |
| POST   | `/users/fcm-token`      | 🔒   | `{ token }`                           | `200 { success }` |
| POST   | `/posts`                | 🔒   | `{ text }`                            | `201 { post }`    |
| GET    | `/posts`                | 🔒   | `?page&limit&username`                | `200 list`        |
| POST   | `/posts/:id/like`       | 🔒   | —                                     | `200 { liked, likeCount }` |
| POST   | `/posts/:id/comment`    | 🔒   | `{ text }`                            | `201 { comment }` |
| GET    | `/posts/:id/comments`   | 🔒   | `?page&limit`                         | `200 list`        |

The `user`, `post`, and `comment` objects are shaped as:

```jsonc
// user (never includes the password hash)
{ "_id": "…", "username": "alice", "email": "alice@x.com", "fcmTokens": [], "createdAt": "…", "updatedAt": "…" }

// post (author populated with username only; raw likes array is not exposed)
{ "id": "…", "author": { "id": "…", "username": "alice" }, "text": "hello",
  "likeCount": 0, "likedByMe": false, "commentCount": 0, "createdAt": "…", "updatedAt": "…" }

// comment
{ "id": "…", "post": "…", "author": { "id": "…", "username": "bob" },
  "text": "nice!", "createdAt": "…", "updatedAt": "…" }
```

---

### `GET /health`

Liveness probe. No auth.

**200**

```json
{ "status": "ok" }
```

---

### `POST /auth/signup`

Create an account and receive a JWT.

**Body**

```json
{ "username": "alice", "email": "alice@example.com", "password": "password123" }
```

- `username`: 3–20 chars, lowercase `a–z`, `0–9`, `_` (normalized to lowercase).
- `email`: valid email (normalized to lowercase).
- `password`: min 8 chars.

**201** → `{ user, token }`

**Errors:** `422 VALIDATION_ERROR` (bad body), `409 USER_EXISTS` (username/email taken).

---

### `POST /auth/login`

Authenticate by email **or** username.

**Body**

```json
{ "emailOrUsername": "alice", "password": "password123" }
```

**200** → `{ user, token }`

**Errors:** `422 VALIDATION_ERROR`, `401 INVALID_CREDENTIALS`.

---

### `GET /auth/me` 🔒

Return the authenticated user.

**200** → `{ user }`

**Errors:** `401 UNAUTHORIZED` / `INVALID_TOKEN`.

---

### `POST /users/fcm-token` 🔒

Register the caller's current device token for push notifications. Idempotent — registering
the same token again does not create a duplicate (`$addToSet`). A user may have multiple
device tokens.

**Body**

```json
{ "token": "fcm-device-token-string" }
```

**200**

```json
{ "success": true }
```

**Errors:** `422 VALIDATION_ERROR` (missing/empty token), `401 UNAUTHORIZED`.

---

### `POST /posts` 🔒

Create a text post.

**Body**

```json
{ "text": "my first ripple" }
```

- `text`: 1–500 chars, trimmed.

**201** → `{ post }` (with `author` populated, `likeCount: 0`, `likedByMe: false`,
`commentCount: 0`).

**Errors:** `422 VALIDATION_ERROR` (empty / >500 chars), `401 UNAUTHORIZED`.

---

### `GET /posts` 🔒

Paginated shared feed, **newest first**.

**Query**

| Param      | Default | Notes                                                      |
| ---------- | ------- | ---------------------------------------------------------- |
| `page`     | `1`     | 1-based page number                                        |
| `limit`    | `20`    | page size (max `100`)                                      |
| `username` | —       | filter to one author. Unknown username → **empty page** (not 404). |

Each post includes `likeCount`, `commentCount`, and `likedByMe` (computed for the requesting
user).

**200**

```json
{
  "data": [
    { "id": "…", "author": { "id": "…", "username": "alice" }, "text": "hello",
      "likeCount": 1, "likedByMe": true, "commentCount": 2, "createdAt": "…", "updatedAt": "…" }
  ],
  "page": 1, "limit": 20, "total": 1, "hasMore": false
}
```

**Errors:** `401 UNAUTHORIZED`.

---

### `POST /posts/:id/like` 🔒

Toggle the caller's like on a post. If not yet liked → adds the like (`liked: true`) and, when
the liker is not the author, fires a notification. If already liked → removes it
(`liked: false`, no notification).

- `:id` must be a valid ObjectId, else `422 VALIDATION_ERROR`.

**200**

```json
{ "liked": true, "likeCount": 1 }
```

**Errors:** `422` (bad `:id`), `404 NOT_FOUND` (no such post), `401 UNAUTHORIZED`.

---

### `POST /posts/:id/comment` 🔒

Add a comment to a post. Increments the post's `commentCount` and (unless commenting on your
own post) fires a notification to the author.

**Body**

```json
{ "text": "great post!" }
```

- `text`: 1–300 chars, trimmed. `:id`: valid ObjectId.

**201** → `{ comment }` (with `author` populated).

**Errors:** `422` (bad `:id` or text), `404 NOT_FOUND`, `401 UNAUTHORIZED`.

---

### `GET /posts/:id/comments` 🔒

Paginated comments for a post, **oldest first**.

**Query:** `page` (default `1`), `limit` (default `20`, max `100`).

**200**

```json
{
  "data": [
    { "id": "…", "post": "…", "author": { "id": "…", "username": "bob" },
      "text": "great post!", "createdAt": "…", "updatedAt": "…" }
  ],
  "page": 1, "limit": 20, "total": 1, "hasMore": false
}
```

**Errors:** `422` (bad `:id`), `404 NOT_FOUND`, `401 UNAUTHORIZED`.

---

## End-to-end example (golden path)

```bash
BASE=http://localhost:4000

# 1) Sign up (capture the token)
TOKEN=$(curl -s -X POST $BASE/auth/signup \
  -H 'Content-Type: application/json' \
  -d '{"username":"alice","email":"alice@example.com","password":"password123"}' \
  | jq -r .token)

# 2) Register a device token for push
curl -s -X POST $BASE/users/fcm-token \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"token":"demo-fcm-token"}'

# 3) Create a post (capture its id)
POST_ID=$(curl -s -X POST $BASE/posts \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"text":"hello ripple"}' | jq -r .post.id)

# 4) Read the feed
curl -s "$BASE/posts?page=1&limit=20" -H "Authorization: Bearer $TOKEN"

# 5) Like and comment (as another user, this would notify alice)
curl -s -X POST $BASE/posts/$POST_ID/like    -H "Authorization: Bearer $TOKEN"
curl -s -X POST $BASE/posts/$POST_ID/comment -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' -d '{"text":"nice!"}'

# 6) Read comments
curl -s "$BASE/posts/$POST_ID/comments" -H "Authorization: Bearer $TOKEN"
```

> Push delivery to a real device requires valid Firebase credentials **and** the mobile app
> (which registers a real FCM token and handles incoming messages). With credentials absent,
> the API behaves identically except no push is sent.
