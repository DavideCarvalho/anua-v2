import * as React from 'react'
import { cn } from '~/lib/utils'

export interface MaskedInputProps extends Omit<React.ComponentProps<'input'>, 'onChange'> {
  mask: string
  maskChar?: string | null
  onChange?: (value: string) => void
}

function applyMask(value: string, mask: string): string {
  const cleanValue = value.replace(/\D/g, '')
  let result = ''
  let valueIndex = 0

  for (let i = 0; i < mask.length && valueIndex < cleanValue.length; i++) {
    if (mask[i] === '9') {
      result += cleanValue[valueIndex]
      valueIndex++
    } else {
      result += mask[i]
      if (cleanValue[valueIndex] === mask[i]) {
        valueIndex++
      }
    }
  }

  return result
}

const MaskedInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ className, mask, onChange, value, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const maskedValue = applyMask(e.target.value, mask)
      onChange?.(maskedValue)
    }

    const displayValue = value ? applyMask(String(value), mask) : ''

    return (
      <input
        ref={ref}
        value={displayValue}
        onChange={handleChange}
        className={cn(
          'flex h-9 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1 text-base text-gray-900 dark:text-white shadow-sm transition-colors placeholder:text-gray-500 dark:placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-500 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          className
        )}
        {...props}
      />
    )
  }
)
MaskedInput.displayName = 'MaskedInput'

export { MaskedInput }
