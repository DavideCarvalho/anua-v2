import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, FormProvider } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Loader2, ExternalLink, CheckCircle2, FileText, Building2, MapPin } from 'lucide-react'

import { Button } from '../../components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../components/ui/form'
import { Input } from '../../components/ui/input'
import { MaskedInput } from '../../components/ui/masked-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import { Stepper, type Step } from '../students/new-student-modal/components/stepper'
import { useCreateAsaasSubaccount } from '../../hooks/mutations/use_create_asaas_subaccount'

const formSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').max(255),
  email: z.string().email('Email invalido').max(255),
  cpfCnpj: z.string().min(11, 'CPF/CNPJ invalido').max(18),
  companyType: z.enum(['MEI', 'LIMITED', 'INDIVIDUAL', 'ASSOCIATION']),
  birthDate: z.string().min(10, 'Data de nascimento invalida').optional().or(z.literal('')),
  phone: z.string().min(10, 'Telefone invalido').max(20).optional().or(z.literal('')),
  mobilePhone: z.string().min(10, 'Celular invalido').max(20).optional().or(z.literal('')),
  address: z.string().min(3, 'Endereco deve ter pelo menos 3 caracteres').max(255),
  addressNumber: z.string().min(1, 'Numero e obrigatorio').max(20),
  complement: z.string().max(255).optional().or(z.literal('')),
  province: z.string().min(2, 'Bairro e obrigatorio').max(255),
  postalCode: z.string().min(8, 'CEP invalido').max(10),
  incomeValue: z.coerce.number().min(1, 'Informe a renda/faturamento'),
})

type FormValues = z.infer<typeof formSchema>

const STEPS_CONFIG = [
  { title: 'Inicio', description: 'Visao geral' },
  { title: 'Dados', description: 'Info basicas' },
  { title: 'Endereco', description: 'Localizacao' },
  { title: 'Conclusao', description: 'Finalizar' },
]

interface AsaasOnboardingWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  documentUrl?: string | null
  paymentConfigStatus?: string | null
  hasAsaasAccount?: boolean
}

export function AsaasOnboardingWizard({
  open,
  onOpenChange,
  documentUrl,
  paymentConfigStatus,
  hasAsaasAccount = false,
}: AsaasOnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [maxVisitedStep, setMaxVisitedStep] = useState(0)
  const [stepsStatus, setStepsStatus] = useState<Step['status'][]>(
    STEPS_CONFIG.map(() => 'pending')
  )
  const [isSubmitted, setIsSubmitted] = useState(false)
  const createMutation = useCreateAsaasSubaccount()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: '',
      email: '',
      cpfCnpj: '',
      companyType: 'LIMITED',
      birthDate: '',
      phone: '',
      mobilePhone: '',
      address: '',
      addressNumber: '',
      complement: '',
      province: '',
      postalCode: '',
      incomeValue: 0,
    },
  })

  const steps: Step[] = STEPS_CONFIG.map((step, index) => ({
    ...step,
    status: stepsStatus[index],
  }))

  const isConclusionStep = currentStep === 3
  const dialogTitle = hasAsaasAccount
    ? 'Atualizar Conta de Pagamento'
    : 'Configurar Conta de Pagamento'
  const loadingMessage = hasAsaasAccount
    ? 'Atualizando conta de pagamento...'
    : 'Criando conta de pagamento...'
  const successMessage = hasAsaasAccount
    ? 'Dados da conta atualizados com sucesso!'
    : 'Conta criada com sucesso!'
  const completionTitle = hasAsaasAccount
    ? 'Conta Atualizada com Sucesso!'
    : 'Conta Criada com Sucesso!'
  const submitButtonLabel = hasAsaasAccount ? 'Atualizar Conta' : 'Criar Conta'
  const submittingButtonLabel = hasAsaasAccount ? 'Atualizando conta...' : 'Criando conta...'

  async function validateCurrentStep(): Promise<boolean> {
    let isValid = false
    const updatedStatus = [...stepsStatus]

    switch (currentStep) {
      case 0:
        // Intro step — always valid
        isValid = true
        break
      case 1:
        isValid = await form.trigger([
          'name',
          'email',
          'cpfCnpj',
          'companyType',
          'birthDate',
          'incomeValue',
          'phone',
          'mobilePhone',
        ])
        break
      case 2:
        isValid = await form.trigger([
          'address',
          'addressNumber',
          'complement',
          'province',
          'postalCode',
        ])
        break
      default:
        isValid = true
    }

    updatedStatus[currentStep] = isValid ? 'success' : 'error'
    setStepsStatus(updatedStatus)
    return isValid
  }

  async function handleNext() {
    const isValid = await validateCurrentStep()
    if (!isValid) return

    const nextStep = currentStep + 1
    setCurrentStep(nextStep)
    setMaxVisitedStep((prev) => Math.max(prev, nextStep))
  }

  function handlePrevious() {
    setCurrentStep((prev) => Math.max(0, prev - 1))
  }

  function handleStepClick(stepIndex: number) {
    if (stepIndex <= maxVisitedStep || stepsStatus[stepIndex] === 'success') {
      // Don't navigate back from conclusion after submit
      if (isSubmitted && stepIndex < 3) return
      setCurrentStep(stepIndex)
    }
  }

  const handleCepAutoFill = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '')
    if (cleanCep.length !== 8) return

    try {
      const response = await fetch(`https://brasilapi.com.br/api/cep/v1/${cleanCep}`)
      if (!response.ok) return
      const data = await response.json()

      if (data.street) form.setValue('address', data.street)
      if (data.neighborhood) form.setValue('province', data.neighborhood)
    } catch {
      // Silently fail — user can fill manually
    }
  }

  const onSubmit = async (values: FormValues) => {
    const digitsOnly = (v: string) => v.replace(/\D/g, '')

    toast.promise(
      createMutation.mutateAsync({
        name: values.name,
        email: values.email,
        cpfCnpj: digitsOnly(values.cpfCnpj),
        companyType: values.companyType,
        birthDate: values.birthDate ? values.birthDate.split('/').reverse().join('-') : undefined,
        phone: values.phone ? digitsOnly(values.phone) : undefined,
        mobilePhone: values.mobilePhone ? digitsOnly(values.mobilePhone) : undefined,
        address: values.address,
        addressNumber: values.addressNumber,
        complement: values.complement || undefined,
        province: values.province,
        postalCode: digitsOnly(values.postalCode),
        incomeValue: values.incomeValue,
      }),
      {
        loading: loadingMessage,
        success: () => {
          setIsSubmitted(true)
          const updatedStatus = [...stepsStatus]
          updatedStatus[2] = 'success'
          updatedStatus[3] = 'success'
          setStepsStatus(updatedStatus)
          setCurrentStep(3)
          setMaxVisitedStep(3)
          return successMessage
        },
        error: (err) => err?.message || 'Erro ao salvar conta de pagamento',
      }
    )
  }

  const handleClose = () => {
    if (!createMutation.isPending) {
      onOpenChange(false)
      setTimeout(() => {
        setCurrentStep(0)
        setMaxVisitedStep(0)
        setStepsStatus(STEPS_CONFIG.map(() => 'pending'))
        setIsSubmitted(false)
        form.reset()
      }, 300)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-[600px] max-h-[90vh] flex flex-col p-0"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Fixed Header with Stepper */}
        <div className="p-6 pb-4 border-b shrink-0">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
          </DialogHeader>

          <Stepper currentStep={currentStep} steps={steps} onStepClick={handleStepClick} />
        </div>

        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {/* Step 0: Intro */}
              {currentStep === 0 && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Configure sua conta Asaas para receber pagamentos de mensalidades diretamente.
                  </p>

                  <div className="rounded-lg border p-4 space-y-3">
                    <h3 className="font-medium text-sm">O que voce vai precisar:</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <FileText className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                        CPF ou CNPJ do responsavel financeiro
                      </li>
                      <li className="flex items-start gap-2">
                        <Building2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                        Dados da empresa (nome, tipo societario)
                      </li>
                      <li className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                        Endereco completo com CEP
                      </li>
                    </ul>
                  </div>

                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
                    Apos criar a conta, voce precisara enviar documentos de identificacao para
                    ativacao. O processo de aprovacao leva em media 1-2 dias uteis.
                  </div>
                </div>
              )}

              {/* Step 1: Basic Info */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Dados do titular da conta de pagamento.
                  </p>

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome / Razao Social *</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome completo ou razao social" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="email@exemplo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cpfCnpj"
                    render={({ field }) => {
                      const digits = (field.value || '').replace(/\D/g, '')
                      const isCnpj = digits.length > 11

                      const formatCpfCnpj = (raw: string) => {
                        const d = raw.replace(/\D/g, '').slice(0, 14)
                        if (d.length > 11) {
                          return d.replace(
                            /(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/,
                            '$1.$2.$3/$4-$5'
                          )
                        }
                        return d.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4')
                      }

                      return (
                        <FormItem>
                          <FormLabel>CPF/CNPJ *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder={isCnpj ? '00.000.000/0000-00' : '000.000.000-00'}
                              value={formatCpfCnpj(field.value || '')}
                              onChange={(e) => {
                                const raw = e.target.value.replace(/\D/g, '').slice(0, 14)
                                field.onChange(raw)
                              }}
                              maxLength={18}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )
                    }}
                  />

                  <FormField
                    control={form.control}
                    name="companyType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Empresa *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="INDIVIDUAL">Pessoa Fisica</SelectItem>
                            <SelectItem value="MEI">MEI</SelectItem>
                            <SelectItem value="LIMITED">Ltda / S.A.</SelectItem>
                            <SelectItem value="ASSOCIATION">Associacao</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="birthDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Nascimento</FormLabel>
                        <FormControl>
                          <MaskedInput
                            mask="99/99/9999"
                            maskChar={null}
                            placeholder="DD/MM/AAAA"
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="incomeValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Renda / Faturamento Mensal (R$)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            step={0.01}
                            placeholder="Ex: 10000"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <MaskedInput
                              mask="(99) 9999-9999"
                              maskChar={null}
                              placeholder="(00) 0000-0000"
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="mobilePhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Celular</FormLabel>
                          <FormControl>
                            <MaskedInput
                              mask="(99) 99999-9999"
                              maskChar={null}
                              placeholder="(00) 00000-0000"
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Address */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Informe o endereco completo. O CEP preenche automaticamente.
                  </p>

                  <FormField
                    control={form.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CEP *</FormLabel>
                        <FormControl>
                          <MaskedInput
                            mask="99999-999"
                            maskChar={null}
                            placeholder="00000-000"
                            value={field.value}
                            onChange={(value) => {
                              field.onChange(value)
                              handleCepAutoFill(value)
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereco *</FormLabel>
                        <FormControl>
                          <Input placeholder="Rua, Avenida..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="addressNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Numero *</FormLabel>
                          <FormControl>
                            <Input placeholder="123" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="complement"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Complemento</FormLabel>
                          <FormControl>
                            <Input placeholder="Sala, Bloco..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="province"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bairro *</FormLabel>
                        <FormControl>
                          <Input placeholder="Bairro" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Step 3: Conclusion — review before submit, or success after */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  {isSubmitted ? (
                    <div className="py-6 flex flex-col items-center space-y-4">
                      <CheckCircle2 className="h-16 w-16 text-green-500" />

                      <div className="text-center space-y-2">
                        <h3 className="text-lg font-semibold">{completionTitle}</h3>
                        <p className="text-sm text-muted-foreground">
                          {paymentConfigStatus === 'ACTIVE'
                            ? 'Sua conta foi aprovada e esta pronta para uso!'
                            : 'Envie seus documentos para completar a ativacao da conta. O processo de aprovacao leva em media 1-2 dias uteis.'}
                        </p>
                      </div>

                      {/* Docs approved automatically (e.g. sandbox) */}
                      {paymentConfigStatus === 'ACTIVE' && (
                        <p className="text-sm text-green-600 font-medium">
                          Conta ativa — nenhum documento adicional necessario.
                        </p>
                      )}

                      {/* Production: show doc upload link */}
                      {paymentConfigStatus !== 'ACTIVE' && documentUrl && (
                        <Button asChild className="mt-4">
                          <a href={documentUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Enviar Documentos
                          </a>
                        </Button>
                      )}

                      {/* Waiting for Asaas to generate onboarding URL */}
                      {paymentConfigStatus !== 'ACTIVE' && !documentUrl && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Gerando link para envio de documentos...
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground">
                        Confira os dados antes de criar a conta.
                      </p>

                      <div className="rounded-lg border divide-y">
                        <div className="p-4 space-y-2">
                          <h4 className="text-sm font-medium text-muted-foreground">
                            Dados do Titular
                          </h4>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                            <span className="text-muted-foreground">Nome</span>
                            <span>{form.getValues('name')}</span>
                            <span className="text-muted-foreground">Email</span>
                            <span>{form.getValues('email')}</span>
                            <span className="text-muted-foreground">CPF/CNPJ</span>
                            <span>{form.getValues('cpfCnpj')}</span>
                            <span className="text-muted-foreground">Tipo</span>
                            <span>
                              {
                                {
                                  INDIVIDUAL: 'Pessoa Fisica',
                                  MEI: 'MEI',
                                  LIMITED: 'Ltda / S.A.',
                                  ASSOCIATION: 'Associacao',
                                }[form.getValues('companyType')]
                              }
                            </span>
                            {form.getValues('birthDate') && (
                              <>
                                <span className="text-muted-foreground">Nascimento</span>
                                <span>{form.getValues('birthDate')}</span>
                              </>
                            )}
                            <span className="text-muted-foreground">Renda/Faturamento</span>
                            <span>
                              R${' '}
                              {Number(form.getValues('incomeValue')).toLocaleString('pt-BR', {
                                minimumFractionDigits: 2,
                              })}
                            </span>
                            {form.getValues('phone') && (
                              <>
                                <span className="text-muted-foreground">Telefone</span>
                                <span>{form.getValues('phone')}</span>
                              </>
                            )}
                            {form.getValues('mobilePhone') && (
                              <>
                                <span className="text-muted-foreground">Celular</span>
                                <span>{form.getValues('mobilePhone')}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="p-4 space-y-2">
                          <h4 className="text-sm font-medium text-muted-foreground">Endereco</h4>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                            <span className="text-muted-foreground">CEP</span>
                            <span>{form.getValues('postalCode')}</span>
                            <span className="text-muted-foreground">Endereco</span>
                            <span>
                              {form.getValues('address')}, {form.getValues('addressNumber')}
                            </span>
                            {form.getValues('complement') && (
                              <>
                                <span className="text-muted-foreground">Complemento</span>
                                <span>{form.getValues('complement')}</span>
                              </>
                            )}
                            <span className="text-muted-foreground">Bairro</span>
                            <span>{form.getValues('province')}</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Fixed Footer */}
            <div className="flex justify-between p-6 pt-4 border-t bg-background shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0 || isSubmitted || createMutation.isPending}
              >
                Anterior
              </Button>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={createMutation.isPending}
                >
                  {isSubmitted ? 'Fechar' : 'Cancelar'}
                </Button>
                {isConclusionStep && !isSubmitted && (
                  <Button
                    type="button"
                    onClick={() => form.handleSubmit(onSubmit)()}
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {submittingButtonLabel}
                      </>
                    ) : (
                      submitButtonLabel
                    )}
                  </Button>
                )}
                {!isConclusionStep && (
                  <Button type="button" onClick={handleNext}>
                    Proximo
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
