# TechWeb on Vercel + Neon

The code is prepared for deployment. No Neon database, Vercel project, or Google OAuth client has been connected by this change.

## 1. Create the Neon database

Create a Neon PostgreSQL project. In its Connect panel, copy the pooled connection string for application traffic and the direct (unpooled) connection string for migrations. Keep both in environment settings, never in GitHub or chat.

The existing SQLite database remains your local demo. Deployment starts a new database; this setup does not transfer local accounts or events. If you want those records online, migrate them separately before inviting users.

## 2. Import GitHub into Vercel

Import your repository and select the directory containing this app's package.json as the Root Directory. The framework is Next.js. The included vercel.json selects `npm run build:vercel`.

Add these **Production** environment variables:

| Variable | Value |
| --- | --- |
| DATABASE_URL | Neon pooled PostgreSQL connection string, with its supplied SSL settings |
| DIRECT_URL | Neon direct PostgreSQL connection string, with its supplied SSL settings |
| APP_URL | Your stable app origin, e.g. https://your-project.vercel.app |
| GOOGLE_CLIENT_ID | OAuth web application's client ID |
| GOOGLE_CLIENT_SECRET | OAuth web application's client secret |

None of these names should have a NEXT_PUBLIC_ prefix. Never commit .env. The tracked .env.example contains only placeholders.

The deployment command derives a PostgreSQL schema from prisma/schema.prisma, generates Prisma Client, applies the checked-in initial migration to Neon, and builds Next.js. It does not seed example people or events. The first real account can type any skill and create a competition even with an empty skill catalogue.

Use a separate Neon branch/database for Preview deployments, with separate DATABASE_URL and DIRECT_URL settings. Each build runs migrations; do not point unreviewed previews at your production database. For Google login tests, use a stable preview domain with its own APP_URL and an explicitly registered redirect URI.

## 3. Enable Sign in with Google

Create or choose a Google Cloud project, configure the Google Auth consent/branding screen, and create an OAuth client of type **Web application**. Direct Google sign-in needs only `openid`, `email`, and `profile`; it does not require the paid Google Cloud Identity Platform service.

Register these exact authorized redirect URIs (replace the production hostname):

```text
http://localhost:3100/api/auth/google/callback
https://your-project.vercel.app/api/auth/google/callback
```

While your consent screen is in Testing mode, add the Google accounts that will test it. Configure the client ID and secret in Vercel, then redeploy. If you use another local port, update APP_URL and register that exact local callback as well. Do not reuse a production APP_URL on a different host: the browser's sign-in cookies must return to the host that started the flow.

For local Google testing, add APP_URL, GOOGLE_CLIENT_ID, and GOOGLE_CLIENT_SECRET to your ignored .env and restart the development server. Without these settings, email/password login works and the Google button explains that it is unavailable.

New Google accounts use the verified Google email as their initial contact address. Existing password accounts must first sign in with their password, then choose **Connect Google sign-in** on Profile, using the same email. Matching email alone never automatically links accounts. Contact-email changes do not change login credentials and are not verified by an email-delivery service.

## 4. Verify before inviting teammates

Sign in with Google, reload the app, save a profile with a custom skill and research link, create a competition with online and in-person rounds, and join its team from a second account. Confirm that email contact is visible only after signing in. Sign out and verify that the public profile contains work links but no contact email.

## Schema maintenance

`prisma/schema.prisma` is the shared model source and keeps SQLite for local development. `npm run db:neon:prepare` generates `prisma/neon/schema.prisma` (ignored by Git). Neon migrations live under `prisma/neon/migrations`; future model changes need a new PostgreSQL migration before deployment. Do not rewrite migrations after deploying them. Local development continues to use `npm run db:push` and `npm run dev -- --port 3100`.

References: [Vercel environment variables](https://vercel.com/docs/environment-variables), [Vercel SQLite guidance](https://vercel.com/kb/guide/is-sqlite-supported-in-vercel), [Prisma 6 and Neon](https://docs.prisma.io/docs/orm/v6/overview/databases/neon), [Google OAuth setup](https://developers.google.com/identity/openid-connect/openid-connect).
