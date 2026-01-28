import { useFormContext, useFieldArray } from 'react-hook-form'
import { useCallback, useMemo } from 'react'
import { Plus, Trash2, AlertCircle } from 'lucide-react'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { DocumentInput } from '~/components/forms/document-input'
import type { NewStudentFormData } from '../schema'

interface ResponsiblesStepProps {
  academicPeriodId?: string
}

export function ResponsiblesStep({ academicPeriodId }: ResponsiblesStepProps = {}) {
  const form = useFormContext<NewStudentFormData>()
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'responsibles',
  })
  // Use academicPeriodId from props or from form
  const formAcademicPeriodId = form.watch('billing.academicPeriodId')
  const effectiveAcademicPeriodId = academicPeriodId || formAcademicPeriodId

  // Watch student document for conflict check
  const studentDocumentNumber = form.watch('basicInfo.documentNumber')

  // Watch all responsibles for document conflict check
  const responsibles = form.watch('responsibles')

  // Check if responsible is adult (18+)
  const isAdult = useCallback((date: Date | undefined): boolean => {
    if (!date) return false
    const today = new Date()
    const age = today.getFullYear() - date.getFullYear()
    const monthDiff = today.getMonth() - date.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
      return age - 1 >= 18
    }
    return age >= 18
  }, [])

  // Check for document conflicts
  const documentConflicts = useMemo(() => {
    const conflicts: { type: 'student' | 'responsible'; index: number; otherIndex?: number }[] = []
    const cleanStudentDoc = studentDocumentNumber?.replace(/\D/g, '') || ''

    responsibles.forEach((resp, index) => {
      const cleanRespDoc = resp.documentNumber?.replace(/\D/g, '') || ''
      if (!cleanRespDoc) return

      // Check if same as student
      if (cleanStudentDoc && cleanRespDoc === cleanStudentDoc) {
        conflicts.push({ type: 'student', index })
      }

      // Check if same as other responsibles
      responsibles.forEach((otherResp, otherIndex) => {
        if (otherIndex <= index) return
        const cleanOtherDoc = otherResp.documentNumber?.replace(/\D/g, '') || ''
        if (cleanOtherDoc && cleanRespDoc === cleanOtherDoc) {
          conflicts.push({ type: 'responsible', index, otherIndex })
        }
      })
    })

    return conflicts
  }, [studentDocumentNumber, responsibles])

  const getDocumentConflictError = (index: number): string | null => {
    const conflict = documentConflicts.find(
      (c) => c.index === index || c.otherIndex === index
    )
    if (!conflict) return null
    if (conflict.type === 'student') {
      return 'Documento igual ao do aluno'
    }
    return 'Documento igual ao de outro responsável'
  }

  const addResponsible = () => {
    append({
      name: '',
      email: '',
      phone: '',
      documentType: 'CPF',
      documentNumber: '',
      birthDate: new Date(),
      isPedagogical: false,
      isFinancial: false,
    })
  }

  // Check for any underage responsibles
  const hasUnderageResponsibles = responsibles.some((resp) => !isAdult(resp.birthDate))

  return (
    <div className="space-y-4 py-4">
      {/* Show alerts for validation issues */}
      {(documentConflicts.length > 0 || hasUnderageResponsibles) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {documentConflicts.length > 0 && hasUnderageResponsibles ? (
              'Existem documentos duplicados e responsáveis menores de idade. Corrija antes de continuar.'
            ) : documentConflicts.length > 0 ? (
              'Existem documentos duplicados. Cada pessoa deve ter um documento único.'
            ) : (
              'Todos os responsáveis devem ser maiores de idade.'
            )}
          </AlertDescription>
        </Alert>
      )}

      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Nenhum responsável adicionado. Clique no botão abaixo para adicionar.
        </p>
      )}

      {fields.map((field, index) => (
        <Card key={field.id}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Responsável {index + 1}</CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(index)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name={`responsibles.${index}.name`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome*</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nome completo" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name={`responsibles.${index}.email`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email*</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="email@exemplo.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`responsibles.${index}.phone`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone*</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        maxLength={11}
                        placeholder="11999999999"
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '')
                          field.onChange(value)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name={`responsibles.${index}.birthDate`}
              render={({ field }) => {
                const birthDate = field.value
                const isAdultResponsible = isAdult(birthDate)
                const showAgeError = birthDate && !isAdultResponsible
                return (
                  <FormItem>
                    <FormLabel>Data de Nascimento*</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        className={showAgeError ? 'border-destructive' : ''}
                        value={field.value ? field.value.toISOString().split('T')[0] : ''}
                        onChange={(e) => {
                          const date = e.target.value ? new Date(e.target.value) : undefined
                          field.onChange(date)
                        }}
                      />
                    </FormControl>
                    {showAgeError && (
                      <p className="text-sm text-destructive">Responsável deve ser maior de idade</p>
                    )}
                    <FormMessage />
                  </FormItem>
                )
              }}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name={`responsibles.${index}.documentType`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Documento*</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="CPF">CPF</SelectItem>
                        <SelectItem value="RG">RG</SelectItem>
                        <SelectItem value="PASSPORT">Passaporte</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`responsibles.${index}.documentNumber`}
                render={({ field: docField }) => {
                  const docType = form.watch(`responsibles.${index}.documentType`)
                  const responsibleId = form.getValues(`responsibles.${index}.id`)
                  const conflictError = getDocumentConflictError(index)
                  return (
                    <FormItem>
                      <FormLabel>Número do Documento*</FormLabel>
                      <FormControl>
                        <DocumentInput
                          value={docField.value}
                          onChange={docField.onChange}
                          documentType={docType}
                          excludeUserId={responsibleId}
                          academicPeriodId={effectiveAcademicPeriodId}
                          placeholder="Número"
                        />
                      </FormControl>
                      {conflictError && (
                        <p className="text-sm text-destructive">{conflictError}</p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )
                }}
              />
            </div>

            <div className="flex gap-6">
              <FormField
                control={form.control}
                name={`responsibles.${index}.isPedagogical`}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="font-normal">Responsável Pedagógico</FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`responsibles.${index}.isFinancial`}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="font-normal">Responsável Financeiro</FormLabel>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
      ))}

      <Button type="button" variant="outline" onClick={addResponsible} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Adicionar Responsável
      </Button>
    </div>
  )
}
