import { useEffect, useState } from 'react'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { Input } from '~/components/ui/input'
import { cn } from '~/lib/utils'
import { useDocumentValidation } from '~/hooks/use_document_validation'

interface DocumentInputProps {
  value: string
  onChange: (value: string) => void
  documentType: string
  excludeUserId?: string
  academicPeriodId?: string
  placeholder?: string
  className?: string
  onValidationChange?: (isValid: boolean, error?: string) => void
}

export function DocumentInput({
  value,
  onChange,
  documentType,
  excludeUserId,
  academicPeriodId,
  placeholder = 'Número',
  className,
  onValidationChange,
}: DocumentInputProps) {
  const { isValidating, validationResult, validateDocument, resetValidation } =
    useDocumentValidation({ excludeUserId, academicPeriodId })
  const [hasBlurred, setHasBlurred] = useState(false)

  // Trigger validation when document type, value, or academicPeriodId changes
  useEffect(() => {
    if (value && hasBlurred) {
      validateDocument(documentType, value)
    }
  }, [documentType, value, hasBlurred, validateDocument, academicPeriodId])

  // Reset validation when document type changes
  useEffect(() => {
    resetValidation()
    setHasBlurred(false)
  }, [documentType, resetValidation])

  // Revalidate when academicPeriodId becomes available (for new student flow)
  useEffect(() => {
    if (value && hasBlurred && academicPeriodId) {
      validateDocument(documentType, value)
    }
  }, [academicPeriodId])

  // Notify parent of validation changes
  useEffect(() => {
    if (onValidationChange && validationResult) {
      onValidationChange(validationResult.isValid, validationResult.error)
    }
  }, [validationResult, onValidationChange])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value

    // For CPF and similar, only allow digits
    if (documentType === 'CPF' || documentType === 'CNPJ' || documentType === 'RG') {
      newValue = newValue.replace(/\D/g, '')
    }

    onChange(newValue)
  }

  const handleBlur = () => {
    setHasBlurred(true)
    if (value) {
      validateDocument(documentType, value)
    }
  }

  const showValidationIcon = hasBlurred && value && !isValidating && validationResult
  const hasError = showValidationIcon && !validationResult?.isValid

  return (
    <div className="relative">
      <Input
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        maxLength={documentType === 'CPF' ? 11 : documentType === 'CNPJ' ? 14 : undefined}
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
