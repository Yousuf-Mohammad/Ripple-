# Ripple

A lightweight, text-only social feed. Every interaction sends a *ripple* back to the
author — a push notification (via Firebase Cloud Messaging) when their post is liked or
commented on.

This is a monorepo with two apps:

- **[`backend/`](./backend/README.md)** — Node.js + Express + TypeScript REST API
  (MongoDB/Mongoose, JWT auth, FCM push). See the backend README for setup and full API docs.
- **`mobile/`** — React Native (Expo) app in TypeScript, shipped as an installable Android
  APK. _(Scaffolded in a later phase.)_

## What it does

- **Auth** — signup / login with JWT.
- **Posts** — create text posts; view a shared paginated feed (newest first); filter by username.
- **Interactions** — like / unlike and comment on posts.
- **Notifications** — the post author gets a push notification when someone likes or
  comments on their post.

## Project docs

- `CLAUDE.md` — authoritative spec and architectural decisions.
- `PLAN.md` — phased implementation plan (P0–P12).

## Quick start (backend)

```bash
cd backend
cp .env.example .env   # then fill in values
npm install
npm run dev            # starts the API with live reload
```

See [`backend/README.md`](./backend/README.md) for details.
