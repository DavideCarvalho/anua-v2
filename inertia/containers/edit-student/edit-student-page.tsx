import { useState, useEffect, useMemo } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Link, router } from '@inertiajs/react'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '~/components/ui/button'
import {
  EnrollmentSidebar,
  type StepStatus,
  type EnrollmentStep,
} from '../enrollment/enrollment-sidebar'
import { StudentInfoStep } from '../enrollment/steps/student-step'
import { ResponsiblesStep } from '../enrollment/steps/responsibles-step'
import { AddressStep } from '../enrollment/steps/address-step'
import { MedicalInfoStep } from '../enrollment/steps/medical-step'
import { ReviewStep } from './steps/review-step'
import { EditPaymentSection } from '../students/edit-payment-modal'
import { editStudentSchema, type EditStudentFormData } from '../students/edit-student-modal/schema'
import { EmergencyContactRelationship } from '../enrollment/schema'
import { useStudentQueryOptions, type StudentResponse } from '~/hooks/queries/use_student'
import { useFullUpdateStudent } from '~/hooks/mutations/use_student_mutations'

const STEPS_CONFIG = [
  { title: 'Aluno', description: 'Dados do aluno' },
  { title: 'Responsáveis', description: 'Dados dos responsáveis' },
  { title: 'Endereço', description: 'Localização do aluno' },
  { title: 'Informações Médicas', description: 'Condições e documentos' },
  { title: 'Cobrança', description: 'Dados financeiros' },
  { title: 'Revisão', description: 'Confirme os dados' },
]

interface EditStudentPageProps {
  studentId: string
}

export function EditStudentPage({ studentId }: EditStudentPageProps) {
  // ── State ─────────────────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState(0)
  const [maxVisitedStep, setMaxVisitedStep] = useState(0)
  const [stepsStatus, setStepsStatus] = useState<StepStatus[]>(STEPS_CONFIG.map(() => 'pending'))
  const [isInitialized, setIsInitialized] = useState(false)

  const fullUpdateStudent = useFullUpdateStudent()

  // ── Data loading ────────────────────────────────────────────────────
  const { data: student, isLoading } = useQuery(useStudentQueryOptions(studentId))

  // Derive academicPeriodId from student data
  const academicPeriodId = useMemo(() => {
    const studentData = student as StudentResponse | undefined
    const levels = studentData?.levels
    const firstLevel = levels?.[0]
    const academicPeriod =
      firstLevel?.levelAssignedToCourseAcademicPeriod?.courseHasAcademicPeriod?.academicPeriod
    return academicPeriod?.id || undefined
  }, [student])

  // ── Form setup ────────────────────────────────────────────────────────
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

  // ── Populate form ───────────────────────────────────────────────────
  useEffect(() => {
    if (student && !isInitialized) {
      const studentData = student as StudentResponse

      // Build a set of responsible IDs that are emergency contacts
      const emergencyResponsibleIds = new Set<string>()
      studentData.emergencyContacts?.forEach((c: any) => {
        if (c.userId) {
          emergencyResponsibleIds.add(c.userId)
        }
      })

      const mappedResponsibles =
        studentData.responsibles?.map((r: any) => ({
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
          isEmergencyContact: emergencyResponsibleIds.has(r.responsibleId || ''),
          isExisting: true,
        })) || []

      // Also match by name+phone for legacy data where userId may be missing
      studentData.emergencyContacts?.forEach((c: any) => {
        if (!c.userId) {
          const idx = mappedResponsibles.findIndex(
            (r: any) => r.name === c.name && r.phone === c.phone
          )
          if (idx >= 0) {
            mappedResponsibles[idx].isEmergencyContact = true
          }
        }
      })

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
            studentData.medicalInfo?.medications?.map((m: any) => ({
              id: m.id,
              name: m.name || '',
              dosage: m.dosage || '',
              frequency: m.frequency || '',
              instructions: m.instructions || '',
            })) || [],
          emergencyContacts:
            studentData.emergencyContacts
              ?.filter((c: any) => {
                // Exclude contacts linked to responsibles — those are shown read-only
                if (c.userId) {
                  const isResp = studentData.responsibles?.some(
                    (r: any) => r.responsibleId === c.userId
                  )
                  if (isResp) return false
                }
                const matchesByName = mappedResponsibles.some(
                  (r: any) => r.name === c.name && r.phone === c.phone
                )
                if (matchesByName) return false
                return true
              })
              .map((c: any, index: number) => ({
                id: c.id,
                name: c.name || '',
                phone: c.phone || '',
                relationship:
                  (c.relationship as (typeof EmergencyContactRelationship)[number]) || 'OTHER',
                order: c.order ?? index,
              })) || [],
        },
      })

      // Mark all steps as success since data is loaded
      setStepsStatus(STEPS_CONFIG.map(() => 'success'))
      setMaxVisitedStep(STEPS_CONFIG.length - 1)
      setIsInitialized(true)
    }
  }, [student, isInitialized, form])

  // ── Watchers ──────────────────────────────────────────────────────────
  const isSelfResponsible = form.watch('basicInfo.isSelfResponsible')

  // ── Clear step error when form data changes ─────────────────────────
  useEffect(() => {
    const subscription = form.watch(() => {
      if (stepsStatus[currentStep] === 'error') {
        setStepsStatus((prev) => {
          const next = [...prev]
          next[currentStep] = 'pending'
          return next
        })
        form.clearErrors('root')
      }
    })
    return () => subscription.unsubscribe()
  }, [currentStep, stepsStatus, form])

  // ── Sidebar steps ─────────────────────────────────────────────────────
  const steps: EnrollmentStep[] = STEPS_CONFIG.map((step, index) => ({
    ...step,
    status: (index === 1 && isSelfResponsible ? 'disabled' : stepsStatus[index]) as StepStatus,
  }))

  // ── Validation ────────────────────────────────────────────────────────
  async function validateCurrentStep(): Promise<boolean> {
    let isValid = false
    const currentStepsStatus = [...stepsStatus]

    switch (currentStep) {
      case 0: {
        const birthDate = form.getValues('basicInfo.birthDate')
        const isStudentAdult = (() => {
          if (!birthDate) return false
          const today = new Date()
          const age = today.getFullYear() - birthDate.getFullYear()
          const monthDiff = today.getMonth() - birthDate.getMonth()
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            return age - 1 >= 18
          }
          return age >= 18
        })()

        const fieldsToValidate: (keyof EditStudentFormData['basicInfo'])[] = [
          'name',
          'birthDate',
          'documentType',
        ]

        if (isStudentAdult) {
          fieldsToValidate.push('phone')
          fieldsToValidate.push('documentNumber')
        }

        isValid = await form.trigger(fieldsToValidate.map((f) => `basicInfo.${f}` as const))

        if (isValid) {
          const studentDoc = form.getValues('basicInfo.documentNumber')?.replace(/\D/g, '') || ''
          const responsibles = form.getValues('responsibles')
          if (studentDoc && responsibles.length > 0) {
            const hasConflict = responsibles.some((resp) => {
              const respDoc = resp.documentNumber?.replace(/\D/g, '') || ''
              return respDoc && respDoc === studentDoc
            })
            if (hasConflict) {
              form.setError('root', {
                message: 'O documento do aluno não pode ser igual ao de um responsável',
              })
              isValid = false
            }
          }
        }
        break
      }
      case 1: {
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

            if (isValid) {
              const hasUnderageResponsible = responsibles.some((resp) => {
                if (!resp.birthDate) return true
                const today = new Date()
                const birthDate = new Date(resp.birthDate)
                const age = today.getFullYear() - birthDate.getFullYear()
                const monthDiff = today.getMonth() - birthDate.getMonth()
                const actualAge =
                  monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())
                    ? age - 1
                    : age
                return actualAge < 18
              })

              if (hasUnderageResponsible) {
                form.setError('root', {
                  message: 'Todos os responsáveis devem ser maiores de idade',
                })
                isValid = false
              }
            }

            if (isValid) {
              const hasPedagogical = responsibles.some((r) => r.isPedagogical)
              const hasFinancial = responsibles.some((r) => r.isFinancial)
              if (!hasPedagogical || !hasFinancial) {
                form.setError('root', {
                  message: 'É necessário pelo menos um responsável financeiro e um pedagógico',
                })
                isValid = false
              }
            }

            if (isValid) {
              const studentDoc =
                form.getValues('basicInfo.documentNumber')?.replace(/\D/g, '') || ''
              const respDocs = responsibles.map((r) => r.documentNumber?.replace(/\D/g, '') || '')

              const hasStudentConflict = respDocs.some((doc) => doc && doc === studentDoc)
              if (hasStudentConflict) {
                form.setError('root', {
                  message: 'O documento do responsável não pode ser igual ao do aluno',
                })
                isValid = false
              }

              if (isValid) {
                const uniqueDocs = new Set(respDocs.filter((d) => d))
                if (uniqueDocs.size !== respDocs.filter((d) => d).length) {
                  form.setError('root', {
                    message: 'Cada responsável deve ter um documento único',
                  })
                  isValid = false
                }
              }
            }
          }
        }
        break
      }
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
      case 3: {
        const emergencyContacts = form.getValues('medicalInfo.emergencyContacts')
        const hasEmergencyGuardians = form
          .getValues('responsibles')
          .some((r) => r.isEmergencyContact)
        if (emergencyContacts.length === 0 && !hasEmergencyGuardians && !isSelfResponsible) {
          form.setError('root', {
            message: 'Adicione pelo menos um contato de emergência',
          })
          isValid = false
        } else {
          isValid = await form.trigger(['medicalInfo'])
        }
        break
      }
      case 4:
        isValid = true
        break
      case 5:
        isValid = true
        break
    }

    currentStepsStatus[currentStep] = isValid ? 'success' : 'error'
    setStepsStatus(currentStepsStatus)
    return isValid
  }

  // ── Navigation ────────────────────────────────────────────────────────
  async function handleNext() {
    form.clearErrors('root')
    const isValid = await validateCurrentStep()
    if (!isValid) return

    let nextStep = currentStep + 1
    if (currentStep === 0 && isSelfResponsible) {
      nextStep = 2
    }

    setCurrentStep(nextStep)
    setMaxVisitedStep((prev) => Math.max(prev, nextStep))
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
    if (stepIndex <= maxVisitedStep || stepsStatus[stepIndex] === 'success') {
      setCurrentStep(stepIndex)
    }
  }

  // ── Submit ────────────────────────────────────────────────────────────
  async function handleSubmit(data: EditStudentFormData) {
    // Merge guardian emergency contacts with manual ones
    const guardianContacts = data.responsibles
      .filter((r) => r.isEmergencyContact)
      .map((r, i) => ({
        name: r.name,
        phone: r.phone,
        relationship: 'GUARDIAN' as const,
        order: i,
      }))
    const manualContacts = (data.medicalInfo.emergencyContacts || []).map((c, i) => ({
      ...c,
      order: guardianContacts.length + i,
    }))

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
        medicalInfo: {
          ...data.medicalInfo,
          emergencyContacts: [...guardianContacts, ...manualContacts],
        },
      })

      toast.success('Aluno atualizado com sucesso!')
      router.visit('/escola/administrativo/alunos')
    } catch (error: any) {
      console.error('Error updating student:', error)

      const status = error?.status
      const message = error?.value?.message || error?.message

      if (status === 422) {
        toast.error('Erro de validação', {
          description: 'Verifique os campos preenchidos e tente novamente.',
        })
      } else if (status === 500) {
        toast.error('Erro interno', {
          description:
            'Ocorreu um erro no servidor. Por favor, tente novamente ou entre em contato com o suporte.',
        })
      } else {
        toast.error('Erro ao atualizar aluno', {
          description: message || 'Ocorreu um erro inesperado. Tente novamente.',
        })
      }
    }
  }

  // ── Derived state ─────────────────────────────────────────────────────
  const isLastStep = currentStep === 5

  // ── Loading state ─────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Carregando dados do aluno...</span>
      </div>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="flex h-full flex-col">
      {/* Top bar: back link */}
      <div className="shrink-0 border-b bg-background">
        <div className="px-6 py-3">
          <Link
            href="/escola/administrativo/alunos"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para alunos
          </Link>
        </div>
      </div>

      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-1 flex-col min-h-0">
          {/* Sidebar + Content */}
          <div className="flex flex-1 min-h-0 relative">
            <EnrollmentSidebar
              steps={steps}
              currentStep={currentStep}
              onStepClick={handleStepClick}
            />

            <div className="flex-1 overflow-y-auto p-6">
              {currentStep === 0 && (
                <StudentInfoStep excludeUserId={studentId} academicPeriodId={academicPeriodId} />
              )}
              {currentStep === 1 && <ResponsiblesStep academicPeriodId={academicPeriodId} />}
              {currentStep === 2 && <AddressStep />}
              {currentStep === 3 && <MedicalInfoStep />}
              {currentStep === 4 && (
                <EditPaymentSection
                  studentId={studentId}
                  studentName={form.watch('basicInfo.name') || 'Aluno'}
                />
              )}
              {currentStep === 5 && <ReviewStep onGoToStep={(step) => setCurrentStep(step)} />}
            </div>
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
              <Button
                type="button"
                variant="outline"
                onClick={() => router.visit('/escola/administrativo/alunos')}
              >
                Cancelar
              </Button>
              {isLastStep ? (
                <Button
                  type="button"
                  disabled={fullUpdateStudent.isPending}
                  onClick={() => form.handleSubmit(handleSubmit)()}
                >
                  {fullUpdateStudent.isPending ? 'Salvando...' : 'Salvar Alterações'}
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
    </div>
  )
}
