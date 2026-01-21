import * as React from 'react'
import InputMask from 'react-input-mask'
import { cn } from '~/lib/utils'

export interface MaskedInputProps extends Omit<React.ComponentProps<'input'>, 'onChange'> {
  mask: string
  maskChar?: string | null
  onChange?: (value: string) => void
}

const MaskedInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ className, mask, maskChar = '_', onChange, ...props }, ref) => {
    return (
      <InputMask
        mask={mask}
        maskChar={maskChar}
        onChange={(e) => onChange?.(e.target.value)}
        {...props}
      >
        {(inputProps: React.InputHTMLAttributes<HTMLInputElement>) => (
          <input
            {...inputProps}
            ref={ref}
            className={cn(
              'flex h-9 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1 text-base text-gray-900 dark:text-white shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-gray-900 dark:file:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-500 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
              className
            )}
          />
        )}
      </InputMask>
    )
  }
)
MaskedInput.displayName = 'MaskedInput'

export { MaskedInput }
