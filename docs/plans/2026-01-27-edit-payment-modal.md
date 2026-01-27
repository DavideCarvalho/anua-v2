# Edit Payment Modal Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a modal to edit student payment information (contract, scholarship, payment method, installments) accessible from the students list actions menu.

**Architecture:** New modal component with tabs per academic period. Backend endpoints for fetching and updating student enrollments (StudentHasLevel). Reuses existing enrollment components (ContractDetailsCard, ScholarshipSelector, DiscountComparison).

**Tech Stack:** React, TanStack Query, react-hook-form, Zod, shadcn/ui Tabs, AdonisJS controllers

---

### Task 1: Backend - List Student Enrollments Endpoint

**Files:**
- Create: `app/controllers/students/list_enrollments_controller.ts`
- Modify: `start/routes.ts`

**Step 1: Create the controller**

```typescript
// app/controllers/students/list_enrollments_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import StudentHasLevel from '#models/student_has_level'

export default class ListEnrollmentsController {
  async handle({ params, response }: HttpContext) {
    const { id: studentId } = params

    const enrollments = await StudentHasLevel.query()
      .where('studentId', studentId)
      .preload('academicPeriod')
      .preload('contract')
      .preload('scholarship')
      .preload('level')
      .preload('class')
      .orderBy('createdAt', 'desc')

    return response.ok(enrollments)
  }
}
```

**Step 2: Add route**

Add to `start/routes.ts` inside the students group:

```typescript
router.get('/students/:id/enrollments', [ListEnrollmentsController]).as('students.enrollments.list')
```

**Step 3: Commit**

```bash
git add app/controllers/students/list_enrollments_controller.ts start/routes.ts
git commit -m "$(cat <<'EOF'
feat: add endpoint to list student enrollments

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Backend - Update Student Enrollment Endpoint

**Files:**
- Create: `app/controllers/students/update_enrollment_controller.ts`
- Create: `app/validators/student_enrollment.ts`
- Modify: `start/routes.ts`

**Step 1: Create the validator**

```typescript
// app/validators/student_enrollment.ts
import vine from '@vinejs/vine'

export const updateEnrollmentValidator = vine.compile(
  vine.object({
    contractId: vine.string().trim().optional(),
    scholarshipId: vine.string().trim().nullable().optional(),
    paymentMethod: vine.enum(['BOLETO', 'CREDIT_CARD', 'PIX'] as const).optional(),
    paymentDay: vine.number().min(1).max(31).optional(),
    installments: vine.number().min(1).max(12).optional(),
  })
)
```

**Step 2: Create the controller**

```typescript
// app/controllers/students/update_enrollment_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import StudentHasLevel from '#models/student_has_level'
import { updateEnrollmentValidator } from '#validators/student_enrollment'

export default class UpdateEnrollmentController {
  async handle({ params, request, response }: HttpContext) {
    const { id: studentId, enrollmentId } = params
    const payload = await request.validateUsing(updateEnrollmentValidator)

    const enrollment = await StudentHasLevel.query()
      .where('id', enrollmentId)
      .where('studentId', studentId)
      .firstOrFail()

    enrollment.merge(payload)
    await enrollment.save()

    // Reload with relations
    await enrollment.load('academicPeriod')
    await enrollment.load('contract')
    await enrollment.load('scholarship')
    await enrollment.load('level')
    await enrollment.load('class')

    return response.ok(enrollment)
  }
}
```

**Step 3: Add route**

Add to `start/routes.ts` inside the students group:

```typescript
router.patch('/students/:id/enrollments/:enrollmentId', [UpdateEnrollmentController]).as('students.enrollments.update')
```

**Step 4: Commit**

```bash
git add app/controllers/students/update_enrollment_controller.ts app/validators/student_enrollment.ts start/routes.ts
git commit -m "$(cat <<'EOF'
feat: add endpoint to update student enrollment payment info

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Frontend - Create useStudentEnrollments hook

**Files:**
- Create: `inertia/hooks/queries/use_student_enrollments.ts`

**Step 1: Create the hook**

```typescript
// inertia/hooks/queries/use_student_enrollments.ts
import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.api.v1.students({ id: '' }).enrollments.$get

export type StudentEnrollmentsResponse = InferResponseType<typeof $route>
export type StudentEnrollment = StudentEnrollmentsResponse[number]

export function useStudentEnrollmentsQueryOptions(studentId: string | null | undefined) {
  return {
    queryKey: ['student-enrollments', studentId],
    queryFn: async () => {
      if (!studentId) return []
      const response = await tuyau.api.v1.students({ id: studentId }).enrollments.$get()
      return response.data ?? []
    },
    enabled: !!studentId,
  } satisfies QueryOptions<StudentEnrollmentsResponse>
}
```

**Step 2: Commit**

```bash
git add inertia/hooks/queries/use_student_enrollments.ts
git commit -m "$(cat <<'EOF'
feat: add useStudentEnrollments hook

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Frontend - Create useUpdateEnrollment mutation hook

**Files:**
- Create: `inertia/hooks/mutations/use_update_enrollment.ts`

**Step 1: Create the mutation hook**

```typescript
// inertia/hooks/mutations/use_update_enrollment.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'

interface UpdateEnrollmentParams {
  studentId: string
  enrollmentId: string
  data: {
    contractId?: string
    scholarshipId?: string | null
    paymentMethod?: 'BOLETO' | 'CREDIT_CARD' | 'PIX'
    paymentDay?: number
    installments?: number
  }
}

export function useUpdateEnrollment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ studentId, enrollmentId, data }: UpdateEnrollmentParams) => {
      const response = await tuyau.api.v1
        .students({ id: studentId })
        .enrollments({ enrollmentId })
        .$patch(data)

      if (response.error) {
        throw new Error('Erro ao atualizar informações de pagamento')
      }

      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['student-enrollments', variables.studentId] })
      queryClient.invalidateQueries({ queryKey: ['students'] })
    },
  })
}
```

**Step 2: Commit**

```bash
git add inertia/hooks/mutations/use_update_enrollment.ts
git commit -m "$(cat <<'EOF'
feat: add useUpdateEnrollment mutation hook

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Frontend - Create EditPaymentModal component

**Files:**
- Create: `inertia/containers/students/edit-payment-modal/index.tsx`

**Step 1: Create the modal component**

```typescript
// inertia/containers/students/edit-payment-modal/index.tsx
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2, CreditCard } from 'lucide-react'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Input } from '~/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { Card, CardContent } from '~/components/ui/card'
import { Avatar, AvatarFallback } from '~/components/ui/avatar'
import { Skeleton } from '~/components/ui/skeleton'
import {
  useStudentEnrollmentsQueryOptions,
  type StudentEnrollment,
} from '~/hooks/queries/use_student_enrollments'
import { useContractQueryOptions } from '~/hooks/queries/use_contract'
import { useScholarshipsQueryOptions } from '~/hooks/queries/use_scholarships'
import { useUpdateEnrollment } from '~/hooks/mutations/use_update_enrollment'
import {
  ContractDetailsCard,
  ScholarshipSelector,
  DiscountComparison,
} from '~/components/enrollment'

const schema = z.object({
  contractId: z.string().min(1, 'Selecione um contrato'),
  scholarshipId: z.string().nullable(),
  paymentMethod: z.enum(['BOLETO', 'CREDIT_CARD', 'PIX']),
  paymentDay: z.number().min(1).max(31),
  installments: z.number().min(1).max(12),
  discountPercentage: z.number().min(0).max(100).optional(),
  enrollmentDiscountPercentage: z.number().min(0).max(100).optional(),
})

type FormData = z.infer<typeof schema>

const PaymentMethodLabels = {
  BOLETO: 'Boleto',
  CREDIT_CARD: 'Cartão de Crédito',
  PIX: 'PIX',
}

interface EditPaymentModalProps {
  studentId: string
  studentName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

function EnrollmentTabContent({
  enrollment,
  studentId,
  onSuccess,
}: {
  enrollment: StudentEnrollment
  studentId: string
  onSuccess?: () => void
}) {
  const updateEnrollment = useUpdateEnrollment()

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      contractId: enrollment.contractId ?? '',
      scholarshipId: enrollment.scholarshipId ?? null,
      paymentMethod: enrollment.paymentMethod ?? 'BOLETO',
      paymentDay: enrollment.paymentDay ?? 5,
      installments: enrollment.installments ?? 12,
      discountPercentage: 0,
      enrollmentDiscountPercentage: 0,
    },
  })

  const contractId = form.watch('contractId')
  const scholarshipId = form.watch('scholarshipId')
  const discountPercentage = form.watch('discountPercentage') ?? 0
  const enrollmentDiscountPercentage = form.watch('enrollmentDiscountPercentage') ?? 0

  // Fetch contract details
  const { data: contractData, isLoading: isLoadingContract } = useQuery({
    ...useContractQueryOptions(contractId),
    enabled: !!contractId,
  })

  // Fetch scholarships
  const { data: scholarshipsData } = useQuery({
    ...useScholarshipsQueryOptions({ active: true, limit: 100 }),
  })

  const scholarships = scholarshipsData?.data ?? []

  // Set discount percentages when scholarship changes
  useEffect(() => {
    if (scholarshipId) {
      const scholarship = scholarships.find((s) => s.id === scholarshipId)
      if (scholarship) {
        form.setValue('discountPercentage', scholarship.discountPercentage)
        form.setValue('enrollmentDiscountPercentage', scholarship.enrollmentDiscountPercentage)
      }
    } else {
      form.setValue('discountPercentage', 0)
      form.setValue('enrollmentDiscountPercentage', 0)
    }
  }, [scholarshipId, scholarships, form])

  // Initialize scholarship percentages from enrollment
  useEffect(() => {
    if (enrollment.scholarship) {
      form.setValue('discountPercentage', enrollment.scholarship.discountPercentage)
      form.setValue('enrollmentDiscountPercentage', enrollment.scholarship.enrollmentDiscountPercentage)
    }
  }, [enrollment, form])

  const handleScholarshipChange = (
    newScholarshipId: string | null,
    scholarship: { discountPercentage: number; enrollmentDiscountPercentage: number } | null
  ) => {
    form.setValue('scholarshipId', newScholarshipId)
    form.setValue('discountPercentage', scholarship?.discountPercentage ?? 0)
    form.setValue('enrollmentDiscountPercentage', scholarship?.enrollmentDiscountPercentage ?? 0)
  }

  async function handleSubmit(data: FormData) {
    try {
      await updateEnrollment.mutateAsync({
        studentId,
        enrollmentId: enrollment.id,
        data: {
          contractId: data.contractId,
          scholarshipId: data.scholarshipId,
          paymentMethod: data.paymentMethod,
          paymentDay: data.paymentDay,
          installments: data.installments,
        },
      })

      toast.success('Informações de pagamento atualizadas!')
      onSuccess?.()
    } catch (error) {
      console.error('Error updating enrollment:', error)
      toast.error('Erro ao atualizar informações de pagamento')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Contract Info Card */}
        {isLoadingContract ? (
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-4 gap-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </CardContent>
          </Card>
        ) : contractData ? (
          <ContractDetailsCard
            name={contractData.name}
            enrollmentValue={contractData.enrollmentValue}
            monthlyFee={contractData.amount}
            installments={contractData.installments}
            enrollmentInstallments={contractData.enrollmentValueInstallments}
            paymentType={contractData.paymentType}
          />
        ) : null}

        {/* Scholarship Selector */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <ScholarshipSelector
              scholarships={scholarships}
              value={scholarshipId}
              onChange={handleScholarshipChange}
              isLoading={false}
            />

            {(discountPercentage > 0 || enrollmentDiscountPercentage > 0) && contractData && (
              <DiscountComparison
                originalEnrollmentFee={contractData.enrollmentValue ?? 0}
                originalMonthlyFee={contractData.amount}
                enrollmentDiscountPercentage={enrollmentDiscountPercentage}
                monthlyDiscountPercentage={discountPercentage}
                installments={form.watch('installments')}
              />
            )}
          </CardContent>
        </Card>

        {/* Payment Info */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Forma de Pagamento</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
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

              <FormField
                control={form.control}
                name="paymentDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dia de Vencimento</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={31}
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
                name="installments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parcelas</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num}x
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={updateEnrollment.isPending}>
            {updateEnrollment.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar Alterações'
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export function EditPaymentModal({
  studentId,
  studentName,
  open,
  onOpenChange,
  onSuccess,
}: EditPaymentModalProps) {
  const { data: enrollments, isLoading } = useQuery({
    ...useStudentEnrollmentsQueryOptions(studentId),
    enabled: open && !!studentId,
  })

  // Group enrollments by academic period
  const enrollmentsByPeriod = useMemo(() => {
    if (!enrollments) return []
    return enrollments.filter((e) => e.academicPeriod).sort((a, b) => {
      const dateA = new Date(a.academicPeriod?.startDate ?? 0)
      const dateB = new Date(b.academicPeriod?.startDate ?? 0)
      return dateB.getTime() - dateA.getTime()
    })
  }, [enrollments])

  const defaultTab = enrollmentsByPeriod[0]?.academicPeriodId ?? ''

  function handleClose() {
    onOpenChange(false)
  }

  function handleSuccess() {
    onSuccess?.()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Editar Pagamento
          </DialogTitle>
        </DialogHeader>

        {/* Student Info */}
        <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback>
              {studentName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{studentName}</h3>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : enrollmentsByPeriod.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Este aluno não possui matrículas ativas.
          </div>
        ) : (
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="w-full justify-start">
              {enrollmentsByPeriod.map((enrollment) => (
                <TabsTrigger
                  key={enrollment.id}
                  value={enrollment.academicPeriodId ?? ''}
                >
                  {enrollment.academicPeriod?.name ?? 'Período'}
                </TabsTrigger>
              ))}
            </TabsList>

            {enrollmentsByPeriod.map((enrollment) => (
              <TabsContent key={enrollment.id} value={enrollment.academicPeriodId ?? ''}>
                <EnrollmentTabContent
                  enrollment={enrollment}
                  studentId={studentId}
                  onSuccess={handleSuccess}
                />
              </TabsContent>
            ))}
          </Tabs>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

**Step 2: Commit**

```bash
git add inertia/containers/students/edit-payment-modal/index.tsx
git commit -m "$(cat <<'EOF'
feat: add EditPaymentModal component

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: Frontend - Add "Editar Pagamento" action to students list

**Files:**
- Modify: `inertia/containers/students-list-container.tsx`

**Step 1: Import the new modal and add state**

At the top imports, add:
```typescript
import { EditPaymentModal } from './students/edit-payment-modal'
```

Add state alongside other modal states:
```typescript
const [editPaymentStudent, setEditPaymentStudent] = useState<StudentAction | null>(null)
```

**Step 2: Add callback to StudentsListContent props**

Add to the props type and destructuring:
```typescript
onEditPayment: (student: StudentAction) => void
```

**Step 3: Add dropdown menu item**

After "Mudar curso" menu item, add:
```typescript
<DropdownMenuItem
  onClick={() =>
    onEditPayment({
      id: student.id,
      name: student.user?.name || student.name,
    })
  }
>
  <CreditCard className="h-4 w-4 mr-2" />
  Editar pagamento
</DropdownMenuItem>
```

Import CreditCard icon at top:
```typescript
import { CreditCard } from 'lucide-react'
```

**Step 4: Add modal component**

After ChangeStudentCourseModal, add:
```typescript
{editPaymentStudent && (
  <EditPaymentModal
    studentId={editPaymentStudent.id}
    studentName={editPaymentStudent.name}
    open={!!editPaymentStudent}
    onOpenChange={(open) => {
      if (!open) setEditPaymentStudent(null)
    }}
    onSuccess={() => setEditPaymentStudent(null)}
  />
)}
```

**Step 5: Pass callback to StudentsListContent**

Add prop:
```typescript
onEditPayment={setEditPaymentStudent}
```

**Step 6: Commit**

```bash
git add inertia/containers/students-list-container.tsx
git commit -m "$(cat <<'EOF'
feat: add 'Editar Pagamento' action to students list

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: Regenerate API types and test

**Step 1: Regenerate tuyau types**

```bash
pnpm dev:api
```

Wait for types to be generated, then stop with Ctrl+C.

**Step 2: Run typecheck**

```bash
pnpm typecheck
```

Fix any type errors that appear.

**Step 3: Manual test**

1. Go to http://localhost:3333/escola/administrativo/alunos
2. Click the 3-dot menu on a student row
3. Click "Editar pagamento"
4. Verify modal opens with tabs for each academic period
5. Change scholarship and verify discount comparison updates
6. Change payment method and save
7. Verify toast appears and modal closes

**Step 4: Final commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
chore: fix any remaining type issues

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```
