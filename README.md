# ভাষাসেতু

Bengali-first language learning app with public learning content, account registration, and an administrator workspace.

## Run locally

1. Install dependencies with `npm install`.
2. Configure `.env.local` with `MONGODB_URI`, `MONGODB_DB`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, and `ADMIN_EMAIL`.
3. Start the app with `npm run dev` and open the URL printed by Next.js.

The MongoDB URI and Better Auth secret must remain private. `.env.local` and the legacy root `env` filename are ignored by Git. The app reuses a MongoDB client and stores authentication records in MongoDB's `user`, `session`, `account`, and `verification` collections. Admin-authored lessons are stored separately in `learningContent`.

## Accounts and admin

Register at `/register` and sign in at `/login`. The email configured in `ADMIN_EMAIL` is the only account authorized for `/admin`; register with that exact email, then sign in and visit `/admin`. Other signed-in users are redirected to their learner panel, and unauthenticated requests are rejected server-side.

Administrators can review registered applicants, change their status, and create, edit, publish, or delete lesson content. Published content appears on the public landing page; drafts remain admin-only.

## Checks

- `npm run lint`
- `npm run build`