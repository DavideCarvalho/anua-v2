import { useEffect, useRef, useState } from 'react'
import { router } from '@inertiajs/react'
import confetti from 'canvas-confetti'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Mail,
  Sparkles,
} from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { tuyau } from '~/lib/api'

import { FloatingOrbs } from './sign-in/components/decorative/floating-orbs'
import { GridPattern } from './sign-in/components/decorative/grid-pattern'
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

  // Confetti effect on success
  useEffect(() => {
    if (formStep === FormStep.SUCCESS) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#8b5cf6', '#a855f7'],
      })

      // Redirect after success
      const redirectTimeout = setTimeout(() => {
        router.visit('/escola')
      }, 2000)

      return () => clearTimeout(redirectTimeout)
    }
  }, [formStep])

  // Cleanup error timeout on unmount or step change
  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current)
      }
    }
  }, [formStep])

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown((prev) => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  // Send OTP code to email
  const sendCode = async (emailAddress: string) => {
    try {
      setFlowState('loading')
      setErrorMessage('')

      const response = await tuyau.api.v1.auth['send-code'].$post({
        email: emailAddress,
      })

      if (response.error) {
        throw new Error(response.error.message || 'Erro ao enviar código')
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

  // Handle email submission
  const onEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailInput || !emailInput.includes('@')) {
      setErrorMessage('Digite um e-mail válido')
      setFlowState('error')
      return
    }

    setEmail(emailInput)
    const success = await sendCode(emailInput)
    if (success) {
      setFormStep(FormStep.CODE)
      setResendCooldown(30)
    }
  }

  // Handle code verification
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

      const response = await tuyau.api.v1.auth['verify-code'].$post({
        email,
        code: codeInput,
      })

      if (response.error) {
        throw new Error(response.error.message || 'Código inválido')
      }

      // Sucesso!
      setFormStep(FormStep.SUCCESS)
      toast.success('Login confirmado!')
    } catch (error) {
      console.error('Verify code error:', error)
      setFlowState('error')
      setErrorMessage('Código inválido. Tenta de novo?')
      toast.error('Código incorreto')
      setCodeInput('')

      // Limpa timeout anterior se existir
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current)
      }

      // Mantém o estado de erro por um tempo para o usuário ver a mensagem
      errorTimeoutRef.current = setTimeout(() => {
        setFlowState('idle')
        setErrorMessage('')
      }, 5000)
    }
  }

  // Handle resend code
  const handleResendCode = async () => {
    if (resendCooldown > 0) return

    const success = await sendCode(email)
    if (success) {
      setResendCooldown(30)
      setCodeInput('')
    }
  }

  // Handle back to email
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

      <div className="bg-linear-to-br relative h-screen w-full overflow-hidden from-indigo-50 via-purple-50 to-blue-50 dark:from-gray-950 dark:via-indigo-950 dark:to-purple-950">
        {/* Background effects */}
        <FloatingOrbs />
        <GridPattern />

        {/* Content */}
        <div className="relative z-10 flex h-full w-full items-center justify-center p-4 lg:p-8">
          <div className="grid w-full max-w-7xl gap-8 lg:grid-cols-2 lg:gap-16">
            {/* Left side - Hero illustration and branding */}
            <motion.div
              className="hidden flex-col justify-center lg:flex"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <div className="space-y-8">
                {/* Logo/Brand */}
                <motion.div
                  className="space-y-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  {/* Logo Icon */}
                  <motion.div
                    className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 shadow-2xl shadow-indigo-500/50"
                    animate={{
                      boxShadow: [
                        '0 20px 60px -15px rgba(99, 102, 241, 0.5)',
                        '0 20px 60px -15px rgba(168, 85, 247, 0.5)',
                        '0 20px 60px -15px rgba(99, 102, 241, 0.5)',
                      ],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: 'easeInOut',
                    }}
                  >
                    <Sparkles className="h-8 w-8 text-white" />
                  </motion.div>

                  {/* Title */}
                  <div className="space-y-4">
                    <h1 className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-7xl font-extrabold tracking-tight text-transparent dark:from-indigo-400 dark:via-purple-400 dark:to-blue-400">
                      Anuá
                    </h1>
                    <motion.p
                      className="bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 bg-clip-text text-2xl font-semibold tracking-wide text-transparent dark:from-gray-200 dark:via-gray-100 dark:to-white"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                    >
                      Onde tecnologia encontra educação
                    </motion.p>
                  </div>
                </motion.div>

                {/* Illustration */}
                <motion.div
                  className="h-[400px] w-full"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  <HeroIllustration />
                </motion.div>
              </div>
            </motion.div>

            {/* Right side - Form */}
            <motion.div
              className="flex items-center justify-center"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            >
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
            </motion.div>
          </div>
        </div>

        {/* Version badge */}
        <motion.div
          className="absolute bottom-4 right-4 text-xs text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          v1.0.0
        </motion.div>
      </div>
    </>
  )
}

// ====================================
// EMAIL STATE COMPONENT
// ====================================

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
      initial={{ opacity: 0, scale: 0.9, x: 50 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.9, x: -50 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md"
    >
      <Card className="border-none bg-white/80 shadow-2xl shadow-indigo-500/20 backdrop-blur-xl dark:bg-gray-900/80">
        <CardHeader className="text-center">
          {/* Logo for mobile */}
          <div className="mb-4 flex items-center justify-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/50">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Anuá
            </h1>
          </div>

          <motion.div
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <Mail className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
          </motion.div>
          <CardTitle className="text-2xl">Entrar no Anuá</CardTitle>
          <CardDescription className="text-base">
            Vamos te mandar um código de acesso pro teu e-mail
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base">
                E-mail
              </Label>
              <motion.div
                whileFocus={{ scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  autoComplete="email"
                  autoFocus
                  disabled={flowState === 'loading'}
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="h-12 border-gray-200 bg-white/50 text-base backdrop-blur-sm transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800/50"
                />
              </motion.div>
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

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                className="h-12 w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-base font-medium shadow-lg shadow-indigo-500/50 transition-all hover:shadow-xl hover:shadow-indigo-500/50"
                disabled={flowState === 'loading'}
              >
                {flowState === 'loading' ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-5 w-5" />
                    Enviar código
                  </>
                )}
              </Button>
            </motion.div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ====================================
// CODE STATE COMPONENT
// ====================================

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
      initial={{ opacity: 0, scale: 0.9, x: 50 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.9, x: -50 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md"
    >
      <Card className="border-none bg-white/80 shadow-2xl shadow-indigo-500/20 backdrop-blur-xl dark:bg-gray-900/80">
        <CardHeader className="text-center">
          <div className="mx-auto mb-6 h-32 w-32">
            <SuccessIllustration />
          </div>
          <CardTitle className="text-2xl">Código enviado!</CardTitle>
          <CardDescription className="text-base">
            Digite o código de 6 dígitos que enviamos pra{' '}
            <strong className="text-indigo-600 dark:text-indigo-400">{email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="code" className="text-base">
                Código
              </Label>
              <motion.div
                whileFocus={{ scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
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
                  className="h-12 border-gray-200 bg-white/50 text-center font-mono text-2xl tracking-widest backdrop-blur-sm transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800/50"
                />
              </motion.div>
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
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  className="h-12 w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-base font-medium shadow-lg shadow-indigo-500/50 transition-all hover:shadow-xl hover:shadow-indigo-500/50"
                  disabled={flowState === 'loading'}
                >
                  {flowState === 'loading' ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                      Verificar código
                    </>
                  )}
                </Button>
              </motion.div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 flex-1"
                  onClick={onResend}
                  disabled={resendCooldown > 0 || flowState === 'loading'}
                >
                  {resendCooldown > 0 ? `Reenviar (${resendCooldown}s)` : 'Reenviar código'}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="h-10 px-3"
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

// ====================================
// SUCCESS STATE COMPONENT
// ====================================

function SuccessState() {
  return (
    <motion.div
      key="success"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md"
    >
      <Card className="border-none bg-white/80 shadow-2xl shadow-green-500/20 backdrop-blur-xl dark:bg-gray-900/80">
        <CardHeader className="text-center">
          <motion.div
            className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/50 dark:to-emerald-900/50"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, ease: 'backOut' }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <CheckCircle2 className="h-16 w-16 text-green-600 dark:text-green-400" />
            </motion.div>
          </motion.div>

          <CardTitle className="text-2xl text-green-600 dark:text-green-400">
            Login confirmado!
          </CardTitle>
          <CardDescription className="text-base">Redirecionando você pro app...</CardDescription>
        </CardHeader>
        <CardContent>
          <motion.div
            className="relative h-2 overflow-hidden rounded-full bg-green-100 dark:bg-green-900/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-emerald-500"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 1.5, ease: 'linear' }}
            />
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
