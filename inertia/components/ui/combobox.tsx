'use client'

import * as React from 'react'
import { Check, ChevronDown, Search, X } from 'lucide-react'

import { cn } from '~/lib/utils'
import { Button } from '~/components/ui/button'

export interface ComboboxOption {
  value: string
  label: string
  icon?: React.ReactNode
}

interface ComboboxProps {
  options: ComboboxOption[]
  value?: string
  onValueChange: (value: string | undefined) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  className?: string
  disabled?: boolean
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = 'Selecione...',
  searchPlaceholder = 'Buscar...',
  emptyText = 'Nenhum resultado encontrado',
  className,
  disabled = false,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const containerRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const selectedOption = options.find((opt) => String(opt.value) === String(value ?? ''))

  const filteredOptions = search
    ? options.filter((opt) => opt.label.toLowerCase().includes(search.toLowerCase()))
    : options

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      setTimeout(() => inputRef.current?.focus(), 0)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  const handleToggle = () => {
    if (!disabled) {
      setOpen(!open)
      if (!open) {
        setSearch('')
      }
    }
  }

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <Button
        type="button"
        variant="outline"
        className={cn('w-full justify-between font-normal', !value && 'text-muted-foreground')}
        disabled={disabled}
        onClick={handleToggle}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <div className="flex items-center">
          {value && value !== 'all' && !disabled && (
            <span
              role="button"
              tabIndex={0}
              className="ml-1 flex shrink-0 cursor-pointer rounded p-0.5 opacity-50 hover:opacity-100 [&_svg]:pointer-events-auto"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onValueChange(undefined)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  e.stopPropagation()
                  onValueChange(undefined)
                }
              }}
            >
              <X className="h-4 w-4" />
            </span>
          )}
          <ChevronDown className={cn('ml-1 h-4 w-4 shrink-0 opacity-50', open && 'rotate-180')} />
        </div>
      </Button>

      {open && (
        <div className="absolute z-[100] mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-lg">
          <div className="flex items-center border-b px-3 py-2">
            <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              className="flex h-9 w-full rounded-md bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setOpen(false)
                }
                e.stopPropagation()
              }}
            />
          </div>
          <div className="max-h-[200px] overflow-auto p-1">
            {filteredOptions.length === 0 ? (
              <div className="py-4 text-center text-sm text-muted-foreground">{emptyText}</div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onValueChange(option.value)
                    setOpen(false)
                  }}
                  className={cn(
                    'relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm text-left outline-none',
                    String(value ?? '') === String(option.value)
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  {option.icon}
                  <span className="ml-2">{option.label}</span>
                  <Check
                    className={cn(
                      'ml-auto h-4 w-4',
                      String(value ?? '') === String(option.value) ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
