# techweb design guide

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
