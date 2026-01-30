import { useFormContext } from 'react-hook-form'
import { useCallback, useEffect, useMemo } from 'react'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { Checkbox } from '~/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { DocumentInput } from '~/components/forms/document-input'
import { EmailInput } from '~/components/forms/email-input'
import type { NewStudentFormData } from '../schema'

interface StudentInfoStepProps {
  excludeUserId?: string
  academicPeriodId?: string
}

export function StudentInfoStep({ excludeUserId, academicPeriodId }: StudentInfoStepProps = {}) {
  const form = useFormContext<NewStudentFormData>()
  const birthDate = form.watch('basicInfo.birthDate')
  const isSelfResponsible = form.watch('basicInfo.isSelfResponsible')
  const documentType = form.watch('basicInfo.documentType')
  const documentNumber = form.watch('basicInfo.documentNumber')
  // Use academicPeriodId from props or from form (for new student modal)
  const formAcademicPeriodId = form.watch('billing.academicPeriodId')
  const effectiveAcademicPeriodId = academicPeriodId || formAcademicPeriodId

  // Watch responsibles to check for document conflicts
  const responsibles = form.watch('responsibles')

  // Watch student email for conflict check
  const studentEmail = form.watch('basicInfo.email')

  // Check if student document matches any responsible's document
  const documentConflictWithResponsible = useMemo(() => {
    const cleanStudentDoc = documentNumber?.replace(/\D/g, '') || ''
    if (!cleanStudentDoc || !responsibles?.length) return null

    const conflictIndex = responsibles.findIndex((resp) => {
      const cleanRespDoc = resp.documentNumber?.replace(/\D/g, '') || ''
      return cleanRespDoc && cleanRespDoc === cleanStudentDoc
    })

    if (conflictIndex >= 0) {
      return responsibles[conflictIndex].name || `Responsável ${conflictIndex + 1}`
    }
    return null
  }, [documentNumber, responsibles])

  // Check if student email matches any responsible's email
  const emailConflictWithResponsible = useMemo(() => {
    const cleanStudentEmail = studentEmail?.toLowerCase().trim() || ''
    if (!cleanStudentEmail || !responsibles?.length) return null

    const conflictIndex = responsibles.findIndex((resp) => {
      const cleanRespEmail = resp.email?.toLowerCase().trim() || ''
      return cleanRespEmail && cleanRespEmail === cleanStudentEmail
    })

    if (conflictIndex >= 0) {
      return responsibles[conflictIndex].name || `Responsável ${conflictIndex + 1}`
    }
    return null
  }, [studentEmail, responsibles])

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

  useEffect(() => {
    if (!isAdult(birthDate)) {
      if (form.getValues('basicInfo.isSelfResponsible')) {
        form.setValue('basicInfo.isSelfResponsible', false)
      }
      if (form.getValues('basicInfo.whatsappContact')) {
        form.setValue('basicInfo.whatsappContact', false)
      }
    }
  }, [birthDate, form, isAdult])

  const isStudentAdult = isAdult(birthDate)
  const isEmailRequired = isStudentAdult && isSelfResponsible
  const isPhoneRequired = isStudentAdult
  const isDocumentRequired = isStudentAdult

  return (
    <div className="grid gap-4 py-4">
      <FormField
        control={form.control}
        name="basicInfo.name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome do aluno*</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Nome completo" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="basicInfo.birthDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Data de Nascimento*</FormLabel>
            <FormControl>
              <Input
                type="date"
                value={field.value ? field.value.toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value) : undefined
                  field.onChange(date)
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="basicInfo.isSelfResponsible"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center gap-2">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={!isAdult(birthDate)}
              />
            </FormControl>
            <FormLabel className="font-normal">
              Maior de idade e próprio responsável
            </FormLabel>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="basicInfo.email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email{isEmailRequired ? '*' : ' (opcional)'}</FormLabel>
            <FormControl>
              <EmailInput
                value={field.value || ''}
                onChange={field.onChange}
                excludeUserId={excludeUserId}
                academicPeriodId={effectiveAcademicPeriodId}
              />
            </FormControl>
            {emailConflictWithResponsible && (
              <p className="text-sm text-destructive">
                Email igual ao de {emailConflictWithResponsible}
              </p>
            )}
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="basicInfo.phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone{isPhoneRequired ? '*' : ' (opcional)'}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value || ''}
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

        <FormField
          control={form.control}
          name="basicInfo.whatsappContact"
          render={({ field }) => (
            <FormItem className="flex flex-row items-end gap-2 pb-2">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={!isStudentAdult}
                />
              </FormControl>
              <FormLabel className="font-normal">WhatsApp</FormLabel>
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="basicInfo.documentType"
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
          name="basicInfo.documentNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Número do Documento{isDocumentRequired ? '*' : ' (opcional)'}
              </FormLabel>
              <FormControl>
                <DocumentInput
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  documentType={documentType}
                  excludeUserId={excludeUserId}
                  academicPeriodId={effectiveAcademicPeriodId}
                  placeholder="Número"
                />
              </FormControl>
              {documentConflictWithResponsible && (
                <p className="text-sm text-destructive">
                  Documento igual ao de {documentConflictWithResponsible}
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
