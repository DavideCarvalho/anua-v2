import { useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { useSuspenseQuery } from '@tanstack/react-query'
import { ArrowLeft, ArrowRight, Loader2, CheckCircle } from 'lucide-react'

import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'

import { EnrollmentStepper } from './enrollment-stepper'
import { StepStudentInfo } from './step-student-info'
import { StepResponsibles } from './step-responsibles'
import { StepAddress } from './step-address'
import { StepMedicalInfo } from './step-medical-info'
import { StepBilling } from './step-billing'

import { useSchoolEnrollmentInfoQueryOptions } from '../../hooks/queries/use-school-enrollment-info'
import { useFinishEnrollmentMutation } from '../../hooks/mutations/use-finish-enrollment'

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

const STEPS = [
  { id: 1, title: 'Aluno', description: 'Dados pessoais' },
  { id: 2, title: 'Responsáveis', description: 'Pais/tutores' },
  { id: 3, title: 'Endereço', description: 'Localização' },
  { id: 4, title: 'Saúde', description: 'Informações médicas' },
  { id: 5, title: 'Pagamento', description: 'Forma de pagamento' },
]

export function EnrollmentForm({
  schoolSlug,
  academicPeriodSlug,
  courseSlug,
}: EnrollmentFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isCompleted, setIsCompleted] = useState(false)

  const { data: enrollmentInfo } = useSuspenseQuery(
    useSchoolEnrollmentInfoQueryOptions(schoolSlug, academicPeriodSlug, courseSlug)
  )

  const finishEnrollmentMutation = useFinishEnrollmentMutation()

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

  const onSubmit = async (data: EnrollmentFormData) => {
    try {
      await finishEnrollmentMutation.mutateAsync({
        student: data.student,
        responsibles: data.student.isSelfResponsible ? [] : data.responsibles,
        address: data.address,
        medicalInfo: data.medicalInfo,
        emergencyContacts: data.emergencyContacts,
        billing: data.billing,
        schoolId: enrollmentInfo.school.id,
        academicPeriodId: enrollmentInfo.academicPeriod.id,
        courseId: enrollmentInfo.course.id,
        levelId: enrollmentInfo.level.id,
        contractId: enrollmentInfo.contract?.id,
      })

      setIsCompleted(true)
    } catch (error) {
      console.error('Error submitting enrollment:', error)
    }
  }

  if (isCompleted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-12 pb-12 text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-600" />
          <h2 className="mt-6 text-2xl font-bold">Matrícula Realizada com Sucesso!</h2>
          <p className="mt-4 text-muted-foreground max-w-md mx-auto">
            Sua matrícula foi recebida e está aguardando análise dos documentos. Você receberá um
            e-mail com as próximas instruções.
          </p>
          <div className="mt-8 p-4 bg-muted rounded-lg text-left max-w-sm mx-auto">
            <h3 className="font-medium mb-2">Próximos passos:</h3>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Aguarde a confirmação por e-mail</li>
              <li>Envie os documentos solicitados</li>
              <li>Assine o contrato digital</li>
              <li>Realize o pagamento da matrícula</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Header with school info */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">{enrollmentInfo.school.name}</h1>
          <p className="text-muted-foreground">
            Matrícula para {enrollmentInfo.course.name} - {enrollmentInfo.academicPeriod.name}
          </p>
        </div>

        {/* Stepper */}
        <EnrollmentStepper steps={STEPS} currentStep={currentStep} />

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
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
          >
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
