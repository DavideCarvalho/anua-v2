import { useState, useCallback, useRef, useEffect } from 'react'
import { tuyau } from '~/lib/api'

interface EmailValidationResult {
  isValid: boolean
  error?: string
  existingUserName?: string | null
}

interface UseEmailValidationOptions {
  excludeUserId?: string
  academicPeriodId?: string
  debounceMs?: number
}

export function useEmailValidation(options: UseEmailValidationOptions = {}) {
  const { excludeUserId, academicPeriodId, debounceMs = 500 } = options
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<EmailValidationResult | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

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

  const validateEmail = useCallback(
    async (email: string) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      const trimmed = email.trim()

      if (!trimmed) {
        setValidationResult(null)
        setIsValidating(false)
        return
      }

      // Basic format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(trimmed)) {
        setValidationResult({
          isValid: false,
          error: 'Email inválido',
        })
        setIsValidating(false)
        return
      }

      if (!academicPeriodId) {
        setValidationResult({ isValid: true })
        setIsValidating(false)
        return
      }

      setIsValidating(true)

      timeoutRef.current = setTimeout(async () => {
        try {
          abortControllerRef.current = new AbortController()

          const response = await tuyau
            .$route('api.v1.students.checkEmail')
            .$get({
              query: {
                email: trimmed,
                academicPeriodId,
                ...(excludeUserId && { excludeUserId }),
              },
            })
            .unwrap()

          if (response.exists) {
            setValidationResult({
              isValid: false,
              error: `Email já cadastrado${response.userName ? ` para ${response.userName}` : ''}`,
              existingUserName: response.userName,
            })
          } else {
            setValidationResult({ isValid: true })
          }
        } catch (error: unknown) {
          if (error instanceof Error && error.name === 'AbortError') {
            return
          }
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
    validateEmail,
    resetValidation,
  }
}
