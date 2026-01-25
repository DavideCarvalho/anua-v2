import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useRouter } from '@tuyau/inertia/react'
import { useQuery } from '@tanstack/react-query'
import { Loader2, Plus, Trash2 } from 'lucide-react'

import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { Checkbox } from '../../components/ui/checkbox'
import { Stepper } from '../../components/ui/stepper'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import { tuyau } from '../../lib/api'
import { useAcademicPeriodsQueryOptions } from '../../hooks/queries/use_academic_periods'

const formSchema = z.object({
  // Basic info
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  description: z.string().optional(),
  academicPeriodId: z.string().optional(),
  endDate: z.string().optional(),
  hasInsurance: z.boolean().default(false),
  isActive: z.boolean().default(true),

  // Payment
  enrollmentValue: z.string().optional(),
  enrollmentValueInstallments: z.coerce.number().min(1).default(1),
  amount: z.string().min(1, 'Valor do curso é obrigatório'),
  paymentType: z.enum(['MONTHLY', 'UPFRONT']),
  installments: z.coerce.number().min(1).default(12),
  flexibleInstallments: z.boolean().default(false),
  paymentDays: z.array(z.number()).min(1, 'Selecione pelo menos um dia de vencimento'),

  // Interest and discounts
  interestPercentage: z.coerce.number().min(0).max(100).optional(),
  interestPerDay: z.coerce.number().min(0).max(100).optional(),
  earlyDiscounts: z.array(
    z.object({
      daysBeforeDeadline: z.coerce.number().min(1),
      percentage: z.coerce.number().min(0).max(100),
    })
  ).default([]),
})

type FormValues = z.infer<typeof formSchema>

interface ContractFormProps {
  schoolId: string
  initialData?: {
    id: string
    name: string
    description?: string | null
    academicPeriodId?: string | null
    endDate?: string | null
    hasInsurance: boolean
    isActive: boolean
    enrollmentValue?: number | null
    enrollmentValueInstallments: number
    ammount: number
    paymentType: 'MONTHLY' | 'UPFRONT'
    installments: number
    flexibleInstallments: boolean
    paymentDays?: { day: number }[]
    interestConfig?: {
      delayInterestPercentage?: number | null
      delayInterestPerDayDelayed?: number | null
    } | null
    earlyDiscounts?: { daysBeforeDeadline: number; percentage: number }[]
  }
}

const AVAILABLE_DAYS = [5, 10, 15, 20, 25]

const steps = [
  { title: 'Informações Básicas', description: 'Nome e configurações gerais' },
  { title: 'Pagamento', description: 'Valores e parcelas' },
  { title: 'Juros e Descontos', description: 'Multas e incentivos' },
]

export function ContractForm({ schoolId, initialData }: ContractFormProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = !!initialData

  // Fetch academic periods via API
  const { data: academicPeriodsData } = useQuery(
    useAcademicPeriodsQueryOptions({ limit: 100 })
  )
  const academicPeriods = Array.isArray(academicPeriodsData)
    ? academicPeriodsData
    : academicPeriodsData?.data || []

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      academicPeriodId: initialData?.academicPeriodId || undefined,
      endDate: initialData?.endDate ? initialData.endDate.split('T')[0] : '',
      hasInsurance: initialData?.hasInsurance || false,
      isActive: initialData?.isActive ?? true,
      enrollmentValue: initialData?.enrollmentValue
        ? String(initialData.enrollmentValue / 100)
        : '',
      enrollmentValueInstallments: initialData?.enrollmentValueInstallments || 1,
      amount: initialData?.ammount ? String(initialData.ammount / 100) : '',
      paymentType: initialData?.paymentType || 'MONTHLY',
      installments: initialData?.installments || 12,
      flexibleInstallments: initialData?.flexibleInstallments || false,
      paymentDays: initialData?.paymentDays?.map((p) => p.day) || [10],
      interestPercentage: initialData?.interestConfig?.delayInterestPercentage || undefined,
      interestPerDay: initialData?.interestConfig?.delayInterestPerDayDelayed || undefined,
      earlyDiscounts: initialData?.earlyDiscounts || [],
    },
  })

  const earlyDiscounts = form.watch('earlyDiscounts')

  const handleNext = async () => {
    let fieldsToValidate: (keyof FormValues)[] = []

    if (currentStep === 0) {
      fieldsToValidate = ['name']
    } else if (currentStep === 1) {
      fieldsToValidate = ['amount', 'paymentType', 'paymentDays']
    }

    const isValid = await form.trigger(fieldsToValidate)
    if (!isValid) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true)
    try {
      const payload = {
        schoolId,
        name: values.name,
        description: values.description || undefined,
        academicPeriodId: values.academicPeriodId || undefined,
        endDate: values.endDate || undefined,
        hasInsurance: values.hasInsurance,
        isActive: values.isActive,
        enrollmentValue: values.enrollmentValue
          ? Math.round(Number(values.enrollmentValue) * 100)
          : undefined,
        enrollmentValueInstallments: values.enrollmentValueInstallments,
        amount: Math.round(Number(values.amount) * 100),
        paymentType: values.paymentType,
        installments: values.installments,
        flexibleInstallments: values.flexibleInstallments,
      }

      if (isEditing) {
        const response = await tuyau.api.v1.contracts({ id: initialData.id }).$put(payload)
        if (response.error) throw new Error(response.error.message)

        // Update payment days
        for (const day of values.paymentDays) {
          await tuyau.api.v1.contracts({ id: initialData.id })['payment-days'].$post({ day })
        }

        // Update interest config if provided
        if (values.interestPercentage || values.interestPerDay) {
          await tuyau.api.v1.contracts({ id: initialData.id })['interest-config'].$put({
            delayInterestPercentage: values.interestPercentage || 0,
            delayInterestPerDayDelayed: values.interestPerDay || 0,
          })
        }

        toast.success('Contrato atualizado com sucesso!')
      } else {
        const response = await tuyau.api.v1.contracts.$post(payload)
        if (response.error) throw new Error(response.error.message)

        const contractId = response.data?.id
        if (contractId) {
          // Add payment days
          for (const day of values.paymentDays) {
            await tuyau.api.v1.contracts({ id: contractId })['payment-days'].$post({ day })
          }

          // Add interest config if provided
          if (values.interestPercentage || values.interestPerDay) {
            await tuyau.api.v1.contracts({ id: contractId })['interest-config'].$put({
              delayInterestPercentage: values.interestPercentage || 0,
              delayInterestPerDayDelayed: values.interestPerDay || 0,
            })
          }

          // Add early discounts
          for (const discount of values.earlyDiscounts) {
            await tuyau.api.v1.contracts({ id: contractId })['early-discounts'].$post({
              daysBeforeDeadline: discount.daysBeforeDeadline,
              percentage: discount.percentage,
            })
          }
        }

        toast.success('Contrato criado com sucesso!')
      }

      router.visit({ route: 'web.escola.administrativo.contratos' })
    } catch (error) {
      toast.error(isEditing ? 'Erro ao atualizar contrato' : 'Erro ao criar contrato', {
        description: error instanceof Error ? error.message : 'Erro desconhecido',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  function addEarlyDiscount() {
    const current = form.getValues('earlyDiscounts')
    form.setValue('earlyDiscounts', [...current, { daysBeforeDeadline: 5, percentage: 3 }])
  }

  function removeEarlyDiscount(index: number) {
    const current = form.getValues('earlyDiscounts')
    form.setValue(
      'earlyDiscounts',
      current.filter((_, i) => i !== index)
    )
  }

  return (
    <div className="space-y-8">
      <Stepper steps={steps} currentStep={currentStep} />

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              {/* Step 0: Informações Básicas */}
              {currentStep === 0 && (
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Contrato *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Fundamental I - 2025" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="academicPeriodId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Período Letivo</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um período" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {academicPeriods.map((period: any) => (
                              <SelectItem key={period.id} value={period.id}>
                                {period.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Descrição do contrato..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Término</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex flex-col gap-4">
                    {/* TODO: Habilitar quando seguro de inadimplência estiver pronto
                    <FormField
                      control={form.control}
                      name="hasInsurance"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center gap-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div>
                            <FormLabel className="font-normal">
                              Seguro de Inadimplência
                            </FormLabel>
                            <FormDescription>
                              Habilita cobertura de inadimplência para este contrato
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    */}

                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center gap-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div>
                            <FormLabel className="font-normal">Contrato Ativo</FormLabel>
                            <FormDescription>
                              Contratos inativos não aparecem nas opções de matrícula
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Step 1: Pagamento */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="enrollmentValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor da Matrícula (R$)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="500,00"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="enrollmentValueInstallments"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Parcelas da Matrícula</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" max="12" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor do Curso (R$) *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="1200,00"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>Valor total ou mensal dependendo do tipo</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="paymentType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Pagamento *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="MONTHLY">Mensal</SelectItem>
                              <SelectItem value="UPFRONT">À Vista (parcelado)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="installments"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Parcelas do Curso</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="flexibleInstallments"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-end gap-3 space-y-0 pb-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div>
                            <FormLabel className="font-normal">Parcelas Flexíveis</FormLabel>
                            <FormDescription>
                              Aluno escolhe quantidade de parcelas
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="paymentDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dias de Vencimento *</FormLabel>
                        <FormDescription>
                          Selecione os dias disponíveis para vencimento das parcelas
                        </FormDescription>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {AVAILABLE_DAYS.map((day) => (
                            <Button
                              key={day}
                              type="button"
                              variant={field.value.includes(day) ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => {
                                if (field.value.includes(day)) {
                                  field.onChange(field.value.filter((d) => d !== day))
                                } else {
                                  field.onChange([...field.value, day].sort((a, b) => a - b))
                                }
                              }}
                            >
                              Dia {day}
                            </Button>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Step 2: Juros e Descontos */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Multa por Atraso</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="interestPercentage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Multa (%)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                placeholder="2,00"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>Percentual de multa por atraso</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="interestPerDay"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Juros ao Dia (%)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.001"
                                min="0"
                                max="100"
                                placeholder="0,033"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>Percentual de juros por dia de atraso</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium">Descontos por Antecipação</h3>
                      <Button type="button" variant="outline" size="sm" onClick={addEarlyDiscount}>
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar
                      </Button>
                    </div>

                    {earlyDiscounts.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Nenhum desconto por antecipação configurado
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {earlyDiscounts.map((_, index) => (
                          <div key={index} className="flex items-end gap-4">
                            <FormField
                              control={form.control}
                              name={`earlyDiscounts.${index}.daysBeforeDeadline`}
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormLabel>Dias antes do vencimento</FormLabel>
                                  <FormControl>
                                    <Input type="number" min="1" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`earlyDiscounts.${index}.percentage`}
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormLabel>Desconto (%)</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      max="100"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeEarlyDiscount(index)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation buttons */}
              <div className="mt-8 flex justify-between">
                {currentStep > 0 && (
                  <Button type="button" variant="outline" onClick={handleBack}>
                    Voltar
                  </Button>
                )}
                <div className="ml-auto flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => router.visit({ route: 'web.escola.administrativo.contratos' })}
                  >
                    Cancelar
                  </Button>
                  {currentStep < steps.length - 1 ? (
                    <Button type="button" onClick={handleNext}>
                      Próximo
                    </Button>
                  ) : (
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {isEditing ? 'Salvando...' : 'Criando...'}
                        </>
                      ) : isEditing ? (
                        'Salvar Contrato'
                      ) : (
                        'Criar Contrato'
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
