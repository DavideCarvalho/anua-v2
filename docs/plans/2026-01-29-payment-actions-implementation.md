# Payment Actions & Agreement Creation - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add action menu to the payments table with 4 features: edit, mark as paid, create agreement (renegotiation), and cancel payment.

**Architecture:** Extend existing `student-payments-container.tsx` with a `DropdownMenu` per row. Each action opens a dedicated modal/dialog component. Backend extended with new agreement endpoint and updated validators for cancel/mark-paid.

**Tech Stack:** React, React Hook Form + Zod, Shadcn/UI (Dialog, AlertDialog, DropdownMenu, Collapsible), TanStack Query, Tuyau client, AdonisJS (VineJS validators, Lucid ORM)

---

### Task 1: Extend backend validators for cancel and mark-paid

**Files:**
- Modify: `app/validators/student_payment.ts`

**Step 1: Update `markPaymentAsPaidValidator`**

Add `metadata` fields to the existing validator:

```typescript
export const markPaymentAsPaidValidator = vine.compile(
  vine.object({
    paidAt: vine.date().optional(),
    paymentGatewayId: vine.string().trim().optional(),
    paymentGateway: vine.enum(['ASAAS', 'CUSTOM']).optional(),
    paymentMethod: vine.enum(['PIX', 'BOLETO', 'CREDIT_CARD', 'CASH', 'OTHER']).optional(),
    amountPaid: vine.number().positive().optional(),
    observation: vine.string().trim().maxLength(500).optional(),
  })
)
```

**Step 2: Create `cancelStudentPaymentValidator`**

Add new validator to the same file:

```typescript
export const cancelStudentPaymentValidator = vine.compile(
  vine.object({
    reason: vine.string().trim().minLength(10).maxLength(500),
  })
)
```

**Step 3: Update `mark_payment_as_paid_controller.ts`**

Modify `app/controllers/student_payments/mark_payment_as_paid_controller.ts` to store extra fields in `metadata`:

```typescript
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import StudentPayment from '#models/student_payment'
import { markPaymentAsPaidValidator } from '#validators/student_payment'

export default class MarkPaymentAsPaidController {
  async handle({ params, request, response }: HttpContext) {
    const { id } = params
    const payload = await request.validateUsing(markPaymentAsPaidValidator)

    const payment = await StudentPayment.find(id)

    if (!payment) {
      return response.notFound({ message: 'Student payment not found' })
    }

    payment.status = 'PAID'
    payment.paidAt = payload.paidAt ? DateTime.fromJSDate(payload.paidAt) : DateTime.now()

    if (payload.paymentGatewayId) {
      payment.paymentGatewayId = payload.paymentGatewayId
    }

    if (payload.paymentGateway) {
      payment.paymentGateway = payload.paymentGateway
    }

    const metadata: Record<string, unknown> = { ...(payment.metadata || {}) }
    if (payload.paymentMethod) metadata.paymentMethod = payload.paymentMethod
    if (payload.amountPaid) metadata.amountPaid = payload.amountPaid
    if (payload.observation) metadata.observation = payload.observation
    payment.metadata = metadata

    await payment.save()
    await payment.load('student')

    return response.ok(payment)
  }
}
```

**Step 4: Update `cancel_student_payment_controller.ts`**

Modify `app/controllers/student_payments/cancel_student_payment_controller.ts` to accept reason:

```typescript
import type { HttpContext } from '@adonisjs/core/http'
import StudentPayment from '#models/student_payment'
import { cancelStudentPaymentValidator } from '#validators/student_payment'

export default class CancelStudentPaymentController {
  async handle({ params, request, response }: HttpContext) {
    const { id } = params
    const payload = await request.validateUsing(cancelStudentPaymentValidator)

    const payment = await StudentPayment.find(id)

    if (!payment) {
      return response.notFound({ message: 'Student payment not found' })
    }

    payment.status = 'CANCELLED'
    payment.metadata = {
      ...(payment.metadata || {}),
      cancelReason: payload.reason,
      cancelledAt: new Date().toISOString(),
    }
    await payment.save()

    await payment.load('student')

    return response.ok(payment)
  }
}
```

**Step 5: Run TypeScript check**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: No new errors from these changes

**Step 6: Commit**

```bash
git add app/validators/student_payment.ts app/controllers/student_payments/mark_payment_as_paid_controller.ts app/controllers/student_payments/cancel_student_payment_controller.ts
git commit -m "feat: extend mark-paid and cancel validators with metadata"
```

---

### Task 2: Create agreement backend (validator, controller, route)

**Files:**
- Create: `app/validators/agreement.ts`
- Create: `app/controllers/agreements/create_agreement_controller.ts`
- Modify: `start/routes.ts`

**Step 1: Create agreement validator**

Create `app/validators/agreement.ts`:

```typescript
import vine from '@vinejs/vine'

export const createAgreementValidator = vine.compile(
  vine.object({
    paymentIds: vine.array(vine.string().trim()).minLength(1),
    installments: vine.number().min(1).max(36),
    startDate: vine.date(),
    paymentDay: vine.number().min(1).max(31),
    earlyDiscounts: vine
      .array(
        vine.object({
          percentage: vine.number().min(1).max(100),
          daysBeforeDeadline: vine.number().min(1).max(30),
        })
      )
      .optional(),
  })
)
```

**Step 2: Create agreement controller**

Create `app/controllers/agreements/create_agreement_controller.ts`:

```typescript
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import { v7 as uuidv7 } from 'uuid'
import Agreement from '#models/agreement'
import AgreementEarlyDiscount from '#models/agreement_early_discount'
import StudentPayment from '#models/student_payment'
import { createAgreementValidator } from '#validators/agreement'

export default class CreateAgreementController {
  async handle({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createAgreementValidator)

    const payments = await StudentPayment.query()
      .whereIn('id', payload.paymentIds)
      .whereIn('status', ['NOT_PAID', 'PENDING', 'OVERDUE'])
      .preload('student')

    if (payments.length === 0) {
      return response.badRequest({ message: 'Nenhum pagamento válido selecionado' })
    }

    if (payments.length !== payload.paymentIds.length) {
      return response.badRequest({
        message: 'Alguns pagamentos não foram encontrados ou já estão pagos/cancelados',
      })
    }

    // All payments must belong to the same student
    const studentIds = new Set(payments.map((p) => p.studentId))
    if (studentIds.size > 1) {
      return response.badRequest({
        message: 'Todos os pagamentos devem pertencer ao mesmo aluno',
      })
    }

    const totalAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0)
    const studentId = payments[0].studentId
    const contractId = payments[0].contractId
    const installmentAmount = Math.round(totalAmount / payload.installments)

    const trx = await db.transaction()

    try {
      // 1. Create agreement
      const agreement = await Agreement.create(
        {
          id: uuidv7(),
          totalAmount,
          installments: payload.installments,
          startDate: DateTime.fromJSDate(payload.startDate),
          paymentDay: payload.paymentDay,
        },
        { client: trx }
      )

      // 2. Create early discounts
      if (payload.earlyDiscounts && payload.earlyDiscounts.length > 0) {
        for (const discount of payload.earlyDiscounts) {
          await AgreementEarlyDiscount.create(
            {
              id: uuidv7(),
              agreementId: agreement.id,
              percentage: discount.percentage,
              daysBeforeDeadline: discount.daysBeforeDeadline,
            },
            { client: trx }
          )
        }
      }

      // 3. Cancel original payments
      for (const payment of payments) {
        payment.useTransaction(trx)
        payment.status = 'CANCELLED'
        payment.metadata = {
          ...(payment.metadata || {}),
          cancelReason: 'Substituído por acordo',
          agreementId: agreement.id,
        }
        await payment.save()
      }

      // 4. Create new agreement payments
      const startDate = DateTime.fromJSDate(payload.startDate)
      for (let i = 0; i < payload.installments; i++) {
        const dueDate = startDate.plus({ months: i }).set({ day: payload.paymentDay })
        await StudentPayment.create(
          {
            id: uuidv7(),
            studentId,
            amount: installmentAmount,
            totalAmount: installmentAmount,
            month: dueDate.month,
            year: dueDate.year,
            type: 'AGREEMENT',
            status: 'PENDING',
            dueDate,
            installments: payload.installments,
            installmentNumber: i + 1,
            discountPercentage: 0,
            contractId,
            agreementId: agreement.id,
          },
          { client: trx }
        )
      }

      await trx.commit()

      await agreement.load('earlyDiscounts')

      return response.created({
        agreement,
        cancelledPayments: payments.length,
        newPayments: payload.installments,
      })
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }
}
```

**Step 3: Register route in `start/routes.ts`**

Add controller import near line 384 (after student payment imports):

```typescript
// Agreements
const CreateAgreementController = () =>
  import('#controllers/agreements/create_agreement_controller')
```

Add route registration function after `registerStudentPaymentApiRoutes` (around line 1438):

```typescript
function registerAgreementApiRoutes() {
  router
    .group(() => {
      router.post('/', [CreateAgreementController]).as('agreements.store')
    })
    .prefix('/agreements')
    .use(middleware.auth())
}
```

Call it near line 2713 (after `registerStudentPaymentApiRoutes()`):

```typescript
registerAgreementApiRoutes()
```

**Step 4: Run TypeScript check**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: No new errors

**Step 5: Commit**

```bash
git add app/validators/agreement.ts app/controllers/agreements/create_agreement_controller.ts start/routes.ts
git commit -m "feat: add agreement creation endpoint"
```

---

### Task 3: Add pending payments query for agreement modal

**Files:**
- Modify: `start/routes.ts` (add route for listing pending payments by student)
- Create: `inertia/hooks/queries/use_student_pending_payments.ts`

**Step 1: Add route for student pending payments**

The existing `ListStudentPaymentsByStudentController` at `app/controllers/student_payments/list_student_payments_by_student_controller.ts` already fetches payments by student. However it doesn't filter by status. We'll use the existing `ListStudentPaymentsController` with `studentId` + `status` query params from the frontend instead of creating a new endpoint. No backend changes needed.

**Step 2: Create query hook**

Create `inertia/hooks/queries/use_student_pending_payments.ts`:

```typescript
import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'

const $route = tuyau.api.v1['student-payments'].$get

export function useStudentPendingPaymentsQueryOptions(studentId: string | undefined) {
  return {
    queryKey: ['student-pending-payments', studentId],
    queryFn: () => {
      return $route({
        query: {
          studentId,
          limit: 100,
        },
      }).unwrap()
    },
    enabled: !!studentId,
  } satisfies QueryOptions
}
```

**Step 3: Commit**

```bash
git add inertia/hooks/queries/use_student_pending_payments.ts
git commit -m "feat: add student pending payments query hook"
```

---

### Task 4: Create agreement mutation hook

**Files:**
- Create: `inertia/hooks/mutations/use_agreement_mutations.ts`

**Step 1: Create mutation hook**

Create `inertia/hooks/mutations/use_agreement_mutations.ts`:

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'

interface CreateAgreementPayload {
  paymentIds: string[]
  installments: number
  startDate: string
  paymentDay: number
  earlyDiscounts?: { percentage: number; daysBeforeDeadline: number }[]
}

export function useCreateAgreement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateAgreementPayload) => {
      return tuyau.$route('api.v1.agreements.store').$post(data).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-payments'] })
      queryClient.invalidateQueries({ queryKey: ['student-pending-payments'] })
    },
  })
}
```

**Step 2: Commit**

```bash
git add inertia/hooks/mutations/use_agreement_mutations.ts
git commit -m "feat: add agreement creation mutation hook"
```

---

### Task 5: Create edit payment modal

**Files:**
- Create: `inertia/containers/student-payments/edit-payment-modal.tsx`

**Step 1: Create the component**

Create `inertia/containers/student-payments/edit-payment-modal.tsx`:

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '~/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import { useUpdateStudentPayment } from '~/hooks/mutations/use_student_payment_mutations'

const editPaymentSchema = z.object({
  amount: z.coerce.number().positive('Valor deve ser maior que zero'),
  dueDate: z.string().min(1, 'Data de vencimento é obrigatória'),
  discountPercentage: z.coerce.number().min(0).max(100, 'Desconto deve ser entre 0 e 100'),
})

type EditPaymentFormData = z.infer<typeof editPaymentSchema>

interface EditPaymentModalProps {
  payment: {
    id: string
    amount: number
    dueDate: string
    discountPercentage: number
    student?: { user?: { name?: string }; name?: string }
    month: number
    year: number
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditPaymentModal({ payment, open, onOpenChange }: EditPaymentModalProps) {
  const updatePayment = useUpdateStudentPayment()

  const form = useForm<EditPaymentFormData>({
    resolver: zodResolver(editPaymentSchema),
    defaultValues: {
      amount: Number(payment.amount),
      dueDate: new Date(payment.dueDate).toISOString().split('T')[0],
      discountPercentage: payment.discountPercentage || 0,
    },
  })

  const watchedAmount = form.watch('amount')
  const watchedDiscount = form.watch('discountPercentage')
  const finalAmount = watchedAmount - (watchedAmount * watchedDiscount) / 100

  async function onSubmit(data: EditPaymentFormData) {
    try {
      await updatePayment.mutateAsync({
        id: payment.id,
        amount: data.amount,
        dueDate: new Date(data.dueDate),
        discountPercentage: data.discountPercentage,
      })
      toast.success('Mensalidade atualizada com sucesso')
      onOpenChange(false)
    } catch {
      toast.error('Erro ao atualizar mensalidade')
    }
  }

  const studentName =
    payment.student?.user?.name || payment.student?.name || 'Aluno'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Mensalidade</DialogTitle>
        </DialogHeader>

        <div className="text-sm text-muted-foreground space-y-1">
          <p>Aluno: <span className="font-medium text-foreground">{studentName}</span></p>
          <p>Referência: <span className="font-medium text-foreground">{payment.month}/{payment.year}</span></p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor (R$)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de vencimento</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="discountPercentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Desconto (%)</FormLabel>
                  <div className="flex items-center gap-3">
                    <FormControl>
                      <Input type="number" min="0" max="100" className="w-24" {...field} />
                    </FormControl>
                    <span className="text-sm text-muted-foreground">
                      Valor final: <span className="font-medium text-foreground">R$ {finalAmount.toFixed(2)}</span>
                    </span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={updatePayment.isPending}>
                {updatePayment.isPending ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
```

**Step 2: Commit**

```bash
git add inertia/containers/student-payments/edit-payment-modal.tsx
git commit -m "feat: add edit payment modal"
```

---

### Task 6: Create mark-as-paid modal

**Files:**
- Create: `inertia/containers/student-payments/mark-paid-modal.tsx`
- Modify: `inertia/hooks/mutations/use_student_payment_mutations.ts`

**Step 1: Extend the mutation hook**

In `inertia/hooks/mutations/use_student_payment_mutations.ts`, update `useMarkPaymentAsPaid` to accept extra fields:

```typescript
export function useMarkPaymentAsPaid() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      paidAt,
      paymentMethod,
      amountPaid,
      observation,
    }: {
      id: string
      paidAt?: string
      paymentMethod?: string
      amountPaid?: number
      observation?: string
    }) => {
      return tuyau
        .$route('api.v1.studentPayments.markPaid', { id })
        .$post({ paidAt, paymentMethod, amountPaid, observation })
        .unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-payments'] })
    },
  })
}
```

**Step 2: Create the component**

Create `inertia/containers/student-payments/mark-paid-modal.tsx`:

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { AlertCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '~/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { useMarkPaymentAsPaid } from '~/hooks/mutations/use_student_payment_mutations'

const markPaidSchema = z.object({
  paidAt: z.string().min(1, 'Data do pagamento é obrigatória'),
  paymentMethod: z.enum(['PIX', 'BOLETO', 'CREDIT_CARD', 'CASH', 'OTHER'], {
    required_error: 'Selecione o método de pagamento',
  }),
  amountPaid: z.coerce.number().positive('Valor deve ser maior que zero'),
  observation: z.string().optional(),
})

type MarkPaidFormData = z.infer<typeof markPaidSchema>

const paymentMethodLabels: Record<string, string> = {
  PIX: 'PIX',
  BOLETO: 'Boleto',
  CREDIT_CARD: 'Cartão de Crédito',
  CASH: 'Dinheiro',
  OTHER: 'Outro',
}

interface MarkPaidModalProps {
  payment: {
    id: string
    amount: number
    student?: { user?: { name?: string }; name?: string }
    month: number
    year: number
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MarkPaidModal({ payment, open, onOpenChange }: MarkPaidModalProps) {
  const markPaid = useMarkPaymentAsPaid()

  const form = useForm<MarkPaidFormData>({
    resolver: zodResolver(markPaidSchema),
    defaultValues: {
      paidAt: new Date().toISOString().split('T')[0],
      paymentMethod: undefined,
      amountPaid: Number(payment.amount),
      observation: '',
    },
  })

  const watchedAmount = form.watch('amountPaid')
  const originalAmount = Number(payment.amount)
  const isDifferentAmount = watchedAmount !== originalAmount && watchedAmount > 0

  async function onSubmit(data: MarkPaidFormData) {
    try {
      await markPaid.mutateAsync({
        id: payment.id,
        paidAt: data.paidAt,
        paymentMethod: data.paymentMethod,
        amountPaid: data.amountPaid,
        observation: data.observation || undefined,
      })
      toast.success('Pagamento registrado com sucesso')
      onOpenChange(false)
    } catch {
      toast.error('Erro ao registrar pagamento')
    }
  }

  const studentName =
    payment.student?.user?.name || payment.student?.name || 'Aluno'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Pagamento</DialogTitle>
        </DialogHeader>

        <div className="text-sm text-muted-foreground space-y-1">
          <p>Aluno: <span className="font-medium text-foreground">{studentName}</span></p>
          <p>Referência: <span className="font-medium text-foreground">{payment.month}/{payment.year}</span></p>
          <p>Valor: <span className="font-medium text-foreground">R$ {originalAmount.toFixed(2)}</span></p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="paidAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data do pagamento</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Método de pagamento</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(paymentMethodLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amountPaid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor pago (R$)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="0" {...field} />
                  </FormControl>
                  {isDifferentAmount && (
                    <Badge variant="secondary" className="gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Valor diferente do original
                    </Badge>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="observation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observação</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={2}
                      placeholder="Observações sobre o pagamento (opcional)"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={markPaid.isPending}>
                {markPaid.isPending ? 'Registrando...' : 'Confirmar Pagamento'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
```

**Step 3: Commit**

```bash
git add inertia/hooks/mutations/use_student_payment_mutations.ts inertia/containers/student-payments/mark-paid-modal.tsx
git commit -m "feat: add mark-as-paid modal with payment method and observation"
```

---

### Task 7: Create cancel payment dialog

**Files:**
- Create: `inertia/containers/student-payments/cancel-payment-dialog.tsx`
- Modify: `inertia/hooks/mutations/use_student_payment_mutations.ts`

**Step 1: Update cancel mutation**

In `inertia/hooks/mutations/use_student_payment_mutations.ts`, update `useCancelStudentPayment`:

```typescript
export function useCancelStudentPayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => {
      return tuyau.$route('api.v1.studentPayments.cancel', { id }).$post({ reason }).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-payments'] })
    },
  })
}
```

**Step 2: Create the component**

Create `inertia/containers/student-payments/cancel-payment-dialog.tsx`:

```tsx
import { useState } from 'react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog'
import { Button } from '~/components/ui/button'
import { Textarea } from '~/components/ui/textarea'
import { Label } from '~/components/ui/label'
import { useCancelStudentPayment } from '~/hooks/mutations/use_student_payment_mutations'

interface CancelPaymentDialogProps {
  payment: {
    id: string
    amount: number
    student?: { user?: { name?: string }; name?: string }
    month: number
    year: number
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CancelPaymentDialog({ payment, open, onOpenChange }: CancelPaymentDialogProps) {
  const [reason, setReason] = useState('')
  const cancelPayment = useCancelStudentPayment()

  const studentName =
    payment.student?.user?.name || payment.student?.name || 'Aluno'

  async function handleCancel() {
    try {
      await cancelPayment.mutateAsync({ id: payment.id, reason })
      toast.success('Pagamento cancelado')
      setReason('')
      onOpenChange(false)
    } catch {
      toast.error('Erro ao cancelar pagamento')
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancelar Pagamento</AlertDialogTitle>
          <AlertDialogDescription>
            Essa ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="text-sm space-y-1">
          <p>Aluno: <span className="font-medium">{studentName}</span></p>
          <p>Referência: <span className="font-medium">{payment.month}/{payment.year}</span></p>
          <p>Valor: <span className="font-medium">R$ {Number(payment.amount).toFixed(2)}</span></p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cancel-reason">Motivo do cancelamento *</Label>
          <Textarea
            id="cancel-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Informe o motivo do cancelamento (mínimo 10 caracteres)"
            rows={3}
          />
          {reason.length > 0 && reason.length < 10 && (
            <p className="text-sm text-destructive">Mínimo 10 caracteres</p>
          )}
        </div>

        <AlertDialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Voltar
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={reason.length < 10 || cancelPayment.isPending}
          >
            {cancelPayment.isPending ? 'Cancelando...' : 'Cancelar Pagamento'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
```

**Step 3: Commit**

```bash
git add inertia/hooks/mutations/use_student_payment_mutations.ts inertia/containers/student-payments/cancel-payment-dialog.tsx
git commit -m "feat: add cancel payment dialog with reason"
```

---

### Task 8: Create agreement modal

**Files:**
- Create: `inertia/containers/student-payments/create-agreement-modal.tsx`

**Step 1: Create the component**

Create `inertia/containers/student-payments/create-agreement-modal.tsx`:

```tsx
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, Trash2, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '~/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'
import { Checkbox } from '~/components/ui/checkbox'
import { Badge } from '~/components/ui/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '~/components/ui/collapsible'
import { useStudentPendingPaymentsQueryOptions } from '~/hooks/queries/use_student_pending_payments'
import { useCreateAgreement } from '~/hooks/mutations/use_agreement_mutations'

const ACTIONABLE_STATUSES = ['NOT_PAID', 'PENDING', 'OVERDUE']

const statusLabels: Record<string, string> = {
  NOT_PAID: 'Não pago',
  PENDING: 'Pendente',
  OVERDUE: 'Vencido',
}

const statusClasses: Record<string, string> = {
  NOT_PAID: 'bg-yellow-100 text-yellow-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  OVERDUE: 'bg-red-100 text-red-700',
}

function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('pt-BR')
}

const agreementSchema = z.object({
  selectedPaymentIds: z.array(z.string()).min(1, 'Selecione pelo menos um pagamento'),
  installments: z.coerce.number().min(1, 'Mínimo 1 parcela').max(36, 'Máximo 36 parcelas'),
  startDate: z.string().min(1, 'Data de início é obrigatória'),
  paymentDay: z.coerce.number().min(1, 'Mínimo dia 1').max(31, 'Máximo dia 31'),
  earlyDiscounts: z.array(
    z.object({
      percentage: z.coerce.number().min(1, 'Mínimo 1%').max(100, 'Máximo 100%'),
      daysBeforeDeadline: z.coerce.number().min(1, 'Mínimo 1 dia').max(30, 'Máximo 30 dias'),
    })
  ),
})

type AgreementFormData = z.infer<typeof agreementSchema>

interface CreateAgreementModalProps {
  payment: {
    id: string
    studentId: string
    student?: { user?: { name?: string }; name?: string }
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateAgreementModal({ payment, open, onOpenChange }: CreateAgreementModalProps) {
  const createAgreement = useCreateAgreement()
  const [discountsOpen, setDiscountsOpen] = useState(false)

  const { data: paymentsData, isLoading } = useQuery({
    ...useStudentPendingPaymentsQueryOptions(payment.studentId),
    enabled: open,
  })

  const allPayments = useMemo(() => {
    const result = paymentsData as any
    const list = Array.isArray(result) ? result : result?.data || []
    return list.filter(
      (p: any) => ACTIONABLE_STATUSES.includes(p.status) && p.type !== 'AGREEMENT'
    )
  }, [paymentsData])

  const form = useForm<AgreementFormData>({
    resolver: zodResolver(agreementSchema),
    defaultValues: {
      selectedPaymentIds: [payment.id],
      installments: 3,
      startDate: new Date().toISOString().split('T')[0],
      paymentDay: 10,
      earlyDiscounts: [],
    },
  })

  // Reset selection when modal opens with new payment
  useEffect(() => {
    if (open) {
      form.reset({
        selectedPaymentIds: [payment.id],
        installments: 3,
        startDate: new Date().toISOString().split('T')[0],
        paymentDay: 10,
        earlyDiscounts: [],
      })
      setDiscountsOpen(false)
    }
  }, [open, payment.id])

  const selectedIds = form.watch('selectedPaymentIds')
  const installments = form.watch('installments')
  const startDateStr = form.watch('startDate')
  const paymentDay = form.watch('paymentDay')
  const earlyDiscounts = form.watch('earlyDiscounts')

  const totalAmount = useMemo(() => {
    return allPayments
      .filter((p: any) => selectedIds.includes(p.id))
      .reduce((sum: number, p: any) => sum + Number(p.amount), 0)
  }, [allPayments, selectedIds])

  const installmentAmount = installments > 0 ? totalAmount / installments : 0

  function togglePayment(paymentId: string) {
    const current = form.getValues('selectedPaymentIds')
    if (current.includes(paymentId)) {
      form.setValue(
        'selectedPaymentIds',
        current.filter((id) => id !== paymentId),
        { shouldValidate: true }
      )
    } else {
      form.setValue('selectedPaymentIds', [...current, paymentId], { shouldValidate: true })
    }
  }

  function addDiscount() {
    const current = form.getValues('earlyDiscounts')
    form.setValue('earlyDiscounts', [...current, { percentage: 5, daysBeforeDeadline: 5 }])
  }

  function removeDiscount(index: number) {
    const current = form.getValues('earlyDiscounts')
    form.setValue(
      'earlyDiscounts',
      current.filter((_, i) => i !== index)
    )
  }

  async function onSubmit(data: AgreementFormData) {
    try {
      await createAgreement.mutateAsync({
        paymentIds: data.selectedPaymentIds,
        installments: data.installments,
        startDate: data.startDate,
        paymentDay: data.paymentDay,
        earlyDiscounts: data.earlyDiscounts.length > 0 ? data.earlyDiscounts : undefined,
      })
      toast.success('Acordo criado com sucesso')
      onOpenChange(false)
    } catch {
      toast.error('Erro ao criar acordo')
    }
  }

  const studentName =
    payment.student?.user?.name || payment.student?.name || 'Aluno'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px] max-h-[90vh] flex flex-col p-0">
        <div className="p-6 pb-4 border-b shrink-0">
          <DialogHeader>
            <DialogTitle>Criar Acordo de Pagamento</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mt-1">
            Aluno: <span className="font-medium text-foreground">{studentName}</span>
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              {/* Section 1: Payment selection */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Pagamentos</h3>
                {isLoading && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                )}
                {!isLoading && allPayments.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum pagamento pendente encontrado
                  </p>
                )}
                {!isLoading &&
                  allPayments.map((p: any) => (
                    <label
                      key={p.id}
                      className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                    >
                      <Checkbox
                        checked={selectedIds.includes(p.id)}
                        onCheckedChange={() => togglePayment(p.id)}
                      />
                      <div className="flex-1 flex items-center justify-between">
                        <div className="text-sm">
                          <span className="font-medium">{p.month}/{p.year}</span>
                          <span className="text-muted-foreground ml-2">
                            Venc: {formatDate(p.dueDate)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            R$ {Number(p.amount).toFixed(2)}
                          </span>
                          <Badge
                            variant="secondary"
                            className={statusClasses[p.status] || ''}
                          >
                            {statusLabels[p.status] || p.status}
                          </Badge>
                        </div>
                      </div>
                    </label>
                  ))}
                {form.formState.errors.selectedPaymentIds && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.selectedPaymentIds.message}
                  </p>
                )}
                <div className="text-sm text-muted-foreground">
                  {selectedIds.length} pagamento(s) selecionado(s) &mdash;{' '}
                  <span className="font-medium text-foreground">
                    Total: R$ {totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Section 2: Agreement terms */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Termos do Acordo</h3>
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="installments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parcelas</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" max="36" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de início</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            min={new Date().toISOString().split('T')[0]}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="paymentDay"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dia do vencimento</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" max="31" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {installments > 0 && totalAmount > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {installments} parcela(s) de{' '}
                    <span className="font-medium text-foreground">
                      R$ {installmentAmount.toFixed(2)}
                    </span>
                  </p>
                )}
              </div>

              {/* Section 3: Early payment discounts */}
              <Collapsible open={discountsOpen} onOpenChange={setDiscountsOpen}>
                <CollapsibleTrigger asChild>
                  <Button type="button" variant="ghost" className="w-full justify-start p-0 h-auto">
                    <h3 className="text-sm font-medium">
                      Descontos por pagamento antecipado
                      {earlyDiscounts.length > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {earlyDiscounts.length}
                        </Badge>
                      )}
                    </h3>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-3 mt-3">
                  {earlyDiscounts.map((discount, index) => (
                    <div key={index} className="flex items-end gap-3">
                      <FormField
                        control={form.control}
                        name={`earlyDiscounts.${index}.percentage`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Desconto (%)</FormLabel>
                            <FormControl>
                              <Input type="number" min="1" max="100" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`earlyDiscounts.${index}.daysBeforeDeadline`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Dias antes</FormLabel>
                            <FormControl>
                              <Input type="number" min="1" max="30" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDiscount(index)}
                        className="mb-1"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  {earlyDiscounts.length > 0 && (
                    <div className="text-xs text-muted-foreground space-y-1">
                      {earlyDiscounts.map((d, i) => (
                        <p key={i}>
                          {d.percentage}% de desconto se pago até {d.daysBeforeDeadline} dia(s)
                          antes do vencimento
                        </p>
                      ))}
                    </div>
                  )}
                  <Button type="button" variant="outline" size="sm" onClick={addDiscount}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar desconto
                  </Button>
                </CollapsibleContent>
              </Collapsible>

              {/* Summary card */}
              {totalAmount > 0 && installments > 0 && (
                <Card className="bg-muted/50">
                  <CardContent className="pt-4 text-sm space-y-1">
                    <p>
                      Total: <span className="font-medium">R$ {totalAmount.toFixed(2)}</span>
                    </p>
                    <p>
                      Parcelas: <span className="font-medium">{installments}x de R$ {installmentAmount.toFixed(2)}</span>
                    </p>
                    {startDateStr && (
                      <p>
                        Primeira parcela em:{' '}
                        <span className="font-medium">{formatDate(startDateStr)}</span>
                      </p>
                    )}
                    <p>
                      Vencimento todo dia <span className="font-medium">{paymentDay}</span>
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            <DialogFooter className="p-6 pt-4 border-t shrink-0">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createAgreement.isPending}>
                {createAgreement.isPending ? 'Criando...' : 'Criar Acordo'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
```

**Step 2: Commit**

```bash
git add inertia/containers/student-payments/create-agreement-modal.tsx
git commit -m "feat: add create agreement modal with payment selection and discounts"
```

---

### Task 9: Wire up actions menu and modals in container

**Files:**
- Modify: `inertia/containers/student-payments-container.tsx`

**Step 1: Add imports and state**

Add these imports at the top of the file:

```typescript
import { useState } from 'react'
import { Pencil, Handshake } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { EditPaymentModal } from './student-payments/edit-payment-modal'
import { MarkPaidModal } from './student-payments/mark-paid-modal'
import { CancelPaymentDialog } from './student-payments/cancel-payment-dialog'
import { CreateAgreementModal } from './student-payments/create-agreement-modal'
```

**Step 2: Add state and modal rendering inside `StudentPaymentsContent`**

Add state at the top of the `StudentPaymentsContent` function:

```typescript
const [selectedPayment, setSelectedPayment] = useState<any>(null)
const [activeModal, setActiveModal] = useState<'edit' | 'mark-paid' | 'cancel' | 'agreement' | null>(null)

function openModal(payment: any, modal: typeof activeModal) {
  setSelectedPayment(payment)
  setActiveModal(modal)
}

function closeModal() {
  setActiveModal(null)
  setSelectedPayment(null)
}
```

**Step 3: Replace the MoreHorizontal button**

Replace the `<td className="p-4 text-right">` block in the table with the dropdown menu:

```tsx
<td className="p-4 text-right">
  {['NOT_PAID', 'PENDING', 'OVERDUE'].includes(payment.status) && (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => openModal(payment, 'edit')}>
          <Pencil className="h-4 w-4 mr-2" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => openModal(payment, 'mark-paid')}>
          <CheckCircle className="h-4 w-4 mr-2" />
          Marcar como pago
        </DropdownMenuItem>
        {payment.type !== 'AGREEMENT' && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => openModal(payment, 'agreement')}>
              <Handshake className="h-4 w-4 mr-2" />
              Criar acordo
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => openModal(payment, 'cancel')}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Cancelar
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )}
</td>
```

**Step 4: Add modals before the closing `</div>` of the component return**

Add right before the final `</div>` of `StudentPaymentsContent`:

```tsx
{selectedPayment && activeModal === 'edit' && (
  <EditPaymentModal
    payment={selectedPayment}
    open
    onOpenChange={(open) => !open && closeModal()}
  />
)}
{selectedPayment && activeModal === 'mark-paid' && (
  <MarkPaidModal
    payment={selectedPayment}
    open
    onOpenChange={(open) => !open && closeModal()}
  />
)}
{selectedPayment && activeModal === 'cancel' && (
  <CancelPaymentDialog
    payment={selectedPayment}
    open
    onOpenChange={(open) => !open && closeModal()}
  />
)}
{selectedPayment && activeModal === 'agreement' && (
  <CreateAgreementModal
    payment={selectedPayment}
    open
    onOpenChange={(open) => !open && closeModal()}
  />
)}
```

**Step 5: Run TypeScript check**

Run: `npx tsc --noEmit -p inertia/tsconfig.json`
Expected: No new errors

**Step 6: Commit**

```bash
git add inertia/containers/student-payments-container.tsx
git commit -m "feat: wire up payment actions menu with all modals"
```

---

### Task 10: Generate Tuyau API types and final verification

**Step 1: Generate API types**

Run: `node ace generate:manifest`

This regenerates `.adonisjs/api.ts` so Tuyau picks up the new agreement route and updated validators.

**Step 2: Run full TypeScript check**

Run: `npx tsc --noEmit -p inertia/tsconfig.json`

Fix any type errors that appear from the generated types.

**Step 3: Final commit**

```bash
git add .adonisjs/api.ts
git commit -m "chore: regenerate tuyau API types for agreement routes"
```
