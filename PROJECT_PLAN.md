# techweb — Build Plan (v1 Prototype)

> How to use this file in Antigravity: open your empty project folder, switch to **Plan** mode,
> and either paste this whole document as your first message, or save it as `PROJECT_PLAN.md`
> in the project root and reference it with `@PROJECT_PLAN.md` in your prompt. Ask the agent to
> work through the "Build Order" section phase by phase, confirming each phase before moving on.

## 1. What we're building

A team-formation platform for hackathons and CTFs. Participants create a skills profile;
events define required skill categories and eligibility rules (team size, diversity
requirement, region, online/offline mode); teams get a live "skill gap" view and a ranked
list of candidates who best close that gap — not just people with similar skills.

v1 is deliberately rule-based. No AI/LLM calls anywhere in this version.

## 2. Tech stack

| Layer | Choice | Notes |
|---|---|---|
| Frontend | Next.js (App Router) + TypeScript | Single app, no separate frontend repo |
| Styling | Tailwind CSS | Fast to build, no custom design system needed for v1 |
| Backend | Next.js API routes (Route Handlers) | Same deployable as frontend |
| Database | PostgreSQL via Neon (free tier) | Autoscaling, native Vercel integration |
| ORM | Prisma | Schema-first, type-safe queries |
| Auth | NextAuth.js | Email or GitHub login, self-hosted, free |
| Hosting | Vercel (Hobby plan) | Auto-deploy from GitHub `main` |

## 3. Data model (Prisma schema — target shape)

```
User
  id, name, email, image
  bio, experienceLevel        // beginner | intermediate | advanced
  timezone, location, travelRadiusKm
  eventPreference              // online | offline | either
  createdAt

Skill
  id, name, category           // category: "hackathon" | "ctf"
  // e.g. name: "Pwn", category: "ctf"; name: "Frontend", category: "hackathon"

UserSkill
  userId, skillId, proficiency // 1-5

EvidenceLink
  userId, label, url           // GitHub, CTFtime, HackerOne, Bugcrowd profile links

Event
  id, name, type                // hackathon | ctf
  mode                           // online | offline
  teamSizeMin, teamSizeMax
  diversityRuleText              // free text for v1, e.g. "at least 1 female member"
  regionRestriction               // nullable
  createdBy

EventRequiredSkill
  eventId, skillId, minCount     // how many teammates need this skill

Team
  id, eventId, name, createdBy

TeamMember
  teamId, userId, joinedAt

// No persisted "Match" table needed for v1 — recommendations are computed
// on request from Team + Event + candidate User data. Add caching later if needed.
```

## 4. Frontend — pages and what each one does

| Route | Purpose |
|---|---|
| `/` | Landing page — problem framing, "Browse events" / "Sign in" CTAs |
| `/auth/signin` | NextAuth sign-in page |
| `/onboarding` | Profile builder: skills (multi-select from taxonomy, tagged hackathon/CTF), experience level, timezone, location, travel radius, event preference, evidence links |
| `/profile` | View/edit own profile |
| `/events` | Browse events — filter by type (hackathon/CTF) and mode (online/offline) |
| `/events/new` | Create an event — name, type, mode, team size range, diversity rule text, required skills + min count per skill |
| `/events/[eventId]` | Event detail — rules summary, list of teams in this event, "Create team" / "Join team" actions |
| `/events/[eventId]/teams/[teamId]` | **Team dashboard** — the core screen: aggregated skill coverage (covered vs. missing, shown as a simple bar/badge list), eligibility status against the event's rules, and the ranked candidate recommendation list |

Component notes for the agent:
- Skill coverage should render as: for each required skill, `covered / required` with a visual fill (Tailwind width class), red/amber/green by how close to met.
- Candidate list cards should show: name, top 2-3 skills that match the gap, location/timezone fit, and a clear "Eligible" / "Not eligible" badge with the reason (e.g. "outside travel radius", "team already at max size").

## 5. Backend — API routes

| Method & route | Purpose |
|---|---|
| `POST /api/profile` | Create/update the signed-in user's profile + skills + evidence links |
| `GET /api/skills` | Return the skill taxonomy (seeded list, grouped by category) |
| `GET /api/events` | List events, with optional `type` / `mode` query filters |
| `POST /api/events` | Create an event with its required-skill rows |
| `GET /api/events/:eventId` | Event detail + its teams |
| `POST /api/events/:eventId/teams` | Create a team inside an event |
| `POST /api/teams/:teamId/join` | Add the signed-in user to a team |
| `GET /api/teams/:teamId` | Team detail: members, aggregated skill profile |
| `GET /api/teams/:teamId/eligibility` | Run the eligibility check (see §6) against the event's rules |
| `GET /api/teams/:teamId/recommendations` | Run the gap-matching engine (see §6), return ranked candidates |

## 6. Core logic (pseudocode — implement as plain TypeScript, no external calls)

**Skill-gap scoring:**
```
teamVector = countSkillsAcrossMembers(team.members)          // { skillId: count }
requiredVector = event.requiredSkills                         // { skillId: minCount }
gapVector = for each skill in requiredVector:
              max(minCount - teamVector[skillId] || 0, 0)

candidateScore(candidate) =
  sum over skills in gapVector where gapVector[skill] > 0:
    candidate.hasSkill(skill) ? proficiencyWeight(candidate, skill) : 0

rankedCandidates = allEligibleUsers
  .filter(not already in team)
  .map(u => ({ user: u, score: candidateScore(u) }))
  .filter(c => c.score > 0)
  .sort(by score desc)
```

**Eligibility check (independent of scoring — hard pass/fail):**
```
- team.members.length within [event.teamSizeMin, event.teamSizeMax]
- if event.diversityRuleText set: flag as "needs manual confirmation" in v1
  (free-text rule — don't try to auto-validate gender in v1, just surface the rule
  as a checklist item for the team to self-confirm)
- if event.mode == offline: candidate must be within travelRadiusKm of event/team location
- if event.mode == online: candidate.timezone must overlap team's typical availability window
```

**Location/mode filter applied before scoring, not after** — an ineligible candidate should never appear in the ranked list at all, to keep the UI simple for the demo.

## 7. Build order (work through these as separate phases/checkpoints)

1. **Scaffold** — Next.js + TypeScript + Tailwind project, connect Prisma to Neon, set up NextAuth with GitHub provider, confirm the app deploys to Vercel with a blank homepage.
2. **Data layer** — write the Prisma schema from §3, run the migration, seed the `Skill` table with an initial hackathon + CTF taxonomy (Frontend, Backend, AI/ML, UI/UX, DevOps, Product/Pitch; Web Exploitation, Pwn, Reverse Engineering, Cryptography, OSINT, Forensics).
3. **Auth + profile** — sign-in flow, `/onboarding` page, `POST /api/profile`, `/profile` view/edit page.
4. **Events** — `/events`, `/events/new`, `/events/[eventId]`, matching API routes for create/list/detail.
5. **Teams** — create/join team flows, `GET /api/teams/:teamId` returning aggregated skill data.
6. **Matching engine** — implement §6 logic as pure functions first (unit-testable without UI), then wire to `GET /api/teams/:teamId/recommendations` and the team dashboard UI.
7. **Eligibility checker** — implement the rule checks, wire to the UI badges on the team dashboard.
8. **Demo polish** — seed 2-3 fake events and a handful of fake user profiles so the recommendation list has something to show live on Monday; basic empty/loading states; mobile-responsive pass on the team dashboard specifically, since that's the screen you'll be presenting.

## 8. Explicitly out of scope for v1

- No AI/LLM calls anywhere (matching is pure rule-based logic per §6)
- No automated diversity-rule validation — surfaced as a manual checklist item only
- No integration with external hackathon platforms (Devpost, etc.) — that's Phase 4 of the
  product roadmap, not this prototype
- No skill verification via GitHub/CTFtime/HackerOne linking — evidence links are stored
  but not validated in v1
