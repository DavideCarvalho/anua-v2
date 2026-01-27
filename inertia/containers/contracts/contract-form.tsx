import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useRouter } from '@tuyau/inertia/react'
import { Loader2, Plus, Trash2 } from 'lucide-react'

import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { CurrencyInput } from '../../components/ui/currency-input'
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
import {
  useCreateContractMutation,
  useUpdateContractMutation,
} from '../../hooks/mutations/use_contract_mutations'
import { useUpdateContractInterestConfig } from '../../hooks/mutations/use_contract_financial_mutations'
import type { ContractResponse } from '../../hooks/queries/use_contract'

const formSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  description: z.string().optional(),
  hasInsurance: z.boolean(),

  // Payment
  enrollmentValue: z.string().optional(),
  enrollmentValueInstallments: z.number().min(1),
  amount: z.string().min(1, 'Valor do curso é obrigatório'),
  paymentType: z.enum(['MONTHLY', 'UPFRONT']),
  installments: z.number().min(1),
  flexibleInstallments: z.boolean(),
  paymentDays: z.array(z.number()).min(1, 'Selecione pelo menos um dia de vencimento'),

  // Interest and discounts
  interestPercentage: z.preprocess(
    (v) => (v === '' || v === undefined ? undefined : Number(v)),
    z.number().min(0).max(100).optional()
  ),
  interestPerDay: z.preprocess(
    (v) => (v === '' || v === undefined ? undefined : Number(v)),
    z.number().min(0).max(100).optional()
  ),
  earlyDiscounts: z.array(
    z.object({
      daysBeforeDeadline: z.number().min(1),
      percentage: z.number().min(0).max(100),
    })
  ),

  // Documents
  contractDocuments: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string().min(1, 'Nome do documento é obrigatório'),
      description: z.string().optional(),
      required: z.boolean(),
    })
  ),
})

type FormValues = z.infer<typeof formSchema>

interface ContractFormProps {
  schoolId: string
  initialData?: ContractResponse
}

const AVAILABLE_DAYS = [5, 10, 15, 20, 25]

function SimulatorBox({ amount }: { amount: number }) {
  const [periodMonths, setPeriodMonths] = useState(12)
  const [elapsedMonths, setElapsedMonths] = useState(0)

  const remainingMonths = Math.max(1, periodMonths - elapsedMonths)
  const installmentValue = amount / remainingMonths

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)

  return (
    <div className="bg-background rounded p-3 space-y-3">
      <p className="text-xs text-muted-foreground font-medium">Simulador de Parcelas</p>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Duração do período (meses)</label>
          <Input
            type="number"
            min="1"
            max="24"
            value={periodMonths}
            onChange={(e) => setPeriodMonths(Math.max(1, Number(e.target.value)))}
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Meses decorridos</label>
          <Input
            type="number"
            min="0"
            max={periodMonths - 1}
            value={elapsedMonths}
            onChange={(e) => setElapsedMonths(Math.min(periodMonths - 1, Math.max(0, Number(e.target.value))))}
            className="h-8 text-sm"
          />
        </div>
      </div>

      <div className="border-t pt-3 flex justify-between items-center">
        <span className="text-sm text-muted-foreground">Resultado:</span>
        <span className="text-sm font-medium">
          {remainingMonths}x de {formatCurrency(installmentValue)}
        </span>
      </div>
    </div>
  )
}

const steps = [
  { title: 'Informações Básicas', description: 'Nome e configurações gerais' },
  { title: 'Pagamento', description: 'Valores e parcelas' },
  { title: 'Juros e Descontos', description: 'Multas e incentivos' },
  { title: 'Documentos', description: 'Documentos exigidos' },
]

export function ContractForm({ schoolId, initialData }: ContractFormProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const isEditing = !!initialData

  const createContract = useCreateContractMutation()
  const updateContract = useUpdateContractMutation()
  const updateInterestConfig = useUpdateContractInterestConfig()

  const isSubmitting =
    createContract.isPending || updateContract.isPending || updateInterestConfig.isPending

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      hasInsurance: initialData?.hasInsurance || false,
      enrollmentValue: initialData?.enrollmentValue
        ? String(initialData.enrollmentValue / 100)
        : '0',
      enrollmentValueInstallments: initialData?.enrollmentValueInstallments || 1,
      amount: initialData?.amount ? String(initialData.amount / 100) : '',
      paymentType: initialData?.paymentType || 'MONTHLY',
      installments: initialData?.installments || 12,
      flexibleInstallments: initialData?.flexibleInstallments || false,
      paymentDays: initialData?.paymentDays?.map((p: { day: number }) => p.day) || [10],
      interestPercentage: initialData?.interestConfig?.delayInterestPercentage || undefined,
      interestPerDay: initialData?.interestConfig?.delayInterestPerDayDelayed || undefined,
      earlyDiscounts: initialData?.earlyDiscounts || [],
      contractDocuments:
        initialData?.contractDocuments?.map((doc) => ({
          id: doc.id,
          name: doc.name,
          description: doc.description || '',
          required: doc.required,
        })) || [],
    },
  })

  const earlyDiscounts = form.watch('earlyDiscounts')
  const contractDocuments = form.watch('contractDocuments')
  const paymentType = form.watch('paymentType')
  const flexibleInstallments = form.watch('flexibleInstallments')
  const amount = form.watch('amount')
  const installments = form.watch('installments')
  const enrollmentValue = form.watch('enrollmentValue')
  const enrollmentValueInstallments = form.watch('enrollmentValueInstallments')

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const handleNext = async () => {
    let fieldsToValidate: (keyof FormValues)[] = []

    if (currentStep === 0) {
      fieldsToValidate = ['name']
    } else if (currentStep === 1) {
      fieldsToValidate = ['amount', 'paymentType', 'paymentDays']
      if (form.getValues('paymentType') === 'UPFRONT' && !form.getValues('flexibleInstallments')) {
        fieldsToValidate.push('installments')
      }
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
    try {
      const basePayload = {
        schoolId,
        name: values.name,
        description: values.description || undefined,
        hasInsurance: values.hasInsurance,
        enrollmentValue: values.enrollmentValue
          ? Math.round(Number(values.enrollmentValue) * 100)
          : undefined,
        enrollmentValueInstallments: values.enrollmentValueInstallments,
        amount: Math.round(Number(values.amount) * 100),
        paymentType: values.paymentType,
        installments: values.installments,
        flexibleInstallments: values.flexibleInstallments,
      }

      if (isEditing && initialData) {
        await updateContract.mutateAsync({
          id: initialData.id,
          ...basePayload,
          paymentDays: values.paymentDays,
        })

        // Update interest config if provided
        if (values.interestPercentage || values.interestPerDay) {
          await updateInterestConfig.mutateAsync({
            contractId: initialData.id,
            delayInterestPercentage: values.interestPercentage || 0,
            delayInterestPerDayDelayed: values.interestPerDay || 0,
          })
        }

        toast.success('Contrato atualizado com sucesso!')
      } else {
        // Create with all nested data in one request
        const payload = {
          ...basePayload,
          paymentDays: values.paymentDays,
          interestConfig:
            values.interestPercentage || values.interestPerDay
              ? {
                  delayInterestPercentage: values.interestPercentage || 0,
                  delayInterestPerDayDelayed: values.interestPerDay || 0,
                }
              : undefined,
          earlyDiscounts: values.earlyDiscounts.length > 0 ? values.earlyDiscounts : undefined,
        }

        await createContract.mutateAsync(payload)
        toast.success('Contrato criado com sucesso!')
      }

      router.visit({ route: 'web.escola.administrativo.contratos' })
    } catch (error) {
      toast.error(isEditing ? 'Erro ao atualizar contrato' : 'Erro ao criar contrato', {
        description: error instanceof Error ? error.message : 'Erro desconhecido',
      })
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

  function addDocument() {
    const current = form.getValues('contractDocuments')
    form.setValue('contractDocuments', [...current, { name: '', description: '', required: true }])
  }

  function removeDocument(index: number) {
    const current = form.getValues('contractDocuments')
    form.setValue(
      'contractDocuments',
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
                </div>
              )}

              {/* Step 1: Pagamento */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  {/* Tipo de Pagamento */}
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

                  {/* Valor - label dinâmico baseado no tipo */}
                  {paymentType === 'MONTHLY' ? (
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor da Mensalidade *</FormLabel>
                          <FormControl>
                            <CurrencyInput
                              placeholder="1.200,00"
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormDescription>
                            As mensalidades serão geradas automaticamente até o final do período letivo
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) : (
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Valor Total *</FormLabel>
                            <FormControl>
                              <CurrencyInput
                                placeholder="12.000,00"
                                value={field.value}
                                onChange={field.onChange}
                              />
                            </FormControl>
                            <FormDescription>
                              Valor total a ser dividido em parcelas
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="installments"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Parcelas Máximas {!flexibleInstallments && '*'}</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="1"
                                  disabled={flexibleInstallments}
                                  {...field}
                                />
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
                                <FormLabel className="font-normal">Calcular parcelas automaticamente</FormLabel>
                                <FormDescription>
                                  O número de parcelas será calculado com base no tempo restante até o fim do período letivo
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {/* Dias de Vencimento */}
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

                  {/* Taxa de Matrícula */}
                  <div className="border-t pt-6">
                    <h3 className="text-sm font-medium mb-4">Taxa de Matrícula</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="enrollmentValue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Valor</FormLabel>
                            <FormControl>
                              <CurrencyInput
                                placeholder="500,00"
                                value={field.value || '0'}
                                onChange={field.onChange}
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
                            <FormLabel>Parcelas</FormLabel>
                            <FormControl>
                              <Input type="number" min="1" max="12" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Resumo do Cálculo */}
                  {amount && Number(amount) > 0 && (
                    <div className="border-t pt-6">
                      <h3 className="text-sm font-medium mb-4">Resumo</h3>
                      <div className="bg-muted rounded-lg p-4 space-y-3">
                        {paymentType === 'MONTHLY' ? (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Mensalidade</span>
                            <span className="font-medium">{formatCurrency(Number(amount))}</span>
                          </div>
                        ) : (
                          <>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Valor Total</span>
                              <span className="font-medium">{formatCurrency(Number(amount))}</span>
                            </div>
                            {!flexibleInstallments && installments > 0 && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Parcelas</span>
                                <span className="font-medium">
                                  {installments}x de {formatCurrency(Number(amount) / installments)}
                                </span>
                              </div>
                            )}
                            {flexibleInstallments && (
                              <div className="space-y-3">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Parcelas</span>
                                  <span className="font-medium text-muted-foreground">
                                    Calculado automaticamente
                                  </span>
                                </div>
                                <SimulatorBox amount={Number(amount)} />
                              </div>
                            )}
                          </>
                        )}
                        {enrollmentValue && Number(enrollmentValue) > 0 && (
                          <>
                            <div className="border-t pt-3 flex justify-between">
                              <span className="text-muted-foreground">Taxa de Matrícula</span>
                              <span className="font-medium">
                                {enrollmentValueInstallments > 1
                                  ? `${enrollmentValueInstallments}x de ${formatCurrency(Number(enrollmentValue) / enrollmentValueInstallments)}`
                                  : formatCurrency(Number(enrollmentValue))}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
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

              {/* Step 3: Documentos */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-medium">Documentos Exigidos</h3>
                        <p className="text-sm text-muted-foreground">
                          Defina os documentos que serão exigidos na matrícula
                        </p>
                      </div>
                      <Button type="button" variant="outline" size="sm" onClick={addDocument}>
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar
                      </Button>
                    </div>

                    {contractDocuments.length === 0 ? (
                      <div className="border rounded-lg p-8 text-center">
                        <p className="text-sm text-muted-foreground mb-4">
                          Nenhum documento exigido configurado
                        </p>
                        <Button type="button" variant="outline" size="sm" onClick={addDocument}>
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Documento
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {contractDocuments.map((_, index) => (
                          <div key={index} className="border rounded-lg p-4 space-y-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 grid grid-cols-2 gap-4">
                                <FormField
                                  control={form.control}
                                  name={`contractDocuments.${index}.name`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Nome do Documento *</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Ex: RG do Aluno" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name={`contractDocuments.${index}.description`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Descrição</FormLabel>
                                      <FormControl>
                                        <Input
                                          placeholder="Descrição opcional"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="mt-8"
                                onClick={() => removeDocument(index)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>

                            <FormField
                              control={form.control}
                              name={`contractDocuments.${index}.required`}
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
                                      Documento obrigatório
                                    </FormLabel>
                                    <FormDescription>
                                      Se marcado, a matrícula não poderá ser concluída sem este documento
                                    </FormDescription>
                                  </div>
                                </FormItem>
                              )}
                            />
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
                  {currentStep < 3 && (
                    <Button type="button" onClick={handleNext}>
                      Próximo
                    </Button>
                  )}
                  {currentStep === 3 && (
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
