import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2, Plus, Edit2, Trash2, CalendarRange } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
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
import { api } from '~/lib/api'
import { useAuthUser } from '~/stores/auth_store'

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
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('pt-BR')
}

function SubPeriodEditDialog({
  subPeriod,
  academicPeriodId,
  open,
  onOpenChange,
}: {
  subPeriod: SubPeriod | null
  academicPeriodId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const updateMutation = useMutation(api.api.v1.academicSubPeriods.update.mutationOptions())

  const [formData, setFormData] = useState({
    name: '',
    startDate: null as Date | null,
    endDate: null as Date | null,
    weight: 1,
    minimumGrade: null as number | null,
    hasRecovery: false,
    recoveryStartDate: null as Date | null,
    recoveryEndDate: null as Date | null,
  })

  useEffect(() => {
    if (subPeriod) {
      setFormData({
        name: subPeriod.name,
        startDate: subPeriod.startDate ? new Date(subPeriod.startDate) : null,
        endDate: subPeriod.endDate ? new Date(subPeriod.endDate) : null,
        weight: subPeriod.weight,
        minimumGrade: subPeriod.minimumGrade,
        hasRecovery: subPeriod.hasRecovery,
        recoveryStartDate: subPeriod.recoveryStartDate
          ? new Date(subPeriod.recoveryStartDate)
          : null,
        recoveryEndDate: subPeriod.recoveryEndDate ? new Date(subPeriod.recoveryEndDate) : null,
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
      toast.success('Sub-periodo atualizado com sucesso')
      queryClient.invalidateQueries({
        queryKey: api.api.v1.academicSubPeriods.index.pathKey(),
      })
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao atualizar sub-periodo')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar Sub-Periodo</DialogTitle>
            <DialogDescription>Altere as informações do sub-periodo</DialogDescription>
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
                Possui Recuperacao
              </Label>
            </div>

            {formData.hasRecovery && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Início Recuperacao</Label>
                  <DatePicker
                    date={formData.recoveryStartDate}
                    onChange={(date) => setFormData({ ...formData, recoveryStartDate: date })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Término Recuperacao</Label>
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

export function SubPeriodsForm({ academicPeriodId }: SubPeriodsFormProps) {
  const user = useAuthUser()
  const schoolId = user?.schoolId
  const queryClient = useQueryClient()

  const { data: schoolData } = useQuery(
    api.api.v1.schools.show.queryOptions({ params: { id: schoolId ?? '' } }),
    { enabled: !!schoolId }
  )

  const {
    data: subPeriodsData,
    isLoading: isLoadingSubPeriods,
    refetch: refetchSubPeriods,
  } = useQuery(
    api.api.v1.academicSubPeriods.index.queryOptions({
      query: { academicPeriodId },
    }),
    { enabled: !!academicPeriodId }
  )

  const generateMutation = useMutation(api.api.v1.academicSubPeriods.generate.mutationOptions())

  const deleteMutation = useMutation(api.api.v1.academicSubPeriods.destroy.mutationOptions())

  const [editingSubPeriod, setEditingSubPeriod] = useState<SubPeriod | null>(null)

  const handleGenerate = async () => {
    if (!schoolId) {
      toast.error('Escola não encontrada')
      return
    }

    try {
      await generateMutation.mutateAsync({
        body: {
          academicPeriodId,
          schoolId,
        },
      })
      toast.success('Sub-periodos gerados com sucesso')
      queryClient.invalidateQueries({
        queryKey: api.api.v1.academicSubPeriods.index.pathKey(),
      })
      refetchSubPeriods()
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao gerar sub-periodos')
    }
  }

  const handleDelete = async (subPeriodId: string) => {
    if (!confirm('Tem certeza que deseja excluir este sub-periodo?')) return

    try {
      await deleteMutation.mutateAsync({ params: { id: subPeriodId } })
      toast.success('Sub-periodo excluído com sucesso')
      queryClient.invalidateQueries({
        queryKey: api.api.v1.academicSubPeriods.index.pathKey(),
      })
      refetchSubPeriods()
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao excluir sub-periodo')
    }
  }

  const usesSubPeriods =
    schoolData && (schoolData as any).periodStructure && (schoolData as any).periodStructure !== ''

  const subPeriods = (subPeriodsData?.data ?? []) as SubPeriod[]

  if (!schoolId) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          Escola não encontrada no contexto do usuário.
        </CardContent>
      </Card>
    )
  }

  if (!usesSubPeriods) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarRange className="h-5 w-5" />
            Sub-Periodos
          </CardTitle>
          <CardDescription>
            Esta escola não utiliza sub-periodos. Configure a estrutura de periodos nas
            configurações da escola para habilitar esta funcionalidade.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarRange className="h-5 w-5" />
            Sub-Periodos
          </CardTitle>
          <CardDescription>Gerencie os sub-periodos deste período letivo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Button
              onClick={handleGenerate}
              disabled={generateMutation.isPending || subPeriods.length > 0}
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Gerar Sub-Periodos
                </>
              )}
            </Button>
            {subPeriods.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {subPeriods.length} sub-periodo(s) criado(s)
              </p>
            )}
          </div>

          {isLoadingSubPeriods ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : subPeriods.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ordem</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Início</TableHead>
                    <TableHead>Término</TableHead>
                    <TableHead>Peso</TableHead>
                    <TableHead>Nota Mín.</TableHead>
                    <TableHead>Recup.</TableHead>
                    <TableHead className="w-24">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subPeriods
                    .sort((a, b) => a.order - b.order)
                    .map((sp) => (
                      <TableRow key={sp.id}>
                        <TableCell>{sp.order}</TableCell>
                        <TableCell className="font-medium">{sp.name}</TableCell>
                        <TableCell>{formatDate(sp.startDate)}</TableCell>
                        <TableCell>{formatDate(sp.endDate)}</TableCell>
                        <TableCell>{sp.weight}</TableCell>
                        <TableCell>{sp.minimumGrade !== null ? sp.minimumGrade : '-'}</TableCell>
                        <TableCell>
                          {sp.hasRecovery ? (
                            <Badge variant="default">Sim</Badge>
                          ) : (
                            <Badge variant="secondary">Não</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setEditingSubPeriod(sp)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
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
            <div className="py-8 text-center text-muted-foreground">
              Nenhum sub-periodo criado. Clique em "Gerar Sub-Periodos" para criar automaticamente
              com base na estrutura configurada.
            </div>
          )}
        </CardContent>
      </Card>

      <SubPeriodEditDialog
        subPeriod={editingSubPeriod}
        academicPeriodId={academicPeriodId}
        open={!!editingSubPeriod}
        onOpenChange={(open) => {
          if (!open) setEditingSubPeriod(null)
        }}
      />
    </div>
  )
}
