# Enrollment Page Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Convert the enrollment modal into a dedicated page at `/escola/administrativo/matriculas/nova` with a sidebar stepper, redesigned guardian step (CPF-first lookup), emergency contact checkbox, and a review step.

**Architecture:** The new page reuses the existing `EnrollStudentController` backend and `useEnrollStudent` mutation. The form state management stays with `react-hook-form` + Zod. We extract step components from the modal into a new `inertia/containers/enrollment/` directory, redesigning only the responsibles step and adding the review step. The schema is extended with `isEmergencyContact` on responsibles.

**Tech Stack:** AdonisJS 6 (Inertia), React, react-hook-form, Zod, TanStack Query, Tailwind CSS, shadcn/ui components, Lucide icons.

**Design doc:** `docs/plans/2026-02-03-enrollment-page-redesign.md`

---

### Task 1: Route & Page Controller

Create the backend route and page controller for the new enrollment page.

**Files:**
- Create: `app/controllers/pages/escola/show_nova_matricula_page_controller.ts`
- Modify: `start/routes.ts`

**Step 1: Create the page controller**

Create `app/controllers/pages/escola/show_nova_matricula_page_controller.ts`:

```typescript
import type { HttpContext } from '@adonisjs/core/http'

export default class ShowNovaMatriculaPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('escola/administrativo/matriculas/nova')
  }
}
```

**Step 2: Register the route**

In `start/routes.ts`:

1. Add lazy import near line ~2417 (after `ShowMatriculasPageController`):
```typescript
const ShowNovaMatriculaPageController = () =>
  import('#controllers/pages/escola/show_nova_matricula_page_controller')
```

2. Add route inside the escola group, after the existing matriculas route (~line 2700, after `administrativo.matriculas`):
```typescript
router
  .get('/administrativo/matriculas/nova', [ShowNovaMatriculaPageController])
  .as('administrativo.matriculas.nova')
```

**Important:** The `/nova` route MUST be registered BEFORE any `/:id` route for matriculas to avoid param collision.

**Step 3: Commit**

```bash
git add app/controllers/pages/escola/show_nova_matricula_page_controller.ts start/routes.ts
git commit -m "feat: add route and controller for enrollment page"
```

---

### Task 2: Schema — Add `isEmergencyContact` to responsibles

Extend the Zod schema to support the new emergency contact checkbox on guardians.

**Files:**
- Create: `inertia/containers/enrollment/schema.ts`

**Step 1: Create the new schema**

Create `inertia/containers/enrollment/schema.ts`. This is a copy of `inertia/containers/students/new-student-modal/schema.ts` with one addition — `isEmergencyContact: z.boolean()` in the responsibles array item.

```typescript
import { z } from 'zod'

export const PaymentMethod = ['BOLETO', 'CREDIT_CARD', 'PIX'] as const
export type PaymentMethod = (typeof PaymentMethod)[number]

export const DocumentType = ['CPF', 'RG', 'PASSPORT'] as const
export type DocumentType = (typeof DocumentType)[number]

export const EmergencyContactRelationship = [
  'MOTHER', 'FATHER', 'GRANDMOTHER', 'GRANDFATHER',
  'AUNT', 'UNCLE', 'COUSIN', 'NEPHEW', 'NIECE', 'GUARDIAN', 'OTHER',
] as const
export type EmergencyContactRelationship = (typeof EmergencyContactRelationship)[number]

export const EmergencyContactRelationshipLabels: Record<EmergencyContactRelationship, string> = {
  MOTHER: 'Mãe',
  FATHER: 'Pai',
  GRANDMOTHER: 'Avó',
  GRANDFATHER: 'Avô',
  AUNT: 'Tia',
  UNCLE: 'Tio',
  COUSIN: 'Primo(a)',
  NEPHEW: 'Sobrinho',
  NIECE: 'Sobrinha',
  GUARDIAN: 'Responsável Legal',
  OTHER: 'Outro',
}

export const enrollmentSchema = z.object({
  basicInfo: z
    .object({
      name: z.string().min(1, 'O nome é obrigatório'),
      email: z.string().email('Email inválido').optional().or(z.literal('')),
      phone: z.string().optional().or(z.literal('')),
      birthDate: z.date({ error: 'A data de nascimento é obrigatória' }),
      documentType: z.enum(DocumentType),
      documentNumber: z.string().optional().or(z.literal('')),
      isSelfResponsible: z.boolean(),
      whatsappContact: z.boolean(),
    })
    .refine(
      (data) => {
        const today = new Date()
        const birthDate = data.birthDate
        const age = today.getFullYear() - birthDate.getFullYear()
        const monthDiff = today.getMonth() - birthDate.getMonth()
        const isAdult =
          monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())
            ? age - 1 >= 18
            : age >= 18
        if (isAdult && (!data.phone || data.phone.length === 0)) return false
        return true
      },
      { message: 'O telefone é obrigatório para maiores de 18 anos', path: ['phone'] }
    )
    .refine(
      (data) => {
        const today = new Date()
        const birthDate = data.birthDate
        const age = today.getFullYear() - birthDate.getFullYear()
        const monthDiff = today.getMonth() - birthDate.getMonth()
        const isAdult =
          monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())
            ? age - 1 >= 18
            : age >= 18
        if (isAdult && (!data.documentNumber || data.documentNumber.length === 0)) return false
        return true
      },
      { message: 'O número do documento é obrigatório para maiores de 18 anos', path: ['documentNumber'] }
    ),
  responsibles: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string().min(1, 'O nome é obrigatório'),
      email: z.string().min(1, 'O email é obrigatório').email('Email inválido'),
      phone: z.string().min(1, 'O telefone é obrigatório'),
      documentType: z.enum(DocumentType),
      documentNumber: z.string().min(1, 'O número do documento é obrigatório'),
      birthDate: z.date({ error: 'A data de nascimento é obrigatória' }),
      isPedagogical: z.boolean(),
      isFinancial: z.boolean(),
      isEmergencyContact: z.boolean(),
      isExisting: z.boolean().optional(),
    })
  ),
  address: z.object({
    zipCode: z.string().min(1, 'O CEP é obrigatório'),
    street: z.string().min(1, 'A rua é obrigatória'),
    number: z.string().min(1, 'O número é obrigatório'),
    complement: z.string().optional(),
    neighborhood: z.string().min(1, 'O bairro é obrigatório'),
    city: z.string().min(1, 'A cidade é obrigatória'),
    state: z.string().min(1, 'O estado é obrigatório'),
  }),
  medicalInfo: z.object({
    conditions: z.string().optional(),
    medications: z
      .array(
        z.object({
          name: z.string().min(1, 'O nome do medicamento é obrigatório'),
          dosage: z.string().min(1, 'A dosagem é obrigatória'),
          frequency: z.string().min(1, 'A frequência é obrigatória'),
          instructions: z.string().optional(),
        })
      )
      .optional(),
    emergencyContacts: z.array(
      z.object({
        name: z.string().min(1, 'O nome é obrigatório'),
        phone: z.string().min(1, 'O telefone é obrigatório'),
        relationship: z.enum(EmergencyContactRelationship, {
          error: 'O parentesco é obrigatório',
        }),
        order: z.number(),
        responsibleIndex: z.number().optional(),
      })
    ),
  }),
  billing: z.object({
    academicPeriodId: z.string().min(1, 'O período letivo é obrigatório'),
    courseId: z.string().min(1, 'O curso é obrigatório'),
    levelId: z.string().min(1, 'O nível é obrigatório'),
    classId: z.string().optional(),
    contractId: z.string().nullable().optional(),
    monthlyFee: z.number().min(0, 'O valor deve ser maior ou igual a 0'),
    enrollmentFee: z.number().min(0).optional().default(0),
    installments: z.number().min(1).max(12),
    enrollmentInstallments: z.number().min(1).max(12).optional().default(1),
    flexibleInstallments: z.boolean().optional().default(true),
    paymentDate: z
      .number()
      .min(1, 'O dia deve ser maior que 0')
      .max(31, 'O dia deve ser menor ou igual a 31'),
    paymentMethod: z.enum(PaymentMethod),
    scholarshipId: z.string().nullable().optional(),
    discountPercentage: z.number().min(0).max(100).optional().default(0),
    enrollmentDiscountPercentage: z.number().min(0).max(100).optional().default(0),
  }),
})

export type EnrollmentFormData = z.infer<typeof enrollmentSchema>
```

**Key difference from old schema:** `isEmergencyContact: z.boolean()` and `isExisting: z.boolean().optional()` added to responsibles.

**Step 2: Commit**

```bash
git add inertia/containers/enrollment/schema.ts
git commit -m "feat: create enrollment schema with emergency contact flag"
```

---

### Task 3: Enrollment Sidebar Stepper

Create the vertical sidebar stepper component for the enrollment page.

**Files:**
- Create: `inertia/containers/enrollment/enrollment-sidebar.tsx`

**Step 1: Create the sidebar stepper**

This is a vertical stepper with 6 steps that shows in a sidebar. On mobile, it collapses to a compact top bar.

```typescript
import { cn } from '~/lib/utils'
import { Check, AlertCircle } from 'lucide-react'

export type StepStatus = 'pending' | 'success' | 'error' | 'disabled'

export interface EnrollmentStep {
  title: string
  description: string
  status: StepStatus
}

interface EnrollmentSidebarProps {
  steps: EnrollmentStep[]
  currentStep: number
  onStepClick: (index: number) => void
}

export function EnrollmentSidebar({ steps, currentStep, onStepClick }: EnrollmentSidebarProps) {
  return (
    <>
      {/* Mobile: compact top bar */}
      <div className="lg:hidden border-b px-4 py-3">
        <p className="text-sm text-muted-foreground">
          Etapa {currentStep + 1} de {steps.length}
        </p>
        <p className="text-sm font-medium">{steps[currentStep]?.title}</p>
      </div>

      {/* Desktop: vertical sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r bg-muted/30 p-6 shrink-0">
        <nav className="space-y-1">
          {steps.map((step, index) => {
            const isActive = index === currentStep
            const isCompleted = step.status === 'success'
            const isError = step.status === 'error'
            const isDisabled = step.status === 'disabled'

            return (
              <button
                key={step.title}
                type="button"
                onClick={() => !isDisabled && onStepClick(index)}
                disabled={isDisabled}
                className={cn(
                  'w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left transition-colors',
                  isActive && 'bg-primary/10',
                  !isActive && !isDisabled && 'hover:bg-muted',
                  isDisabled && 'opacity-40 cursor-not-allowed'
                )}
              >
                <div
                  className={cn(
                    'flex items-center justify-center w-7 h-7 rounded-full shrink-0 text-xs font-medium border-2 mt-0.5',
                    isCompleted && 'bg-primary border-primary text-primary-foreground',
                    isError && 'bg-destructive border-destructive text-destructive-foreground',
                    isActive && !isCompleted && !isError && 'border-primary text-primary',
                    !isActive && !isCompleted && !isError && !isDisabled && 'border-muted-foreground/30 text-muted-foreground/50'
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : isError ? (
                    <AlertCircle className="h-3.5 w-3.5" />
                  ) : (
                    index + 1
                  )}
                </div>
                <div>
                  <p
                    className={cn(
                      'text-sm font-medium',
                      isActive ? 'text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              </button>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
```

**Step 2: Commit**

```bash
git add inertia/containers/enrollment/enrollment-sidebar.tsx
git commit -m "feat: create vertical enrollment sidebar stepper"
```

---

### Task 4: Guardian CPF Lookup Component

Create the CPF-first lookup component for the responsibles step.

**Files:**
- Create: `inertia/containers/enrollment/components/guardian-cpf-lookup.tsx`

**Step 1: Create the component**

This component handles the CPF input, lookup, and either shows the existing guardian or expands the full form.

It uses the existing `CheckDocumentController` at `/api/v1/students/check-document` which returns `{ exists: boolean, userName: string | null }`.

However, we need more data (email, phone) to show in the read-only card. Check if the existing endpoint returns enough data. If not, we may need to extend it or use a different approach.

**Important discovery:** The current `CheckDocumentController` only returns `{ exists, userName }`. For the lookup card, we need `name, email, phone`. Two approaches:

**Approach A:** Create a new endpoint `/api/v1/students/lookup-responsible` that returns full guardian data when found by CPF.
**Approach B:** Extend the existing check-document endpoint to return more fields.

Go with **Approach A** — a dedicated lookup endpoint that returns the data we need for the card, keeping the existing check-document endpoint unchanged.

**Step 1a: Create the backend lookup controller**

Create `app/controllers/students/lookup_responsible_controller.ts`:

```typescript
import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import Role from '#models/role'

export default class LookupResponsibleController {
  async handle({ request, response }: HttpContext) {
    const { documentNumber, schoolId } = request.qs()

    if (!documentNumber) {
      return response.badRequest({ message: 'Número do documento é obrigatório' })
    }

    if (!schoolId) {
      return response.badRequest({ message: 'School ID é obrigatório' })
    }

    const responsibleRole = await Role.findBy('name', 'STUDENT_RESPONSIBLE')
    if (!responsibleRole) {
      return response.ok({ found: false })
    }

    const user = await User.query()
      .where('documentNumber', documentNumber.replace(/\D/g, ''))
      .where('schoolId', schoolId)
      .where('roleId', responsibleRole.id)
      .first()

    if (!user) {
      return response.ok({ found: false })
    }

    return response.ok({
      found: true,
      responsible: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        documentType: user.documentType,
        documentNumber: user.documentNumber,
        birthDate: user.birthDate,
      },
    })
  }
}
```

**Step 1b: Register the route**

In `start/routes.ts`, add in the API students group:

```typescript
const LookupResponsibleController = () =>
  import('#controllers/students/lookup_responsible_controller')
```

And the route:
```typescript
router.get('/lookup-responsible', [LookupResponsibleController])
```

Find the existing students API group (where `check-document` is registered) and add this route next to it.

**Step 1c: Create the frontend lookup component**

Create `inertia/containers/enrollment/components/guardian-cpf-lookup.tsx`:

```tsx
import { useState } from 'react'
import { Loader2, Search, UserCheck, UserPlus } from 'lucide-react'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import { Label } from '~/components/ui/label'
import { Card, CardContent } from '~/components/ui/card'
import { Checkbox } from '~/components/ui/checkbox'
import { Badge } from '~/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { DocumentType } from '../schema'
import type { EnrollmentFormData } from '../schema'

interface LookupResult {
  id: string
  name: string
  email: string
  phone: string
  documentType: string
  documentNumber: string
  birthDate: string
}

interface GuardianCpfLookupProps {
  schoolId: string
  onConfirm: (guardian: EnrollmentFormData['responsibles'][number]) => void
  onCancel: () => void
  existingDocuments: string[]
}

export function GuardianCpfLookup({
  schoolId,
  onConfirm,
  onCancel,
  existingDocuments,
}: GuardianCpfLookupProps) {
  const [cpf, setCpf] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searched, setSearched] = useState(false)
  const [lookupResult, setLookupResult] = useState<LookupResult | null>(null)

  // Role checkboxes
  const [isPedagogical, setIsPedagogical] = useState(false)
  const [isFinancial, setIsFinancial] = useState(false)
  const [isEmergencyContact, setIsEmergencyContact] = useState(true)

  // New guardian form fields (when not found)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [documentType, setDocumentType] = useState<string>('CPF')

  const cleanCpf = cpf.replace(/\D/g, '')
  const isDuplicate = existingDocuments.includes(cleanCpf)

  function formatCpf(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 11)
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
    if (digits.length <= 9)
      return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
  }

  async function handleSearch() {
    if (cleanCpf.length < 11) return

    setIsSearching(true)
    setSearched(false)
    setLookupResult(null)

    try {
      const params = new URLSearchParams({
        documentNumber: cleanCpf,
        schoolId,
      })
      const res = await fetch(`/api/v1/students/lookup-responsible?${params}`)
      const data = await res.json()

      if (data.found) {
        setLookupResult(data.responsible)
      }
      setSearched(true)
    } catch {
      setSearched(true)
    } finally {
      setIsSearching(false)
    }
  }

  function handleConfirmExisting() {
    if (!lookupResult) return
    onConfirm({
      id: lookupResult.id,
      name: lookupResult.name,
      email: lookupResult.email,
      phone: lookupResult.phone,
      documentType: lookupResult.documentType as any,
      documentNumber: lookupResult.documentNumber,
      birthDate: new Date(lookupResult.birthDate),
      isPedagogical,
      isFinancial,
      isEmergencyContact,
      isExisting: true,
    })
  }

  function handleConfirmNew() {
    onConfirm({
      name,
      email,
      phone,
      documentType: documentType as any,
      documentNumber: cleanCpf,
      birthDate: birthDate ? new Date(birthDate) : new Date(),
      isPedagogical,
      isFinancial,
      isEmergencyContact,
      isExisting: false,
    })
  }

  return (
    <Card className="border-dashed">
      <CardContent className="pt-4 space-y-4">
        {/* CPF Input */}
        <div className="space-y-2">
          <Label>CPF do responsável</Label>
          <div className="flex gap-2">
            <Input
              value={cpf}
              onChange={(e) => {
                setCpf(formatCpf(e.target.value))
                setSearched(false)
                setLookupResult(null)
              }}
              placeholder="000.000.000-00"
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleSearch}
              disabled={cleanCpf.length < 11 || isSearching || isDuplicate}
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
          {isDuplicate && (
            <p className="text-sm text-destructive">
              Este CPF já foi adicionado como responsável
            </p>
          )}
        </div>

        {/* Found: read-only card */}
        {searched && lookupResult && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-emerald-600">
              <UserCheck className="h-4 w-4" />
              Responsável encontrado
            </div>
            <div className="rounded-lg bg-muted/50 p-4 space-y-1">
              <p className="font-medium">{lookupResult.name}</p>
              <p className="text-sm text-muted-foreground">{lookupResult.email}</p>
              <p className="text-sm text-muted-foreground">{lookupResult.phone}</p>
            </div>

            {/* Role checkboxes */}
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={isPedagogical} onCheckedChange={(v) => setIsPedagogical(!!v)} />
                Responsável Pedagógico
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={isFinancial} onCheckedChange={(v) => setIsFinancial(!!v)} />
                Responsável Financeiro
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={isEmergencyContact}
                  onCheckedChange={(v) => setIsEmergencyContact(!!v)}
                />
                Contato de Emergência
              </label>
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="button" onClick={handleConfirmExisting}>
                Confirmar
              </Button>
            </div>
          </div>
        )}

        {/* Not found: full form */}
        {searched && !lookupResult && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <UserPlus className="h-4 w-4" />
              Nenhum responsável encontrado — preencha os dados
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome*</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome completo" />
              </div>
              <div className="space-y-2">
                <Label>Data de Nascimento*</Label>
                <Input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email*</Label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemplo.com" />
              </div>
              <div className="space-y-2">
                <Label>Telefone*</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="11999999999"
                  maxLength={11}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Documento</Label>
                <Select value={documentType} onValueChange={setDocumentType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CPF">CPF</SelectItem>
                    <SelectItem value="RG">RG</SelectItem>
                    <SelectItem value="PASSPORT">Passaporte</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Número do Documento</Label>
                <Input value={formatCpf(cpf)} disabled className="bg-muted" />
              </div>
            </div>

            {/* Role checkboxes */}
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={isPedagogical} onCheckedChange={(v) => setIsPedagogical(!!v)} />
                Responsável Pedagógico
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={isFinancial} onCheckedChange={(v) => setIsFinancial(!!v)} />
                Responsável Financeiro
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={isEmergencyContact}
                  onCheckedChange={(v) => setIsEmergencyContact(!!v)}
                />
                Contato de Emergência
              </label>
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="button" onClick={handleConfirmNew} disabled={!name || !email || !phone || !birthDate}>
                Confirmar
              </Button>
            </div>
          </div>
        )}

        {/* Initial state: just cancel */}
        {!searched && (
          <div className="flex justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

**Step 2: Commit**

```bash
git add app/controllers/students/lookup_responsible_controller.ts start/routes.ts inertia/containers/enrollment/components/guardian-cpf-lookup.tsx
git commit -m "feat: add guardian CPF lookup component and API endpoint"
```

---

### Task 5: Guardian Card Component

Create the read-only card that displays an added guardian in the list.

**Files:**
- Create: `inertia/containers/enrollment/components/guardian-card.tsx`

**Step 1: Create the component**

```tsx
import { X } from 'lucide-react'
import { Card, CardContent } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import type { EnrollmentFormData } from '../schema'

interface GuardianCardProps {
  guardian: EnrollmentFormData['responsibles'][number]
  onRemove: () => void
}

export function GuardianCard({ guardian, onRemove }: GuardianCardProps) {
  function formatCpf(doc: string) {
    const d = doc.replace(/\D/g, '')
    if (d.length !== 11) return doc
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
  }

  return (
    <Card>
      <CardContent className="py-3 flex items-center justify-between">
        <div className="space-y-1">
          <p className="font-medium text-sm">{guardian.name}</p>
          <p className="text-xs text-muted-foreground">
            {guardian.documentType}: {formatCpf(guardian.documentNumber)}
          </p>
          <div className="flex gap-1.5 flex-wrap">
            {guardian.isPedagogical && (
              <Badge variant="secondary" className="text-xs">
                Pedagógico
              </Badge>
            )}
            {guardian.isFinancial && (
              <Badge variant="secondary" className="text-xs">
                Financeiro
              </Badge>
            )}
            {guardian.isEmergencyContact && (
              <Badge variant="outline" className="text-xs">
                Emergência
              </Badge>
            )}
          </div>
        </div>
        <Button type="button" variant="ghost" size="icon" onClick={onRemove}>
          <X className="h-4 w-4 text-muted-foreground" />
        </Button>
      </CardContent>
    </Card>
  )
}
```

**Step 2: Commit**

```bash
git add inertia/containers/enrollment/components/guardian-card.tsx
git commit -m "feat: add guardian card component"
```

---

### Task 6: Enrollment Step Components

Port existing steps from the modal to the new enrollment directory. Steps 1, 3, 4, 5 are mostly unchanged. Step 2 is redesigned.

**Files:**
- Create: `inertia/containers/enrollment/steps/student-step.tsx` (port from `new-student-modal/steps/student-info-step.tsx`)
- Create: `inertia/containers/enrollment/steps/responsibles-step.tsx` (redesigned)
- Create: `inertia/containers/enrollment/steps/address-step.tsx` (port from `new-student-modal/steps/address-step.tsx`)
- Create: `inertia/containers/enrollment/steps/medical-step.tsx` (port with changes for read-only emergency contacts)
- Create: `inertia/containers/enrollment/steps/billing-step.tsx` (port from `new-student-modal/steps/billing-step.tsx`)

**Step 1: Port student-step.tsx**

Copy `inertia/containers/students/new-student-modal/steps/student-info-step.tsx` to `inertia/containers/enrollment/steps/student-step.tsx`. Change the import from `../schema` to `../schema` (relative to enrollment dir). Change `NewStudentFormData` to `EnrollmentFormData`. Change `newStudentSchema` references if any.

**Step 2: Create redesigned responsibles-step.tsx**

```tsx
import { useState } from 'react'
import { useFormContext, useFieldArray } from 'react-hook-form'
import { Plus, AlertCircle, Users } from 'lucide-react'
import { usePage } from '@inertiajs/react'
import { Button } from '~/components/ui/button'
import { Alert, AlertDescription } from '~/components/ui/alert'
import type { SharedProps } from '~/lib/types'
import type { EnrollmentFormData } from '../schema'
import { GuardianCpfLookup } from '../components/guardian-cpf-lookup'
import { GuardianCard } from '../components/guardian-card'

interface ResponsiblesStepProps {
  academicPeriodId?: string
}

export function ResponsiblesStep({ academicPeriodId }: ResponsiblesStepProps) {
  const form = useFormContext<EnrollmentFormData>()
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'responsibles',
  })
  const { props } = usePage<SharedProps>()
  const schoolId = props.user?.school?.id ?? ''

  const [isAdding, setIsAdding] = useState(false)

  const responsibles = form.watch('responsibles')

  const hasPedagogical = responsibles.some((r) => r.isPedagogical)
  const hasFinancial = responsibles.some((r) => r.isFinancial)

  const existingDocuments = responsibles.map((r) => r.documentNumber?.replace(/\D/g, '') || '')

  return (
    <div className="space-y-4 py-4">
      {form.formState.errors.root?.message && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{form.formState.errors.root.message}</AlertDescription>
        </Alert>
      )}

      {fields.length === 0 && !isAdding && (
        <div className="text-center py-8 text-muted-foreground">
          <Users className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-sm">Nenhum responsável adicionado</p>
        </div>
      )}

      {/* List of added guardians */}
      {fields.map((field, index) => (
        <GuardianCard
          key={field.id}
          guardian={responsibles[index]}
          onRemove={() => remove(index)}
        />
      ))}

      {/* CPF lookup (when adding) */}
      {isAdding && (
        <GuardianCpfLookup
          schoolId={schoolId}
          onConfirm={(guardian) => {
            append(guardian)
            setIsAdding(false)
          }}
          onCancel={() => setIsAdding(false)}
          existingDocuments={existingDocuments}
        />
      )}

      {/* Add button */}
      {!isAdding && (
        <Button type="button" variant="outline" onClick={() => setIsAdding(true)} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Responsável
        </Button>
      )}

      {/* Validation hints */}
      {fields.length > 0 && (!hasPedagogical || !hasFinancial) && (
        <p className="text-xs text-muted-foreground text-center">
          {!hasPedagogical && !hasFinancial
            ? 'É necessário pelo menos um responsável financeiro e um pedagógico'
            : !hasPedagogical
              ? 'É necessário pelo menos um responsável pedagógico'
              : 'É necessário pelo menos um responsável financeiro'}
        </p>
      )}
    </div>
  )
}
```

**Step 3: Port address-step.tsx**

Copy `inertia/containers/students/new-student-modal/steps/address-step.tsx` to `inertia/containers/enrollment/steps/address-step.tsx`. Update imports to use `EnrollmentFormData` from `../schema`.

**Step 4: Create medical-step.tsx with read-only emergency contacts from guardians**

Port from `inertia/containers/students/new-student-modal/steps/medical-info-step.tsx` with these changes:
- Responsibles marked as `isEmergencyContact` appear as read-only cards at the top of the emergency contacts section
- The existing manual add flow remains for additional contacts
- Update type imports to `EnrollmentFormData`

**Step 5: Port billing-step.tsx**

Copy `inertia/containers/students/new-student-modal/steps/billing-step.tsx` to `inertia/containers/enrollment/steps/billing-step.tsx`. Update imports to use `EnrollmentFormData` from `../schema`.

**Step 6: Commit**

```bash
git add inertia/containers/enrollment/steps/
git commit -m "feat: create enrollment step components with redesigned responsibles"
```

---

### Task 7: Review Step

Create the review step that shows a summary of all form data.

**Files:**
- Create: `inertia/containers/enrollment/steps/review-step.tsx`

**Step 1: Create the review step**

```tsx
import { useFormContext } from 'react-hook-form'
import { Pencil } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import type { EnrollmentFormData } from '../schema'

interface ReviewStepProps {
  onGoToStep: (step: number) => void
  courseName?: string
  levelName?: string
  className?: string
  contractName?: string
}

export function ReviewStep({ onGoToStep, courseName, levelName, className, contractName }: ReviewStepProps) {
  const form = useFormContext<EnrollmentFormData>()
  const data = form.getValues()

  const PaymentMethodLabels: Record<string, string> = {
    BOLETO: 'Boleto',
    CREDIT_CARD: 'Cartão de Crédito',
    PIX: 'PIX',
  }

  function formatDate(date: Date) {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('pt-BR')
  }

  function formatCpf(doc: string) {
    const d = doc?.replace(/\D/g, '') || ''
    if (d.length !== 11) return doc || '—'
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
  }

  function EditLink({ step }: { step: number }) {
    return (
      <Button type="button" variant="ghost" size="sm" onClick={() => onGoToStep(step)}>
        <Pencil className="h-3.5 w-3.5 mr-1" />
        Editar
      </Button>
    )
  }

  return (
    <div className="space-y-4 py-4">
      {/* Student */}
      <Card>
        <CardHeader className="pb-2 flex-row items-center justify-between">
          <CardTitle className="text-base">Aluno</CardTitle>
          <EditLink step={0} />
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p><span className="text-muted-foreground">Nome:</span> {data.basicInfo.name}</p>
          <p><span className="text-muted-foreground">Nascimento:</span> {formatDate(data.basicInfo.birthDate)}</p>
          {data.basicInfo.documentNumber && (
            <p><span className="text-muted-foreground">Documento:</span> {data.basicInfo.documentType} — {formatCpf(data.basicInfo.documentNumber)}</p>
          )}
          {data.basicInfo.email && (
            <p><span className="text-muted-foreground">Email:</span> {data.basicInfo.email}</p>
          )}
          {data.basicInfo.phone && (
            <p><span className="text-muted-foreground">Telefone:</span> {data.basicInfo.phone}</p>
          )}
        </CardContent>
      </Card>

      {/* Responsibles */}
      {!data.basicInfo.isSelfResponsible && data.responsibles.length > 0 && (
        <Card>
          <CardHeader className="pb-2 flex-row items-center justify-between">
            <CardTitle className="text-base">Responsáveis</CardTitle>
            <EditLink step={1} />
          </CardHeader>
          <CardContent className="space-y-3">
            {data.responsibles.map((resp, i) => (
              <div key={i} className="space-y-1">
                <p className="text-sm font-medium">{resp.name}</p>
                <p className="text-xs text-muted-foreground">{resp.documentType}: {formatCpf(resp.documentNumber)}</p>
                <div className="flex gap-1.5 flex-wrap">
                  {resp.isPedagogical && <Badge variant="secondary" className="text-xs">Pedagógico</Badge>}
                  {resp.isFinancial && <Badge variant="secondary" className="text-xs">Financeiro</Badge>}
                  {resp.isEmergencyContact && <Badge variant="outline" className="text-xs">Emergência</Badge>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Address */}
      <Card>
        <CardHeader className="pb-2 flex-row items-center justify-between">
          <CardTitle className="text-base">Endereço</CardTitle>
          <EditLink step={2} />
        </CardHeader>
        <CardContent className="text-sm">
          <p>
            {data.address.street}, {data.address.number}
            {data.address.complement ? ` — ${data.address.complement}` : ''}
          </p>
          <p className="text-muted-foreground">
            {data.address.neighborhood} — {data.address.city}/{data.address.state} — CEP {data.address.zipCode}
          </p>
        </CardContent>
      </Card>

      {/* Medical Info */}
      <Card>
        <CardHeader className="pb-2 flex-row items-center justify-between">
          <CardTitle className="text-base">Informações Médicas</CardTitle>
          <EditLink step={3} />
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          {data.medicalInfo.conditions ? (
            <p><span className="text-muted-foreground">Condições:</span> {data.medicalInfo.conditions}</p>
          ) : (
            <p className="text-muted-foreground">Sem condições registradas</p>
          )}
          {data.medicalInfo.medications && data.medicalInfo.medications.length > 0 && (
            <p><span className="text-muted-foreground">Medicamentos:</span> {data.medicalInfo.medications.length}</p>
          )}
          <p>
            <span className="text-muted-foreground">Contatos de emergência:</span>{' '}
            {data.medicalInfo.emergencyContacts.map((c) => c.name).join(', ') || '—'}
          </p>
        </CardContent>
      </Card>

      {/* Billing */}
      <Card>
        <CardHeader className="pb-2 flex-row items-center justify-between">
          <CardTitle className="text-base">Cobrança</CardTitle>
          <EditLink step={4} />
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          {courseName && <p><span className="text-muted-foreground">Curso:</span> {courseName}</p>}
          {levelName && <p><span className="text-muted-foreground">Nível:</span> {levelName}</p>}
          {className && <p><span className="text-muted-foreground">Turma:</span> {className}</p>}
          {contractName && <p><span className="text-muted-foreground">Contrato:</span> {contractName}</p>}
          <p><span className="text-muted-foreground">Pagamento:</span> {PaymentMethodLabels[data.billing.paymentMethod] || data.billing.paymentMethod} — dia {data.billing.paymentDate}</p>
          <p><span className="text-muted-foreground">Parcelas:</span> {data.billing.installments}x</p>
        </CardContent>
      </Card>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add inertia/containers/enrollment/steps/review-step.tsx
git commit -m "feat: add enrollment review step"
```

---

### Task 8: Main Enrollment Page Container

Create the main container that orchestrates form state, step navigation, and the sidebar.

**Files:**
- Create: `inertia/containers/enrollment/enrollment-page.tsx`

**Step 1: Create the main container**

This is the biggest file. It ports the logic from `new-student-modal/index.tsx` but:
- Uses the new sidebar stepper layout
- Has 6 steps (with review)
- Adds validation for `isPedagogical` and `isFinancial` in step 1
- Handles emergency contact auto-population from `isEmergencyContact` guardians
- On submit, redirects to `/escola/administrativo/matriculas` with Inertia

The core form logic (validation, submission, step navigation) stays the same as the modal. Key changes:
- `STEPS_CONFIG` has 6 items
- Validation for step 1 (responsibles) checks `hasPedagogical && hasFinancial`
- When moving from address to medical (step 2→3), auto-populate emergency contacts from guardians marked as `isEmergencyContact`
- Step 5 is review — no validation needed, just display
- Submit on step 5 (review) instead of step 4

Port the full logic from `new-student-modal/index.tsx` adapting:
- Dialog → div with sidebar layout
- `handleClose` → Inertia visit back to list
- Academic period selector moves into the page top area
- All imports reference the new `../schema` and new step components

**Step 2: Commit**

```bash
git add inertia/containers/enrollment/enrollment-page.tsx
git commit -m "feat: create enrollment page container with sidebar stepper"
```

---

### Task 9: Inertia Page

Create the actual page file and wire it to the layout.

**Files:**
- Create: `inertia/pages/escola/administrativo/matriculas/nova.tsx`

**Step 1: Create the page**

```tsx
import { Head } from '@inertiajs/react'
import { EscolaLayout } from '../../../../components/layouts'
import { EnrollmentPage } from '../../../../containers/enrollment/enrollment-page'

export default function NovaMatriculaPage() {
  return (
    <EscolaLayout>
      <Head title="Nova Matrícula" />
      <EnrollmentPage />
    </EscolaLayout>
  )
}
```

**Step 2: Commit**

```bash
git add inertia/pages/escola/administrativo/matriculas/nova.tsx
git commit -m "feat: create nova matricula inertia page"
```

---

### Task 10: Wire Up — Replace Modal with Page Link

Update the existing enrollment list to link to the new page instead of opening the modal.

**Files:**
- Modify: `inertia/containers/students-list-container.tsx` — replace modal button with Inertia Link
- Modify: `inertia/containers/enrollment-management/enrollments-table.tsx` — add "Nova Matrícula" link if not present

**Step 1: Update students-list-container.tsx**

Replace the "Novo Aluno" button that opens the modal with an Inertia `Link` to `/escola/administrativo/matriculas/nova`. Remove the modal state (`isNewStudentModalOpen`) and the `<NewStudentModal>` component render.

**Step 2: Add link to enrollments-table.tsx if needed**

Check if the enrollments table also needs a "Nova Matrícula" button/link. If so, add an Inertia Link.

**Step 3: Commit**

```bash
git add inertia/containers/students-list-container.tsx inertia/containers/enrollment-management/enrollments-table.tsx
git commit -m "feat: replace enrollment modal with link to new page"
```

---

### Task 11: Verify & Test

Manual verification of the complete flow.

**Step 1: Run the dev server**

```bash
npm run dev
```

**Step 2: Test the flow**

1. Navigate to `/escola/administrativo/matriculas`
2. Click "Nova Matrícula" — should navigate to `/escola/administrativo/matriculas/nova`
3. Select an academic period
4. Fill step 1 (student data) → click "Próximo"
5. In step 2, click "Adicionar Responsável" → enter a CPF
   - If CPF found: verify read-only card appears with name/email/phone
   - If CPF not found: verify full form appears with CPF pre-filled
   - Check all 3 checkboxes (pedagógico, financeiro, emergência) → Confirm
6. Step 3: fill address with CEP lookup
7. Step 4: verify the guardian marked as emergency contact appears as read-only in the emergency contacts section
8. Step 5: fill billing/payment
9. Step 6: review all data, click "Editar" links to go back to specific steps
10. Click "Confirmar Matrícula" — should submit and redirect

**Step 3: Commit any fixes**

```bash
git add -A
git commit -m "fix: enrollment page adjustments from testing"
```
