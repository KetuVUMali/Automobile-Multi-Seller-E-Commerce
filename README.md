# OurtAuto — Automobile Multi-Seller E-Commerce SaaS Platform

An original, production-quality **frontend-only** admin dashboard system for an
automobile multi-seller marketplace — vehicles, parts, sellers, customers,
CRM, service, inventory, finance and marketing — built with plain HTML, CSS,
JavaScript, Bootstrap 5, AOS and Chart.js. No frameworks, no backend, no
real authentication.

## ⚠️ Scope: this is Phase 1, not the full 150+ page spec

The original spec called for 150+ pages across every conceivable module
(deep seller sub-pages, dozens of report types, a full SaaS billing system,
etc.) — realistically a multi-week build. What's shipped here is a genuine,
fully-working **Phase 1**: **48 real pages**, each with functioning
interactions, realistic Indian-automotive demo data, and a complete design
system — not a visual mockup. Every navigation link goes to a real page;
nothing here is a placeholder or dead link.

### What's built (48 pages)

| Module | Pages |
|---|---|
| **Dashboards** | Master Overview, Seller, Dealer, Inventory, Finance, Analytics |
| **Vehicles** | Listing (grid+list), Details, Add Vehicle (8-step wizard), Inspection, Valuation calculator, Approval queue |
| **Products** | Listing, Add Product (with vehicle-compatibility UI), Details, Categories & Brands |
| **Sellers** | Listing, Seller Profile (KYC/Performance/Branches/Subscription tabs), Onboarding (10-step wizard) |
| **Customers** | Listing, Customer 360 Profile |
| **Orders** | Listing, Order Details (timeline + invoice) |
| **CRM** | Lead Pipeline (drag-drop Kanban), Enquiries, Test Drives |
| **Service** | Bookings, Calendar (month view) |
| **Inventory** | Stock overview across warehouses |
| **Finance** | Payments/Transactions, Commissions & Payouts |
| **Marketing** | Campaigns, Coupons |
| **Communication** | Chat, Notifications |
| **Administration** | Users, Roles & Permissions (matrix) |
| **Settings** | Profile, Settings, Pricing/Subscription plans, Help Center/FAQ |
| **Auth & System** | Login, Register, Forgot Password, Lock Screen, 404, 500, Maintenance |

### What's *not* built yet (Phase 2 candidates)

The full spec's remaining ~100 pages are mostly **deeper sub-pages of
modules already represented above** — the platform's structure and design
system already support adding them. Candidates, roughly in priority order:
- Seller sub-pages: dedicated KYC/Documents/Branches/Commission/Payout
  pages (currently combined as tabs on Seller Profile)
- Deep reports module (per-category report builder with export)
- Warehouses/Suppliers/Purchase Orders (inventory sub-pages)
- Email/SMS/push campaign builders (currently one combined Campaigns page)
- Support ticket system, Activity/Audit log
- Vehicle comparison tool, wishlist pages
- Product sub-pages: Attributes, Variants, Bulk Upload, Reviews

## Tech stack

HTML5, CSS3, vanilla JavaScript (ES6), Bootstrap 5.3, Bootstrap Icons, AOS,
Chart.js v4, Flatpickr, SweetAlert2. All vendor libraries are self-hosted
under `assets/` — no CDN dependency, no build step. Open any HTML file
directly in a browser.

## Folder structure

```
automobile-saas/
├── index.html                  Master dashboard
├── 404.html, 500.html, maintenance.html
├── pages/
│   ├── vehicles/  products/  sellers/  customers/  orders/
│   ├── crm/  service/  inventory/  finance/  marketing/
│   ├── communication/  users/  system/  auth/
│   └── *-dashboard.html        (5 more dashboards)
└── assets/
    ├── css/   theme.css (design system) · responsive.css · fonts.css · vendor CSS
    ├── js/    theme.js · sidebar.js · charts.js · tables.js · filters.js ·
    │          search.js · notifications.js · components.js · main.js · vendor JS
    └── images/  original SVG illustrations (vehicles, products, avatars, sellers, banners)
```

## Multi-theme system

Open the gear icon in the header (or any page's Settings) to change:
- **Mode**: Light / Dark / System (follows OS preference live)
- **Primary color**: 7 presets — Blue, Indigo, Purple, Teal, Green, Orange, Red
- **Sidebar style**: Dark / Light / Gradient
- **Layout width**: Fluid / Boxed
- **Sidebar**: collapse/expand (persists, with a hover flyout when collapsed)

All preferences save to `localStorage` and apply instantly except the color
preset, which triggers a reload — Chart.js bakes its palette into the
canvas at creation time, so a reload is what makes every chart correctly
repaint with the new accent color everywhere at once.

### The dark-mode approach (read this before adding new pages/components)

Bootstrap 5.3 ships its own complete CSS-variable theming system
(`--bs-body-color`, `--bs-table-color`, `--bs-card-bg`, etc.) that most
Bootstrap components read from directly. Its dark-mode variant lives behind
Bootstrap's own `data-bs-theme` attribute, which this project doesn't use.
**The fix, applied from the start in `theme.css` §12**, is a one-time bridge
that points every relevant `--bs-*` variable at this project's own
`--ourt-*` tokens:

```css
:root{
  --bs-body-color: var(--ourt-text);
  --bs-table-color: var(--ourt-text);
  --bs-card-bg: var(--ourt-card-bg);
  /* …and the rest — see theme.css */
}
```

Because CSS custom properties resolve lazily at the point of use, this
single block means **every** Bootstrap component — `.table`, `.card`,
`.btn`, `.form-control`, `.dropdown-menu`, `.list-group`, `.popover`,
`.accordion`, `.pagination`, `.nav-tabs`, `.modal` — automatically stays
theme-correct in both light and dark mode, including components not yet
explicitly re-styled. If you add a new Bootstrap component to a page and
it looks wrong in dark mode, check this bridge first before writing a
component-specific override.

## JavaScript architecture

Split into focused modules (loaded on every page, in this order):

- **theme.js** — mode/preset/sidebar-style/layout, `localStorage`, exposes `window.OurtStore`
- **sidebar.js** — collapse/expand, mobile off-canvas, the collapsed-state hover flyout
- **charts.js** — `window.OurtCharts` helper wrapping Chart.js; safe theme re-application (see note below)
- **tables.js** — front-end pagination + column sort
- **filters.js** — filter-bar apply/reset, date-range presets
- **search.js** — global Ctrl/Cmd+K search modal (reads `search-data.js`, a local dummy index)
- **notifications.js** — mark-all-read
- **components.js** — row view/edit/delete, status dropdowns, Kanban drag-drop, multi-step
  wizard navigation, EMI calculator, vehicle valuation calculator, star rating, file
  upload preview, and more
- **main.js** — orchestrator: AOS init (with a visibility safety net), tooltips, animated
  KPI counters, the `window.OurtToast` helper, back-to-top, form validation

**Chart.js theming gotcha, avoided from the start**: never reassign a
Chart.js v4 option object onto itself (e.g. `scale.ticks = scale.ticks ||
{}`) when re-theming on dark/light toggle — v4's scale/tick options are
Proxy-backed resolvers, and self-reassignment triggers infinite internal
recursion. `charts.js` only ever mutates a property directly (e.g.
`scale.ticks.color = …`), which is both correct and safe.

## Demo data

All data (vehicles, sellers, customers, orders, KPIs) is realistic but
fictional, using Indian automotive brands (Honda, Hyundai, Tata, Maruti
Suzuki, Mahindra, Kia, Royal Enfield, TVS…), Indian cities, and ₹ currency
formatted via `toLocaleString("en-IN")`. Every "Add", "Edit", "Delete",
"Approve" and filter action produces real, visible frontend feedback
(toast, modal, table update) — there are no dead buttons.

## Testing performed

- **Link & asset validation**: every `href`/`src` across all 48 pages
  resolves to a real file (0 broken links, 0 missing assets)
- **Duplicate ID check**: 0 duplicate element IDs per page
- **JS error sweep**: all 48 pages load via jsdom + real Chart.js
  rendering (node-canvas) with 0 runtime errors
- **Interaction tests**: dark/light theme toggle (double-flip) across
  every chart-bearing page, sidebar collapse + hover flyout, EMI
  calculator, vehicle valuation calculator, multi-step wizard navigation,
  Kanban board, status-change dropdowns, grid/list view toggle, table
  search/filtering — all verified with 0 errors
- **Dark-mode-specific check**: confirmed the Bootstrap variable bridge
  resolves correctly on both `:root` and after the theme toggle fires

## Extending this for Phase 2

1. Add the new page's key to `gen/data.py` (`PAGE_PATHS`, `TITLES`,
   `BREADCRUMBS`, and a `NAV` entry if it needs a sidebar link).
2. Write a `page_xxx(out)` function in a `gen/content_*.py` file returning
   `(content_html, page_script, needs_charts, needs_flatpickr, needs_sweetalert)`.
3. Register it in `STANDARD_PAGES` (or `STANDALONE_PAGES` for auth/error-style
   pages with no sidebar) in `gen/build.py`, then run `python3 -m gen.build`.
4. Reuse existing CSS classes (`ourt-kpi-card`, `ourt-car-card`,
   `ourt-kanban-*`, `ourt-calendar`, `ourt-step-indicator`, etc.) and JS
   hooks (`data-view-row`, `data-edit-row`, `data-delete-row`,
   `data-set-status`, `data-filter-apply`) already wired up in
   `components.js`/`filters.js` — most new admin pages need zero new JS.

## Known limitations (by design — this is a frontend demo)

- No real backend, authentication, or data persistence — everything
  resets on page reload.
- Role-switcher and workspace-switcher in the header are visual-only demos.
- EMI and vehicle-valuation calculators use simple illustrative formulas,
  clearly labeled as demo calculations — swap in a real pricing engine
  for production use.
- Calendar month navigation and a few deep-link actions show a toast
  rather than real navigation, since there's no backend data to page through.
