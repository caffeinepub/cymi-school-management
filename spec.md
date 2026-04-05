# CYMI School Management

## Current State
Fee Management module has: Fee Structure, Fee Collection, Fee Register, Fee Receipts, Fee History, Fee Reports, and Fee Settings pages. No Fee Concession or Fee Defaulters pages exist.

## Requested Changes (Diff)

### Add
- `/fees/concession` — Fee Concession page: list of students with applied concessions (type, percentage/amount, approved by, status), add/edit/delete concession modal, search/filter by class/type/status, export Excel/PDF
- `/fees/defaulters` — Fee Defaulters page: list of students with overdue/pending fees, showing outstanding balance, overdue days, last payment date, and reminder/action buttons, search/filter by class/grade/status, export Excel/PDF, summary stats
- Routes registered in App.tsx for both pages
- Sidebar links wired for both (already shown in sidebar under Fee Management)

### Modify
- `App.tsx` — add two new route imports and route definitions
- `src/frontend/src/data/fees.ts` — add concession and defaulter data arrays

### Remove
- Nothing

## Implementation Plan
1. Add concession data (student concessions with type, amount, %, status) to fees.ts
2. Add defaulters data derived from FEE_TRANSACTIONS with overdue/pending status to fees.ts
3. Create `FeeConcessionPage.tsx` — stat cards, search/filter table, add/edit/delete modal, export
4. Create `FeeDefaultersPage.tsx` — stat cards (total defaulters, total outstanding, overdue >30d), search/filter table, send reminder mock action, export
5. Register both routes in App.tsx
