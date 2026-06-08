import { useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { useSuspenseQuery } from '@tanstack/react-query'
import { router as inertiaRouter } from '@inertiajs/react'
import { ArrowLeft, ArrowRight, Loader2, CheckCircle, Mail } from 'lucide-react'

import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'

import { Stepper } from '../../components/ui/stepper'
import { StepStudentInfo } from './step-student-info'
import { StepResponsibles } from './step-responsibles'
import { StepAddress } from './step-address'
import { StepMedicalInfo } from './step-medical-info'
import { StepBilling } from './step-billing'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '~/lib/api'

export interface EnrollmentFormData {
  student: {
    name: string
    email: string
    phone?: string
    birthDate: string
    documentType: 'CPF' | 'RG' | 'PASSPORT' | 'OTHER'
    document: string
    isSelfResponsible: boolean
  }
  responsibles: Array<{
    name: string
    email: string
    phone: string
    birthDate?: string
    documentType: 'CPF' | 'RG' | 'PASSPORT' | 'OTHER'
    document: string
    isPedagogical: boolean
    isFinancial: boolean
  }>
  address: {
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
    zipCode: string
  }
  medicalInfo: {
    conditions?: string
    medications?: Array<{
      name: string
      dosage: string
      frequency: string
      instructions?: string
    }>
  }
  emergencyContacts: Array<{
    name: string
    phone: string
    relationship:
      | 'MOTHER'
      | 'FATHER'
      | 'GRANDMOTHER'
      | 'GRANDFATHER'
      | 'AUNT'
      | 'UNCLE'
      | 'COUSIN'
      | 'NEPHEW'
      | 'NIECE'
      | 'GUARDIAN'
      | 'OTHER'
  }>
  billing: {
    paymentMethod: 'BOLETO' | 'CREDIT_CARD' | 'PIX'
    paymentDay?: number
    enrollmentInstallments?: number
    installments?: number
    scholarshipCode?: string
  }
}

interface EnrollmentFormProps {
  schoolSlug: string
  academicPeriodSlug: string
  courseSlug: string
}

const BASE_STEPS = [
  { id: 1, title: 'Aluno', description: 'Dados pessoais' },
  { id: 2, title: 'Responsáveis', description: 'Pais/tutores' },
  { id: 3, title: 'Endereço', description: 'Localização' },
  { id: 4, title: 'Saúde', description: 'Informações médicas' },
] as const
const PAYMENT_STEP = { id: 5, title: 'Pagamento', description: 'Forma de pagamento' } as const

export function EnrollmentForm({
  schoolSlug,
  academicPeriodSlug,
  courseSlug,
}: EnrollmentFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isCompleted, setIsCompleted] = useState(false)

  const queryClient = useQueryClient()
  const { data: enrollmentInfo } = useSuspenseQuery(
    api.api.v1.enrollment.info.queryOptions({
      params: { schoolSlug, academicPeriodSlug, courseSlug },
    })
  )

  // Se a escola não tem gateway de pagamento online ativo, pula o step de
  // pagamento — a escola entra em contato depois pra combinar forma e geração
  // de cobranças. Mostrar selects/radios aqui só prometeria algo que não
  // existe ainda do lado dela.
  const hasOnlinePayment = enrollmentInfo.school.hasOnlinePayment === true
  const STEPS = hasOnlinePayment ? [...BASE_STEPS, PAYMENT_STEP] : [...BASE_STEPS]

  const finishEnrollmentMutation = useMutation(api.api.v1.enrollment.finish.mutationOptions())

  const methods = useForm<EnrollmentFormData>({
    defaultValues: {
      student: {
        name: '',
        email: '',
        phone: '',
        birthDate: '',
        documentType: 'CPF',
        document: '',
        isSelfResponsible: false,
      },
      responsibles: [
        {
          name: '',
          email: '',
          phone: '',
          documentType: 'CPF',
          document: '',
          isPedagogical: true,
          isFinancial: true,
        },
      ],
      address: {
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
        zipCode: '',
      },
      medicalInfo: {
        conditions: '',
        medications: [],
      },
      emergencyContacts: [
        {
          name: '',
          phone: '',
          relationship: 'OTHER',
        },
      ],
      billing: {
        paymentMethod: 'BOLETO',
        paymentDay: 10,
        enrollmentInstallments: 1,
        installments: 12,
      },
    },
  })

  const {
    handleSubmit,
    trigger,
    watch,
    formState: { isSubmitting },
  } = methods

  const validateStep = async (step: number): Promise<boolean> => {
    switch (step) {
      case 1:
        return await trigger([
          'student.name',
          'student.email',
          'student.birthDate',
          'student.document',
        ])
      case 2:
        const isSelfResponsible = watch('student.isSelfResponsible')
        if (isSelfResponsible) return true
        return await trigger('responsibles')
      case 3:
        return await trigger([
          'address.street',
          'address.number',
          'address.neighborhood',
          'address.city',
          'address.state',
          'address.zipCode',
        ])
      case 4:
        return await trigger('emergencyContacts')
      case 5:
        return await trigger('billing.paymentMethod')
      default:
        return true
    }
  }

  const handleNext = async () => {
    const isValid = await validateStep(currentStep)
    if (isValid && currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const [completionInfo, setCompletionInfo] = useState<{
    otpSentTo: string | null
    redirectTo: string
  } | null>(null)

  const onSubmit = async (data: EnrollmentFormData) => {
    try {
      const result = await finishEnrollmentMutation.mutateAsync({
        body: {
          student: data.student,
          responsibles: data.student.isSelfResponsible ? [] : data.responsibles,
          address: data.address,
          medicalInfo: data.medicalInfo,
          emergencyContacts: data.emergencyContacts,
          // Só envia billing se a escola coleta forma de pagamento online.
          billing: hasOnlinePayment ? data.billing : undefined,
          schoolId: enrollmentInfo.school.id,
          academicPeriodId: enrollmentInfo.academicPeriod.id,
          courseId: enrollmentInfo.course.id,
          levelId: enrollmentInfo.level.id,
          contractId: enrollmentInfo.contract?.id,
        },
      })
      queryClient.invalidateQueries({ queryKey: ['enrollment'] })
      setCompletionInfo({
        otpSentTo: result.otpSentTo ?? null,
        redirectTo: result.redirectTo ?? '/auth/verify',
      })
      setIsCompleted(true)
    } catch (error) {
      console.error('Error submitting enrollment:', error)
    }
  }

  if (isCompleted && completionInfo) {
    // Lista honesta do que ainda falta. Documentos sempre via portal; pagamento
    // e assinatura podem ser presenciais (escola entra em contato) ou online.
    const nextSteps: string[] = ['enviar os documentos do aluno pelo portal']
    if (hasOnlinePayment) {
      nextSteps.push('escolher e confirmar a forma de pagamento')
    } else {
      nextSteps.push('combinar a forma de pagamento com a secretaria, que vai entrar em contato')
    }
    nextSteps.push('agendar a assinatura presencial do contrato com a secretaria')

    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-12 pb-12 text-center space-y-6">
          <CheckCircle className="mx-auto h-16 w-16 text-green-600" />
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold tracking-tight">Matrícula recebida</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              {completionInfo.otpSentTo ? (
                <>
                  Enviamos um código de acesso para <strong>{completionInfo.otpSentTo}</strong>. Use
                  o código pra entrar no portal e acompanhar os próximos passos.
                </>
              ) : (
                'Sua matrícula foi registrada. Acesse o portal pra acompanhar os próximos passos.'
              )}
            </p>
            <div className="mx-auto max-w-md text-left">
              <p className="text-sm font-medium text-foreground">Próximos passos</p>
              <ol className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                {nextSteps.map((step, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-primary font-medium tabular-nums">{i + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
          <Button onClick={() => inertiaRouter.visit(completionInfo.redirectTo)} className="gap-2">
            <Mail className="h-4 w-4" />
            Verificar código e entrar
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* School trust signal: logo + name + period make it obvious this is
            the right school's official portal (anti-phishing cue) */}
        <header className="mb-8 flex flex-col items-center gap-3 text-center">
          {enrollmentInfo.school.logoUrl ? (
            <img
              src={enrollmentInfo.school.logoUrl}
              alt={`Logo de ${enrollmentInfo.school.name}`}
              className="h-14 w-14 rounded-lg object-cover ring-1 ring-foreground/10"
            />
          ) : (
            <div className="grid h-14 w-14 place-items-center rounded-lg bg-primary/10 text-primary ring-1 ring-foreground/10">
              <span className="text-lg font-semibold">
                {enrollmentInfo.school.name?.charAt(0).toUpperCase() ?? 'E'}
              </span>
            </div>
          )}
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Portal oficial de matrícula
            </p>
            <h1 className="text-xl font-semibold tracking-tight">{enrollmentInfo.school.name}</h1>
            <p className="text-sm text-muted-foreground">
              {enrollmentInfo.course.name} · {enrollmentInfo.academicPeriod.name}
            </p>
          </div>
        </header>

        {/* Stepper */}
        <Stepper
          steps={STEPS.map((s) => ({ title: s.title, description: s.description }))}
          currentStep={currentStep - 1}
          showCompletedCheckmark
          className="mb-8"
        />

        {/* Form Steps */}
        <div className="mb-8">
          {currentStep === 1 && <StepStudentInfo />}
          {currentStep === 2 && <StepResponsibles />}
          {currentStep === 3 && <StepAddress />}
          {currentStep === 4 && <StepMedicalInfo />}
          {currentStep === 5 && (
            <StepBilling schoolId={enrollmentInfo.school.id} contract={enrollmentInfo.contract} />
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={handleBack} disabled={currentStep === 1}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>

          {currentStep < STEPS.length ? (
            <Button type="button" onClick={handleNext}>
              Próximo
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button type="submit" disabled={isSubmitting || finishEnrollmentMutation.isPending}>
              {(isSubmitting || finishEnrollmentMutation.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Finalizar Matrícula
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  )
}

export function EnrollmentFormSkeleton() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="h-8 w-48 bg-muted animate-pulse rounded mx-auto" />
        <div className="h-5 w-64 bg-muted animate-pulse rounded mx-auto mt-2" />
      </div>

      <div className="flex justify-between">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="h-8 w-8 bg-muted animate-pulse rounded-full" />
            <div className="h-3 w-16 bg-muted animate-pulse rounded mt-2" />
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-muted animate-pulse rounded" />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
