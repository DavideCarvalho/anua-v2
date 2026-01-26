# Billing Step - Contrato e Bolsa Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Show linked contract details when selecting level in admin enrollment, with scholarship selection and discount comparison.

**Architecture:** Update the BillingStep component to fetch and display contract data when level is selected. Add scholarship dropdown with real-time discount calculation. Contract is linked directly to Level via `level.contractId`.

**Tech Stack:** AdonisJS, React, TanStack Query, react-hook-form, Zod, shadcn/ui

---

## Task 1: Create Contract Query Hook

**Files:**
- Create: `inertia/hooks/queries/use_contract.ts`

**Step 1: Create the hook file**

```typescript
// inertia/hooks/queries/use_contract.ts
import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.api.v1.contracts({ id: '' }).$get

export type ContractResponse = InferResponseType<typeof $route>

export function useContractQueryOptions(contractId: string | null | undefined) {
  return {
    queryKey: ['contract', contractId],
    queryFn: () => {
      if (!contractId) return null
      return tuyau.api.v1.contracts({ id: contractId }).$get().unwrap()
    },
    enabled: !!contractId,
  } satisfies QueryOptions<ContractResponse | null>
}
```

**Step 2: Verify hook compiles**

Run: `cd /home/dudousxd/personal/anua-v2 && pnpm typecheck`
Expected: No errors related to use_contract.ts

**Step 3: Commit**

```bash
git add inertia/hooks/queries/use_contract.ts
git commit -m "feat: add useContractQueryOptions hook"
```

---

## Task 2: Update Form Schema

**Files:**
- Modify: `inertia/containers/students/new-student-modal/schema.ts`

**Step 1: Add new fields to billing schema**

```typescript
// Add to billing object in newStudentSchema (around line 94-112)
billing: z.object({
  academicPeriodId: z.string().min(1, 'O período letivo é obrigatório'),
  courseId: z.string().min(1, 'O curso é obrigatório'),
  levelId: z.string().min(1, 'O nível é obrigatório'),
  classId: z.string().optional(),
  contractId: z.string().nullable().optional(),

  // Contract values
  monthlyFee: z.number().min(0, 'O valor deve ser maior ou igual a 0'),
  enrollmentFee: z.number().min(0).optional().default(0),
  installments: z.number().min(1).max(12),
  enrollmentInstallments: z.number().min(1).max(12).optional().default(1),
  flexibleInstallments: z.boolean().optional().default(true),

  // Payment
  paymentDate: z
    .number()
    .min(1, 'O dia deve ser maior que 0')
    .max(31, 'O dia deve ser menor ou igual a 31'),
  paymentMethod: z.enum(PaymentMethod),

  // Scholarship
  scholarshipId: z.string().nullable().optional(),
  discountPercentage: z.number().min(0).max(100).optional().default(0),
  enrollmentDiscountPercentage: z.number().min(0).max(100).optional().default(0),
}),
```

**Step 2: Verify schema compiles**

Run: `cd /home/dudousxd/personal/anua-v2 && pnpm typecheck`
Expected: No errors in schema.ts

**Step 3: Commit**

```bash
git add inertia/containers/students/new-student-modal/schema.ts
git commit -m "feat: update billing schema with contract and scholarship fields"
```

---

## Task 3: Create Contract Details Card Component

**Files:**
- Create: `inertia/components/enrollment/contract-details-card.tsx`

**Step 1: Create the component**

```typescript
// inertia/components/enrollment/contract-details-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { FileText } from 'lucide-react'

interface ContractDetailsCardProps {
  name: string
  enrollmentValue: number | null
  monthlyFee: number
  installments: number
  enrollmentInstallments: number
  paymentType: 'MONTHLY' | 'UPFRONT'
}

const PaymentTypeLabels = {
  MONTHLY: 'Mensal',
  UPFRONT: 'À Vista',
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function ContractDetailsCard({
  name,
  enrollmentValue,
  monthlyFee,
  installments,
  enrollmentInstallments,
  paymentType,
}: ContractDetailsCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Contrato: {name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {enrollmentValue !== null && enrollmentValue > 0 && (
            <div>
              <p className="text-sm text-muted-foreground">Taxa de Matrícula</p>
              <p className="font-medium">{formatCurrency(enrollmentValue)}</p>
              <p className="text-xs text-muted-foreground">{enrollmentInstallments}x</p>
            </div>
          )}
          <div>
            <p className="text-sm text-muted-foreground">Mensalidade</p>
            <p className="font-medium">{formatCurrency(monthlyFee)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Parcelas</p>
            <p className="font-medium">{installments}x</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Tipo</p>
            <p className="font-medium">{PaymentTypeLabels[paymentType]}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

**Step 2: Verify component compiles**

Run: `cd /home/dudousxd/personal/anua-v2 && pnpm typecheck`
Expected: No errors

**Step 3: Commit**

```bash
git add inertia/components/enrollment/contract-details-card.tsx
git commit -m "feat: add ContractDetailsCard component"
```

---

## Task 4: Create Scholarship Selector Component

**Files:**
- Create: `inertia/components/enrollment/scholarship-selector.tsx`

**Step 1: Create the component**

```typescript
// inertia/components/enrollment/scholarship-selector.tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Label } from '~/components/ui/label'
import { GraduationCap } from 'lucide-react'

interface Scholarship {
  id: string
  name: string
  discountPercentage: number
  enrollmentDiscountPercentage: number
  type: string
}

interface ScholarshipSelectorProps {
  scholarships: Scholarship[]
  value: string | null
  onChange: (scholarshipId: string | null, scholarship: Scholarship | null) => void
  disabled?: boolean
  isLoading?: boolean
}

export function ScholarshipSelector({
  scholarships,
  value,
  onChange,
  disabled,
  isLoading,
}: ScholarshipSelectorProps) {
  const handleChange = (selectedValue: string) => {
    if (selectedValue === 'none') {
      onChange(null, null)
    } else {
      const scholarship = scholarships.find((s) => s.id === selectedValue)
      onChange(selectedValue, scholarship || null)
    }
  }

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <GraduationCap className="h-4 w-4" />
        Aplicar Bolsa (opcional)
      </Label>
      <Select
        value={value || 'none'}
        onValueChange={handleChange}
        disabled={disabled || isLoading}
      >
        <SelectTrigger>
          <SelectValue
            placeholder={isLoading ? 'Carregando bolsas...' : 'Selecione uma bolsa'}
          />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Sem bolsa</SelectItem>
          {scholarships.map((scholarship) => (
            <SelectItem key={scholarship.id} value={scholarship.id}>
              {scholarship.name} ({scholarship.discountPercentage}% mensalidade
              {scholarship.enrollmentDiscountPercentage > 0 &&
                `, ${scholarship.enrollmentDiscountPercentage}% matrícula`}
              )
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
```

**Step 2: Verify component compiles**

Run: `cd /home/dudousxd/personal/anua-v2 && pnpm typecheck`
Expected: No errors

**Step 3: Commit**

```bash
git add inertia/components/enrollment/scholarship-selector.tsx
git commit -m "feat: add ScholarshipSelector component"
```

---

## Task 5: Create Discount Comparison Component

**Files:**
- Create: `inertia/components/enrollment/discount-comparison.tsx`

**Step 1: Create the component**

```typescript
// inertia/components/enrollment/discount-comparison.tsx
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { TrendingDown } from 'lucide-react'

interface DiscountComparisonProps {
  originalEnrollmentFee: number
  originalMonthlyFee: number
  enrollmentDiscountPercentage: number
  monthlyDiscountPercentage: number
  installments: number
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function DiscountComparison({
  originalEnrollmentFee,
  originalMonthlyFee,
  enrollmentDiscountPercentage,
  monthlyDiscountPercentage,
  installments,
}: DiscountComparisonProps) {
  const discountedEnrollmentFee =
    originalEnrollmentFee * (1 - enrollmentDiscountPercentage / 100)
  const discountedMonthlyFee = originalMonthlyFee * (1 - monthlyDiscountPercentage / 100)

  const enrollmentSavings = originalEnrollmentFee - discountedEnrollmentFee
  const monthlySavings = (originalMonthlyFee - discountedMonthlyFee) * installments
  const totalSavings = enrollmentSavings + monthlySavings

  const hasEnrollmentDiscount = enrollmentDiscountPercentage > 0 && originalEnrollmentFee > 0
  const hasMonthlyDiscount = monthlyDiscountPercentage > 0

  if (!hasEnrollmentDiscount && !hasMonthlyDiscount) {
    return null
  }

  return (
    <Card className="border-green-200 bg-green-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2 text-green-700">
          <TrendingDown className="h-4 w-4" />
          Comparativo de Desconto
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-4 gap-2 text-sm font-medium text-muted-foreground border-b pb-2">
          <span>Item</span>
          <span>Original</span>
          <span>Desconto</span>
          <span>Final</span>
        </div>

        {hasEnrollmentDiscount && (
          <div className="grid grid-cols-4 gap-2 text-sm">
            <span>Matrícula</span>
            <span className="line-through text-muted-foreground">
              {formatCurrency(originalEnrollmentFee)}
            </span>
            <span className="text-green-600">{enrollmentDiscountPercentage}%</span>
            <span className="font-medium">{formatCurrency(discountedEnrollmentFee)}</span>
          </div>
        )}

        {hasMonthlyDiscount && (
          <div className="grid grid-cols-4 gap-2 text-sm">
            <span>Mensalidade</span>
            <span className="line-through text-muted-foreground">
              {formatCurrency(originalMonthlyFee)}
            </span>
            <span className="text-green-600">{monthlyDiscountPercentage}%</span>
            <span className="font-medium">{formatCurrency(discountedMonthlyFee)}</span>
          </div>
        )}

        <div className="pt-2 border-t">
          <p className="text-sm font-medium text-green-700">
            Economia total: {formatCurrency(totalSavings)}/ano
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
```

**Step 2: Verify component compiles**

Run: `cd /home/dudousxd/personal/anua-v2 && pnpm typecheck`
Expected: No errors

**Step 3: Commit**

```bash
git add inertia/components/enrollment/discount-comparison.tsx
git commit -m "feat: add DiscountComparison component"
```

---

## Task 6: Create Required Documents List Component

**Files:**
- Create: `inertia/components/enrollment/required-documents-list.tsx`

**Step 1: Create the component**

```typescript
// inertia/components/enrollment/required-documents-list.tsx
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Paperclip, AlertCircle } from 'lucide-react'

interface ContractDocument {
  id: string
  name: string
  description: string | null
  required: boolean
}

interface RequiredDocumentsListProps {
  documents: ContractDocument[]
}

export function RequiredDocumentsList({ documents }: RequiredDocumentsListProps) {
  if (documents.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Paperclip className="h-4 w-4" />
          Documentos Exigidos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="flex items-start gap-2 text-sm py-1 border-b last:border-0"
          >
            <div className="flex-1">
              <p className="font-medium">
                {doc.name}
                {doc.required && <span className="text-destructive ml-1">*</span>}
              </p>
              {doc.description && (
                <p className="text-xs text-muted-foreground">{doc.description}</p>
              )}
            </div>
          </div>
        ))}
        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
          <AlertCircle className="h-3 w-3" />
          <span>
            Documentos pendentes ficarão disponíveis para o responsável completar depois.
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
```

**Step 2: Verify component compiles**

Run: `cd /home/dudousxd/personal/anua-v2 && pnpm typecheck`
Expected: No errors

**Step 3: Commit**

```bash
git add inertia/components/enrollment/required-documents-list.tsx
git commit -m "feat: add RequiredDocumentsList component"
```

---

## Task 7: Create Index Export for Enrollment Components

**Files:**
- Create: `inertia/components/enrollment/index.ts`

**Step 1: Create the index file**

```typescript
// inertia/components/enrollment/index.ts
export { ContractDetailsCard } from './contract-details-card'
export { ScholarshipSelector } from './scholarship-selector'
export { DiscountComparison } from './discount-comparison'
export { RequiredDocumentsList } from './required-documents-list'
```

**Step 2: Commit**

```bash
git add inertia/components/enrollment/index.ts
git commit -m "feat: add enrollment components index export"
```

---

## Task 8: Update BillingStep - Add Imports and State

**Files:**
- Modify: `inertia/containers/students/new-student-modal/steps/billing-step.tsx`

**Step 1: Add imports at top of file**

Replace current imports with:

```typescript
import { useEffect, useMemo } from 'react'
import { useFormContext } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Skeleton } from '~/components/ui/skeleton'
import { useAcademicPeriodsQueryOptions } from '~/hooks/queries/use_academic_periods'
import { useAcademicPeriodCoursesQueryOptions } from '~/hooks/queries/use_academic_period_courses'
import { useClassesQueryOptions } from '~/hooks/queries/use_classes'
import { useContractQueryOptions } from '~/hooks/queries/use_contract'
import { useScholarshipsQueryOptions } from '~/hooks/queries/use_scholarships'
import { getCourseLabel, getLevelLabel } from '~/lib/formatters'
import {
  ContractDetailsCard,
  ScholarshipSelector,
  DiscountComparison,
  RequiredDocumentsList,
} from '~/components/enrollment'
import type { AcademicPeriodSegment } from '~/lib/formatters'
import type { NewStudentFormData, PaymentMethod } from '../schema'
```

**Step 2: Verify imports compile**

Run: `cd /home/dudousxd/personal/anua-v2 && pnpm typecheck`
Expected: May have errors about missing components (will fix in next steps)

**Step 3: Commit**

```bash
git add inertia/containers/students/new-student-modal/steps/billing-step.tsx
git commit -m "feat(billing-step): add imports for contract and scholarship"
```

---

## Task 9: Update BillingStep - Add Contract and Scholarship Queries

**Files:**
- Modify: `inertia/containers/students/new-student-modal/steps/billing-step.tsx`

**Step 1: Add contract and scholarship queries after existing queries (around line 50)**

After the `classesData` query, add:

```typescript
  // Get contractId from selected level
  const selectedLevel = levels.find((l) => l.levelId === levelId)
  const contractId = selectedLevel?.contractId

  // Fetch contract details
  const { data: contractData, isLoading: isLoadingContract } = useQuery({
    ...useContractQueryOptions(contractId),
    enabled: !!contractId,
  })

  // Fetch scholarships
  const { data: scholarshipsData, isLoading: isLoadingScholarships } = useQuery({
    ...useScholarshipsQueryOptions({ active: true, limit: 100 }),
  })

  const scholarships = scholarshipsData?.data ?? []

  // Calculate months remaining until academic period ends
  const maxInstallments = useMemo(() => {
    if (!selectedPeriod?.endDate || !contractData) return 12
    const endDate = new Date(selectedPeriod.endDate)
    const now = new Date()
    const monthsDiff = (endDate.getFullYear() - now.getFullYear()) * 12 +
                       (endDate.getMonth() - now.getMonth())
    return Math.min(Math.max(monthsDiff, 1), contractData.installments)
  }, [selectedPeriod?.endDate, contractData])
```

**Step 2: Verify changes compile**

Run: `cd /home/dudousxd/personal/anua-v2 && pnpm typecheck`
Expected: No errors

**Step 3: Commit**

```bash
git add inertia/containers/students/new-student-modal/steps/billing-step.tsx
git commit -m "feat(billing-step): add contract and scholarship queries"
```

---

## Task 10: Update BillingStep - Auto-fill Contract Values

**Files:**
- Modify: `inertia/containers/students/new-student-modal/steps/billing-step.tsx`

**Step 1: Add useEffect to auto-fill form when contract loads (after queries)**

```typescript
  // Auto-fill form when contract is loaded
  useEffect(() => {
    if (contractData) {
      form.setValue('billing.contractId', contractData.id)
      form.setValue('billing.monthlyFee', contractData.amount)
      form.setValue('billing.enrollmentFee', contractData.enrollmentValue ?? 0)
      form.setValue('billing.installments', contractData.flexibleInstallments
        ? maxInstallments
        : contractData.installments)
      form.setValue('billing.enrollmentInstallments', contractData.enrollmentValueInstallments)
      form.setValue('billing.flexibleInstallments', contractData.flexibleInstallments)
    } else if (levelId && !contractId) {
      // Level selected but no contract - clear contract fields
      form.setValue('billing.contractId', null)
      form.setValue('billing.monthlyFee', 0)
      form.setValue('billing.enrollmentFee', 0)
    }
  }, [contractData, contractId, levelId, maxInstallments, form])

  // Handle scholarship selection
  const handleScholarshipChange = (
    scholarshipId: string | null,
    scholarship: { discountPercentage: number; enrollmentDiscountPercentage: number } | null
  ) => {
    form.setValue('billing.scholarshipId', scholarshipId)
    form.setValue('billing.discountPercentage', scholarship?.discountPercentage ?? 0)
    form.setValue('billing.enrollmentDiscountPercentage', scholarship?.enrollmentDiscountPercentage ?? 0)
  }

  const selectedScholarshipId = form.watch('billing.scholarshipId')
  const discountPercentage = form.watch('billing.discountPercentage') ?? 0
  const enrollmentDiscountPercentage = form.watch('billing.enrollmentDiscountPercentage') ?? 0
```

**Step 2: Verify changes compile**

Run: `cd /home/dudousxd/personal/anua-v2 && pnpm typecheck`
Expected: No errors

**Step 3: Commit**

```bash
git add inertia/containers/students/new-student-modal/steps/billing-step.tsx
git commit -m "feat(billing-step): auto-fill form with contract values"
```

---

## Task 11: Update BillingStep - Update JSX with Contract Card

**Files:**
- Modify: `inertia/containers/students/new-student-modal/steps/billing-step.tsx`

**Step 1: Add contract card section after academic info card**

After the closing `</Card>` of "Informações Acadêmicas" (around line 200), add:

```typescript
      {/* Contract Loading State */}
      {levelId && isLoadingContract && (
        <Card>
          <CardHeader className="pb-3">
            <Skeleton className="h-5 w-48" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contract Details */}
      {contractData && (
        <ContractDetailsCard
          name={contractData.name}
          enrollmentValue={contractData.enrollmentValue}
          monthlyFee={contractData.amount}
          installments={contractData.installments}
          enrollmentInstallments={contractData.enrollmentValueInstallments}
          paymentType={contractData.paymentType}
        />
      )}
```

**Step 2: Verify changes compile**

Run: `cd /home/dudousxd/personal/anua-v2 && pnpm typecheck`
Expected: No errors

**Step 3: Commit**

```bash
git add inertia/containers/students/new-student-modal/steps/billing-step.tsx
git commit -m "feat(billing-step): add contract details card"
```

---

## Task 12: Update BillingStep - Add Scholarship Section

**Files:**
- Modify: `inertia/containers/students/new-student-modal/steps/billing-step.tsx`

**Step 1: Add scholarship selector and discount comparison after contract card**

```typescript
      {/* Scholarship Selection */}
      {contractData && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <ScholarshipSelector
              scholarships={scholarships}
              value={selectedScholarshipId ?? null}
              onChange={handleScholarshipChange}
              isLoading={isLoadingScholarships}
            />

            {(discountPercentage > 0 || enrollmentDiscountPercentage > 0) && (
              <DiscountComparison
                originalEnrollmentFee={contractData.enrollmentValue ?? 0}
                originalMonthlyFee={contractData.amount}
                enrollmentDiscountPercentage={enrollmentDiscountPercentage}
                monthlyDiscountPercentage={discountPercentage}
                installments={form.watch('billing.installments')}
              />
            )}
          </CardContent>
        </Card>
      )}
```

**Step 2: Verify changes compile**

Run: `cd /home/dudousxd/personal/anua-v2 && pnpm typecheck`
Expected: No errors

**Step 3: Commit**

```bash
git add inertia/containers/students/new-student-modal/steps/billing-step.tsx
git commit -m "feat(billing-step): add scholarship selector and discount comparison"
```

---

## Task 13: Update BillingStep - Conditional Payment Section

**Files:**
- Modify: `inertia/containers/students/new-student-modal/steps/billing-step.tsx`

**Step 1: Wrap payment section with contract condition**

Replace the "Informações de Pagamento" Card with:

```typescript
      {/* Payment Info - Only show if contract exists */}
      {contractData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informações de Pagamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="billing.paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Forma de Pagamento*</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(['BOLETO', 'CREDIT_CARD', 'PIX'] as const).map((method) => (
                        <SelectItem key={method} value={method}>
                          {PaymentMethodLabels[method]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="billing.paymentDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dia de Vencimento*</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={31}
                        placeholder="5"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="billing.installments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parcelas Mensalidade*</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value?.toString()}
                      disabled={!contractData.flexibleInstallments}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.from(
                          { length: contractData.flexibleInstallments ? maxInstallments : 1 },
                          (_, i) => (contractData.flexibleInstallments ? i + 1 : contractData.installments)
                        ).map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num}x
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {!contractData.flexibleInstallments && (
                      <p className="text-xs text-muted-foreground">
                        Parcelas fixas definidas no contrato
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
      )}
```

**Step 2: Verify changes compile**

Run: `cd /home/dudousxd/personal/anua-v2 && pnpm typecheck`
Expected: No errors

**Step 3: Commit**

```bash
git add inertia/containers/students/new-student-modal/steps/billing-step.tsx
git commit -m "feat(billing-step): conditional payment section based on contract"
```

---

## Task 14: Update BillingStep - Add Required Documents Section

**Files:**
- Modify: `inertia/containers/students/new-student-modal/steps/billing-step.tsx`

**Step 1: Add documents list after payment section**

```typescript
      {/* Required Documents */}
      {contractData?.contractDocuments && contractData.contractDocuments.length > 0 && (
        <RequiredDocumentsList documents={contractData.contractDocuments} />
      )}
```

**Step 2: Verify changes compile**

Run: `cd /home/dudousxd/personal/anua-v2 && pnpm typecheck`
Expected: No errors

**Step 3: Commit**

```bash
git add inertia/containers/students/new-student-modal/steps/billing-step.tsx
git commit -m "feat(billing-step): add required documents list"
```

---

## Task 15: Update Default Values in Modal Index

**Files:**
- Modify: `inertia/containers/students/new-student-modal/index.tsx`

**Step 1: Update billing default values (around line 70-84)**

```typescript
      billing: {
        academicPeriodId: '',
        courseId: '',
        levelId: '',
        classId: '',
        contractId: null,
        monthlyFee: 0,
        enrollmentFee: 0,
        discount: 0,
        paymentDate: 5,
        paymentMethod: 'BOLETO',
        installments: 12,
        enrollmentInstallments: 1,
        flexibleInstallments: true,
        scholarshipId: null,
        discountPercentage: 0,
        enrollmentDiscountPercentage: 0,
      },
```

**Step 2: Verify changes compile**

Run: `cd /home/dudousxd/personal/anua-v2 && pnpm typecheck`
Expected: No errors

**Step 3: Commit**

```bash
git add inertia/containers/students/new-student-modal/index.tsx
git commit -m "feat(new-student-modal): update default billing values"
```

---

## Task 16: Update Validation in Modal Index

**Files:**
- Modify: `inertia/containers/students/new-student-modal/index.tsx`

**Step 1: Update billing validation in validateCurrentStep (around line 144-153)**

Find the case 4 validation and update to not require monthlyFee if no contract:

```typescript
      case 4:
        // Only validate payment fields if contract exists
        const contractId = form.getValues('billing.contractId')
        if (contractId) {
          isValid = await form.trigger([
            'billing.academicPeriodId',
            'billing.courseId',
            'billing.levelId',
            'billing.paymentDate',
            'billing.paymentMethod',
            'billing.installments',
          ])
        } else {
          isValid = await form.trigger([
            'billing.academicPeriodId',
            'billing.courseId',
            'billing.levelId',
          ])
        }
        break
```

**Step 2: Verify changes compile**

Run: `cd /home/dudousxd/personal/anua-v2 && pnpm typecheck`
Expected: No errors

**Step 3: Commit**

```bash
git add inertia/containers/students/new-student-modal/index.tsx
git commit -m "feat(new-student-modal): update validation for optional contract"
```

---

## Task 17: Update handleSubmit in Modal Index

**Files:**
- Modify: `inertia/containers/students/new-student-modal/index.tsx`

**Step 1: Update handleSubmit to include scholarship data (around line 207-228)**

```typescript
  async function handleSubmit(data: NewStudentFormData) {
    try {
      await enrollStudent.mutateAsync({
        basicInfo: {
          ...data.basicInfo,
          birthDate: data.basicInfo.birthDate.toISOString(),
        },
        responsibles: data.responsibles.map((r) => ({
          ...r,
          birthDate: r.birthDate.toISOString(),
        })),
        address: data.address,
        medicalInfo: data.medicalInfo,
        billing: {
          academicPeriodId: data.billing.academicPeriodId,
          classId: data.billing.classId || undefined,
          contractId: data.billing.contractId || undefined,
          monthlyFee: data.billing.monthlyFee,
          enrollmentFee: data.billing.enrollmentFee,
          discount: data.billing.discountPercentage,
          enrollmentDiscount: data.billing.enrollmentDiscountPercentage,
          paymentDate: data.billing.paymentDate,
          installments: data.billing.installments,
          enrollmentInstallments: data.billing.enrollmentInstallments,
          scholarshipId: data.billing.scholarshipId || undefined,
        },
      })

      toast.success('Aluno matriculado com sucesso!')
      handleClose()
    } catch (error: any) {
      console.error('Error enrolling student:', error)
      toast.error(error?.message || 'Erro ao matricular aluno')
    }
  }
```

**Step 2: Verify changes compile**

Run: `cd /home/dudousxd/personal/anua-v2 && pnpm typecheck`
Expected: No errors

**Step 3: Commit**

```bash
git add inertia/containers/students/new-student-modal/index.tsx
git commit -m "feat(new-student-modal): include scholarship in submit data"
```

---

## Task 18: Final Typecheck and Manual Test

**Step 1: Run full typecheck**

Run: `cd /home/dudousxd/personal/anua-v2 && pnpm typecheck`
Expected: No errors

**Step 2: Start dev server and test manually**

Run: `cd /home/dudousxd/personal/anua-v2 && pnpm dev`

Test checklist:
1. Go to `/escola/administrativo/alunos`
2. Click "Novo Aluno"
3. Fill steps 1-4
4. On step 5 (Cobrança):
   - Select a period
   - Select a course
   - Select a level WITH a contract
   - Verify contract card appears with values
   - Verify scholarship dropdown appears
   - Select a scholarship
   - Verify discount comparison appears
   - Verify documents list appears
   - Verify payment fields are filled from contract
5. Test selecting a level WITHOUT a contract
   - Verify payment section is hidden
   - Verify can still proceed with enrollment

**Step 3: Final commit**

```bash
git add -A
git commit -m "feat: complete billing step with contract and scholarship integration"
```
