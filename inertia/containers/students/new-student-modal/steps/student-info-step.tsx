import { useFormContext } from 'react-hook-form'
import { useCallback, useEffect } from 'react'
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
import type { NewStudentFormData } from '../schema'

export function StudentInfoStep() {
  const form = useFormContext<NewStudentFormData>()
  const birthDate = form.watch('basicInfo.birthDate')
  const isSelfResponsible = form.watch('basicInfo.isSelfResponsible')

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
    if (!isAdult(birthDate) && form.getValues('basicInfo.isSelfResponsible')) {
      form.setValue('basicInfo.isSelfResponsible', false)
    }
  }, [birthDate, form, isAdult])

  const isEmailRequired = isAdult(birthDate) && isSelfResponsible

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
              <Input
                {...field}
                type="email"
                value={field.value || ''}
                placeholder="email@exemplo.com"
              />
            </FormControl>
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

        <FormField
          control={form.control}
          name="basicInfo.whatsappContact"
          render={({ field }) => (
            <FormItem className="flex flex-row items-end gap-2 pb-2">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
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
              <FormLabel>Número do Documento*</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Número" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
