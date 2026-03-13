# PDV: Payment Methods Tabs + Student Balance Display

**Date:** 2026-03-13  
**Status:** Approved

## Goal

Improve the PDV (`/escola/cantina/pdv`) with three enhancements:

1. **Student balance display** — show balance alongside selected student name; disable "Saldo do Aluno" button when balance is insufficient
2. **Payment method tabs** — split payment methods into "Pelo App" (platform-processed) and "Manual" (physical/external) tabs
3. **PIX and Cartão platform methods conditional** — only shown when `CanteenFinancialSettings` has the relevant configuration

## Backend Changes

### New enum values in `PaymentMethod`

Add `PIX_MACHINE` and `CARD_MACHINE` to the `CanteenPaymentMethod` enum (used in `canteen_purchase.ts` and wherever the enum is defined). These represent manual machine payments, distinct from platform-processed PIX and CARD.

Check if the DB column is a Postgres `ENUM` type (needs migration) or `VARCHAR` (no migration needed).

### New endpoint: `GET /api/v1/canteens/:canteenId/financial-settings`

- Controller: `app/controllers/canteen_financial_settings/show_canteen_financial_settings_controller.ts`
- Returns `CanteenFinancialSettingsDto` if a settings row exists for the canteen, otherwise returns an object with all fields null (same pattern as `show_store_financial_settings_controller.ts`)
- Route name: `canteens.financial_settings.show`
- Registered inside `registerCanteenApiRoutes()` in `start/routes/api/canteen.ts`
- Run `node ace tuyau:generate` after adding the route

## Frontend Changes

### Student balance

- Add `useQuery` for `api.api.v1.students.balance.queryOptions({ params: { studentId } })`, enabled only when `selectedStudentId` is set
- Display result as a small badge/label next to the selected student name in the "Buscar Aluno" card: e.g. `Saldo: R$ 12,50`
- "Saldo do Aluno" payment button: `disabled` when `studentBalance < totalAmount` (balance in cents, totalAmount in cents)
- On successful purchase with `BALANCE` method, invalidate `students.balance` query

### Payment method tabs

The payment methods card gains two tabs implemented with shadcn `Tabs` component.

#### Tab "Pelo App" (default)

| Method       | Label          | Visible when                         |
| ------------ | -------------- | ------------------------------------ |
| `BALANCE`    | Saldo do Aluno | Always                               |
| `PIX`        | PIX            | `financialSettings?.pixKey !== null` |
| `CARD`       | Cartão         | `financialSettings` row exists       |
| `ON_ACCOUNT` | Fiado (fatura) | Always                               |

#### Tab "Manual"

| Method         | Label            | Visible when |
| -------------- | ---------------- | ------------ |
| `CASH`         | Dinheiro         | Always       |
| `PIX_MACHINE`  | PIX (máquina)    | Always       |
| `CARD_MACHINE` | Cartão (máquina) | Always       |

#### Tab switching behavior

- When switching tabs, if the currently selected payment method is not in the new tab, reset to the tab's default (`BALANCE` for App, `CASH` for Manual)
- The enrollment selector for `ON_ACCOUNT` only shows when `ON_ACCOUNT` is selected (existing behavior, unchanged)

### `PaymentMethod` type update

Update the frontend `PaymentMethod` type in `pdv.tsx` to include `PIX_MACHINE` and `CARD_MACHINE`.

## Data flow

```
PDV loads
  ├── useQuery: canteenItems (existing)
  ├── useQuery: students (existing, debounced search)
  └── useQuery: canteens.financial_settings.show(canteenId)  ← NEW

Student selected
  └── useQuery: students.balance(studentId)  ← NEW

Purchase submitted
  └── on success:
        ├── invalidate canteenPurchases.index (existing)
        ├── invalidate canteenItems.index (existing)
        └── invalidate students.balance(studentId)  ← NEW if BALANCE method
```

## Files to create / modify

### Create

- `app/controllers/canteen_financial_settings/show_canteen_financial_settings_controller.ts`

### Modify

- `start/routes/api/canteen.ts` — add `GET /:canteenId/financial-settings` route
- `app/models/canteen_purchase.ts` (or enum source) — add `PIX_MACHINE`, `CARD_MACHINE`
- `inertia/pages/escola/cantina/pdv.tsx` — all frontend changes
- Run `node ace tuyau:generate` — regenerate registry

### Possibly modify (if DB column is ENUM type)

- New migration to alter the `CanteenPurchase.paymentMethod` column

## Out of scope

- Configuring a payment gateway for `CARD` — the `CARD` platform method will appear based only on the existence of `CanteenFinancialSettings`, not on a specific gateway config field (no such field exists today)
- Settings UI for `CanteenFinancialSettings` — already handled elsewhere
