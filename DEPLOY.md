# Deploying to a VPS with Coolify

This app is a standard Next.js 16 (standalone) build. It runs anywhere Docker
runs. These steps target **Coolify on a Hostinger VPS**, but apply to any
Coolify host.

## Prerequisites

- A VPS with Coolify installed (Hostinger has a one-click Coolify template).
- A **Neon** database (keep your existing one) — Coolify only runs the app.
- A **Clerk** application for auth.
- A domain or subdomain pointed at the VPS (for HTTPS via Coolify/Let's Encrypt).

## 1. Create the resource in Coolify

1. New Resource → **Public/Private Git Repository** → select this repo and the
   branch you want to deploy.
2. Build Pack: **Dockerfile** (Coolify auto-detects the `Dockerfile` in the root).
3. Set the **Ports Exposed** to `3000`.

## 2. Environment variables

In Coolify, env vars come in two kinds. `NEXT_PUBLIC_*` values are inlined at
**build** time, so they must be marked as **Build Variables** (toggle "Build
Variable" on). The rest are runtime-only secrets.

**Build Variables** (also available at runtime):

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

**Runtime secrets:**

```
CLERK_SECRET_KEY=sk_live_...
DATABASE_URL=postgresql://...neon.tech/...?sslmode=require
CLERK_ADMIN_IDS=user_xxx
```

(Clerk sign-in/up URL vars have sensible defaults baked into the Dockerfile;
override them only if you change the routes.)

## 3. Domain + HTTPS

Set the resource's domain to `https://your-domain.com`. Coolify provisions a
Let's Encrypt certificate automatically. Make sure `NEXT_PUBLIC_APP_URL` matches
this exactly.

## 4. Clerk configuration

In the Clerk dashboard, add `https://your-domain.com` to the allowed origins /
production instances so auth works from the deployed domain.

## 5. Deploy

Hit **Deploy**. Coolify builds the Dockerfile and starts the container.

## 6. One-time database setup

Run these locally (or from any machine with the repo and the production
`DATABASE_URL` in your environment) to create the schema and seed content:

```bash
bun run db:push    # create tables in Neon
bun run db:prod    # seed the 5 courses incl. the HSK Chinese curriculum
```

## 7. (Optional) Mandarin audio

The Chinese courses cover HSK 1–6 (~4,800 words). Generate the pronunciation
files, then commit them so they ship in the image. Audio powers the "listening"
challenges (the speaker button on Chinese prompts); until generated, those
challenges fall back to reading.

```bash
# Everything at once
GOOGLE_TTS_API_KEY=... bun run audio:zh

# Or one HSK level at a time to spread out the quota/cost
HSK_LEVEL=1 GOOGLE_TTS_API_KEY=... bun run audio:zh

git add public/zh_*.mp3 && git commit -m "Add Mandarin audio" && git push
```

## 8. (Maintenance) Regenerating the HSK word list

HSK 2–6 vocabulary lives in `scripts/zh-hsk-data.json`, generated from the open
[complete-hsk-vocabulary](https://github.com/drkameleon/complete-hsk-vocabulary)
dataset. To rebuild it:

```bash
bunx tsx scripts/build-zh-hsk.ts
```

## Notes

- **Cold starts:** On Neon's free tier the database scales to zero after
  inactivity; the first request after idle takes ~1-2s while it wakes. Upgrade
  the Neon plan if you want it always-on.
- **Updates:** Push to the deployed branch and Coolify can auto-redeploy (enable
  the webhook in the resource settings).
