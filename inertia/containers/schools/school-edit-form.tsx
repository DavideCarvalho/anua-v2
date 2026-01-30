import { Suspense, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  useMutation,
  useSuspenseQuery,
  useQueryClient,
  QueryErrorResetBoundary,
  useQuery,
} from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Building2, AlertCircle, Loader2, User, UserPlus, Users } from 'lucide-react'
import { toast } from 'sonner'
import { ErrorBoundary } from 'react-error-boundary'
import { router } from '@inertiajs/react'
import { z } from 'zod'

import { Button } from '../../components/ui/button'
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
import { MaskedInput } from '../../components/ui/masked-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Label } from '../../components/ui/label'
import { tuyau } from '../../lib/api'
import { useSchoolQueryOptions } from '../../hooks/queries/use_schools'
import { schoolEditSchema, type SchoolEditFormData } from './school_edit_schema'

const newDirectorSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
})

function EditFormSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="py-12 text-center">
          <Building2 className="mx-auto h-12 w-12 animate-pulse text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">Carregando dados da escola...</p>
        </div>
      </CardContent>
    </Card>
  )
}

function EditFormError({
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
          <h3 className="mt-4 text-lg font-semibold text-destructive">Erro ao carregar escola</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {error.message || 'Não foi possível carregar os dados da escola.'}
          </p>
          <Button variant="outline" className="mt-4" onClick={resetErrorBoundary}>
            Tentar novamente
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

interface SchoolUser {
  id: string
  name: string
  email: string
  role: string
  roleName: string
}

function EditFormContent({ schoolId }: { schoolId: string }) {
  const [isLoadingCep, setIsLoadingCep] = useState(false)
  const [directorMode, setDirectorMode] = useState<'view' | 'select' | 'create'>('view')
  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [newDirectorData, setNewDirectorData] = useState({ name: '', email: '', phone: '' })
  const queryClient = useQueryClient()

  const { data: school } = useSuspenseQuery(useSchoolQueryOptions(schoolId))

  // Buscar usuários da escola para o select
  const { data: schoolUsers, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['school-users', schoolId],
    queryFn: () => (tuyau.api.v1.schools as any)({ id: schoolId }).users.$get().unwrap(),
    enabled: directorMode === 'select',
  })

  const form = useForm<SchoolEditFormData>({
    resolver: zodResolver(schoolEditSchema) as any,
    defaultValues: {
      name: school?.name || '',
      logoUrl: school?.logoUrl || null,
      zipCode: school?.zipCode || null,
      street: school?.street || null,
      number: school?.number || null,
      complement: school?.complement || null,
      neighborhood: school?.neighborhood || null,
      city: school?.city || null,
      state: school?.state || null,
      latitude: school?.latitude || null,
      longitude: school?.longitude || null,
      minimumGrade: school?.minimumGrade ?? 7,
      minimumAttendancePercentage: school?.minimumAttendancePercentage ?? 75,
      calculationAlgorithm: (school?.calculationAlgorithm as 'AVERAGE' | 'SUM') || 'AVERAGE',
      hasInsurance: school?.hasInsurance || null,
      insurancePercentage: school?.insurancePercentage || null,
      insuranceCoveragePercentage: school?.insuranceCoveragePercentage || null,
      insuranceClaimWaitingDays: school?.insuranceClaimWaitingDays || null,
    },
  })

  const { mutateAsync: updateSchool, isPending } = useMutation({
    mutationFn: async (data: SchoolEditFormData) => {
      const response = await (tuyau.api.v1.schools as any)({ id: schoolId }).$put(data)
      if (response.error) {
        throw new Error((response.error as any).value?.message || 'Erro ao atualizar escola')
      }
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school', schoolId] })
      queryClient.invalidateQueries({ queryKey: ['schools'] })
    },
  })

  const { mutateAsync: updateDirector, isPending: isUpdatingDirector } = useMutation({
    mutationFn: async (data: { existingUserId?: string; newDirector?: { name: string; email: string; phone?: string } }) => {
      return (tuyau.api.v1.schools as any)({ id: schoolId }).director.$put(data).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school', schoolId] })
      queryClient.invalidateQueries({ queryKey: ['school-users', schoolId] })
      setDirectorMode('view')
      setSelectedUserId('')
      setNewDirectorData({ name: '', email: '', phone: '' })
      toast.success('Diretor atualizado com sucesso!')
    },
    onError: (error: Error) => {
      toast.error('Erro ao atualizar diretor', { description: error.message })
    },
  })

  const handleUpdateDirector = async () => {
    if (directorMode === 'select' && selectedUserId) {
      await updateDirector({ existingUserId: selectedUserId })
    } else if (directorMode === 'create') {
      const validation = newDirectorSchema.safeParse(newDirectorData)
      if (!validation.success) {
        toast.error('Dados inválidos', { description: validation.error.issues[0]?.message })
        return
      }
      await updateDirector({ newDirector: newDirectorData })
    }
  }

  const onSubmit = async (data: SchoolEditFormData) => {
    try {
      await updateSchool(data)
      toast.success('Escola atualizada com sucesso!')
      router.visit('/admin/escolas')
    } catch (error) {
      console.error('Erro ao atualizar escola:', error)
      toast.error('Erro ao atualizar escola', {
        description: error instanceof Error ? error.message : 'Ocorreu um erro desconhecido',
      })
    }
  }

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
    <Card>
      <CardHeader>
        <CardTitle>Editar Escola</CardTitle>
        <CardDescription>{school?.name}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="basic">Dados Básicos</TabsTrigger>
                <TabsTrigger value="address">Endereço</TabsTrigger>
                <TabsTrigger value="academic">Acadêmico</TabsTrigger>
                <TabsTrigger value="insurance">Seguro</TabsTrigger>
                <TabsTrigger value="team">Equipe</TabsTrigger>
              </TabsList>

              {/* Dados Básicos */}
              <TabsContent value="basic" className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="name"
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
                  name="logoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL do Logo (Opcional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://exemplo.com/logo.png"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value || null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              {/* Endereço */}
              <TabsContent value="address" className="space-y-4 pt-4">
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
                              value={field.value || ''}
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
                          <Input
                            placeholder="Ex: Rua das Flores"
                            {...field}
                            value={field.value || ''}
                            disabled={isLoadingCep}
                          />
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
                          <Input
                            placeholder="123"
                            {...field}
                            value={field.value || ''}
                            disabled={isLoadingCep}
                          />
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
                          <Input
                            placeholder="Ex: Sala 101"
                            {...field}
                            value={field.value || ''}
                            disabled={isLoadingCep}
                          />
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
                          <Input
                            placeholder="Ex: Centro"
                            {...field}
                            value={field.value || ''}
                            disabled={isLoadingCep}
                          />
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
                          <Input
                            placeholder="Ex: São Paulo"
                            {...field}
                            value={field.value || ''}
                            disabled={isLoadingCep}
                          />
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
                          <Input
                            placeholder="Ex: SP"
                            maxLength={2}
                            {...field}
                            value={field.value || ''}
                            disabled={isLoadingCep}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              {/* Acadêmico */}
              <TabsContent value="academic" className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="minimumGrade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nota Mínima para Aprovação</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          min={0}
                          max={10}
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>Nota mínima para aprovação (0 a 10)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="minimumAttendancePercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frequência Mínima (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          min={0}
                          max={100}
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>Porcentagem mínima de presença para aprovação</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="calculationAlgorithm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Algoritmo de Cálculo de Notas</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o algoritmo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="AVERAGE">Média</SelectItem>
                          <SelectItem value="SUM">Soma</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Define como as notas são calculadas no sistema
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              {/* Seguro */}
              <TabsContent value="insurance" className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="hasInsurance"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value || false}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Habilitar seguro de inadimplência</FormLabel>
                        <FormDescription>
                          A escola pagará uma porcentagem mensal sobre as mensalidades para ter
                          cobertura contra inadimplência.
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
                                field.onChange(e.target.value ? Number(e.target.value) : null)
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
                                field.onChange(e.target.value ? Number(e.target.value) : null)
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
                                field.onChange(e.target.value ? Number(e.target.value) : null)
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
              </TabsContent>

              {/* Equipe */}
              <TabsContent value="team" className="space-y-4 pt-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-lg font-medium">Diretor da Escola</h3>
                  </div>

                  {directorMode === 'view' && (
                    <div className="rounded-lg border p-4 space-y-4">
                      {(school as { director?: { id: string; name: string; email: string; phone?: string } })?.director ? (
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <User className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{(school as { director?: { name: string } }).director?.name}</p>
                            <p className="text-sm text-muted-foreground">{(school as { director?: { email: string } }).director?.email}</p>
                            {(school as { director?: { phone?: string } }).director?.phone && (
                              <p className="text-sm text-muted-foreground">{(school as { director?: { phone?: string } }).director?.phone}</p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-4 text-muted-foreground">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                            <User className="h-6 w-6" />
                          </div>
                          <p>Nenhum diretor cadastrado</p>
                        </div>
                      )}
                      <div className="flex gap-2 pt-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => setDirectorMode('select')}>
                          <Users className="h-4 w-4 mr-2" />
                          Escolher da escola
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => setDirectorMode('create')}>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Criar novo diretor
                        </Button>
                      </div>
                    </div>
                  )}

                  {directorMode === 'select' && (
                    <div className="rounded-lg border p-4 space-y-4">
                      <Label>Selecionar usuário da escola</Label>
                      {isLoadingUsers ? (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Carregando usuários...
                        </div>
                      ) : (
                        <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um usuário" />
                          </SelectTrigger>
                          <SelectContent>
                            {(schoolUsers as SchoolUser[] || [])
                              .filter((u) => u.role !== 'SCHOOL_DIRECTOR')
                              .map((user) => (
                                <SelectItem key={user.id} value={user.id}>
                                  {user.name} ({user.roleName})
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      )}
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleUpdateDirector}
                          disabled={!selectedUserId || isUpdatingDirector}
                        >
                          {isUpdatingDirector && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          Confirmar
                        </Button>
                        <Button type="button" variant="ghost" size="sm" onClick={() => setDirectorMode('view')}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  )}

                  {directorMode === 'create' && (
                    <div className="rounded-lg border p-4 space-y-4">
                      <Label>Criar novo diretor</Label>
                      <div className="grid gap-4">
                        <div>
                          <Label htmlFor="directorName">Nome *</Label>
                          <Input
                            id="directorName"
                            placeholder="Nome completo"
                            value={newDirectorData.name}
                            onChange={(e) => setNewDirectorData({ ...newDirectorData, name: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="directorEmail">Email *</Label>
                          <Input
                            id="directorEmail"
                            type="email"
                            placeholder="email@exemplo.com"
                            value={newDirectorData.email}
                            onChange={(e) => setNewDirectorData({ ...newDirectorData, email: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="directorPhone">Telefone</Label>
                          <Input
                            id="directorPhone"
                            placeholder="(11) 99999-9999"
                            value={newDirectorData.phone}
                            onChange={(e) => setNewDirectorData({ ...newDirectorData, phone: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleUpdateDirector}
                          disabled={!newDirectorData.name || !newDirectorData.email || isUpdatingDirector}
                        >
                          {isUpdatingDirector && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          Criar e definir como diretor
                        </Button>
                        <Button type="button" variant="ghost" size="sm" onClick={() => setDirectorMode('view')}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-4 border-t pt-4">
              <Button type="button" variant="outline" onClick={() => router.visit('/admin/escolas')}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export function SchoolEditForm({ schoolId }: { schoolId: string }) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ error, resetErrorBoundary }) => (
            <EditFormError error={error as Error} resetErrorBoundary={resetErrorBoundary} />
          )}
        >
          <Suspense fallback={<EditFormSkeleton />}>
            <EditFormContent schoolId={schoolId} />
          </Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}
