import { useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { Stepper, type Step } from './components/stepper'
import { StudentInfoStep } from './steps/student-info-step'
import { ResponsiblesStep } from './steps/responsibles-step'
import { AddressStep } from './steps/address-step'
import { MedicalInfoStep } from './steps/medical-info-step'
import { BillingStep } from './steps/billing-step'
import { newStudentSchema, type NewStudentFormData } from './schema'
import { useEnrollStudent } from '~/hooks/mutations/use-student-mutations'

const STEPS_CONFIG = [
  { title: 'Aluno', description: 'Dados do aluno' },
  { title: 'Responsáveis', description: 'Dados dos responsáveis' },
  { title: 'Endereço', description: 'Localização do aluno' },
  { title: 'Informações Médicas', description: 'Condições e documentos' },
  { title: 'Cobrança', description: 'Dados financeiros' },
]

interface NewStudentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewStudentModal({ open, onOpenChange }: NewStudentModalProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [stepsStatus, setStepsStatus] = useState<Step['status'][]>(
    STEPS_CONFIG.map(() => 'pending')
  )

  const enrollStudent = useEnrollStudent()

  const form = useForm<NewStudentFormData>({
    resolver: zodResolver(newStudentSchema),
    defaultValues: {
      basicInfo: {
        name: '',
        email: '',
        phone: '',
        birthDate: new Date(),
        documentType: 'CPF',
        documentNumber: '',
        isSelfResponsible: false,
        whatsappContact: true,
      },
      responsibles: [],
      address: {
        zipCode: '',
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
      },
      medicalInfo: {
        conditions: '',
        medications: [],
        emergencyContacts: [],
      },
      billing: {
        academicPeriodId: '',
        courseId: '',
        levelId: '',
        classId: '',
        contractId: '',
        monthlyFee: 0,
        discount: 0,
        paymentDate: 5,
        paymentMethod: 'BOLETO',
        installments: 12,
        scholarshipId: null,
      },
    },
  })

  const isSelfResponsible = form.watch('basicInfo.isSelfResponsible')

  const steps: Step[] = STEPS_CONFIG.map((step, index) => ({
    ...step,
    status: index === 1 && isSelfResponsible ? 'disabled' : stepsStatus[index],
  }))

  async function validateCurrentStep(): Promise<boolean> {
    let isValid = false
    const currentStepsStatus = [...stepsStatus]

    switch (currentStep) {
      case 0:
        isValid = await form.trigger([
          'basicInfo.name',
          'basicInfo.phone',
          'basicInfo.birthDate',
          'basicInfo.documentType',
          'basicInfo.documentNumber',
        ])
        break
      case 1:
        if (isSelfResponsible) {
          isValid = true
        } else {
          const responsibles = form.getValues('responsibles')
          if (responsibles.length === 0) {
            form.setError('root', {
              message: 'Adicione pelo menos um responsável',
            })
            isValid = false
          } else {
            isValid = await form.trigger(['responsibles'])
          }
        }
        break
      case 2:
        isValid = await form.trigger([
          'address.zipCode',
          'address.street',
          'address.number',
          'address.neighborhood',
          'address.city',
          'address.state',
        ])
        break
      case 3:
        const emergencyContacts = form.getValues('medicalInfo.emergencyContacts')
        if (emergencyContacts.length === 0 && !isSelfResponsible) {
          form.setError('root', {
            message: 'Adicione pelo menos um contato de emergência',
          })
          isValid = false
        } else {
          isValid = await form.trigger(['medicalInfo'])
        }
        break
      case 4:
        isValid = await form.trigger([
          'billing.academicPeriodId',
          'billing.courseId',
          'billing.levelId',
          'billing.monthlyFee',
          'billing.paymentDate',
          'billing.paymentMethod',
          'billing.installments',
        ])
        break
    }

    currentStepsStatus[currentStep] = isValid ? 'success' : 'error'
    setStepsStatus(currentStepsStatus)
    return isValid
  }

  async function handleNext() {
    form.clearErrors('root')
    const isValid = await validateCurrentStep()
    if (!isValid) return

    let nextStep = currentStep + 1
    // Skip responsibles step if self responsible
    if (currentStep === 0 && isSelfResponsible) {
      nextStep = 2
    }

    // When moving from address to medical, copy responsibles as emergency contacts
    if (currentStep === 2 && !isSelfResponsible) {
      const responsibles = form.getValues('responsibles')
      const existingContacts = form.getValues('medicalInfo.emergencyContacts')
      if (existingContacts.length === 0) {
        form.setValue(
          'medicalInfo.emergencyContacts',
          responsibles.map((r, index) => ({
            name: r.name,
            phone: r.phone,
            relationship: 'GUARDIAN' as const,
            order: index,
          }))
        )
      }
    }

    setCurrentStep(nextStep)
  }

  function handlePrevious() {
    if (currentStep === 2 && isSelfResponsible) {
      setCurrentStep(0)
    } else {
      setCurrentStep((prev) => Math.max(0, prev - 1))
    }
  }

  async function handleStepClick(stepIndex: number) {
    if (steps[stepIndex].status === 'disabled') return
    if (stepIndex < currentStep || stepsStatus[stepIndex] === 'success') {
      setCurrentStep(stepIndex)
    }
  }

  async function handleSubmit(data: NewStudentFormData) {
    try {
      await enrollStudent.mutateAsync({
        basicInfo: {
          ...data.basicInfo,
          birthDate: data.basicInfo.birthDate.toISOString(),
        },
        responsibles: data.responsibles.map((r) => ({
          ...r,
          birthDate: r.birthDate.toISOString(),
        })),
        address: data.address,
        medicalInfo: data.medicalInfo,
        billing: {
          academicPeriodId: data.billing.academicPeriodId,
          classId: data.billing.classId || undefined,
          contractId: data.billing.contractId || undefined,
          monthlyFee: data.billing.monthlyFee,
          discount: data.billing.discount,
          paymentDate: data.billing.paymentDate,
        },
      })

      toast.success('Aluno matriculado com sucesso!')
      handleClose()
    } catch (error: any) {
      console.error('Error enrolling student:', error)
      toast.error(error?.message || 'Erro ao matricular aluno')
    }
  }

  function handleClose() {
    form.reset()
    setCurrentStep(0)
    setStepsStatus(STEPS_CONFIG.map(() => 'pending'))
    onOpenChange(false)
  }

  function renderStep() {
    switch (currentStep) {
      case 0:
        return <StudentInfoStep />
      case 1:
        return <ResponsiblesStep />
      case 2:
        return <AddressStep />
      case 3:
        return <MedicalInfoStep />
      case 4:
        return <BillingStep />
      default:
        return null
    }
  }

  const isLastStep = currentStep === 4

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Matrícula</DialogTitle>
        </DialogHeader>

        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <Stepper
              currentStep={currentStep}
              steps={steps}
              onStepClick={handleStepClick}
            />

            {renderStep()}

            <div className="flex justify-between pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
              >
                Anterior
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                {isLastStep ? (
                  <Button type="submit" disabled={enrollStudent.isPending}>
                    {enrollStudent.isPending ? 'Matriculando...' : 'Finalizar Matrícula'}
                  </Button>
                ) : (
                  <Button type="button" onClick={handleNext}>
                    Próximo
                  </Button>
                )}
              </div>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
