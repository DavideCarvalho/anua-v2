import * as React from 'react'
import { useState, useEffect } from 'react'
import { format, parse, isValid } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { DayPicker, type Matcher } from 'react-day-picker'
import { useIMask } from 'react-imask'
import IMask from 'imask'

import { cn } from '~/lib/utils'
import { Input } from '~/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'

export interface DatePickerProps {
  date?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  fromDate?: Date
  toDate?: Date
  className?: string
}

const DATE_FORMAT = 'dd/MM/yyyy'

function formatDate(date: Date | undefined): string {
  if (!date) return ''
  return format(date, DATE_FORMAT)
}

function parseDate(value: string): Date | undefined {
  if (!value) return undefined
  if (value.includes('_')) return undefined
  const parsed = parse(value, DATE_FORMAT, new Date())
  if (isValid(parsed)) return parsed
  return undefined
}

export function DatePicker({
  date,
  onChange,
  placeholder = 'dd/mm/aaaa',
  disabled = false,
  fromDate,
  toDate,
  className,
}: DatePickerProps) {
  const [open, setOpen] = useState(false)

  const { ref, value, setValue } = useIMask(
    {
      mask: 'd/m/Y',
      blocks: {
        d: { mask: IMask.MaskedRange, from: 1, to: 31, maxLength: 2, autofix: 'pad' },
        m: { mask: IMask.MaskedRange, from: 1, to: 12, maxLength: 2, autofix: 'pad' },
        Y: { mask: IMask.MaskedRange, from: 1900, to: 2100 },
      },
      overwrite: true,
      lazy: false,
      placeholderChar: '_',
    },
    {
      onComplete: (v) => {
        const parsed = parseDate(v)
        if (parsed) {
          if (fromDate && parsed < fromDate) return
          if (toDate && parsed > toDate) return
          onChange?.(parsed)
        }
      },
    }
  )

  useEffect(() => {
    // If date changes from outside (e.g. initial load), update the mask value
    setValue(formatDate(date))
  }, [date, setValue])

  let disabledMatcher: Matcher | Matcher[] | undefined
  if (fromDate && toDate) {
    disabledMatcher = { before: fromDate, after: toDate }
  } else if (fromDate) {
    disabledMatcher = { before: fromDate }
  } else if (toDate) {
    disabledMatcher = { after: toDate }
  }

  function handleInputBlur() {
    const parsed = parseDate(value)
    if (!parsed) {
      // Revert to original date if left incomplete
      setValue(formatDate(date))
    } else if (fromDate && parsed < fromDate) {
      setValue(formatDate(date))
    } else if (toDate && parsed > toDate) {
      setValue(formatDate(date))
    }
  }

  function handleCalendarSelect(selected: Date | undefined) {
    onChange?.(selected)
    setValue(formatDate(selected))
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Input
            ref={ref as any}
            type="text"
            onBlur={handleInputBlur}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            disabled={disabled}
            className={cn('pr-10', className)}
          />
          <CalendarIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start" side="top">
        <DayPicker
          mode="single"
          selected={date}
          onSelect={handleCalendarSelect}
          locale={ptBR}
          disabled={disabledMatcher}
          components={{
            PreviousMonthButton: (props) => (
              <button
                type="button"
                {...props}
                className={cn(
                  props.className,
                  'absolute left-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center rounded-md border border-input'
                )}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            ),
            NextMonthButton: (props) => (
              <button
                type="button"
                {...props}
                className={cn(
                  props.className,
                  'absolute right-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center rounded-md border border-input'
                )}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            ),
          }}
          classNames={{
            months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
            month: 'space-y-4',
            month_caption: 'flex justify-center pt-1 relative items-center',
            caption_label: 'text-sm font-medium',
            nav: 'space-x-1 flex items-center',
            month_grid: 'w-full border-collapse space-y-1',
            weekdays: 'flex',
            weekday: 'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
            week: 'flex w-full mt-2',
            day: 'h-9 w-9 text-center text-sm p-0 relative',
            day_button:
              'h-9 w-9 p-0 font-normal hover:bg-accent hover:text-accent-foreground rounded-md inline-flex items-center justify-center',
            selected:
              'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-md',
            today: 'bg-accent text-accent-foreground rounded-md',
            outside: 'text-muted-foreground opacity-50',
            disabled: 'text-muted-foreground opacity-50',
            hidden: 'invisible',
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
