import { useEffect, useMemo, useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { Stepper, type Step } from '../new-student-modal/components/stepper'
import { StudentInfoStep } from '../new-student-modal/steps/student-info-step'
import { ResponsiblesStep } from '../new-student-modal/steps/responsibles-step'
import { AddressStep } from '../new-student-modal/steps/address-step'
import { MedicalInfoStep } from '../new-student-modal/steps/medical-info-step'
import { editStudentSchema, type EditStudentFormData } from './schema'
import { EmergencyContactRelationship } from '../new-student-modal/schema'
import { useStudentQueryOptions, type StudentResponse } from '~/hooks/queries/use_student'
import { useFullUpdateStudent } from '~/hooks/mutations/use_student_mutations'

const STEPS_CONFIG = [
  { title: 'Aluno', description: 'Dados do aluno' },
  { title: 'Responsáveis', description: 'Dados dos responsáveis' },
  { title: 'Endereço', description: 'Localização do aluno' },
  { title: 'Informações Médicas', description: 'Condições e contatos' },
]

interface EditStudentModalProps {
  studentId: string
  academicPeriodId?: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EditStudentModal({
  studentId,
  academicPeriodId,
  open,
  onOpenChange,
  onSuccess,
}: EditStudentModalProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [stepsStatus, setStepsStatus] = useState<Step['status'][]>(
    STEPS_CONFIG.map(() => 'pending')
  )
  const [isInitialized, setIsInitialized] = useState(false)

  const { data: student, isLoading } = useQuery({
    ...useStudentQueryOptions(studentId),
    enabled: open && !!studentId,
  })

  const fullUpdateStudent = useFullUpdateStudent()

  // Get academicPeriodId from student's levels if not passed as prop
  const effectiveAcademicPeriodId = useMemo(() => {
    if (academicPeriodId) return academicPeriodId
    // StudentResponse includes levels with nested academicPeriod
    const levels = (student as StudentResponse | undefined)?.levels
    const firstLevel = levels?.[0]
    const academicPeriod = firstLevel?.levelAssignedToCourseAcademicPeriod?.courseHasAcademicPeriod?.academicPeriod
    return academicPeriod?.id || null
  }, [academicPeriodId, student])

  const form = useForm<EditStudentFormData>({
    resolver: zodResolver(editStudentSchema),
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
    },
  })

  // Populate form with student data when loaded
  useEffect(() => {
    if (student && open && !isInitialized) {
      const studentData = student as StudentResponse

      const mappedResponsibles =
        studentData.responsibles?.map((r) => ({
          id: r.responsibleId,
          name: r.responsible?.name || '',
          email: r.responsible?.email || '',
          phone: r.responsible?.phone || '',
          documentType: (r.responsible?.documentType as 'CPF' | 'RG' | 'PASSPORT') || 'CPF',
          documentNumber: r.responsible?.documentNumber || '',
          birthDate: r.responsible?.birthDate
            ? new Date(String(r.responsible.birthDate))
            : new Date(),
          isPedagogical: r.isPedagogical || false,
          isFinancial: r.isFinancial || false,
        })) || []

      form.reset({
        basicInfo: {
          name: studentData.user?.name || '',
          email: studentData.user?.email || '',
          phone: studentData.user?.phone || '',
          birthDate: studentData.user?.birthDate
            ? new Date(String(studentData.user.birthDate))
            : new Date(),
          documentType: (studentData.user?.documentType as 'CPF' | 'RG' | 'PASSPORT') || 'CPF',
          documentNumber: studentData.user?.documentNumber || '',
          isSelfResponsible: studentData.isSelfResponsible || false,
          whatsappContact: studentData.user?.whatsappContact || false,
        },
        responsibles: mappedResponsibles,
        address: {
          zipCode: studentData.address?.zipCode || '',
          street: studentData.address?.street || '',
          number: studentData.address?.number || '',
          complement: studentData.address?.complement || '',
          neighborhood: studentData.address?.neighborhood || '',
          city: studentData.address?.city || '',
          state: studentData.address?.state || '',
        },
        medicalInfo: {
          conditions: studentData.medicalInfo?.conditions || '',
          medications:
            studentData.medicalInfo?.medications?.map((m) => ({
              id: m.id,
              name: m.name || '',
              dosage: m.dosage || '',
              frequency: m.frequency || '',
              instructions: m.instructions || '',
            })) || [],
          emergencyContacts:
            studentData.emergencyContacts?.map((c, index) => {
              // Match by userId first, then fallback to name+phone for legacy data
              let respIndex = -1
              if (c.userId) {
                respIndex = studentData.responsibles?.findIndex(
                  (r) => r.responsibleId === c.userId
                ) ?? -1
              }
              if (respIndex < 0) {
                respIndex = mappedResponsibles.findIndex(
                  (r) => r.name === c.name && r.phone === c.phone
                )
              }
              return {
                id: c.id,
                name: c.name || '',
                phone: c.phone || '',
                relationship: (c.relationship as typeof EmergencyContactRelationship[number]) || 'OTHER',
                order: c.order ?? index,
                responsibleIndex: respIndex >= 0 ? respIndex : undefined,
              }
            }) || [],
        },
      })

      setStepsStatus(STEPS_CONFIG.map(() => 'success'))
      setIsInitialized(true)
    }
  }, [student, open, isInitialized, form])

  // Reset when modal closes
  useEffect(() => {
    if (!open) {
      setIsInitialized(false)
      setCurrentStep(0)
      setStepsStatus(STEPS_CONFIG.map(() => 'pending'))
    }
  }, [open])

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
    if (currentStep === 0 && isSelfResponsible) {
      nextStep = 2
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

  async function handleSubmit(data: EditStudentFormData) {
    try {
      await fullUpdateStudent.mutateAsync({
        id: studentId,
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
      })

      toast.success('Aluno atualizado com sucesso!')
      handleClose()
      onSuccess?.()
    } catch (error: any) {
      console.error('Error updating student:', error)
      toast.error(error?.message || 'Erro ao atualizar aluno')
    }
  }

  function handleClose() {
    form.reset()
    setCurrentStep(0)
    setStepsStatus(STEPS_CONFIG.map(() => 'pending'))
    setIsInitialized(false)
    onOpenChange(false)
  }

  function renderStep() {
    switch (currentStep) {
      case 0:
        return <StudentInfoStep excludeUserId={studentId} academicPeriodId={effectiveAcademicPeriodId || undefined} />
      case 1:
        return <ResponsiblesStep academicPeriodId={effectiveAcademicPeriodId || undefined} />
      case 2:
        return <AddressStep />
      case 3:
        return <MedicalInfoStep />
      default:
        return null
    }
  }

  const isLastStep = currentStep === 3

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-[700px]">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Carregando dados do aluno...</span>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[700px] max-h-[90vh] flex flex-col p-0">
        {/* Fixed Header */}
        <div className="p-6 pb-4 border-b shrink-0">
          <DialogHeader>
            <DialogTitle>Editar Aluno</DialogTitle>
          </DialogHeader>
        </div>

        <FormProvider {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              form.handleSubmit(handleSubmit)(e)
            }}
            className="flex flex-col flex-1 min-h-0"
          >
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <Stepper currentStep={currentStep} steps={steps} onStepClick={handleStepClick} />

              {renderStep()}
            </div>

            {/* Fixed Footer */}
            <div className="flex justify-between p-6 pt-4 border-t bg-background shrink-0">
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
                {!isLastStep && (
                  <Button type="button" variant="outline" onClick={handleNext}>
                    Próximo
                  </Button>
                )}
                <Button type="submit" disabled={fullUpdateStudent.isPending}>
                  {fullUpdateStudent.isPending ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
