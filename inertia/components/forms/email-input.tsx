import { useEffect, useState } from 'react'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { Input } from '~/components/ui/input'
import { cn } from '~/lib/utils'
import { useEmailValidation } from '~/hooks/use_email_validation'

interface EmailInputProps {
  value: string
  onChange: (value: string) => void
  excludeUserId?: string
  academicPeriodId?: string
  placeholder?: string
  className?: string
}

export function EmailInput({
  value,
  onChange,
  excludeUserId,
  academicPeriodId,
  placeholder = 'email@exemplo.com',
  className,
}: EmailInputProps) {
  const { isValidating, validationResult, validateEmail } =
    useEmailValidation({ excludeUserId, academicPeriodId })
  const [hasBlurred, setHasBlurred] = useState(false)

  useEffect(() => {
    if (value && hasBlurred) {
      validateEmail(value)
    }
  }, [value, hasBlurred, validateEmail, academicPeriodId])

  useEffect(() => {
    if (value && hasBlurred && academicPeriodId) {
      validateEmail(value)
    }
  }, [academicPeriodId])

  const handleBlur = () => {
    setHasBlurred(true)
    if (value) {
      validateEmail(value)
    }
  }

  const showValidationIcon = hasBlurred && value && !isValidating && validationResult
  const hasError = showValidationIcon && !validationResult?.isValid

  return (
    <div className="relative">
      <Input
        type="email"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={cn(
          'pr-10',
          hasError && 'border-destructive focus-visible:ring-destructive',
          className
        )}
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2">
        {isValidating && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        {showValidationIcon && validationResult?.isValid && (
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        )}
        {showValidationIcon && !validationResult?.isValid && (
          <XCircle className="h-4 w-4 text-destructive" />
        )}
      </div>
      {hasError && validationResult?.error && (
        <p className="text-sm text-destructive mt-1">{validationResult.error}</p>
      )}
    </div>
  )
}
