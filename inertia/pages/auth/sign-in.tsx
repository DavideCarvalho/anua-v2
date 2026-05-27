import { useEffect, useRef, useState } from 'react'
import { router } from '@inertiajs/react'
import { useMutation } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, CheckCircle2, Loader2, Mail, Sparkles } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { api } from '~/lib/api'

import { HeroIllustration } from './sign-in/components/illustrations/hero-illustration'
import { SuccessIllustration } from './sign-in/components/illustrations/success-illustration'
import { SeoHead } from '~/components/seo/seo-head'

enum FormStep {
  EMAIL = 'email',
  CODE = 'code',
  SUCCESS = 'success',
}

type FlowState = 'idle' | 'loading' | 'error'

export default function SignIn() {
  const [formStep, setFormStep] = useState<FormStep>(FormStep.EMAIL)
  const [flowState, setFlowState] = useState<FlowState>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [emailInput, setEmailInput] = useState<string>('')
  const [codeInput, setCodeInput] = useState<string>('')
  const [resendCooldown, setResendCooldown] = useState<number>(0)
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const sendCodeMutation = useMutation(api.api.v1.auth.sendCode.mutationOptions())
  const verifyCodeMutation = useMutation(api.api.v1.auth.verifyCode.mutationOptions())

  useEffect(() => {
    if (formStep === FormStep.SUCCESS) {
      const redirectTimeout = setTimeout(() => {
        router.visit('/dashboard')
      }, 2000)

      return () => clearTimeout(redirectTimeout)
    }
  }, [formStep])

  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current)
      }
    }
  }, [formStep])

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown((prev) => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const sendCode = async (emailAddress: string) => {
    try {
      setFlowState('loading')
      setErrorMessage('')

      const response = await sendCodeMutation.mutateAsync({
        body: { email: emailAddress },
      })

      if (!response?.message) {
        throw new Error('Erro ao enviar código')
      }

      setFlowState('idle')
      toast.success('Código enviado pro seu e-mail!')
      return true
    } catch (error) {
      console.error('Send code error:', error)
      setFlowState('error')

      if (error && typeof error === 'object' && 'message' in error) {
        setErrorMessage(error.message as string)
      } else {
        setErrorMessage('Erro ao enviar código. Tenta de novo?')
      }

      toast.error('Ops! Algo deu errado')
      return false
    }
  }

  const onEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const normalizedEmailInput = emailInput.trim().toLowerCase()
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmailInput)

    if (!isValidEmail) {
      setErrorMessage('Digite um e-mail válido')
      setFlowState('error')
      return
    }

    setEmailInput(normalizedEmailInput)
    setEmail(normalizedEmailInput)
    const success = await sendCode(normalizedEmailInput)
    if (success) {
      setFormStep(FormStep.CODE)
      setResendCooldown(30)
    }
  }

  const onCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (codeInput.length !== 6) {
      setErrorMessage('O código deve ter 6 dígitos')
      setFlowState('error')
      return
    }

    try {
      setFlowState('loading')
      setErrorMessage('')

      const response = await verifyCodeMutation.mutateAsync({
        body: { email, code: codeInput },
      })

      if (!response?.message) {
        throw new Error('Código inválido')
      }

      setFormStep(FormStep.SUCCESS)
      toast.success('Login confirmado!')
    } catch (error) {
      console.error('Verify code error:', error)
      setFlowState('error')
      setErrorMessage('Código inválido. Tenta de novo?')
      toast.error('Código incorreto')
      setCodeInput('')

      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current)
      }

      errorTimeoutRef.current = setTimeout(() => {
        setFlowState('idle')
        setErrorMessage('')
      }, 5000)
    }
  }

  const handleResendCode = async () => {
    if (resendCooldown > 0) return

    const success = await sendCode(email)
    if (success) {
      setResendCooldown(30)
      setCodeInput('')
    }
  }

  const handleBackToEmail = () => {
    setFormStep(FormStep.EMAIL)
    setFlowState('idle')
    setErrorMessage('')
    setCodeInput('')
    setResendCooldown(0)
  }

  return (
    <>
      <SeoHead
        title="Entrar"
        description="Acesse o Anuá, o sistema de gestão escolar com inteligência artificial. Faça login para gerenciar sua escola de forma completa e integrada."
        url="/sign-in"
        noIndex={true}
      />
      <Toaster position="top-center" />

      <div className="flex h-screen w-full items-center justify-center bg-background p-4 lg:p-8">
        <div className="grid w-full max-w-7xl gap-8 lg:grid-cols-2 lg:gap-16">
          {/* Left side: branding + illustration */}
          <div className="hidden flex-col justify-center lg:flex">
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                  <Sparkles className="h-7 w-7 text-primary" />
                </div>

                <div className="space-y-3">
                  <h1 className="text-6xl font-bold tracking-tight text-foreground">Anuá</h1>
                  <p className="text-lg font-medium text-muted-foreground">
                    Onde tecnologia encontra educação
                  </p>
                </div>
              </div>

              <div className="h-[400px] w-full">
                <HeroIllustration />
              </div>
            </div>
          </div>

          {/* Right side: form */}
          <div className="flex items-center justify-center">
            <AnimatePresence mode="wait">
              {formStep === FormStep.SUCCESS ? (
                <SuccessState />
              ) : formStep === FormStep.CODE ? (
                <CodeState
                  flowState={flowState}
                  errorMessage={errorMessage}
                  email={email}
                  codeInput={codeInput}
                  setCodeInput={setCodeInput}
                  resendCooldown={resendCooldown}
                  onSubmit={onCodeSubmit}
                  onResend={handleResendCode}
                  onBack={handleBackToEmail}
                />
              ) : (
                <EmailState
                  flowState={flowState}
                  errorMessage={errorMessage}
                  emailInput={emailInput}
                  setEmailInput={setEmailInput}
                  onSubmit={onEmailSubmit}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  )
}

function EmailState({
  flowState,
  errorMessage,
  emailInput,
  setEmailInput,
  onSubmit,
}: {
  flowState: FlowState
  errorMessage: string
  emailInput: string
  setEmailInput: (value: string) => void
  onSubmit: (e: React.FormEvent) => Promise<void>
}) {
  return (
    <motion.div
      key="email"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="w-full max-w-md"
    >
      <Card className="ring-1 ring-foreground/10">
        <CardHeader className="text-center">
          <div className="mb-4 flex items-center justify-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Anuá</h1>
          </div>

          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
            <Mail className="h-7 w-7 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">Entrar no Anuá</CardTitle>
          <CardDescription className="text-base">
            Vamos te mandar um código de acesso pro teu e-mail
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                required
                autoComplete="email"
                autoFocus
                disabled={flowState === 'loading'}
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
              />
              <AnimatePresence>
                {flowState === 'error' && errorMessage && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-sm text-destructive"
                  >
                    {errorMessage}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <Button type="submit" className="w-full" disabled={flowState === 'loading'}>
              {flowState === 'loading' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Enviar código
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function CodeState({
  flowState,
  errorMessage,
  email,
  codeInput,
  setCodeInput,
  resendCooldown,
  onSubmit,
  onResend,
  onBack,
}: {
  flowState: FlowState
  errorMessage: string
  email: string
  codeInput: string
  setCodeInput: (value: string) => void
  resendCooldown: number
  onSubmit: (e: React.FormEvent) => Promise<void>
  onResend: () => Promise<void>
  onBack: () => void
}) {
  return (
    <motion.div
      key="code"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="w-full max-w-md"
    >
      <Card className="ring-1 ring-foreground/10">
        <CardHeader className="text-center">
          <div className="mx-auto mb-6 h-32 w-32">
            <SuccessIllustration />
          </div>
          <CardTitle className="text-2xl">Código enviado!</CardTitle>
          <CardDescription className="text-base">
            Digite o código de 6 dígitos que enviamos pra{' '}
            <strong className="text-foreground">{email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="code">Código</Label>
              <Input
                id="code"
                type="text"
                placeholder="000000"
                autoComplete="one-time-code"
                autoFocus
                maxLength={6}
                disabled={flowState === 'loading'}
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value.replace(/\D/g, ''))}
                className="text-center font-mono text-xl tracking-widest"
              />
              <AnimatePresence>
                {flowState === 'error' && errorMessage && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-sm text-destructive"
                  >
                    {errorMessage}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div className="space-y-3">
              <Button type="submit" className="w-full" disabled={flowState === 'loading'}>
                {flowState === 'loading' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Verificar código
                  </>
                )}
              </Button>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={onResend}
                  disabled={resendCooldown > 0 || flowState === 'loading'}
                >
                  {resendCooldown > 0 ? `Reenviar (${resendCooldown}s)` : 'Reenviar código'}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Voltar"
                  onClick={onBack}
                  disabled={flowState === 'loading'}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function SuccessState() {
  return (
    <motion.div
      key="success"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="w-full max-w-md"
    >
      <Card className="ring-1 ring-foreground/10">
        <CardHeader className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-600/10">
            <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>

          <CardTitle className="text-2xl">Login confirmado!</CardTitle>
          <CardDescription className="text-base">Redirecionando você pro app...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full bg-green-600 dark:bg-green-400"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 1.5, ease: 'linear' }}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
