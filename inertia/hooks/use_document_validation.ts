import { useState, useCallback, useRef, useEffect } from 'react'
import { validateDocument } from '~/lib/document-validators'
import { tuyau } from '~/lib/api'

interface DocumentValidationResult {
  isValid: boolean
  error?: string
  existingUserName?: string | null
}

interface UseDocumentValidationOptions {
  excludeUserId?: string
  academicPeriodId?: string
  debounceMs?: number
}

export function useDocumentValidation(options: UseDocumentValidationOptions = {}) {
  const { excludeUserId, academicPeriodId, debounceMs = 500 } = options
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<DocumentValidationResult | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const validateDocumentAsync = useCallback(
    async (documentType: string, documentNumber: string) => {
      // Clear previous timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      const cleanNumber = documentNumber.replace(/\D/g, '')

      // Don't validate if empty
      if (!cleanNumber) {
        setValidationResult(null)
        setIsValidating(false)
        return
      }

      // First, do format validation immediately
      const formatValidation = validateDocument(documentType, documentNumber)

      if (!formatValidation.valid) {
        setValidationResult({
          isValid: false,
          error: formatValidation.error,
        })
        setIsValidating(false)
        return
      }

      // Skip database check if no academicPeriodId (we don't know which school to check)
      if (!academicPeriodId) {
        setValidationResult({ isValid: true })
        setIsValidating(false)
        return
      }

      // Debounce the database check
      setIsValidating(true)

      timeoutRef.current = setTimeout(async () => {
        try {
          abortControllerRef.current = new AbortController()

          const response = await tuyau
            .$route('api.v1.students.checkDocument')
            .$get({
              query: {
                documentNumber: cleanNumber,
                academicPeriodId,
                ...(excludeUserId && { excludeUserId }),
              },
            })
            .unwrap()

          if (response.exists) {
            setValidationResult({
              isValid: false,
              error: `Documento já cadastrado${response.userName ? ` para ${response.userName}` : ''}`,
              existingUserName: response.userName,
            })
          } else {
            setValidationResult({
              isValid: true,
            })
          }
        } catch (error: unknown) {
          // Don't show error if request was aborted
          if (error instanceof Error && error.name === 'AbortError') {
            return
          }
          // On network error, don't show validation result (neutral state)
          // The duplicate check will still happen on form submit
          setValidationResult(null)
        } finally {
          setIsValidating(false)
        }
      }, debounceMs)
    },
    [excludeUserId, academicPeriodId, debounceMs]
  )

  const resetValidation = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    setValidationResult(null)
    setIsValidating(false)
  }, [])

  return {
    isValidating,
    validationResult,
    validateDocument: validateDocumentAsync,
    resetValidation,
  }
}
