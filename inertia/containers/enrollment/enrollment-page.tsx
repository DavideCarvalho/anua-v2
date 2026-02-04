import { useState, useRef, useEffect } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Link, router } from '@inertiajs/react'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { cn } from '~/lib/utils'
import { Button } from '~/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Label } from '~/components/ui/label'
import { EnrollmentSidebar, type StepStatus, type EnrollmentStep } from './enrollment-sidebar'
import { StudentInfoStep } from './steps/student-step'
import { ResponsiblesStep } from './steps/responsibles-step'
import { AddressStep } from './steps/address-step'
import { MedicalInfoStep } from './steps/medical-step'
import { BillingStep } from './steps/billing-step'
import { ReviewStep } from './steps/review-step'
import { enrollmentSchema, type EnrollmentFormData } from './schema'
import { useEnrollStudent } from '~/hooks/mutations/use_student_mutations'
import { useAcademicPeriodsQueryOptions } from '~/hooks/queries/use_academic_periods'
import { useAcademicPeriodCoursesQueryOptions } from '~/hooks/queries/use_academic_period_courses'
import { useClassesQueryOptions } from '~/hooks/queries/use_classes'
import { useContractQueryOptions } from '~/hooks/queries/use_contract'

const STEPS_CONFIG = [
  { title: 'Aluno', description: 'Dados do aluno' },
  { title: 'Responsáveis', description: 'Dados dos responsáveis' },
  { title: 'Endereço', description: 'Localização do aluno' },
  { title: 'Informações Médicas', description: 'Condições e documentos' },
  { title: 'Cobrança', description: 'Dados financeiros' },
  { title: 'Revisão', description: 'Confirme os dados' },
]

export function EnrollmentPage() {
  // ── State ─────────────────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState(0)
  const [maxVisitedStep, setMaxVisitedStep] = useState(0)
  const [stepsStatus, setStepsStatus] = useState<StepStatus[]>(
    STEPS_CONFIG.map(() => 'pending')
  )
  const [selectorShake, setSelectorShake] = useState(false)
  const selectorRef = useRef<HTMLDivElement>(null)

  const enrollStudent = useEnrollStudent()

  // ── Form setup ────────────────────────────────────────────────────────
  const form = useForm<EnrollmentFormData>({
    resolver: zodResolver(enrollmentSchema) as any,
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
        contractId: null,
        monthlyFee: 0,
        enrollmentFee: 0,
        paymentDate: 5,
        paymentMethod: 'BOLETO',
        installments: 12,
        enrollmentInstallments: 1,
        flexibleInstallments: true,
        scholarshipId: null,
        discountPercentage: 0,
        enrollmentDiscountPercentage: 0,
      },
    },
  })

  // ── Watchers ──────────────────────────────────────────────────────────
  const isSelfResponsible = form.watch('basicInfo.isSelfResponsible')
  const academicPeriodId = form.watch('billing.academicPeriodId')
  const courseId = form.watch('billing.courseId')
  const levelId = form.watch('billing.levelId')
  const classId = form.watch('billing.classId')

  // ── Queries for academic data ─────────────────────────────────────────
  const { data: academicPeriodsData } = useQuery(
    useAcademicPeriodsQueryOptions({ limit: 50 })
  )
  const academicPeriods = academicPeriodsData?.data ?? []

  const { data: coursesData } = useQuery({
    ...useAcademicPeriodCoursesQueryOptions(academicPeriodId),
    enabled: !!academicPeriodId,
  })
  const courses = coursesData ?? []

  const { data: classesData } = useQuery({
    ...useClassesQueryOptions({ levelId, academicPeriodId, limit: 50 }),
    enabled: !!levelId && !!academicPeriodId,
  })
  const classes = classesData?.data ?? []

  // ── Resolve names for ReviewStep ──────────────────────────────────────
  const selectedCourse = courses.find((c: any) => c.courseId === courseId)
  const selectedLevel = selectedCourse?.levels?.find((l: any) => l.levelId === levelId)
  const selectedClass = classes.find((c: any) => c.id === classId)
  const contractId = selectedLevel?.contractId

  const { data: contractData } = useQuery({
    ...useContractQueryOptions(contractId),
    enabled: !!contractId,
  })

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
        // Check if student is adult to determine if document is required
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

        // Base fields to validate
        const fieldsToValidate: (keyof EnrollmentFormData['basicInfo'])[] = [
          'name',
          'birthDate',
          'documentType',
        ]

        // Add phone if adult
        if (isStudentAdult) {
          fieldsToValidate.push('phone')
        }

        // Add document if adult
        if (isStudentAdult) {
          fieldsToValidate.push('documentNumber')
        }

        isValid = await form.trigger(fieldsToValidate.map((f) => `basicInfo.${f}` as const))

        // Check if student document conflicts with any responsible (only if document is filled)
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
            // Check form validation first
            isValid = await form.trigger(['responsibles'])

            if (isValid) {
              // Check if all responsibles are adults
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

            // Check pedagogical and financial flags
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
              // Check for document conflicts
              const studentDoc =
                form.getValues('basicInfo.documentNumber')?.replace(/\D/g, '') || ''
              const respDocs = responsibles.map(
                (r) => r.documentNumber?.replace(/\D/g, '') || ''
              )

              // Check student vs responsibles
              const hasStudentConflict = respDocs.some((doc) => doc && doc === studentDoc)
              if (hasStudentConflict) {
                form.setError('root', {
                  message: 'O documento do responsável não pode ser igual ao do aluno',
                })
                isValid = false
              }

              // Check responsibles vs each other
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
        const hasEmergencyGuardians = form.getValues('responsibles').some((r) => r.isEmergencyContact)
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
      case 4: {
        // Only validate payment fields if contract exists
        const billingContractId = form.getValues('billing.contractId')
        if (billingContractId) {
          isValid = await form.trigger([
            'billing.academicPeriodId',
            'billing.courseId',
            'billing.levelId',
            'billing.paymentDate',
            'billing.paymentMethod',
            'billing.installments',
          ])
        } else {
          isValid = await form.trigger([
            'billing.academicPeriodId',
            'billing.courseId',
            'billing.levelId',
          ])
        }
        break
      }
      case 5:
        // Review step: always valid (no validation needed)
        isValid = true
        break
    }

    currentStepsStatus[currentStep] = isValid ? 'success' : 'error'
    setStepsStatus(currentStepsStatus)
    return isValid
  }

  // ── Selector shake ────────────────────────────────────────────────────
  function shakeSelector() {
    setSelectorShake(true)
    selectorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setTimeout(() => setSelectorShake(false), 500)
  }

  // ── Navigation ────────────────────────────────────────────────────────
  async function handleNext() {
    // Check if academic period is selected first
    if (!academicPeriodId) {
      toast.error('Selecione o período letivo', {
        description: 'É necessário selecionar o período letivo para continuar.',
      })
      shakeSelector()
      return
    }

    form.clearErrors('root')
    const isValid = await validateCurrentStep()
    if (!isValid) return

    let nextStep = currentStep + 1
    // Skip responsibles step if self responsible
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
    // Allow navigation to any step that was already visited or is marked as success
    if (stepIndex <= maxVisitedStep || stepsStatus[stepIndex] === 'success') {
      setCurrentStep(stepIndex)
    }
  }

  // ── Submit ────────────────────────────────────────────────────────────
  async function handleSubmit(data: EnrollmentFormData) {
    // Check if academic period is selected
    if (!academicPeriodId) {
      toast.error('Selecione o período letivo', {
        description: 'É necessário selecionar o período letivo para continuar.',
      })
      shakeSelector()
      return
    }

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
        medicalInfo: {
          ...data.medicalInfo,
          emergencyContacts: [...guardianContacts, ...manualContacts],
        },
        billing: {
          academicPeriodId: data.billing.academicPeriodId,
          monthlyFee: data.billing.monthlyFee,
          enrollmentFee: data.billing.enrollmentFee,
          discount: data.billing.discountPercentage,
          enrollmentDiscount: data.billing.enrollmentDiscountPercentage,
          paymentDate: data.billing.paymentDate,
          paymentMethod: data.billing.paymentMethod,
          installments: data.billing.installments,
          enrollmentInstallments: data.billing.enrollmentInstallments,
          ...(data.billing.classId && { classId: data.billing.classId }),
          ...(data.billing.contractId && { contractId: data.billing.contractId }),
          ...(data.billing.scholarshipId && { scholarshipId: data.billing.scholarshipId }),
        },
      })

      toast.success('Aluno matriculado com sucesso!')
      router.visit('/escola/administrativo/matriculas')
    } catch (error: any) {
      console.error('Error enrolling student:', error)

      const status = error?.status
      const message = error?.value?.message || error?.message

      if (status === 409) {
        toast.error('Aluno já matriculado', {
          description: message || 'Este aluno já está matriculado neste período letivo.',
        })
        setCurrentStep(0)
      } else if (status === 400) {
        toast.error('Erro nos dados de cobrança', {
          description: message || 'Período letivo não encontrado. Selecione outro período.',
        })
        setCurrentStep(4)
      } else if (status === 422) {
        toast.error('Erro de validação', {
          description: 'Verifique os campos preenchidos e tente novamente.',
        })
      } else if (status === 500) {
        toast.error('Erro interno', {
          description:
            'Ocorreu um erro no servidor. Por favor, tente novamente ou entre em contato com o suporte.',
        })
      } else {
        toast.error('Erro ao matricular aluno', {
          description: message || 'Ocorreu um erro inesperado. Tente novamente.',
        })
      }
    }
  }

  // ── Derived state ─────────────────────────────────────────────────────
  const isLastStep = currentStep === 5

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="flex h-full flex-col">
      {/* Top bar: back link + academic period selector */}
      <div className="shrink-0 border-b bg-background">
        <div className="px-6 py-3">
          <Link
            href="/escola/administrativo/matriculas"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para matrículas
          </Link>
        </div>

        {/* Academic Period Selector */}
        <div
          ref={selectorRef}
          className={cn(
            'mx-6 mb-4 p-3 rounded-lg transition-all',
            !academicPeriodId &&
              'bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700',
            selectorShake && 'animate-shake'
          )}
        >
          <div className="flex items-center gap-2">
            {!academicPeriodId && (
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            )}
            <Label
              className={cn(
                'text-sm font-medium',
                !academicPeriodId && 'text-amber-700 dark:text-amber-400'
              )}
            >
              Período Letivo *
            </Label>
          </div>
          <Select
            value={academicPeriodId || ''}
            onValueChange={(value) => {
              form.setValue('billing.academicPeriodId', value)
              // Reset dependent fields when period changes
              form.setValue('billing.courseId', '')
              form.setValue('billing.levelId', '')
              form.setValue('billing.classId', '')
              form.setValue('billing.contractId', null)
            }}
          >
            <SelectTrigger
              className={cn(
                'mt-1',
                !academicPeriodId &&
                  'border-amber-500 dark:border-amber-400 focus:ring-amber-500 dark:focus:ring-amber-400'
              )}
            >
              <SelectValue placeholder="Selecione o período letivo" />
            </SelectTrigger>
            <SelectContent>
              {academicPeriods.map((period) => (
                <SelectItem key={period.id} value={period.id}>
                  {period.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!academicPeriodId && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
              Selecione o período letivo para preencher o formulário
            </p>
          )}
        </div>
      </div>

      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex flex-1 flex-col min-h-0"
        >
          {/* Sidebar + Content */}
          <div className="flex flex-1 min-h-0 relative">
            {/* Overlay when no academic period selected */}
            {!academicPeriodId && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
                <div className="text-center p-6">
                  <AlertCircle className="h-12 w-12 text-amber-500 dark:text-amber-400 mx-auto mb-3" />
                  <p className="text-lg font-medium text-foreground">
                    Selecione o período letivo
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Use o seletor acima para escolher o período letivo antes de continuar
                  </p>
                </div>
              </div>
            )}

            <EnrollmentSidebar
              steps={steps}
              currentStep={currentStep}
              onStepClick={handleStepClick}
            />

            <div className="flex-1 overflow-y-auto p-6">
              {/* Step 0: Dados do Aluno */}
              {currentStep === 0 && <StudentInfoStep academicPeriodId={academicPeriodId} />}

              {/* Step 1: Responsáveis */}
              {currentStep === 1 && <ResponsiblesStep academicPeriodId={academicPeriodId} />}

              {/* Step 2: Endereço */}
              {currentStep === 2 && <AddressStep />}

              {/* Step 3: Informações Médicas */}
              {currentStep === 3 && <MedicalInfoStep />}

              {/* Step 4: Cobrança */}
              {currentStep === 4 && <BillingStep />}

              {/* Step 5: Revisão */}
              {currentStep === 5 && (
                <ReviewStep
                  onGoToStep={(step) => setCurrentStep(step)}
                  courseName={selectedCourse?.name}
                  levelName={selectedLevel?.name}
                  className={selectedClass?.name}
                  contractName={contractData?.name}
                />
              )}
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
                onClick={() => router.visit('/escola/administrativo/matriculas')}
              >
                Cancelar
              </Button>
              {isLastStep ? (
                <Button
                  type="button"
                  disabled={enrollStudent.isPending}
                  onClick={() => form.handleSubmit(handleSubmit)()}
                >
                  {enrollStudent.isPending ? 'Matriculando...' : 'Confirmar Matrícula'}
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
