# TechWeb UI/UX redesign plan

Status: implementation-ready plan. The source audit is complete; the visual redesign below is proposed work, not a report of completed changes.

## 1. The result we want

Make TechWeb feel like a distinctive community where students discover opportunities, show their work, and find complementary teammates. The first screen should explain that purpose immediately and have a memorable visual: a layered network of skills connecting around a shared project.

Keep the navy, electric blue, and violet identity. Add crisp artwork, deliberate contrast, stronger typography, and restrained animation. Forms and team decisions should remain calm and easy to use.

The redesign succeeds when a new visitor can understand the product, find a suitable competition, inspect a builder's work, and locate the contact action without an explanation from the developer.

## 2. Current findings and scope

The audit covers the current `techweb-clean` application, its route files, shared components, design guide, and the desktop/mobile screens inspected earlier in this task.

| Finding | Planned response |
| --- | --- |
| The homepage already has an SVG network, but it is confined to a rectangular panel | Develop it into a layered, responsive hero composition with its own visual identity |
| Many sections use similar dark cards | Give discovery, people, work, and forms distinct visual treatments within one system |
| Event artwork cycles through three patterns by list position | Choose a stable artwork variant from event ID and type, so filtering does not change an event's appearance |
| `public/` contains starter SVG assets rather than a custom artwork collection | Create a small, consistent library of original vector artwork and reusable decorative layers |
| The profile editor is one long form with unused desktop space | Group fields into clear sections and add a live public-profile preview |
| Work links are mainly titles and hostnames | Turn them into readable project/research cards with clear destinations |
| Shared `DataForm` branches across four unrelated flows | Extract focused forms incrementally while preserving existing payloads and validation |

Preserve custom skills, email contact privacy, Google sign-in, global/local reach, mixed-format rounds, matching, and all existing routes. Chat and automatic event verification stay outside this redesign. Neon/Vercel activation remains a separate setup task documented in `DEPLOYMENT.md`.

The first release needs no new storage service or database fields. Event artwork, profile covers, and fallback avatars can all be rendered from existing data. Optional image uploads and richer project metadata belong to a later release with explicit storage and migration work.

## 3. Visual system

### Color and depth

| Role | Starting value | Use |
| --- | --- | --- |
| Page background | `#080F20` | Main canvas |
| Section surface | `#0D172B` | Large content areas |
| Raised surface | `#101C32` | Forms and cards |
| Primary action | `#397BFF` | Main buttons and connection actions |
| Brand accent | `#9565F5` | Identity, artwork, selected states |
| Main text | `#EEF3FF` | Headings and primary content |
| Secondary text | `#A8B6D0` | Supporting information |
| Amber | `#F5BB54` | Events, deadlines, unverified listings |
| Green | `#34D399` | Verified skills only, when verification actually exists |
| Red | `#F87171` | Errors and urgent deadlines |

Use three visible depth layers: a quiet page background, separated content surfaces, and small highlighted interactive elements. Keep luminous effects behind artwork and around selected actions. Avoid giving every card a large glow or using gradients behind body text.

### Typography, spacing, and controls

- Retain the system font in the first implementation; improve the type scale and weight before adding a font dependency. A later licensed local font must justify its transfer cost and include its license.
- Hero heading: approximately 64–76px on large screens and 36–42px on phones, with fluid scaling and no clipped fixed-height container.
- Page headings: 32–44px. Section headings: 24–32px. Body text: 16–18px. Metadata: 13–14px.
- Use an 8px spacing rhythm, with 4px adjustments for compact controls. Limit ordinary paragraphs to roughly 60–70 characters per line.
- Keep a maximum content width near the existing 1240px. Use 20px mobile gutters and 32–40px desktop gutters.
- Use 12–16px radii for controls/cards and 20–24px for hero and cover surfaces. Make borders visible enough to distinguish input fields from backgrounds.
- Aim for 44px minimum interactive targets as a project usability target, including remove buttons and mobile menu actions.
- Every component needs default, hover, focus, disabled, pending, error, and empty states where applicable.

## 4. High-definition artwork and motion

### Artwork deliverables

| Asset | Composition | Delivery |
| --- | --- | --- |
| Hero network | Central project hub with development, design, research, data, and security nodes | Responsive SVG; separate decorative layers for CSS animation |
| Ambient hero background | Soft blue/violet light, subtle grid, faint texture | CSS gradients and a small local texture only if needed |
| Event covers | Six related compositions: circuits, geometric build blocks, research diagrams, security pathways, data points, and community connections | Local SVG variants selected deterministically |
| Profile covers | Three quiet network patterns | Local SVG/CSS; no personal image required |
| Avatars | Initials with a stable blue/violet background | Existing data; no invented photos |
| Empty states | Small illustrations for no competitions, no team matches, and no work links | Three simple local SVGs |

Vector artwork stays sharp on high-density displays. If a raster hero layer is justified after reviewing the vector version, create a source around 2400px wide and export responsive WebP/AVIF versions. Keep text in HTML, never baked into an image. Do not enlarge a small source and call it high-definition.

Maintain an asset manifest containing filename, intended use, source/author, and license. Original repository-native SVGs are the default. AI-generated bitmap artwork is optional and is not required to execute this plan. Do not use invented sponsor logos, organizer identities, endorsements, or member photographs.

### Motion specification

| Element | Behavior | Reduced-motion / mobile behavior |
| --- | --- | --- |
| Hero introduction | Nodes and connections appear over 600–900ms; meaningful text remains visible immediately | Static composition when reduced motion is requested |
| Ambient hero | Very slow movement of one or two background layers; 18–24 second cycles | Static on narrow mobile screens; paused when offscreen or the tab is hidden |
| Cards and buttons | 150–200ms color/border transition; optional 2px lift | No lift for reduced motion; identical keyboard affordances |
| Section entrance | Optional 250–350ms fade once | Content visible without JavaScript; no hidden-until-observed dependency |
| Form sections | Short opacity transition when changing steps | Immediate change; focus moves to the section heading |
| Save feedback | Inline pending indicator followed by a clear saved/error message | Same textual feedback, no celebratory particle effects |

Provide a visible **Pause background animation** control if ambient motion continues. Store only that preference locally and honor the operating-system reduced-motion setting before any animation starts. Continuous movement alongside content needs a pause/stop/hide mechanism under the applicable conditions in [W3C's motion guidance](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide).

Use CSS transforms and opacity for motion. A small client component may coordinate pause state, visibility, and intersection. Start without WebGL, video backgrounds, GIFs, cursor trails, or a general animation library. Ambient effects must never intercept pointer events, change layout, or reduce text contrast.

## 5. Page-by-page redesign

### Homepage: `/`

Desktop composition: roughly 55% narrative and 45% artwork. Mobile order: headline, explanation, actions, compact artwork. Keep the primary action visible before a visitor has to scroll through decoration.

Section order:

1. Navigation: competitions, teams, how it works, and account action.
2. Hero: “Your next big idea needs the right people.” Primary action: **Explore competitions**. Secondary: **Build your profile**.
3. Compact product explanation: skills → opportunity → balanced team. Label any sample team illustration clearly.
4. Recently added competitions: three distinct covers with readable dates and attendance.
5. Teams looking for skills: real member counts, open places, and a small set of missing skills.
6. Work and connection explanation: a clearly labelled example profile showing how research and projects help teammates decide.
7. Closing action and useful footer links.

Use live counts only when they add useful context. A small or empty community should look intentionally designed without inflated statistics or fabricated testimonials. If the local dataset contains samples, label that context.

Acceptance: the page explains what TechWeb does and its next action in the first viewport; the network graphic complements the heading; there are clear visual differences between opportunities, teams, and explanations.

### Competition directory: `/events`

- Give each event a stable 16:9 cover and a clear title area. Keep reach and attendance separate.
- Put type and reach near the cover; group start date and attendance in a compact facts row. Keep unverified status visible without crowding the title with five equally weighted badges.
- Retain server-side search, URL filters, pagination, and combined-filter behavior.
- On mobile, show search and an expandable filter panel with an active-filter count, apply action, and reset action. Preserve selections while opening/closing it.
- Show the person who posted an event only if fetched from the existing creator relation, labelled **Posted by**. Do not call that person the organizer without organizer data.
- Empty results explain which filters are active and provide a one-click reset.

Acceptance: a visitor can distinguish a global online event from a local event with an in-person final directly in the list, then open the full schedule.

### Competition detail: `/events/[eventId]`

Use a wide event cover, title, reach, attendance, and unverified label. Below, place challenge details and the round timeline in the main column; use a desktop side panel for team size, venue summary, website, and **Create a team**.

Each round shows its order, name, date or TBA, online/in-person requirement, and venue when relevant. Mixed events include an explicit travel note. A past starting date must not make a future final appear completed.

On mobile, stack facts before the timeline and teams. Any sticky action must respect the safe area, avoid covering focused content, and collapse when unnecessary. Include a working inline action even if the sticky control is absent.

### Profile editor: `/profile`

Desktop: section navigation, editor, and a compact live public preview. Mobile: editor with a **Preview profile** disclosure rather than a permanently visible second column.

Use four named sections: **About you**, **Skills**, **Work & research**, and **Contact & preferences**. Keep all values in one parent draft state so changing sections cannot discard them. The preview should share presentation components with the actual public profile and clearly distinguish unsaved changes from saved data.

- Skills remain typed tags with suggestions, Enter-to-add, duplicate feedback, and accessible removal. Uncommitted text in the skill field must prompt the user to add or discard it before saving.
- Work cards display title, URL/hostname, and edit/remove actions. Keep LinkedIn and GitHub easy to locate.
- Retain an explicit save action. Show “Unsaved changes”, “Saving”, or “Saved” honestly; a live preview is not a save.
- Validation opens the relevant section and focuses its first invalid field. A request failure preserves the draft.
- Do not store the contact-email draft in browser storage. Keep drafts in component memory; warn before losing unsaved edits where the browser/router supports it.
- Make contact visibility clear: signed-in members can see the contact email; visitors can see public work links.

Acceptance: edit a skill in one section, add a research link in another, preview, save, reload, and see the exact saved result without any experience level or skill rating.

### Public profile: `/people/[userId]`

Use a cover, initials/avatar, name, location, concise bio, skills, and a work grid. Put **Contact by email** near the identity section for signed-in viewers; guests get a sign-in action that returns to this profile.

Work previews initially use only the saved title, destination hostname, and a tasteful link-type icon. They must not invent project descriptions, screenshots, publication metrics, or verified badges. Automatic website metadata fetching is deferred: it would need its own security, caching, and failure handling.

Acceptance: users can quickly understand what the person contributes, inspect their evidence, and find where to contact them. Guest HTML and serialized page data contain no contact email.

### Teams: `/teams` and `/teams/[teamId]`

Use member initials, event artwork accents, actual open places, and required skills to give teams an identity. On the detail page, prioritize members, missing skills, and useful candidates. Reduce repeated card borders around small facts.

Recommendations should explain the actual missing skills a person brings. Show **View work & connect** as the main next step. Keep matching transparent; do not replace counts with an invented suitability percentage or imply availability was verified.

### Sign-in: `/auth`

Create a compact, visually integrated account panel alongside a smaller static version of the hero artwork. Give Google sign-in clear placement when configured and keep email/password access obvious. Maintain password visibility, error messages, and the requested return destination. On mobile, put the form before decorative content.

Google's unavailable state remains honest until credentials are configured. Do not redesign the interface to suggest that activation has already happened.

### Competition creation: `/create`

Use four steps: **Basics & reach → Rounds & attendance → Team requirements → Review & publish**. Store the full draft above the steps. Validate the current step on Next and the entire payload before publishing; show any server error in its relevant section.

The review screen previews the event cover, reach, derived attendance, round schedule, required skills, and unverified status. Keep one submission path to the existing event API. Creating a team at `/create?kind=team` stays a compact separate form.

Acceptance: go forward and backward, edit an earlier round, remove a later one, and publish with the correct derived format and no lost fields.

## 6. Component and file plan

Proposed new files are implementation destinations, not existing components.

| Area | Existing files | Proposed extraction |
| --- | --- | --- |
| Tokens, layout, navigation | `src/app/globals.css`, `src/app/layout.tsx`, `src/components/navigation.tsx` | Consolidated tokens and reusable surface/button styles |
| Hero and background | `src/app/page.tsx` | `src/components/hero-network.tsx`, `src/components/ambient-background.tsx`, scoped motion styles |
| Event artwork/cards | `src/components/discovery.tsx` | `src/components/event-art.tsx`, local assets under `public/art/` |
| Profile editor | `src/components/forms.tsx`, `src/components/profile-fields.tsx`, `src/app/profile/page.tsx` | `src/components/profile-editor.tsx`, `src/components/profile-preview.tsx` |
| Public identity and work | `src/app/people/[userId]/page.tsx` | Shared `profile-header.tsx`, `work-link-card.tsx`, `avatar.tsx` |
| Round schedule | `src/app/events/[eventId]/page.tsx` | `src/components/round-timeline.tsx` |
| Creation flow | `src/components/forms.tsx`, `src/app/create/page.tsx` | `src/components/competition-form.tsx` |
| Account/team forms | `src/components/forms.tsx` | Extract only when it improves clarity; retain one canonical implementation |

Keep server-rendered page content and database queries on the server. Use small client boundaries for form drafts, mobile filters, preview controls, and optional motion. Do not turn the whole site into a client component just to animate the hero.

Keep current API contracts intact where possible. Shared presentation components must accept only the data each viewer can see. A private editing preview must never cause contact data to be passed into a guest-facing component tree.

## 7. Implementation sequence and completion gates

| Phase | Work | Completion gate | Dependency |
| --- | --- | --- | --- |
| 0 — Baseline | Capture current desktop/mobile screens, list all existing states, record production-build size and load measurements | Baseline evidence saved; current APIs still pass | None |
| 1 — Design foundation | Tokens, typography, buttons, fields, surfaces, avatar, stable artwork variants | Static homepage/card/profile examples are coherent at 390px and 1440px | Phase 0 |
| 2 — Homepage and motion | New hero, section hierarchy, artwork, pause control and static fallbacks | Clear first viewport; controls and content work with motion disabled | Phase 1 |
| 3 — Discovery and event detail | Covers, metadata hierarchy, mobile filters, timeline, team action panel | Combined filters, pagination, mixed rounds, and empty states verified | Phase 1 |
| 4 — Profiles and teams | Sectioned editor, live preview, work cards, contact panel, team presentation | Save/reload, guest privacy, recommendations, and contact actions verified | Phase 1 |
| 5 — Account and creation flows | Auth polish, competition steps, review screen, preserved drafts | Sign-in return paths and multi-step submission verified | Phases 3–4 |
| 6 — Final quality pass | Accessibility, responsive checks, asset budgets, regressions, documentation | Checks below pass; remaining external setup clearly recorded | Phases 2–5 |

Execute these phases sequentially in the existing app. Each gate is an implementation check, not an automatic request for user approval. Capture screenshots after meaningful changes. Do not create a second starter application or overwrite unrelated uncommitted work.

The first visible milestone is Phase 2: the homepage, background, typography, and cards should already communicate the new identity before the form restructuring begins.

## 8. Performance, accessibility, and verification

### Proposed engineering budgets

- Added decorative assets on the initial viewport: target at most 300KB transferred on mobile and 600KB on desktop; measure compressed transfer size, not source dimensions.
- Added client JavaScript for decorative motion: target at most 25KB compressed over the baseline. Prefer no new animation runtime.
- Reserve image dimensions; deliver appropriate image sizes; lazy-load below-fold raster assets. Use the installed Next.js image guidance when implementing raster images.
- No automatic video download. Stop decorative work outside the viewport and in hidden tabs.
- Aim for LCP ≤ 2.5s, INP ≤ 200ms, and CLS ≤ 0.1 at the 75th percentile of real visits once traffic exists. These are targets, not current measured results. Before launch, record lab loading/layout measurements and interaction traces; a Lighthouse load test does not establish field INP. [Web Vitals guidance](https://web.dev/articles/vitals)

### Required checks

- Check widths 360, 390, 768, 1024, and 1440px; long names, URLs, titles, and skills; 200% zoom; and empty data. No horizontal overflow or clipped actions.
- Test keyboard-only navigation, visible focus, mobile menu Escape behavior, dialog/disclosure focus, and form validation focus.
- Check text and control contrast on the actual rendered surfaces. Important states must include text, not color alone.
- With reduced motion enabled, all decorative loops and movement are absent. The page remains complete with JavaScript disabled; interactive forms may require JavaScript but must not disappear behind an entrance effect.
- Check image failure, slow requests, failed saves, unauthenticated access, empty searches, full teams, missing profile links, and unconfigured Google login.
- Keep new step navigation accessible and announce save/publish feedback without announcing every live-preview keystroke.

### Verification commands and journeys

Run `npm run lint` and `npm run build`. With a local development server at port 3100, run `node scripts/smoke.mjs`; run `npm run test:security` after touching account or contact-data boundaries. Use disposable local test records.

Extend browser checks for: creating/removing custom skills; switching form sections without losing data; previewing and saving work links; signing in from a public profile and returning to it; creating an online qualifier plus in-person final; changing round formats; filtering by reach and attendance; joining a team and opening member contact information.

Do not claim visual QA from a passing build. Record screenshots and actual browser outcomes separately. Neon and real Google OAuth checks remain blocked until their credentials are configured; this does not block the local visual redesign.

## 9. Deferred enhancements

After the first release, consider uploaded profile photos, user-selected event covers, and work cards with user-written summaries. Each requires its own data/storage design, limits, fallbacks, and migration. Consider automatic link previews only after defining safe fetching and caching.

Chat, paid animation services, automatic event validation, skill verification, and AI matching are not prerequisites for this design. The initial direction uses the current stack and local assets and introduces no required paid visual service.

## 10. Execution checklist

- [x] Audit the current source, routes, design rules, and available assets.
- [x] Specify visual direction, page layouts, motion, component changes, and quality gates.
- [ ] Capture and record the implementation baseline.
- [ ] Build the shared design foundation and custom artwork.
- [ ] Deliver the homepage and accessible animated background.
- [ ] Redesign competition discovery and round details.
- [ ] Redesign profile editing, public profiles, and team pages.
- [ ] Polish authentication and build competition creation steps.
- [ ] Complete browser, accessibility, performance, and regression checks.
- [ ] Update `DESIGN.md` to describe the final implemented system.

`PROJECT_PLAN.md` is an older prototype reference with outdated stack and profile assumptions. Use this plan for the redesign, `DESIGN.md` for current design constraints, and the live source/README for implemented behavior.
