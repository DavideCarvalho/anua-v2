'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useFormContext } from 'react-hook-form'
import { CalendarDays } from 'lucide-react'

import { cn } from '~/lib/utils'
import { Button } from '~/components/ui/button'
import { Calendar } from '~/components/ui/calendar'
import { DateRangePicker } from '~/components/ui/date-range-picker'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'

import type { AcademicPeriodFormValues } from '../new-academic-period-form'

export function CalendarForm() {
  const form = useFormContext<AcademicPeriodFormValues>()

  const fromDate = form.watch('calendar.startDate')
  const toDate = form.watch('calendar.endDate')
  const holidays = form.watch('calendar.holidays') || []
  const weekendDaysWithClasses = form.watch('calendar.weekendDaysWithClasses') || []

  return (
    <div className="space-y-8">
      <FormField
        control={form.control}
        name="calendar.name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome do Período Letivo</FormLabel>
            <FormControl>
              <Input placeholder="Ex: Ano Letivo 2025" {...field} />
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
                  <SelectValue placeholder="Selecione um segmento" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="KINDERGARTEN">Educação Infantil</SelectItem>
                <SelectItem value="ELEMENTARY">Ensino Fundamental</SelectItem>
                <SelectItem value="HIGHSCHOOL">Ensino Médio</SelectItem>
                <SelectItem value="TECHNICAL">Ensino Técnico</SelectItem>
                <SelectItem value="UNIVERSITY">Ensino Superior</SelectItem>
                <SelectItem value="OTHER">Outros</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="space-y-4">
        <Label className="text-base font-medium">Período Letivo</Label>
        <p className="text-sm text-muted-foreground">
          Selecione a data de início e término do período letivo
        </p>
        <DateRangePicker
          from={fromDate}
          to={toDate}
          onSelectDate={(from, to) => {
            if (from) form.setValue('calendar.startDate', from)
            if (to) form.setValue('calendar.endDate', to)
          }}
          className="w-full"
        />
      </div>

      <div className="space-y-4">
        <Label className="text-base font-medium">Dias de Feriado</Label>
        <p className="text-sm text-muted-foreground">
          Selecione os dias que serão feriados (sem aula)
        </p>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full justify-start font-normal',
                !holidays.length && 'text-muted-foreground'
              )}
            >
              <CalendarDays className="mr-2 h-4 w-4" />
              {holidays.length > 0
                ? `${holidays.length} dia(s) selecionado(s)`
                : 'Clique para selecionar os feriados'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="multiple"
              selected={holidays}
              onSelect={(dates) => form.setValue('calendar.holidays', dates || [])}
              numberOfMonths={2}
              modifiers={{
                holiday: holidays,
              }}
              modifiersClassNames={{
                holiday: 'bg-orange-100 text-orange-900',
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-4">
        <Label className="text-base font-medium">Fins de Semana Letivos</Label>
        <p className="text-sm text-muted-foreground">
          Selecione sábados ou domingos que terão aula
        </p>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full justify-start font-normal',
                !weekendDaysWithClasses.length && 'text-muted-foreground'
              )}
            >
              <CalendarDays className="mr-2 h-4 w-4" />
              {weekendDaysWithClasses.length > 0
                ? `${weekendDaysWithClasses.length} dia(s) selecionado(s)`
                : 'Clique para selecionar fins de semana letivos'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="multiple"
              selected={weekendDaysWithClasses}
              onSelect={(dates) => form.setValue('calendar.weekendDaysWithClasses', dates || [])}
              numberOfMonths={2}
              modifiers={{
                weekend: weekendDaysWithClasses,
              }}
              modifiersClassNames={{
                weekend: 'bg-green-100 text-green-900',
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-4">
        <Label className="text-base font-medium">Período de Matrículas Online</Label>
        <p className="text-sm text-muted-foreground">
          Configure as datas para matrículas online (opcional)
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="calendar.enrollmentStartDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Início das Matrículas</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ?? undefined}
                      onSelect={field.onChange}
                    />
                  </PopoverContent>
                </Popover>
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
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ?? undefined}
                      onSelect={field.onChange}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  )
}
