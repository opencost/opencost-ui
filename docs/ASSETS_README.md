# OpenCost UI — Assets Page Implementation & 12-Week Revamp Roadmap

**Author:** Tushar Verma ([vtushar06](https://github.com/vtushar06))
**PR:** [opencost/opencost-ui#XXX](https://github.com/opencost/opencost-ui/pull/XXX) <!-- TODO: replace XXX -->
**Challenge Issue:** [#28 — Support Assets in the UI](https://github.com/opencost/opencost-ui/issues/28)
**Mentorship Issue:** [#155 — OpenCost UI Revamp](https://github.com/opencost/opencost/issues/155)

---

## What I Built

A complete storage Assets dashboard for the OpenCost UI using the Carbon Design System. The `/assets` route now shows storage cost data with KPI cards, multiple chart types, a filterable data table, an insights panel, and a detail side panel.

**Total implementation: 5,164 lines across 26 files** (9 components, 1 page, 1 service, 2 utilities, 4 CSS files, 10 test files).

<!-- TODO: Add screenshot — full dashboard view -->
<!-- Save to: docs/screenshots/dashboard-overview.png -->
![Dashboard Overview](./screenshots/dashboard-overview.png)

---

## File Breakdown

### Pages

| File | Lines | What it does |
|------|-------|-------------|
| `src/pages/Assets.js` | 351 | Main dashboard page — fetches data from API or mock, transforms nested API response into flat rows, manages filters/state, renders all child components |

### Components

| File | Lines | What it does |
|------|-------|-------------|
| `src/components/assets/KPICards.js` | 79 | 4 summary cards — total cost, wasted cost, efficiency score, asset count. Uses Carbon `Tile`. Wasted cost calculated from `breakdown.idle * totalCost` per asset. |
| `src/components/assets/CostDistributionChart.js` | 264 | Cost breakdown by cluster or type. Supports 3 chart variants (Stacked, Grouped, Combo) via Carbon `ContentSwitcher`. Uses `@carbon/charts-react` `StackedBarChart`, `GroupedBarChart`, `ComboChart`. |
| `src/components/assets/CostTrendChart.js` | 182 | Cost trends over time. Area and line chart variants. Generates time-series data points from asset time windows. |
| `src/components/assets/CostUtilizationChart.js` | 215 | Utilization analysis. 3 variants: Scatter (cost vs utilization), Donut (distribution), Bar (ranked). Scatter shows expensive+underutilized assets in the top-left quadrant. |
| `src/components/assets/AssetTable.js` | 392 | Carbon `DataTable` with expandable rows (shows breakdown: idle%, system%, user%, size), batch select for CSV export, pagination, visual progress bars in usage column, color-coded status badges. |
| `src/components/assets/FilterPanel.js` | 188 | Multi-select filters: status (OK/Review/Waste), asset type (Node Disk/PVC), storage class, cluster. Plus text search across name, namespace, and cluster. |
| `src/components/assets/InsightsPanel.js` | 82 | Generates cost optimization recommendations from asset data — identifies high-idle assets, suggests right-sizing, highlights waste. |
| `src/components/assets/AssetDetailPanel.js` | 244 | Side panel that opens when clicking an asset row. Shows full details: cost, size, breakdown percentages, cluster, namespace, storage class, status. Uses Carbon `Accordion` for sections. |
| `src/components/assets/AssetsHeader.js` | 96 | Controls bar: time window selector (7d/14d/30d/60d/90d), aggregation dropdown (type/cluster/storageclass/providerID), refresh button. |

### Services

| File | Lines | What it does |
|------|-------|-------------|
| `src/services/assets.js` | 495 | API client (`fetchAssets` hits `/assets?window=...&aggregate=...`) with mock data fallback (`getMockData`). Mock covers 3 clusters, 10 nodes, 11 PVCs across realistic scenarios. Mock data scales costs based on selected time window. Supports reorganization by aggregate parameter. |

### Utilities

| File | Lines | What it does |
|------|-------|-------------|
| `src/utils/assetCalculations.js` | 164 | `bytesToGB`, `getIdlePercentage`, `getTotalCost`, `getTotalWastedCost`, `calculateEfficiencyScore`, `getAssetStatus` (OK/Review/Waste classification), `calculateUsage`, `formatCurrency`, `buildColorScale`. Exports idle thresholds as constants (`IDLE_THRESHOLD_REVIEW=40`, `IDLE_THRESHOLD_WASTE=80`). |
| `src/utils/assetInsights.js` | 99 | Generates actionable insights from asset data — flags assets with >80% idle, calculates potential savings, recommends storage class changes. |

### Styles

| File | Lines | What it does |
|------|-------|-------------|
| `src/styles/assets/dashboard.css` | 578 | Main layout: KPI grid, chart sections, table section, filter section, error/empty states, skeleton loading. Responsive grid with `auto-fit`. |
| `src/styles/assets/charts-layout.css` | 324 | Chart tile layout, stats footer beneath charts, ContentSwitcher positioning, chart container sizing. |
| `src/styles/assets/colors.css` | 76 | CSS custom properties using `--cds-*` tokens. Overrides for all 4 Carbon themes: `white`, `g10`, `g90`, `g100`. Semantic colors for status (OK/Review/Waste). |
| `src/styles/assets/detail-panel.css` | 205 | Side panel positioning, accordion styling, property grid, breakdown bars, close button. |

### Tests

| File | Lines | Tests |
|------|-------|-------|
| `src/components/assets/__tests__/KPICards.test.js` | 65 | Renders all 4 cards, displays correct values, handles empty data |
| `src/components/assets/__tests__/AssetTable.test.js` | 108 | Renders rows, expandable rows, status badges, pagination, empty state |
| `src/components/assets/__tests__/CostDistributionChart.test.js` | 66 | Renders chart, ContentSwitcher toggles, handles empty data |
| `src/components/assets/__tests__/CostTrendChart.test.js` | 187 | Time series generation, area/line variants, empty data handling |
| `src/components/assets/__tests__/CostUtilizationChart.test.js` | 47 | Scatter/Donut/Bar variants, empty data |
| `src/components/assets/__tests__/FilterPanel.test.js` | 96 | Filter selection, search, mock data toggle, clear filters |
| `src/components/assets/__tests__/AssetDetailPanel.test.js` | 239 | Panel open/close, asset details display, accordion sections |
| `src/components/assets/__tests__/AssetsHeader.test.js` | 101 | Time window change, aggregate change, refresh callback |
| `src/utils/__tests__/assetCalculations.test.js` | 126 | All calculation functions, edge cases (null, zero, missing fields) |
| `src/utils/__tests__/assetInsights.test.js` | 95 | Insight generation, threshold detection, empty input handling |
| **Total** | **1,130** | **50 tests, all passing** |

---

## Architecture

### Data Flow

```
OpenCost Backend
GET /assets?window=7d&aggregate=type&accumulate=true
│
▼
src/services/assets.js
├── fetchAssets()  →  Axios GET to /assets endpoint
└── getMockData()  →  Returns 3 clusters × (nodes + PVCs), scaled by time window
│
▼
src/pages/Assets.js
├── transformAssetData()  →  Flattens nested API response:
│     { cluster: { nodes: {...}, pvc: {...} } }
│     → flat array: [{ id, name, cluster, assetType, breakdown, ... }]
│
├── applyFilters()  →  Filters by status, type, storageClass, cluster, search
│
▼
┌─────────────────────────────────────────────────────┐
│  KPICards          (aggregated totals from filtered) │
│  InsightsPanel     (recommendations from filtered)   │
│  CostTrendChart    (time series from filtered)       │
│  CostUtilizationChart (scatter/donut/bar)            │
│  CostDistributionChart (stacked/grouped/combo)       │
│  FilterPanel       (controls → updates filters)      │
│  AssetTable        (sortable, expandable, exportable)│
│  AssetDetailPanel  (side panel on row click)         │
└─────────────────────────────────────────────────────┘
```

### API Response Structure

The Assets API (`/assets`) returns data grouped by cluster:

```json
{
  "cluster-name": {
    "nodes": {
      "node-name": {
        "type": "Disk",
        "category": "Storage",
        "storageClass": "__local__",
        "bytes": 536870912000,
        "totalCost": 12.75,
        "breakdown": { "idle": 0.55, "system": 0.45, "user": 0, "other": 0 },
        "window": { "start": "...", "end": "..." }
      }
    },
    "pvc": {
      "pvc-name": {
        "type": "Disk",
        "category": "Storage",
        "storageClass": "fast-ssd",
        "claimName": "mysql-data",
        "claimNamespace": "database",
        "bytes": 107374182400,
        "totalCost": 24.55,
        "breakdown": { "idle": 0.3, "system": 0, "user": 0.7, "other": 0 }
      }
    }
  }
}
```

This nested structure is flattened by `transformAssetData()` in `Assets.js` into a flat array for filtering and display.

### Waste Classification

Based on `breakdown.idle` per asset:

| Idle % | Status | Color | Tag |
|--------|--------|-------|-----|
| < 40% | OK | Green | `type="green"` |
| 40–80% | Review | Magenta | `type="magenta"` |
| > 80% | Waste | Red | `type="red"` |

These thresholds are defined as constants in `assetCalculations.js` (`IDLE_THRESHOLD_REVIEW=40`, `IDLE_THRESHOLD_WASTE=80`) and used consistently across KPI cards, filters, table badges, and chart colors.

### Carbon Components Used

| Carbon Component | Where Used |
|-----------------|------------|
| [`DataTable`](https://carbondesignsystem.com/components/data-table/usage/) | AssetTable — expandable rows, batch select, sortable headers, pagination |
| [`Tile`](https://carbondesignsystem.com/components/tile/usage/) | KPICards — summary metric cards |
| [`ContentSwitcher`](https://carbondesignsystem.com/components/content-switcher/usage/) | CostDistributionChart, CostUtilizationChart — toggle between chart variants |
| [`Tag`](https://carbondesignsystem.com/components/tag/usage/) | AssetTable — status badges, asset type badges, storage class badges |
| [`InlineNotification`](https://carbondesignsystem.com/components/notification/usage/) | Assets.js — error and empty states |
| [`Accordion`](https://carbondesignsystem.com/components/accordion/usage/) | AssetDetailPanel — collapsible detail sections |
| [`Dropdown`](https://carbondesignsystem.com/components/dropdown/usage/) | AssetsHeader — time window and aggregation selectors |
| [`Button`](https://carbondesignsystem.com/components/button/usage/) | AssetsHeader (refresh), FilterPanel (clear), error states (retry) |
| [`Pagination`](https://carbondesignsystem.com/components/pagination/usage/) | AssetTable — page navigation |
| `SkeletonPlaceholder`, `DataTableSkeleton`, `SkeletonText` | Assets.js — loading states |
| [`@carbon/charts-react`](https://charts.carbondesignsystem.com/) | All chart components — StackedBarChart, GroupedBarChart, ComboChart, ScatterChart, DonutChart, AreaChart, LineChart |
| [`@carbon/icons-react`](https://carbondesignsystem.com/elements/icons/library/) | AssetsHeader (Renew, Filter), AssetTable (Export) |

### CSS Architecture

```
src/styles/assets/
├── colors.css          →  --cds-* token definitions for 4 themes (white, g10, g90, g100)
├── dashboard.css       →  Page layout grid, section spacing, responsive breakpoints
├── charts-layout.css   →  Chart tile grid, stats footer, ContentSwitcher positioning
└── detail-panel.css    →  Side panel, accordion overrides, property grid
```

All colors use CSS custom properties. No hardcoded hex values in components. Theme switching works by changing Carbon's `Theme` wrapper — all `--cds-*` variables cascade automatically.

---

## Current State of the Full UI (What Needs Revamping)

Before planning the 12-week roadmap, here's what I found going through the entire codebase:

| Page | Lines | UI Library | Tests | CSS |
|------|-------|-----------|-------|-----|
| Allocations | 491 + 9,269 (`allocationReport.js`) | MUI | 0 | Inline styles |
| CloudCosts | 322 | MUI | 0 | Inline styles |
| ExternalCosts | 317 | MUI | 0 | Inline styles |
| **Assets (mine)** | **351** | **Carbon** | **50** | **Dedicated CSS files** |

**Problems found:**

1. **`allocationReport.js` is 9,269 lines.** One file handles table rendering, sorting, filtering, drilldown (namespace → controller → pod → container), formatting, and data transformation. This needs to be broken into multiple components.

2. **CloudCosts and ExternalCosts are 70%+ duplicate code.** Both have the same drilldown pattern, the same table sorting functions (`descendingComparator`, `stableSort`, `getComparator`), the same range chart logic (~250 lines each), and similar detail modals. Zero code is shared between them.

3. **Only 1 shared component in the entire codebase** — `StatCard.js` (37 lines). Everything else is page-specific. Table sorting, chart setup, filter logic, modals — all reimplemented per page.

4. **Two UI libraries coexist.** Allocations/CloudCosts/ExternalCosts use MUI. Assets uses Carbon. Navigation (`SidebarNav.js`) uses MUI Drawer. Theme toggle uses Carbon. The mix creates inconsistent look and theme behavior.

5. **No CSS architecture outside Assets.** All other pages use inline styles (`style={{ padding: 24, flexGrow: 1 }}`). No design tokens, no theme variables, no dark mode support.

6. **Allocations has 11 `useState` calls** chained with `useEffect`. No state grouping, no reducers, no custom hooks.

---

## Proposed 12-Week Roadmap

### Phase 1: Foundation — Shared Component Library (Weeks 1–3)

**Goal:** Build the reusable pieces that all pages will use. Without this, every page revamp means rebuilding the same patterns from scratch.

**Week 1 — Shared table and chart wrappers:**

| Task | Details |
|------|---------|
| Build `SharedDataTable` | Wraps Carbon [DataTable](https://carbondesignsystem.com/components/data-table/usage/). Accepts `rows`, `headers`, `onSort`, `onPaginate`, `expandable`, `selectable` props. Handles the `getRowProps` key destructuring pattern internally. Replaces MUI Table usage across all pages. |
| Build `SharedChart` | Wraps [@carbon/charts-react](https://charts.carbondesignsystem.com/). Provides consistent tooltip formatting, legend styling, responsive sizing, and theme-aware color palettes. Accepts a `variant` prop for switching chart types. |
| Write tests | Unit tests for both components — rendering, prop variations, empty data, theme switching. |

**Week 2 — Shared page shell and filters:**

| Task | Details |
|------|---------|
| Build `SharedPageHeader` | Carbon [UIShell Header](https://carbondesignsystem.com/components/UI-shell-header/usage/) with breadcrumbs, title, and a controls slot for time window/aggregate selectors. Replaces MUI `Breadcrumbs` + `Typography` pattern. |
| Build `SharedFilter` | Carbon [MultiSelect](https://carbondesignsystem.com/components/dropdown/usage/) wrapper. Accepts filter config, emits changes. Replaces per-page filter implementations. |
| Build `SharedModal` | Carbon [Modal](https://carbondesignsystem.com/components/modal/usage/) wrapper for detail views. Replaces `cloudCostDetails.js` (174 lines) and `externalCostDetailModal.js` (93 lines). |
| Migrate `SidebarNav.js` | Replace MUI `Drawer` with Carbon [SideNav](https://carbondesignsystem.com/components/UI-shell-left-panel/usage/). This is the most visible MUI→Carbon switch and affects every page. |

**Week 3 — Global CSS tokens and theme setup:**

| Task | Details |
|------|---------|
| Extend `colors.css` to global scope | Move the `--cds-*` token pattern from `src/styles/assets/` to a global `src/styles/tokens.css` imported by every page. |
| Create `layout.css` | Shared grid patterns, spacing scale, responsive breakpoints used across pages. |
| Remove inline styles from shared components | Replace all `style={{ ... }}` in shared components with class-based styling using tokens. |
| Theme testing | Verify all 4 Carbon themes (white, g10, g90, g100) work correctly across shared components. |

**Phase 1 deliverables:** 5 shared components (`SharedDataTable`, `SharedChart`, `SharedFilter`, `SharedPageHeader`, `SharedModal`), migrated SidebarNav, global CSS token system. All with tests.

---

### Phase 2: Allocations Page Revamp (Weeks 4–7)

**Goal:** Break the biggest and most-used page into maintainable components using the shared library.

**Week 4 — Break apart `allocationReport.js`:**

| Task | Details |
|------|---------|
| Extract `AllocationTable` | Pull table rendering out of the 9,269-line file. Use `SharedDataTable` with custom cell renderers for cost formatting, resource bars, and namespace labels. |
| Extract `AllocationChart` | Pull chart rendering into a standalone component. Use `SharedChart` with allocation-specific data transforms. |
| Extract `AllocationControls` | Pull the controls (Edit, Download, window selector, aggregate selector) into a dedicated component behind `SharedPageHeader`. |

**Week 5 — Drilldown revamp:**

| Task | Details |
|------|---------|
| Extract `AllocationDrilldown` | Currently drilldown (namespace → controller → pod → container) is managed through URL params with filter state inside the page component. Extract into a dedicated component that tracks the drilldown stack. |
| Improve breadcrumb navigation | Current breadcrumbs only support "go one level up." Add ability to jump back to any level directly (e.g., click "namespace" to skip back from container view). |
| URL state cleanup | Current implementation has 11 `useState` calls reading from URL params. Group related state using `useReducer` or a custom `useAllocationState` hook. |

**Week 6 — KPI cards and visual improvements:**

| Task | Details |
|------|---------|
| Add KPI summary cards | Same pattern as Assets page — total cost, idle cost, efficiency score. Using `SharedPageHeader` controls slot for layout consistency. |
| Replace MUI components | Swap remaining MUI Tables, Paper, Typography, CircularProgress with Carbon equivalents (DataTable, Tile, heading utilities, InlineLoading). |
| Replace inline styles | Move all `style={{ ... }}` to CSS files using global tokens. |

**Week 7 — Testing and integration:**

| Task | Details |
|------|---------|
| Write tests for new components | `AllocationTable`, `AllocationChart`, `AllocationDrilldown`, `AllocationControls` — render tests, interaction tests, edge cases. |
| Integration testing | Verify the full Allocations page works end-to-end with the new components. Test URL state persistence, drilldown navigation, filter combinations. |
| Performance check | The 9,269-line file likely has unnecessary re-renders. Check that memoization (`useMemo`, `React.memo`) is applied correctly in the new structure. |

**Phase 2 deliverables:** `allocationReport.js` broken into 4 components (<500 lines each), KPI cards added, drilldown improved, MUI removed from Allocations, full test coverage.

---

### Phase 3: CloudCosts, ExternalCosts, and Reports (Weeks 8–10)

**Goal:** Deduplicate the two near-identical pages and add a basic Reports feature.

**Week 8 — Shared drilldown and deduplicate CloudCosts/ExternalCosts:**

| Task | Details |
|------|---------|
| Build `SharedDrilldown` | Both pages use the same drilldown pattern (3 levels deep). CloudCosts: provider → service → item. ExternalCosts: domain → account → resource. Extract the drilldown logic into a shared component that accepts level configuration as props. |
| Merge range chart logic | `cloudCostChart/rangeChart.js` (275 lines) and `externalCosts/rangeChart.js` (225 lines) are near-identical. Replace both with `SharedChart` configured for time-range data. |
| Merge sorting utilities | `descendingComparator`, `stableSort`, `getComparator` are copy-pasted in both pages. Move to `src/utils/sorting.js` once and import everywhere. |

**Week 9 — Migrate CloudCosts and ExternalCosts to Carbon:**

| Task | Details |
|------|---------|
| CloudCosts migration | Replace MUI components with shared Carbon components. Use `SharedDataTable` for the cost table, `SharedModal` for CloudCostDetails, `SharedPageHeader` for controls. |
| ExternalCosts migration | Same approach. Because the components are already deduplicated in Week 8, this is mostly wiring. |
| Tests | Tests for both pages using the shared components. |

**Week 10 — Reports page:**

| Task | Details |
|------|---------|
| Build `Reports.js` | A new page at `/reports` where users can save filtered views. Example: "Production storage costs, 30d, filtered by waste status." |
| URL serialization | Each saved report is a serialized URL state string. Clicking a saved report navigates to the corresponding page with those params restored. |
| Add route | Add `/reports` to `src/route.js` and `SidebarNav`. |
| Storage | `localStorage` for now (no backend needed). Could be upgraded to backend-persisted later. |

**Phase 3 deliverables:** CloudCosts and ExternalCosts migrated to Carbon, ~50% code reduction from deduplication, basic Reports page with saved views.

---

### Phase 4: Testing, Accessibility Audit, Documentation (Weeks 11–12)

**Goal:** Make sure everything works correctly, is accessible, and is documented for future contributors.

**Week 11 — Testing push and accessibility audit:**

| Task | Details |
|------|---------|
| Test coverage for all pages | Target: every component that renders data has at minimum render + props + edge case coverage. Use the same Jest + React Testing Library setup from Assets. |
| Accessibility audit with axe-core | Run [axe-core](https://github.com/dequelabs/axe-core) against every page. Carbon components have built-in ARIA support, but integration can break it (wrong roles, missing labels, broken focus order). |
| Keyboard navigation testing | Tab through every interactive element on every page. Verify: all buttons reachable, modals trap focus, tables navigable, dropdowns operable, side panels closeable via Escape. |
| Fix issues | Fix everything found in the audit. Prioritize: broken keyboard nav > missing labels > color contrast. |

**Week 12 — Documentation and cleanup:**

| Task | Details |
|------|---------|
| Component guide | Document all shared components — props, usage examples, and which pages use them. Written as markdown in `docs/`, not JSDoc. Future contributors need to know where things are and how to use them. |
| Theming guide | Document the CSS token system — how to add a new color, how to override per-theme, how dark mode works. |
| Migration notes | Document what changed from MUI to Carbon and why, for anyone maintaining the codebase who's used to the old patterns. |
| Final cleanup | Remove unused MUI imports and dependencies from `package.json`. Remove dead code. Run Prettier. Verify build. |

**Phase 4 deliverables:** Test coverage across all pages, zero critical accessibility issues, contributing documentation for shared components and theming.

---

## Summary

| What | Count |
|------|-------|
| Components built for Assets | 9 |
| Test files | 11 (10 asset + 1 shared) |
| Total tests | 50, all passing |
| CSS files | 4 |
| Total lines (Assets implementation) | 5,164 |
| Roadmap phases | 4 |
| Roadmap duration | 12 weeks |

---

## References

| Resource | Link |
|----------|------|
| My PR | [opencost/opencost-ui#XXX](https://github.com/opencost/opencost-ui/pull/XXX) <!-- TODO: replace XXX --> |
| Challenge Issue | [#28 — Support Assets in the UI](https://github.com/opencost/opencost-ui/issues/28) |
| Mentorship Issue | [#155 — OpenCost UI Revamp](https://github.com/opencost/opencost/issues/155) |
| OpenCost Assets API | [`handlers.go`](https://github.com/opencost/opencost/blob/develop/pkg/costmodel/handlers.go) |
| Asset Data Model | [`asset.go`](https://github.com/opencost/opencost/blob/develop/core/pkg/opencost/asset.go) |
| Asset Properties | [`assetprops.go`](https://github.com/opencost/opencost/blob/develop/core/pkg/opencost/assetprops.go) |
| Carbon Design System | [carbondesignsystem.com](https://carbondesignsystem.com) |
| Carbon DataTable | [Usage](https://carbondesignsystem.com/components/data-table/usage/) · [Code](https://carbondesignsystem.com/components/data-table/code/) |
| Carbon ContentSwitcher | [Usage](https://carbondesignsystem.com/components/content-switcher/usage/) |
| Carbon UIShell | [Header](https://carbondesignsystem.com/components/UI-shell-header/usage/) · [SideNav](https://carbondesignsystem.com/components/UI-shell-left-panel/usage/) |
| Carbon Charts | [@carbon/charts-react](https://charts.carbondesignsystem.com/) |
| Carbon Themes | [Overview](https://carbondesignsystem.com/elements/themes/overview/) |
| Carbon MultiSelect | [Dropdown Usage](https://carbondesignsystem.com/components/dropdown/usage/) |
| Carbon Modal | [Usage](https://carbondesignsystem.com/components/modal/usage/) |
| axe-core (a11y) | [github.com/dequelabs/axe-core](https://github.com/dequelabs/axe-core) |
| OpenCost Docs | [opencost.io/docs](https://www.opencost.io/docs/) |
