# PDV Payment Methods Tabs + Student Balance Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Improve the PDV with student balance display, payment method tabs ("Pelo App" / "Manual"), and conditional PIX/Cartão based on `CanteenFinancialSettings`.

**Architecture:** New backend endpoint mirrors the stores pattern; frontend adds a `useQuery` for student balance and financial settings, and restructures the payment card into two tabs using shadcn `Tabs`.

**Tech Stack:** AdonisJS 6, Tuyau, React, TanStack Query, shadcn/ui Tabs

---

### Task 1: Add `PIX_MACHINE` and `CARD_MACHINE` to backend enum

**Files:**

- Modify: `app/models/canteen_purchase.ts:11`
- Modify: `app/validators/canteen.ts:72` and `app/validators/canteen.ts:89`
- Modify: `app/models/dto/canteen_purchase.dto.ts:13`

**Step 1: Update the `CanteenPaymentMethod` type**

In `app/models/canteen_purchase.ts`, change line 11:

```ts
export type CanteenPaymentMethod =
  | 'BALANCE'
  | 'CASH'
  | 'CARD'
  | 'PIX'
  | 'ON_ACCOUNT'
  | 'PIX_MACHINE'
  | 'CARD_MACHINE'
```

**Step 2: Update the vine validator**

In `app/validators/canteen.ts`, update both occurrences at lines 72 and 89:

```ts
paymentMethod: vine.enum(['BALANCE', 'CASH', 'CARD', 'PIX', 'ON_ACCOUNT', 'PIX_MACHINE', 'CARD_MACHINE']),
```

and:

```ts
paymentMethod: vine.enum(['BALANCE', 'CASH', 'CARD', 'PIX', 'ON_ACCOUNT', 'PIX_MACHINE', 'CARD_MACHINE']).optional(),
```

**Step 3: Verify TypeScript compiles**

```bash
node ace build --ignore-ts-errors 2>&1 | grep -i "error" | head -20
```

No errors expected for these changes (it's a text column in DB, no migration needed).

**Step 4: Commit**

```bash
git add app/models/canteen_purchase.ts app/validators/canteen.ts
git commit -m "feat(canteen): add PIX_MACHINE and CARD_MACHINE payment methods"
```

---

### Task 2: Create `ShowCanteenFinancialSettingsController`

**Files:**

- Create: `app/controllers/canteen_financial_settings/show_canteen_financial_settings_controller.ts`

**Step 1: Create the controller** (mirror of `show_store_financial_settings_controller.ts`)

```ts
import type { HttpContext } from '@adonisjs/core/http'
import CanteenFinancialSettings from '#models/canteen_financial_settings'
import CanteenFinancialSettingsDto from '#models/dto/canteen_financial_settings.dto'

export default class ShowCanteenFinancialSettingsController {
  async handle({ params, response }: HttpContext) {
    const settings = await CanteenFinancialSettings.query()
      .where('canteenId', params.canteenId)
      .first()

    if (!settings) {
      return response.ok({
        canteenId: params.canteenId,
        platformFeePercentage: null,
        pixKey: null,
        pixKeyType: null,
        bankName: null,
        accountHolder: null,
      })
    }

    return response.ok(new CanteenFinancialSettingsDto(settings))
  }
}
```

**Step 2: Commit**

```bash
git add app/controllers/canteen_financial_settings/show_canteen_financial_settings_controller.ts
git commit -m "feat(canteen): add ShowCanteenFinancialSettingsController"
```

---

### Task 3: Register the new route and regenerate Tuyau

**Files:**

- Modify: `start/routes/api/canteen.ts`

**Step 1: Add import and route inside `registerCanteenApiRoutes()`**

At the top of `start/routes/api/canteen.ts`, add the import:

```ts
const ShowCanteenFinancialSettingsController = () =>
  import('#controllers/canteen_financial_settings/show_canteen_financial_settings_controller')
```

Inside `registerCanteenApiRoutes()`, add inside the group (after the existing canteen routes):

```ts
router
  .get('/:canteenId/financial-settings', [ShowCanteenFinancialSettingsController])
  .as('canteens.financial_settings.show')
```

**Step 2: Regenerate Tuyau registry**

```bash
node ace tuyau:generate
```

Expected: no errors, `.adonisjs/client/registry/index.ts` updated with `api.v1.canteens.financial_settings.show`.

**Step 3: Verify route appears in registry**

```bash
grep "canteens.financial_settings.show" .adonisjs/client/registry/index.ts
```

Expected: one match.

**Step 4: Commit**

```bash
git add start/routes/api/canteen.ts .adonisjs/
git commit -m "feat(canteen): expose GET /canteens/:canteenId/financial-settings route"
```

---

### Task 4: Update `pdv.tsx` — student balance query + display

**Files:**

- Modify: `inertia/pages/escola/cantina/pdv.tsx`

**Step 1: Add balance query**

After the `enrollments` query (around line 74), add:

```tsx
const { data: studentBalanceData } = useQuery({
  ...api.api.v1.students.balance.queryOptions({
    params: { studentId: selectedStudentId! },
  }),
  enabled: !!selectedStudentId,
})
const studentBalance: number = studentBalanceData?.balance ?? 0
```

**Step 2: Display balance next to selected student name**

Replace the existing selected student paragraph (lines 234–241):

```tsx
{
  selectedStudent && (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <span>
        Aluno selecionado:{' '}
        <span className="font-medium text-foreground">{selectedStudent.user?.name || 'Aluno'}</span>
      </span>
      <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
        Saldo: {formatCurrency(studentBalance)}
      </span>
    </div>
  )
}
```

**Step 3: Invalidate balance after BALANCE purchase**

In the `onSubmit` success handler (around line 170), add:

```tsx
if (paymentMethod === 'BALANCE' && selectedStudentId) {
  queryClient.invalidateQueries({
    queryKey: api.api.v1.students.balance.pathKey(),
  })
}
```

**Step 4: Commit**

```bash
git add inertia/pages/escola/cantina/pdv.tsx
git commit -m "feat(pdv): show student balance and invalidate after BALANCE purchase"
```

---

### Task 5: Update `pdv.tsx` — financial settings query + payment method tabs

**Files:**

- Modify: `inertia/pages/escola/cantina/pdv.tsx`

**Step 1: Add financial settings query**

After the `itemsData` query (around line 82), add:

```tsx
const { data: financialSettings } = useQuery({
  ...api.api.v1.canteens.financial_settings.show.queryOptions({
    params: { canteenId: canteenId! },
  }),
  enabled: !!canteenId,
})
```

**Step 2: Update `PaymentMethod` type**

Change line 40:

```ts
type PaymentMethod =
  | 'BALANCE'
  | 'CASH'
  | 'CARD'
  | 'PIX'
  | 'ON_ACCOUNT'
  | 'PIX_MACHINE'
  | 'CARD_MACHINE'
```

**Step 3: Add payment tab state**

After `const [selectedEnrollmentId, ...]`, add:

```tsx
const [paymentTab, setPaymentTab] = useState<'app' | 'manual'>('app')
```

**Step 4: Add tab-switch reset effect**

After the enrollment effect (around line 98), add:

```tsx
useEffect(() => {
  const appMethods: PaymentMethod[] = ['BALANCE', 'PIX', 'CARD', 'ON_ACCOUNT']
  const manualMethods: PaymentMethod[] = ['CASH', 'PIX_MACHINE', 'CARD_MACHINE']
  if (paymentTab === 'app' && !appMethods.includes(paymentMethod)) {
    setPaymentMethod('BALANCE')
  }
  if (paymentTab === 'manual' && !manualMethods.includes(paymentMethod)) {
    setPaymentMethod('CASH')
  }
}, [paymentTab])
```

**Step 5: Import `Tabs` components**

Add to imports at the top:

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/ui/tabs'
```

(shadcn `tabs` should already be installed; if not, run `npx shadcn@latest add tabs`)

**Step 6: Replace the payment card content with tabs**

Replace the `<CardContent>` block of the "Forma de Pagamento" card (lines 349–398) with:

```tsx
<CardContent>
  <Tabs value={paymentTab} onValueChange={(v) => setPaymentTab(v as 'app' | 'manual')}>
    <TabsList className="w-full mb-3">
      <TabsTrigger value="app" className="flex-1">
        Pelo App
      </TabsTrigger>
      <TabsTrigger value="manual" className="flex-1">
        Manual
      </TabsTrigger>
    </TabsList>

    <TabsContent value="app" className="space-y-2 mt-0">
      <Button
        variant={paymentMethod === 'BALANCE' ? 'default' : 'outline'}
        className="w-full justify-start gap-2"
        disabled={!!selectedStudentId && studentBalance < totalAmount}
        onClick={() => setPaymentMethod('BALANCE')}
      >
        <CreditCard className="h-4 w-4" />
        Saldo do Aluno
      </Button>

      {financialSettings?.pixKey && (
        <Button
          variant={paymentMethod === 'PIX' ? 'default' : 'outline'}
          className="w-full justify-start gap-2"
          onClick={() => setPaymentMethod('PIX')}
        >
          <QrCode className="h-4 w-4" />
          PIX
        </Button>
      )}

      {financialSettings && (
        <Button
          variant={paymentMethod === 'CARD' ? 'default' : 'outline'}
          className="w-full justify-start gap-2"
          onClick={() => setPaymentMethod('CARD')}
        >
          <CreditCard className="h-4 w-4" />
          Cartão
        </Button>
      )}

      <Button
        variant={paymentMethod === 'ON_ACCOUNT' ? 'default' : 'outline'}
        className="w-full justify-start gap-2"
        onClick={() => setPaymentMethod('ON_ACCOUNT')}
      >
        <ReceiptText className="h-4 w-4" />
        Fiado (fatura)
      </Button>
    </TabsContent>

    <TabsContent value="manual" className="space-y-2 mt-0">
      <Button
        variant={paymentMethod === 'CASH' ? 'default' : 'outline'}
        className="w-full justify-start gap-2"
        onClick={() => setPaymentMethod('CASH')}
      >
        <Banknote className="h-4 w-4" />
        Dinheiro
      </Button>

      <Button
        variant={paymentMethod === 'PIX_MACHINE' ? 'default' : 'outline'}
        className="w-full justify-start gap-2"
        onClick={() => setPaymentMethod('PIX_MACHINE')}
      >
        <QrCode className="h-4 w-4" />
        PIX (máquina)
      </Button>

      <Button
        variant={paymentMethod === 'CARD_MACHINE' ? 'default' : 'outline'}
        className="w-full justify-start gap-2"
        onClick={() => setPaymentMethod('CARD_MACHINE')}
      >
        <CreditCard className="h-4 w-4" />
        Cartão (máquina)
      </Button>
    </TabsContent>
  </Tabs>

  {paymentMethod === 'ON_ACCOUNT' && enrollments.length > 1 && !selectedEnrollmentId && (
    <p className="text-xs text-destructive mt-2">Selecione o período letivo abaixo</p>
  )}

  <Button
    className="w-full mt-4"
    disabled={!canFinish || createPurchaseMutation.isPending}
    onClick={onSubmit}
  >
    Finalizar Venda
  </Button>
</CardContent>
```

> Note: The enrollment selector for `ON_ACCOUNT` is already rendered above in the "Buscar Aluno" card (lines 243–260) so it stays there. The note above is just a reminder hint.

**Step 7: Remove unused Banknote import if it's now only in TabsContent**

Check that all Lucide icons used (`Search`, `ShoppingCart`, `CreditCard`, `Banknote`, `QrCode`, `ReceiptText`) are still referenced. They all are.

**Step 8: Check tabs component exists**

```bash
ls inertia/components/ui/tabs.tsx 2>/dev/null && echo "exists" || echo "missing"
```

If missing, add it:

```bash
npx shadcn@latest add tabs
```

**Step 9: Commit**

```bash
git add inertia/pages/escola/cantina/pdv.tsx
git commit -m "feat(pdv): add payment method tabs (Pelo App / Manual) with conditional PIX/Cartão"
```

---

### Task 6: Smoke test

**Step 1: Start the dev server if not running**

```bash
npm run dev
```

**Step 2: Manual test checklist**

1. Navigate to `/escola/cantina/pdv` (impersonate Testerson diretor)
2. Verify "Pelo App" tab is active by default
3. Search for a student — verify balance badge appears next to name
4. Add items to cart so total > student balance — verify "Saldo do Aluno" button is disabled
5. Reduce cart total below balance — verify button re-enables
6. Switch to "Manual" tab — verify Dinheiro, PIX (máquina), Cartão (máquina) appear
7. Select "Cartão (máquina)", switch back to "Pelo App" — verify reset to "Saldo do Aluno"
8. Complete a BALANCE purchase — verify success toast and balance badge updates
9. Check that PIX/Cartão platform buttons are hidden if canteen has no `CanteenFinancialSettings` row

**Step 3: Commit any fixes found during testing**
