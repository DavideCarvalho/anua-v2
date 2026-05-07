import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useFormContext } from 'react-hook-form'
import { toast } from 'sonner'
import { Loader2, Plus, Edit2, Trash2, CalendarRange } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { Badge } from '~/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { DatePicker } from '~/components/ui/date-picker'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '~/components/ui/form'
import {
  PERIOD_STRUCTURE_OPTIONS,
  RECOVERY_METHOD_OPTIONS,
} from '../schemas/edit_academic_period.schema'
import { api } from '~/lib/api'
import { useAuthUser } from '~/stores/auth_store'

interface SchoolData {
  id: string
  name: string
  periodStructure: string | null
  recoveryGradeMethod: string | null
  minimumGrade: number
}

interface SubPeriod {
  id: string
  name: string
  order: number
  startDate: string
  endDate: string
  weight: number
  minimumGrade: number | null
  hasRecovery: boolean
  recoveryStartDate: string | null
  recoveryEndDate: string | null
  academicPeriodId: string
  schoolId: string
}

interface SubPeriodsFormProps {
  academicPeriodId: string
  periodStructure?: string | null
  recoveryGradeMethod?: string | null
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('pt-BR')
}

function SubPeriodEditDialog({
  subPeriod,
  open,
  onOpenChange,
}: {
  subPeriod: SubPeriod | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const updateMutation = useMutation(api.api.v1.academicSubPeriods.update.mutationOptions())

  type SubPeriodFormData = {
    name: string
    startDate: Date | undefined
    endDate: Date | undefined
    weight: number
    minimumGrade: number | null
    hasRecovery: boolean
    recoveryStartDate: Date | undefined
    recoveryEndDate: Date | undefined
  }

  const [formData, setFormData] = useState<SubPeriodFormData>({
    name: '',
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    weight: 1,
    minimumGrade: null as number | null,
    hasRecovery: false,
    recoveryStartDate: undefined as Date | undefined,
    recoveryEndDate: undefined as Date | undefined,
  })

  useEffect(() => {
    if (subPeriod) {
      setFormData({
        name: subPeriod.name,
        startDate: subPeriod.startDate ? new Date(subPeriod.startDate) : undefined,
        endDate: subPeriod.endDate ? new Date(subPeriod.endDate) : undefined,
        weight: subPeriod.weight,
        minimumGrade: subPeriod.minimumGrade,
        hasRecovery: subPeriod.hasRecovery,
        recoveryStartDate: subPeriod.recoveryStartDate
          ? new Date(subPeriod.recoveryStartDate)
          : undefined,
        recoveryEndDate: subPeriod.recoveryEndDate
          ? new Date(subPeriod.recoveryEndDate)
          : undefined,
      })
    }
  }, [subPeriod])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subPeriod) return

    try {
      await updateMutation.mutateAsync({
        params: { id: subPeriod.id },
        body: {
          name: formData.name,
          startDate: formData.startDate?.toISOString() ?? '',
          endDate: formData.endDate?.toISOString() ?? '',
          weight: formData.weight,
          minimumGrade: formData.minimumGrade,
          hasRecovery: formData.hasRecovery,
          recoveryStartDate: formData.recoveryStartDate?.toISOString(),
          recoveryEndDate: formData.recoveryEndDate?.toISOString(),
        },
      })
      toast.success('Sub-período atualizado com sucesso')
      queryClient.invalidateQueries({
        queryKey: api.api.v1.academicSubPeriods.index.pathKey(),
      })
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao atualizar sub-período')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar Sub-Período</DialogTitle>
            <DialogDescription>Altere as informações do sub-período</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="subPeriodName">Nome</Label>
              <Input
                id="subPeriodName"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data de Início</Label>
                <DatePicker
                  date={formData.startDate}
                  onChange={(date) => setFormData({ ...formData, startDate: date })}
                />
              </div>
              <div className="space-y-2">
                <Label>Data de Término</Label>
                <DatePicker
                  date={formData.endDate}
                  onChange={(date) => setFormData({ ...formData, endDate: date })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Peso</Label>
              <Input
                id="weight"
                type="number"
                min={0}
                step={0.1}
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minimumGrade">Nota Mínima (opcional)</Label>
              <Input
                id="minimumGrade"
                type="number"
                min={0}
                max={10}
                step={0.5}
                value={formData.minimumGrade ?? ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    minimumGrade: e.target.value ? parseFloat(e.target.value) : null,
                  })
                }
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="hasRecovery"
                checked={formData.hasRecovery}
                onChange={(e) => setFormData({ ...formData, hasRecovery: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="hasRecovery" className="text-sm font-normal cursor-pointer">
                Possui Recuperação
              </Label>
            </div>

            {formData.hasRecovery && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Início Recuperação</Label>
                  <DatePicker
                    date={formData.recoveryStartDate}
                    onChange={(date) => setFormData({ ...formData, recoveryStartDate: date })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Término Recuperação</Label>
                  <DatePicker
                    date={formData.recoveryEndDate}
                    onChange={(date) => setFormData({ ...formData, recoveryEndDate: date })}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function SubPeriodsForm({
  academicPeriodId,
  periodStructure: propPeriodStructure,
  recoveryGradeMethod: propRecoveryGradeMethod,
}: SubPeriodsFormProps) {
  const form = useFormContext()
  const user = useAuthUser()
  const schoolId = user?.schoolId
  const queryClient = useQueryClient()

  const { data: schoolData } = useQuery({
    ...api.api.v1.schools.show.queryOptions({ params: { id: schoolId ?? '' } }),
  })

  const {
    data: subPeriodsData,
    isLoading: isLoadingSubPeriods,
    refetch: refetchSubPeriods,
  } = useQuery({
    ...api.api.v1.academicSubPeriods.index.queryOptions({
      query: { academicPeriodId },
    }),
  })

  const generateMutation = useMutation(api.api.v1.academicSubPeriods.generate.mutationOptions())

  const deleteMutation = useMutation(api.api.v1.academicSubPeriods.destroy.mutationOptions())

  const [editingSubPeriod, setEditingSubPeriod] = useState<SubPeriod | null>(null)
  const [showDiffDialog, setShowDiffDialog] = useState(false)

  const handleGenerate = async (overwrite: boolean = false) => {
    if (!schoolId) {
      toast.error('Escola não encontrada')
      return
    }

    try {
      await generateMutation.mutateAsync({
        body: {
          academicPeriodId,
          schoolId,
          overwrite,
          periodStructure: resolvedPeriodStructure || undefined,
        },
      })
      toast.success(
        overwrite ? 'Sub-períodos regenerados com sucesso' : 'Sub-períodos gerados com sucesso'
      )
      queryClient.invalidateQueries({
        queryKey: api.api.v1.academicSubPeriods.index.pathKey(),
      })
      refetchSubPeriods()
      setShowDiffDialog(false)
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao gerar sub-períodos')
    }
  }

  const handleDelete = async (subPeriodId: string) => {
    if (!confirm('Tem certeza que deseja excluir este sub-período?')) return

    try {
      await deleteMutation.mutateAsync({ params: { id: subPeriodId } })
      toast.success('Sub-período excluído com sucesso')
      queryClient.invalidateQueries({
        queryKey: api.api.v1.academicSubPeriods.index.pathKey(),
      })
      refetchSubPeriods()
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao excluir sub-período')
    }
  }

  const STRUCTURE_LABELS: Record<string, string> = {
    BIMESTRAL: 'Bimestral (4 períodos)',
    TRIMESTRAL: 'Trimestral (3 períodos)',
    SEMESTRAL: 'Semestral (2 períodos)',
    ANUAL: 'Anual (1 período)',
  }

  const STRUCTURE_COUNT: Record<string, number> = {
    BIMESTRAL: 4,
    TRIMESTRAL: 3,
    SEMESTRAL: 2,
    ANUAL: 1,
  }

  const school = schoolData as SchoolData | undefined
  const resolvedPeriodStructure =
    propPeriodStructure && propPeriodStructure !== ''
      ? propPeriodStructure
      : school?.periodStructure

  const usesSubPeriods = resolvedPeriodStructure && resolvedPeriodStructure !== ''
  const isFromPeriod = propPeriodStructure && propPeriodStructure !== ''

  const subPeriods = (subPeriodsData?.data ?? []) as SubPeriod[]

  const expectedCount = resolvedPeriodStructure
    ? (STRUCTURE_COUNT[resolvedPeriodStructure] ?? 0)
    : 0
  const countMismatch = subPeriods.length > 0 && subPeriods.length !== expectedCount

  useEffect(() => {
    if (countMismatch) {
      form.setError('root.subPeriodMismatch', {
        message:
          'Existem sub-períodos que não correspondem à estrutura selecionada. Regere ou reverta antes de salvar.',
      })
    } else {
      form.clearErrors('root.subPeriodMismatch')
    }
  }, [countMismatch, form])

  if (!schoolId) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          Escola não encontrada no contexto do usuário.
        </CardContent>
      </Card>
    )
  }

  const structureLabel = resolvedPeriodStructure
    ? (STRUCTURE_LABELS[resolvedPeriodStructure] ?? '')
    : ''

  const generateLabel = resolvedPeriodStructure
    ? `Gerar ${expectedCount} ${resolvedPeriodStructure === 'BIMESTRAL' ? 'Bimestres' : resolvedPeriodStructure === 'TRIMESTRAL' ? 'Trimestres' : resolvedPeriodStructure === 'SEMESTRAL' ? 'Semestres' : 'Período Anual'}`
    : 'Gerar Sub-Períodos'

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarRange className="h-5 w-5" />
            Configuração de Sub-Períodos
          </CardTitle>
          <CardDescription>
            Configure a divisão deste período letivo e gerencie os sub-períodos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <FormField
            control={form.control}
            name="calendar.periodStructure"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-base">Estrutura de Períodos</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value ?? ''}
                    className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
                  >
                    {PERIOD_STRUCTURE_OPTIONS.map((opt) => (
                      <FormItem
                        key={opt.value}
                        className="flex cursor-pointer items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm hover:border-primary has-data-[state=checked]:border-primary"
                        onClick={() => field.onChange(opt.value)}
                      >
                        <FormControl onClick={(e) => e.stopPropagation()}>
                          <RadioGroupItem value={opt.value} className="mt-0.5" />
                        </FormControl>
                        <div className="space-y-1">
                          <FormLabel className="cursor-pointer font-medium leading-none">
                            {opt.label}
                          </FormLabel>
                          <p className="text-xs text-muted-foreground">{opt.description}</p>
                        </div>
                      </FormItem>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="calendar.recoveryGradeMethod"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-base">Método de Recuperação</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value ?? ''}
                    className="grid gap-3 sm:grid-cols-2"
                  >
                    {RECOVERY_METHOD_OPTIONS.map((opt) => (
                      <FormItem
                        key={opt.value}
                        className="flex cursor-pointer items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm hover:border-primary has-data-[state=checked]:border-primary"
                        onClick={() => field.onChange(opt.value)}
                      >
                        <FormControl onClick={(e) => e.stopPropagation()}>
                          <RadioGroupItem value={opt.value} className="mt-0.5" />
                        </FormControl>
                        <div className="space-y-1">
                          <FormLabel className="cursor-pointer font-medium leading-none">
                            {opt.label}
                          </FormLabel>
                          <p className="text-xs text-muted-foreground">{opt.description}</p>
                        </div>
                      </FormItem>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="border-t pt-6 space-y-4">
            {!usesSubPeriods ? (
              <div className="flex flex-col items-center justify-center py-10 text-center border rounded-lg border-dashed bg-muted/10">
                <div className="rounded-full bg-muted p-3 mb-4">
                  <CalendarRange className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">Nenhuma estrutura definida</h3>
                <p className="text-sm text-muted-foreground max-w-sm mt-1">
                  Selecione uma estrutura (como Bimestral ou Trimestral) acima para poder gerar
                  sub-períodos.
                </p>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-lg border bg-muted/50 p-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" className="bg-background">
                      {structureLabel}
                    </Badge>
                    {isFromPeriod ? (
                      <span className="text-muted-foreground">definido neste período</span>
                    ) : (
                      <span className="text-muted-foreground">herdado da escola</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {isLoadingSubPeriods ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Carregando...
                      </div>
                    ) : (
                      <Button
                        onClick={() =>
                          subPeriods.length > 0 && countMismatch
                            ? setShowDiffDialog(true)
                            : handleGenerate(false)
                        }
                        disabled={
                          generateMutation.isPending || (subPeriods.length > 0 && !countMismatch)
                        }
                      >
                        {generateMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {subPeriods.length > 0 ? 'Regenerando...' : 'Gerando...'}
                          </>
                        ) : (
                          <>
                            <Plus className="mr-2 h-4 w-4" />
                            {subPeriods.length > 0
                              ? `Regenerar ${expectedCount} ${resolvedPeriodStructure === 'BIMESTRAL' ? 'Bimestres' : resolvedPeriodStructure === 'TRIMESTRAL' ? 'Trimestres' : resolvedPeriodStructure === 'SEMESTRAL' ? 'Semestres' : 'Período Anual'}`
                              : generateLabel}
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                {countMismatch && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                    <span className="font-semibold">Atenção:</span> A estrutura selecionada (
                    {structureLabel}) prevê {expectedCount} sub-períodos, mas atualmente existem{' '}
                    {subPeriods.length}. Clique em "Regenerar" acima para substituir.
                  </div>
                )}

                {isLoadingSubPeriods ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : subPeriods.length > 0 ? (
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow>
                          <TableHead className="w-16 text-center">Ordem</TableHead>
                          <TableHead>Nome</TableHead>
                          <TableHead>Início</TableHead>
                          <TableHead>Término</TableHead>
                          <TableHead className="w-20 text-center">Peso</TableHead>
                          <TableHead className="w-24 text-center">Nota Mín.</TableHead>
                          <TableHead className="w-24 text-center">Recup.</TableHead>
                          <TableHead className="w-24 text-center">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {subPeriods
                          .sort((a, b) => a.order - b.order)
                          .map((sp) => (
                            <TableRow key={sp.id}>
                              <TableCell className="text-center font-medium">{sp.order}º</TableCell>
                              <TableCell className="font-medium">{sp.name}</TableCell>
                              <TableCell>{formatDate(sp.startDate)}</TableCell>
                              <TableCell>{formatDate(sp.endDate)}</TableCell>
                              <TableCell className="text-center">{sp.weight}</TableCell>
                              <TableCell className="text-center">
                                {sp.minimumGrade !== null ? sp.minimumGrade : '-'}
                              </TableCell>
                              <TableCell className="text-center">
                                {sp.hasRecovery ? (
                                  <Badge
                                    variant="default"
                                    className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-none"
                                  >
                                    Sim
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="secondary"
                                    className="bg-muted text-muted-foreground border-none"
                                  >
                                    Não
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center justify-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                    onClick={() => setEditingSubPeriod(sp)}
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                    onClick={() => handleDelete(sp.id)}
                                    disabled={deleteMutation.isPending}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg border-dashed bg-muted/10">
                    <div className="rounded-full bg-muted p-3 mb-4">
                      <CalendarRange className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold">Nenhum sub-período gerado</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-4">
                      Clique no botão acima para criar os sub-períodos automaticamente com base na
                      sua configuração de calendário.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <SubPeriodEditDialog
        subPeriod={editingSubPeriod}
        open={!!editingSubPeriod}
        onOpenChange={(open) => {
          if (!open) setEditingSubPeriod(null)
        }}
      />

      <Dialog open={showDiffDialog} onOpenChange={setShowDiffDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Atenção! Substituição de Sub-períodos</DialogTitle>
            <DialogDescription>
              Você está alterando a estrutura deste período letivo. Os sub-períodos atuais serão
              substituídos.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="rounded-md border p-3 bg-red-50/50">
              <p className="font-semibold mb-2 text-sm text-red-600">
                Serão Excluídos ({subPeriods.length}):
              </p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                {subPeriods.map((sp) => (
                  <li key={sp.id}>- {sp.name}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-md border p-3 bg-green-50/50">
              <p className="font-semibold mb-2 text-sm text-green-600">
                Serão Criados ({expectedCount}):
              </p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                {Array.from({ length: expectedCount }).map((_, i) => (
                  <li key={i}>
                    - {i + 1}º{' '}
                    {resolvedPeriodStructure === 'BIMESTRAL'
                      ? 'Bimestre'
                      : resolvedPeriodStructure === 'TRIMESTRAL'
                        ? 'Trimestre'
                        : resolvedPeriodStructure === 'SEMESTRAL'
                          ? 'Semestre'
                          : 'Período'}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
            As notas e avaliações vinculadas aos sub-períodos antigos serão mantidas e
            redistribuídas automaticamente de acordo com as novas datas.
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowDiffDialog(false)}>
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={generateMutation.isPending}
              onClick={() => handleGenerate(true)}
            >
              {generateMutation.isPending ? 'Regenerando...' : 'Confirmar Substituição'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
