# techweb design guide

The detailed visual redesign roadmap is in [UI_UX_REDESIGN_PLAN.md](UI_UX_REDESIGN_PLAN.md). It defines proposed artwork, animation, page layouts, form improvements, and acceptance checks. Its unchecked phases are future implementation work; this guide describes the current app until those changes land.

Open this project folder in Cursor using File > Open Folder. In its terminal, run `npm run dev -- --port 3100`, then keep http://localhost:3100 open beside the editor. Saved edits update the preview automatically.

## Where to edit

- `src/app/page.tsx`: homepage sections, copy, and live database queries.
- `src/app/globals.css`: shared colors and styles; homepage styles start at the techweb identity comment.
- `src/app/layout.tsx`: logo, navigation, metadata, and footer.
- `src/components/forms.tsx`: reusable profile, account, event, and team forms.

## Identity

| Color | Hex | Purpose |
| --- | --- | --- |
| Deep navy | #080F20 | Page background |
| Electric blue | #397BFF | Primary actions, links, connections |
| Violet | #9565F5 | Brand accents and team identity |
| Green | #34D399 | Verified skills only |
| Amber | #F5BB54 | Competitions and deadlines |
| Red | #F87171 | Errors and urgent deadlines only |

Skills are currently self-reported. Do not add green verification badges to real profiles until verification exists. Dates in the database are event dates, not registration deadlines. Label past events honestly. Use real counts, and explicitly label illustrative content.

## Working in Cursor

Select a homepage section or CSS block and ask Cursor for a focused change. Example prompt:

“Refine the techweb competition cards in src/app/page.tsx and src/app/globals.css. Follow DESIGN.md, preserve the database queries and working links, and keep the layout responsive at 390px and 1440px. Use amber for competitions, blue/violet for identity, and green only for verified skills.”

Keep typography, spacing, and colors in CSS. Change wording and section order in page.tsx. Avoid putting database credentials or implementation notes in the public interface.

After edits, run `npm run lint` and `npm run build`. Inspect both a narrow mobile window and a desktop window. Check keyboard focus and all navigation links.

## Interaction and performance

- `src/components/navigation.tsx`: active links and the mobile menu, with Escape to close.
- `src/components/discovery.tsx`: shared competition cards, date formatting, empty states, and pagination.
- Event and team searches use URL query parameters. Lists fetch 12 results per page; team previews fetch at most four member names.
- Forms offer typed custom skills with suggestions and removable tags, password visibility, pending states, and accessible feedback. Creating a team resumes after sign-in.
- System fonts remove the external font request. Animations use CSS transforms and opacity without an animation dependency. Decorative motion stops after its entrance, and reduced-motion preferences disable animation and smooth scrolling.
- Preserve the `prefers-reduced-motion` rule when adjusting animations. Main content must remain visible when JavaScript or scroll animations are unavailable.

Run `npm run lint`, `npm run build`, and the smoke test in README.md after functional edits. Check 390px and desktop layouts, keyboard navigation, custom skill additions and removal, empty searches, and pagination.

## Profiles and competition rounds

- Do not restore experience selectors, skill checkboxes, numeric skill ratings, or proficiency-based matching. Skills are typed contributions; work links provide context and evidence.
- `src/components/profile-fields.tsx` owns skill tags, repeatable work links, and round editors. Keep each repeatable input labelled, retain keyboard Enter to add skills, and show explicit remove actions.
- Public builder profiles live at `/people/[userId]`. Work links are public; contact email is available only after sign-in. Make this sharing rule clear in the edit form and account creation flow.
- Reach (global/local) and attendance (online/in person/mixed) are separate concepts. In-person rounds must show a venue. Show all rounds in order on the event detail page.
- Event listings are unverified. Use amber for this status, never a verification checkmark. A start date in the past does not mean later rounds have finished.
