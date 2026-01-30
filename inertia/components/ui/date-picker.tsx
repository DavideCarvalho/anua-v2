import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { DayPicker } from 'react-day-picker'

import { cn } from '~/lib/utils'
import { Button } from '~/components/ui/button'
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

export function DatePicker({
  date,
  onChange,
  placeholder = 'Selecione uma data',
  disabled = false,
  fromDate,
  toDate,
  className,
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            'w-full justify-start text-left font-normal',
            !date && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, 'PPP', { locale: ptBR }) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <DayPicker
          mode="single"
          selected={date}
          onSelect={onChange}
          locale={ptBR}
          disabled={
            fromDate || toDate
              ? { before: fromDate, after: toDate } as any
              : undefined
          }
          components={{
            PreviousMonthButton: (props) => (
              <button type="button" {...props} className={cn(props.className, 'absolute left-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center rounded-md border border-input')}>
                <ChevronLeft className="h-4 w-4" />
              </button>
            ),
            NextMonthButton: (props) => (
              <button type="button" {...props} className={cn(props.className, 'absolute right-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center rounded-md border border-input')}>
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
