# TechWeb: prototype, launch, and Design Thinking roadmap

Prepared 15 September 2026. This is the execution checklist for the next prototype. It builds on the existing app and links to DESIGN.md, UI_UX_REDESIGN_PLAN.md, and DEPLOYMENT.md. It does not report a completed security audit or a live deployment. Dates below are proposed; launch depends on passing the checks.

## 1. Problem and prototype scope

Working hypothesis: students struggle to find suitable teammates because skills, work examples, competition information, and availability are scattered. Validate this through research; it is not yet an interview finding.

Prototype outcome: a student can find a competition, inspect people and their work, understand a team's missing skills, and join or contact a suitable team.

- [ ] Keep the first release focused on discovery, accounts, profiles, competitions, and teams.
- [ ] Include clear self-reported skill labels, unverified event labels, empty states, and a feedback route.
- [ ] Keep matching rule based. Defer chat, uploads, paid AI, automated verification, and external event scraping.
- [ ] Treat the initial website as a hypothesis to test. Research can change both the problem statement and the interface.

## 2. Current evidence, checked in source

The current checkout includes Next.js/Prisma, a local SQLite database model, a generated PostgreSQL/Neon schema and migration, Google OAuth code, profile work links, typed skills, competition rounds, and paginated event/team pages. Deployment documentation says provider accounts have not been connected by that setup work. This review did not inspect live provider dashboards.

The checkout contains substantial uncommitted work. Preserve it. Do not replace this app with an unrelated starter or rewrite an already deployed migration.

Launch gaps observed:

- src/app/api/auth/route.ts has no request rate limiter before database access/password hashing.
- src/app/api/users/route.ts, events/route.ts, and teams/route.ts return lists without a top-level result cap.
- src/lib/team.ts loads an unbounded candidate pool for recommendations.
- Mutation handlers call request.json() without an application-level streamed body-size limit.
- src/lib/auth.ts creates expiring sessions; scheduled cleanup and per-account session caps need implementation/verification.
- Existing security tests focus on Google token validation/account linking. They do not establish complete application security.

## 3. Ordered work packages

### A. Establish a reliable baseline — target 15–16 September

- [x] Inspect current source, deployment notes, and design plan.
- [ ] Record the working diff and preserve local data and settings.
- [ ] Run lint, build, existing security tests, and the functional smoke flow using a disposable test database.
- [ ] Verify the PostgreSQL migration on an isolated test database and verify an empty-database first run.
- [ ] Record current mobile/desktop screenshots for comparison.

Done when: the starting behavior is reproducible and failures are recorded before further changes.

### B. Protect the prototype and free quotas — target 16–19 September

- [ ] Add provider-edge rate limiting for dynamic traffic, including pages that query the database; exclude static assets. Cover direct deployment aliases as well as the public domain.
- [ ] Add an atomic shared rate limiter for sensitive actions. Do not use an in-memory Map as production protection across serverless instances, and do not write one Neon row per incoming request.
- [ ] Choose and verify the shared counter service's free quota before enabling it. Bound key size/cardinality, use TTLs, and check its failure behavior.
- [ ] Apply pre-authentication limits before database access or password hashing. Derive IP only from headers guaranteed by the chosen host; never trust arbitrary forwarded headers.
- [ ] Combine short bursts, per-account limits, and a global write budget. Test legitimate students sharing one campus IP.
- [ ] Add Turnstile to registration and other selected high-risk actions; validate success, expected hostname and action on the server. Reject expired/replayed/invalid tokens and provider failures before database writes.
- [ ] Rate-limit OAuth start/callback too. Google sign-in alone is not a bot defence. Require a verified identity or an invite for public creation during the pilot; password registration needs its own verification policy.
- [ ] Return HTTP 429 with Retry-After for limits. Preserve form values and explain when the student can retry. Return a clear temporary-unavailable response when a required protection service is down.
- [ ] Enforce streaming JSON body limits, string/array limits, safe URL schemes, validated query parameters, and capped pagination on APIs as well as pages.
- [ ] Bound recommendation candidates and disclose/tune candidate selection so pagination does not silently misrepresent a complete ranking.
- [ ] Add transactional per-account creation quotas, expiry cleanup for sessions, and safe duplicate handling. Verify simultaneous team joins cannot exceed capacity.
- [ ] Cache only suitable public data. Keep contact emails, sessions, and personalized responses out of shared caches. Avoid frequent database polling.
- [ ] Add an operational switch to pause registration and writes. Keep a static explanation available without a database query during exhaustion.
- [ ] Review authorization, public/contact-email exposure, session/cookie handling, OAuth, CSRF, injection/XSS, production error output, and response headers.
- [ ] Review runtime dependencies for known vulnerabilities and resolve applicable high/critical findings before launch.

Done when: automated tests demonstrate denial before expensive work, limits hold across instances, concurrency tests pass, legitimate campus users can complete tasks, and no known unresolved high/critical issue remains in the reviewed scope. This is a launch criterion, not a guarantee of zero vulnerabilities.

### C. Improve the UI/UX — target 19–22 September

- [ ] Confirm the exact Landen reference URL. Until then use the existing navy/blue/violet identity and a polished SaaS direction; no exact visual match is claimed.
- [ ] Build a clear hero with one main action, a secondary browse action, and a readable product preview. Use original/licensed assets.
- [ ] Explain the problem, how team discovery works, and the benefit of complementary skills. Use real or explicitly illustrative content, not invented testimonials or usage statistics.
- [ ] Improve discovery cards, filter layout, available spots, and event detail hierarchy.
- [ ] Split long profile/create forms into understandable sections, keeping drafts and validation feedback clear.
- [ ] Make work links easy to assess and state when contact details become visible.
- [ ] Add restrained motion; preserve reduced motion, keyboard focus, and content visibility without animation JavaScript.
- [ ] Check 390px mobile, tablet, and 1440px desktop; zoom, keyboard, contrast, loading, empty, error, and throttled states.
- [ ] Update DESIGN.md to describe the final implementation.

Done when: new students can browse, save a profile, and join a team without coaching; no clipping or obstructed controls; visual checks supplement build/smoke tests.

### D. Deploy and run a small pilot — target 22–24 September

- [ ] Verify current free-plan eligibility and limits in the hosting, database, anti-bot, and rate-counter dashboards. No paid upgrade is assumed.
- [ ] Configure isolated preview/production data, pooled application connections, direct migration connections, OAuth redirects, and server secrets.
- [ ] Rehearse migration, backup/export, rollback, and the pause-write switch. Avoid automatic production migrations from unreviewed previews.
- [ ] Deploy after the preceding launch checks pass, then verify the actual public URL from a signed-out browser.
- [ ] Invite a small pilot cohort first; test two real accounts, contact privacy, persistence, and mobile use.
- [ ] Measure database compute/storage/transfer, hosting usage, counter-service usage, blocked requests, errors, and task completion.
- [ ] Set warning thresholds at 50%, 75%, and 90% of each applicable quota as internal operating targets; use the provider's actual quota units. Pause or narrow access before exhaustion.

Done when: public flows work, protections are active on the deployed host, usage is measured, and recovery has been rehearsed. One thousand people reached is not evidence of capacity for one thousand simultaneous users.

### E. Research, iteration, and submission — target 24–30 September

- [ ] Read the teacher's screenshots and reconcile the rubric.
- [ ] Define whether 1,000 means outreach reach, responses, registrations, or active users. Working assumption: people reached; not 1,000 survey responses.
- [ ] Prepare and pilot the survey. Ask about current experiences before showing the proposed solution.
- [ ] Recruit 4–5 interviewees early; use consent, anonymous notes, and actual quotes only.
- [ ] Conduct discovery questions before prototype tasks to reduce solution bias.
- [ ] Analyse results; create evidence-based empathy maps, personas if required, and the current journey map.
- [ ] Refine the problem statement, compare alternatives, and document the proposed journey and prototype changes.
- [ ] Expand outreach in stages only while the service remains healthy; track reach, responses, registrations, and active use separately.
- [ ] Replace planning slides with actual research, screenshots, tests, and lessons in the final assignment PPT.

## 4. Initial abuse policy to tune in the pilot

These numbers are proposed starting settings, not implemented limits or proven capacity. Use atomic counters, expiry, and explicit global budgets; adapt to actual usage before widening access.

| Action | Proposed starting policy | Important condition |
| --- | --- | --- |
| Login | 5 attempts per account/IP pair per 10 minutes, with an additional broader source-IP limit | Avoid permanently locking an account through attacker traffic; handle campus NAT |
| Registration | 3 attempts per source IP per hour, initially invite/verified-identity gated | Raise or adapt for shared campus networks after pilot tests; bot verification required |
| Profile saves | 20 per account per hour | Bound payload and skill/work-link counts |
| Create competitions | 2 per account per day | Transactional quota and global daily write cap |
| Create teams | 5 per account per day | Transactional quota; event permissions/eligibility still apply |
| Join attempts | 10 per account per 10 minutes | Idempotency, duplicate and capacity checks remain necessary |
| Recommendations | 10 requests per account per minute | Bound computation and candidate pool; cache only appropriate results |
| Public listings | Default 12, maximum 24 results; bounded query length and pagination | Cover HTML/RSC routes as well as JSON APIs; choose edge burst limit from observed traffic |
| Mutation payload | Maximum 32 KiB JSON unless a smaller route-specific limit applies | Enforce streamed bytes; Content-Length alone is insufficient |

Per-user limits cannot stop an attacker rotating accounts/IPs. The global write budget and the ability to stop writes protect storage; edge filtering/caching reduce database wakeups. Neither a pooled connection nor a CAPTCHA guarantees low resource usage.

## 5. Open-source reuse

Keep the existing app. Consider Radix primitives only for interactions that need them and Lucide for a consistent icon set. Before adding anything: inspect the actual package/version, license and attribution terms, maintenance, security advisories, and bundle cost. Record adopted assets/packages in a license manifest. Open source is not a security guarantee. Do not copy Landen's code or proprietary artwork merely because its site is publicly visible.

## 6. Presentation plan

The accompanying editable planning PPT covers the problem hypothesis, proposed service, prototype flow, current implementation, visual direction, abuse protection, usage budgets, launch gates, schedule, and research. It includes speaker notes. It contains no fabricated survey results, interviews, or claim of live deployment.

## Sources checked 15 September 2026

- Cloudflare Turnstile validation: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
- Cloudflare Turnstile plans: https://developers.cloudflare.com/turnstile/plans/
- Vercel WAF rate limits (Hobby currently lists one rate-limiting rule per project): https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting
- Neon plan reference; dashboard verification remains a launch task: https://neon.com/pricing
- Radix license: https://github.com/radix-ui/primitives/blob/main/LICENSE
- Lucide license: https://github.com/lucide-icons/lucide/blob/main/LICENSE

## Immediate next implementation step

Complete package A, then implement package B's bounded reads/body limits and shared abuse controls with tests. Complete the visual redesign after the protection architecture is established. Public deployment follows the launch checks.
