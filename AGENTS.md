# Savur Admin — agent rules

Prototype admin console for Savur (Savvi platform). Demo data, in-memory only; nothing persists on refresh.

## Stack (do not change)
React 19 + Vite + TypeScript. Extra packages: `react-router-dom` (HashRouter) and `lucide-react` only. No UI kits, no Tailwind, no state libraries.
Fonts self-hosted in `src/fonts` (DM Sans, DM Serif Display, declared in `src/styles.css`). All styles live in `src/styles.css`. Images go in `public/images`.

## Screens and routes (no login screen)
- `#/dashboard` — KPI tiles, Accounts Needing Attention, Recent Activity
- `#/attention` — full Accounts Needing Attention list
- `#/users`, `#/users/:id` — Profile, Access, Activity, Account tabs
- `#/bd`, `#/np`, `#/up` — directories (Business Donors, Nonprofit Organizations, Upcycle Partners)
- `#/bd/:id`, `#/np/:id`, `#/up/:id` — record pages; tab via `?tab=`
- `#/plans` — Plan Management (plans per partner type: edit, pause/activate, add)
- `#/audit` — search, actor filter, Export CSV
- `#/settings` — Profile & Preferences, Notifications, Team Members

Sidebar: Dashboard · Directory (Users, Business Donors, Nonprofit Organizations, Upcycle Partners) · Administration (Plan Management, Audit & Activity, Settings).

## Rules
- Do not add Partner Invites, Sponsor Impact, Access & Verification, Data Governance or Integrations anywhere (sidebar, Settings, dashboard).
- Records open on their own full pages, never side panels. Confirmations and forms use the shared `Dialog`.
- Every action goes through `src/store.tsx` and is written to the audit log. Every card, button and dialog must work.
- Account status (Active, Pending activation, Paused, Suspended) is derived data; verification (Approved, Needs Review, Declined…) and access are separate pills. Don't merge them.
- Suspend/Reactivate is not offered for the signed-in user (USR-0001).
- Brand: Navy #01284D, Green #29E050, Blue #00BDFF, Amber #F59E0B, Red #EF4444. DM Serif Display for titles and KPI numbers, DM Sans for UI.
- Layout works at 1440 and 390 wide, with no horizontal page scroll.
- Data: `src/data/savur.json` (22 organizations: 5 Business Donors, 11 Nonprofits, 6 Upcycle; 12 users). Sponsor organizations are intentionally excluded.
- Keep copy, layout and styles as they are unless asked.

## Commands
`npm install` · `npm run dev` · `npm run build` · `npm run preview`
