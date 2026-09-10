# techweb

A local hackathon and CTF teammate finder built with Next.js, React, Prisma, and SQLite.

## Run locally

From this directory:

```powershell
npm install
```

Create `.env` with `DATABASE_URL="file:./dev.db"`, then run:

```powershell
npm run db:push
npm run db:seed
npm run dev
```

Open http://localhost:3000. Register a new account, save your skills in Profile, create an event with skill requirements, then create a team from the event page. The team dashboard displays coverage, missing skills, recommendations, and eligibility checks. Other signed-in users can join teams with available places.

## Data and accounts

Seeding only runs on an empty database and skips existing data. Sample profiles have no passwords and cannot sign in; register your own account. `npm run db:reset` intentionally erases all local data.

## Matching and eligibility

Recommendations use missing skills, weighted by self-reported proficiency; no AI service or paid API is required. Existing team members and incompatible candidates are excluded. Joining checks capacity, event-mode preferences, and any exact region restriction. Travel, working hours, and free-text requirements need manual confirmation. A matching score is not a probability or a guarantee of suitability.

Accounts use salted scrypt password hashes and seven-day server-side sessions. This is a local student demo; email verification, password recovery, and login rate limiting are not implemented.

## Verification

```powershell
npm run lint
npm run build
```

With a development server running on port 3100 (`npm run dev -- --port 3100`), run `node scripts/smoke.mjs`. Set `TEST_BASE_URL` for another port. The smoke test creates temporary accounts, an event, and a team, exercises the APIs and page rendering, and removes its own records afterward. Run against a local development database.

## Design in Cursor

See [DESIGN.md](DESIGN.md) for the color system, editable files, and live-preview workflow.
