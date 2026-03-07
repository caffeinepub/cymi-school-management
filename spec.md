# CYMI School Management

## Current State
- Admin and SuperAdmin dashboards show stat cards (total students, total teachers, access level) and an info panel.
- No data visualizations exist on any dashboard.

## Requested Changes (Diff)

### Add
- A pie/donut chart on both the Admin and SuperAdmin dashboard panels showing a breakdown of school composition (Students, Teachers, Staff, Others).
- A legend below or beside the chart listing each slice with its label, value, and percentage.
- Chart follows best practices: slices ordered by size descending, percentage labels on slices, max 5 categories.

### Modify
- AdminPanel and SuperAdminPanel components updated to include the pie chart section below the stat cards and above the info box.

### Remove
- Nothing removed.

## Implementation Plan
1. Install / confirm recharts is available (it ships with the shadcn chart component).
2. Create a `SchoolCompositionPieChart` component using recharts `PieChart` + `Pie` + `Cell` with a custom legend.
3. Add the chart component into `AdminPanel` and `SuperAdminPanel` in `DashboardPage.tsx`.
4. Use sample proportional data: Students 65%, Teachers 20%, Staff 10%, Others 5%.
5. Style with CYMI blue palette, responsive container, animated entrance.
