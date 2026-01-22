import { useFormContext } from 'react-hook-form'

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
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
import { DatePicker } from '~/components/ui/date-picker'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'

import {
  SEGMENTS,
  SEGMENT_LABELS,
  type EditAcademicPeriodFormValues,
} from '../schemas/edit-academic-period.schema'

export function CalendarForm() {
  const form = useFormContext<EditAcademicPeriodFormValues>()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
          <CardDescription>
            Configure o nome e segmento do período letivo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="calendar.name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Período</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Ano Letivo 2026" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="calendar.segment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Segmento</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o segmento" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {SEGMENTS.map((segment) => (
                      <SelectItem key={segment} value={segment}>
                        {SEGMENT_LABELS[segment]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Datas do Período</CardTitle>
          <CardDescription>
            Defina as datas de início e término do período letivo
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="calendar.startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Início</FormLabel>
                <FormControl>
                  <DatePicker
                    date={field.value}
                    onChange={field.onChange}
                    placeholder="Selecione a data de início"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="calendar.endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Término</FormLabel>
                <FormControl>
                  <DatePicker
                    date={field.value}
                    onChange={field.onChange}
                    placeholder="Selecione a data de término"
                    fromDate={form.watch('calendar.startDate')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Período de Matrículas</CardTitle>
          <CardDescription>
            Defina as datas de abertura e encerramento das matrículas (opcional)
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="calendar.enrollmentStartDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Início das Matrículas</FormLabel>
                <FormControl>
                  <DatePicker
                    date={field.value ?? undefined}
                    onChange={field.onChange}
                    placeholder="Selecione a data"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="calendar.enrollmentEndDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Término das Matrículas</FormLabel>
                <FormControl>
                  <DatePicker
                    date={field.value ?? undefined}
                    onChange={field.onChange}
                    placeholder="Selecione a data"
                    fromDate={form.watch('calendar.enrollmentStartDate') ?? undefined}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  )
}
