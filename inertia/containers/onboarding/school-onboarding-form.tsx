import { Suspense, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useSuspenseQuery, QueryErrorResetBoundary } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Plus, Building2, AlertCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { ErrorBoundary } from 'react-error-boundary'
import { router } from '@inertiajs/react'

import { Button } from '../../components/ui/button'
import { MaskedInput } from '../../components/ui/masked-input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Checkbox } from '../../components/ui/checkbox'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../components/ui/form'
import { Input } from '../../components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import { tuyau } from '../../lib/api'
import { useSchoolChainsQueryOptions } from '../../hooks/queries/use-school-chains'
import { usePlatformSettingsQueryOptions } from '../../hooks/queries/use-platform-settings'
import { CreateSchoolChainDialog } from './create-school-chain-dialog'
import { type SchoolOnboardingFormData, schoolOnboardingSchema } from './schema'

function OnboardingFormSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="py-12 text-center">
          <Building2 className="mx-auto h-12 w-12 animate-pulse text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">Carregando formulário...</p>
        </div>
      </CardContent>
    </Card>
  )
}

function OnboardingFormError({
  error,
  resetErrorBoundary,
}: {
  error: Error
  resetErrorBoundary: () => void
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="py-12 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <h3 className="mt-4 text-lg font-semibold text-destructive">Erro ao carregar formulário</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {error.message || 'Não foi possível carregar o formulário de onboarding.'}
          </p>
          <Button variant="outline" className="mt-4" onClick={resetErrorBoundary}>
            Tentar novamente
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function OnboardingFormContent() {
  const [isCreateChainDialogOpen, setIsCreateChainDialogOpen] = useState(false)
  const [isLoadingCep, setIsLoadingCep] = useState(false)

  const { data: schoolChains } = useSuspenseQuery(useSchoolChainsQueryOptions())
  const { data: platformSettings } = useSuspenseQuery(usePlatformSettingsQueryOptions())

  const form = useForm<SchoolOnboardingFormData>({
    resolver: zodResolver(schoolOnboardingSchema),
    defaultValues: {
      schoolName: '',
      isNetwork: false,
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: '',
      latitude: undefined,
      longitude: undefined,
      directorName: '',
      directorEmail: '',
      directorPhone: '',
      trialDays: platformSettings?.defaultTrialDays ?? 30,
      pricePerStudent: platformSettings?.defaultPricePerStudent ?? 1290,
      platformFeePercentage: 5.0,
      hasInsurance: false,
      insurancePercentage: undefined,
      insuranceCoveragePercentage: undefined,
      insuranceClaimWaitingDays: undefined,
    },
  })

  const schoolChainId = form.watch('schoolChainId')
  const chainsList = Array.isArray(schoolChains) ? schoolChains : schoolChains?.data ?? []
  const selectedChain = chainsList.find((chain) => chain.id === schoolChainId)
  const hasNetworkSubscription = selectedChain?.subscriptionLevel === 'NETWORK'

  const { mutateAsync: createSchool, isPending } = useMutation({
    mutationFn: async (data: SchoolOnboardingFormData) => {
      const response = await tuyau.api.v1.admin.schools.onboarding.$post({
        name: data.schoolName,
        schoolChainId: data.schoolChainId,
        street: data.street,
        number: data.number,
        complement: data.complement,
        neighborhood: data.neighborhood,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        latitude: data.latitude,
        longitude: data.longitude,
        directorName: data.directorName,
        directorEmail: data.directorEmail,
        directorPhone: data.directorPhone,
        isNetwork: data.isNetwork,
        trialDays: data.trialDays,
        pricePerStudent: data.pricePerStudent,
        platformFeePercentage: data.platformFeePercentage,
        hasInsurance: data.hasInsurance,
        insurancePercentage: data.insurancePercentage,
        insuranceCoveragePercentage: data.insuranceCoveragePercentage,
        insuranceClaimWaitingDays: data.insuranceClaimWaitingDays,
      })
      if (response.error) {
        throw new Error(response.error.message || 'Erro ao criar escola')
      }
      return response.data
    },
  })

  const onSubmit = async (data: SchoolOnboardingFormData) => {
    try {
      const result = await createSchool(data)

      toast.success('Escola criada com sucesso!', {
        description: `A escola ${result?.school?.name} foi criada e o diretor ${result?.director?.name} foi associado.`,
      })

      form.reset()
      router.visit('/admin/escolas')
    } catch (error) {
      console.error('Erro ao criar escola:', error)
      toast.error('Erro ao criar escola', {
        description: error instanceof Error ? error.message : 'Ocorreu um erro desconhecido',
      })
    }
  }

  const isNetwork = form.watch('isNetwork')

  const handleZipCodeChange = async (zipCode: string) => {
    const cleanZipCode = zipCode.replace(/\D/g, '')
    form.setValue('zipCode', cleanZipCode)

    if (cleanZipCode.length === 8) {
      setIsLoadingCep(true)
      try {
        const response = await fetch(`https://brasilapi.com.br/api/cep/v2/${cleanZipCode}`)

        if (!response.ok) {
          toast.error('CEP não encontrado', {
            description: 'Por favor, verifique o CEP informado',
          })
          return
        }

        const data = await response.json()

        form.setValue('street', data.street || '')
        form.setValue('neighborhood', data.neighborhood || '')
        form.setValue('city', data.city || '')
        form.setValue('state', data.state || '')

        // BrasilAPI retorna coordenadas quando disponível
        if (data.location?.coordinates?.latitude) {
          form.setValue('latitude', data.location.coordinates.latitude)
        }
        if (data.location?.coordinates?.longitude) {
          form.setValue('longitude', data.location.coordinates.longitude)
        }
      } catch {
        toast.error('Erro ao buscar CEP', {
          description: 'Por favor, tente novamente',
        })
      } finally {
        setIsLoadingCep(false)
      }
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Onboarding de Nova Escola</CardTitle>
          <CardDescription>
            Adicione uma nova escola ao sistema e configure o diretor responsável
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Dados da Escola</h3>

                <FormField
                  control={form.control}
                  name="schoolName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Escola</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Colégio São José" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isNetwork"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Esta escola faz parte de uma rede de ensino?</FormLabel>
                        <FormDescription>
                          Marque se a escola pertence a uma rede ou grupo educacional
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {isNetwork && (
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="schoolChainId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rede de Ensino</FormLabel>
                          <div className="flex gap-2">
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione a rede" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {chainsList.map((chain) => (
                                  <SelectItem key={chain.id} value={chain.id}>
                                    {chain.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => setIsCreateChainDialogOpen(true)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {hasNetworkSubscription && (
                      <p className="text-sm text-muted-foreground">
                        Esta rede possui assinatura única. As configurações de trial e preço são
                        gerenciadas no nível da rede.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Address Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Endereço da Escola</h3>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CEP</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MaskedInput
                              mask="99999-999"
                              maskChar={null}
                              placeholder="00000-000"
                              value={field.value}
                              onChange={(value) => handleZipCodeChange(value)}
                              disabled={isLoadingCep}
                            />
                            {isLoadingCep && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="street"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Rua</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Rua das Flores" {...field} disabled={isLoadingCep} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número</FormLabel>
                        <FormControl>
                          <Input placeholder="123" {...field} disabled={isLoadingCep} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="complement"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Complemento (Opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Sala 101" {...field} disabled={isLoadingCep} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="neighborhood"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bairro</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Centro" {...field} disabled={isLoadingCep} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: São Paulo" {...field} disabled={isLoadingCep} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: SP" {...field} maxLength={2} disabled={isLoadingCep} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {!hasNetworkSubscription && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Configuração de Assinatura</h3>

                  <FormField
                    control={form.control}
                    name="trialDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dias de Trial</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          Número de dias de acesso gratuito (padrão: {platformSettings?.defaultTrialDays}{' '}
                          dias)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pricePerStudent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço por Aluno Ativo</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="R$ 0,00"
                            value={
                              field.value
                                ? `R$ ${(field.value / 100).toFixed(2).replace('.', ',')}`
                                : ''
                            }
                            onChange={(e) => {
                              const rawValue = e.target.value.replace(/\D/g, '')
                              const centavos = rawValue ? parseInt(rawValue, 10) : 0
                              field.onChange(centavos)
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Valor cobrado por aluno ativo. Padrão: R${' '}
                          {((platformSettings?.defaultPricePerStudent ?? 0) / 100)
                            .toFixed(2)
                            .replace('.', ',')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="platformFeePercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Taxa da Plataforma (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            min={0}
                            max={100}
                            placeholder="5.0"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          Percentual cobrado sobre as mensalidades dos alunos (padrão: 5%)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="rounded-lg border bg-muted/50 p-4">
                    <p className="text-sm text-muted-foreground">
                      <strong>Preview:</strong> Trial até{' '}
                      {new Date(
                        Date.now() + form.watch('trialDays') * 24 * 60 * 60 * 1000
                      ).toLocaleDateString('pt-BR')}{' '}
                      | R$ {(form.watch('pricePerStudent') / 100).toFixed(2).replace('.', ',')} por aluno
                      ativo
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Dados do Diretor</h3>

                <FormField
                  control={form.control}
                  name="directorName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: João da Silva" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="directorEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="diretor@escola.com" {...field} />
                      </FormControl>
                      <FormDescription>Este será o email de acesso do diretor ao sistema</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="directorPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone (Opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="(11) 98765-4321" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Insurance Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Seguro de Inadimplência</h3>
                <p className="text-sm text-muted-foreground">
                  Configure o seguro contra inadimplência para proteger a escola de inadimplentes.
                </p>

                <FormField
                  control={form.control}
                  name="hasInsurance"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Habilitar seguro de inadimplência</FormLabel>
                        <FormDescription>
                          A escola pagará uma porcentagem mensal sobre as mensalidades para ter cobertura
                          contra inadimplência.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {form.watch('hasInsurance') && (
                  <div className="space-y-4 rounded-md border p-4">
                    <FormField
                      control={form.control}
                      name="insurancePercentage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Porcentagem do Seguro (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={3}
                              step="0.1"
                              placeholder="3.0"
                              value={field.value ?? ''}
                              onChange={(e) =>
                                field.onChange(e.target.value ? Number(e.target.value) : undefined)
                              }
                            />
                          </FormControl>
                          <FormDescription>
                            Porcentagem cobrada sobre as mensalidades (mínimo: 3%)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="insuranceCoveragePercentage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cobertura do Seguro (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              max={100}
                              step="0.1"
                              placeholder="100.0"
                              value={field.value ?? ''}
                              onChange={(e) =>
                                field.onChange(e.target.value ? Number(e.target.value) : undefined)
                              }
                            />
                          </FormControl>
                          <FormDescription>
                            Porcentagem do valor inadimplente que será coberto (padrão: 100%)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="insuranceClaimWaitingDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dias para Acionamento</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              placeholder="90"
                              value={field.value ?? ''}
                              onChange={(e) =>
                                field.onChange(e.target.value ? Number(e.target.value) : undefined)
                              }
                            />
                          </FormControl>
                          <FormDescription>
                            Quantos dias de atraso antes de acionar o seguro (padrão: 90)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => router.visit('/admin/escolas')}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? 'Criando...' : 'Criar Escola'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <CreateSchoolChainDialog
        open={isCreateChainDialogOpen}
        onOpenChange={setIsCreateChainDialogOpen}
        defaultPlatformSettings={
          platformSettings
            ? {
                defaultTrialDays: platformSettings.defaultTrialDays,
                defaultPricePerStudent: platformSettings.defaultPricePerStudent,
              }
            : undefined
        }
        onSuccess={(newChain) => {
          form.setValue('schoolChainId', newChain.id)
        }}
      />
    </>
  )
}

export function SchoolOnboardingForm() {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ error, resetErrorBoundary }) => (
            <OnboardingFormError error={error} resetErrorBoundary={resetErrorBoundary} />
          )}
        >
          <Suspense fallback={<OnboardingFormSkeleton />}>
            <OnboardingFormContent />
          </Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}
