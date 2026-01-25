import * as React from 'react'
import { cn } from '~/lib/utils'

export interface CurrencyInputProps
  extends Omit<React.ComponentProps<'input'>, 'onChange' | 'value'> {
  value: string | number
  onChange: (value: string) => void
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, value, onChange, placeholder, ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null)

    React.useImperativeHandle(ref, () => inputRef.current!)

    // Valor em centavos
    const cents = React.useMemo(() => {
      const numValue = typeof value === 'number' ? value : parseFloat(value) || 0
      return Math.round(numValue * 100)
    }, [value])

    // Formata centavos para exibição (120000 -> "1.200,00")
    const formatDisplay = (c: number): string => {
      if (c === 0) return ''
      return (c / 100).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Permite: tab, escape
      if (['Tab', 'Escape'].includes(e.key)) {
        return
      }

      // Previne Enter de submeter o form
      if (e.key === 'Enter') {
        e.preventDefault()
        return
      }

      // Permite Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
      if (e.ctrlKey || e.metaKey) {
        return
      }

      e.preventDefault()

      if (e.key === 'Backspace') {
        const newCents = Math.floor(cents / 10)
        onChange(String(newCents / 100))
        return
      }

      if (/^[0-9]$/.test(e.key)) {
        const digit = parseInt(e.key, 10)
        const newCents = cents * 10 + digit
        onChange(String(newCents / 100))
      }
    }

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault()
      const pastedText = e.clipboardData.getData('text')
      // Tenta parsear como valor em reais (ex: "1.200,50" ou "1200.50" ou "1200")
      const cleaned = pastedText.replace(/\./g, '').replace(',', '.')
      const parsed = parseFloat(cleaned)
      if (!isNaN(parsed)) {
        onChange(String(parsed))
      }
    }

    return (
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
          R$
        </span>
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          value={formatDisplay(cents)}
          onChange={() => {}}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={placeholder}
          className={cn(
            'flex h-9 w-full rounded-md border border-input bg-transparent pl-9 pr-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
            className
          )}
          {...props}
        />
      </div>
    )
  }
)
CurrencyInput.displayName = 'CurrencyInput'

export { CurrencyInput }
