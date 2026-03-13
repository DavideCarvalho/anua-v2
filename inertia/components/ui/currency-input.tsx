import * as React from 'react'
import { cn } from '~/lib/utils'

export interface CurrencyInputProps extends Omit<
  React.ComponentProps<'input'>,
  'onChange' | 'value'
> {
  /** Valor em centavos inteiros (ex: 150 = R$ 1,50) */
  value: number
  onChange: (cents: number) => void
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, value, onChange, ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null)
    React.useImperativeHandle(ref, () => inputRef.current!)

    // Estado interno: string de dígitos (ex: "150" para R$ 1,50)
    const [digits, setDigits] = React.useState(() => (value > 0 ? String(value) : ''))

    // Sync externa: quando value muda de fora (ex: abrir edit dialog)
    React.useEffect(() => {
      setDigits(value > 0 ? String(value) : '')
    }, [value])

    const displayValue = React.useMemo(() => {
      const cents = digits.length > 0 ? Number(digits) : 0
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(cents / 100)
    }, [digits])

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (['Tab', 'Escape'].includes(e.key)) return
      if (e.key === 'Enter') {
        e.preventDefault()
        return
      }
      if (e.ctrlKey || e.metaKey) return

      e.preventDefault()

      if (e.key === 'Delete') {
        setDigits('')
        onChange(0)
        return
      }

      if (e.key === 'Backspace') {
        const next = digits.slice(0, -1)
        setDigits(next)
        onChange(next.length > 0 ? Number(next) : 0)
        return
      }

      if (/^[0-9]$/.test(e.key)) {
        // Limita a 7 dígitos: max R$ 99.999,99
        if (digits.length >= 7) return
        const next = digits + e.key
        setDigits(next)
        onChange(Number(next))
      }
    }

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault()
      const text = e.clipboardData.getData('text')
      // Aceita tanto "12,50" quanto "12.50" quanto "1250"
      const cleaned = text.replace(/\./g, '').replace(',', '.')
      const parsed = parseFloat(cleaned)
      if (!isNaN(parsed) && parsed >= 0) {
        const cents = Math.round(parsed * 100)
        const next = String(cents).slice(0, 7)
        setDigits(next)
        onChange(Number(next))
      }
    }

    return (
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm select-none">
          R$
        </span>
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={() => {}}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          className={cn(
            'flex h-9 w-full rounded-md border border-input bg-transparent pl-9 pr-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm tabular-nums',
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
