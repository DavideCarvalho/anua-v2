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
  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: 'responsibles',
  })
  const { props } = usePage<SharedProps>()
  const schoolId = props.user?.schoolId ?? ''

  const [isAdding, setIsAdding] = useState(false)

  const responsibles = form.watch('responsibles')

  const hasPedagogical = responsibles.some((r) => r.isPedagogical)
  const hasFinancial = responsibles.some((r) => r.isFinancial)

  const existingDocuments = responsibles.map((r) => r.documentNumber?.replace(/\D/g, '') || '')
  const existingEmails = responsibles.map((r) => r.email?.trim().toLowerCase()).filter(Boolean) as string[]

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
          onUpdate={(data) => {
            const current = form.getValues(`responsibles.${index}`)
            update(index, { ...current, ...data })
          }}
          existingEmails={existingEmails.filter((e) => e !== responsibles[index]?.email?.trim().toLowerCase())}
          academicPeriodId={academicPeriodId}
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
          existingEmails={existingEmails}
          academicPeriodId={academicPeriodId}
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
