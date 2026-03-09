import { useState } from 'react'
import { Target, Flag, Plus, Pencil, Trash2, Loader2, Repeat } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import { Switch } from '../../components/ui/switch'
import { useQuery } from '@tanstack/react-query'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '~/lib/api'
import type { Route } from '@tuyau/core/types'
import { useAuthUser } from '../../stores/auth_store'

const CHALLENGE_CATEGORIES = [
  { value: 'ATTENDANCE', label: 'Frequência', color: 'bg-green-500' },
  { value: 'ACADEMIC', label: 'Acadêmico', color: 'bg-blue-500' },
  { value: 'BEHAVIOR', label: 'Comportamento', color: 'bg-purple-500' },
  { value: 'EXTRACURRICULAR', label: 'Extracurricular', color: 'bg-yellow-500' },
  { value: 'SPECIAL', label: 'Especial', color: 'bg-indigo-500' },
]

const RECURRENCE_PERIODS = [
  { value: 'DAILY', label: 'Diário' },
  { value: 'WEEKLY', label: 'Semanal' },
  { value: 'MONTHLY', label: 'Mensal' },
  { value: 'YEARLY', label: 'Anual' },
]

function getCategoryBadge(category: string) {
  const categoryInfo = CHALLENGE_CATEGORIES.find((c) => c.value === category)
  return (
    <Badge variant="secondary" className="gap-1">
      <span className={`h-2 w-2 rounded-full ${categoryInfo?.color || 'bg-gray-500'}`} />
      {categoryInfo?.label || category}
    </Badge>
  )
}

interface ChallengeFormData {
  name: string
  description: string
  category: string
  points: number
  icon: string
  isRecurring: boolean
  recurrencePeriod: string
  isActive: boolean
}

type ChallengeCategory = Route.Body<'api.v1.challenges.store'>['category']
type RecurrencePeriod = NonNullable<Route.Body<'api.v1.challenges.store'>['recurrencePeriod']>
type ChallengeItem = Route.Response<'api.v1.challenges.index'>['data'][number]

const defaultFormData: ChallengeFormData = {
  name: '',
  description: '',
  category: 'ACADEMIC',
  points: 100,
  icon: '',
  isRecurring: false,
  recurrencePeriod: 'WEEKLY',
  isActive: true,
}

export function ChallengesTable() {
  const user = useAuthUser()
  const schoolId = user?.schoolId

  const queryClient = useQueryClient()
  const { data: challenges } = useQuery(
    api.api.v1.challenges.index.queryOptions({
      query: { schoolId: schoolId || undefined },
    })
  )
  const createChallenge = useMutation(api.api.v1.challenges.store.mutationOptions())
  const updateChallenge = useMutation(api.api.v1.challenges.update.mutationOptions())
  const deleteChallenge = useMutation(api.api.v1.challenges.destroy.mutationOptions())

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<ChallengeFormData>(defaultFormData)

  const handleChange = (field: keyof ChallengeFormData, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCreate = async () => {
    const category = formData.category as ChallengeCategory
    const recurrencePeriod = formData.isRecurring
      ? (formData.recurrencePeriod as RecurrencePeriod)
      : undefined

    await createChallenge.mutateAsync({
      body: {
        name: formData.name,
        description: formData.description,
        category,
        points: formData.points,
        schoolId: schoolId || undefined,
        icon: formData.icon || undefined,
        isRecurring: formData.isRecurring,
        recurrencePeriod,
        isActive: formData.isActive,
      },
    })
    queryClient.invalidateQueries({ queryKey: ['challenges'] })
    setIsCreateOpen(false)
    setFormData(defaultFormData)
  }

  const handleEdit = (challenge: ChallengeItem) => {
    setEditingId(challenge.id)
    setFormData({
      name: challenge.name,
      description: challenge.description,
      category: challenge.category,
      points: challenge.points,
      icon: challenge.icon || '',
      isRecurring: challenge.isRecurring,
      recurrencePeriod: challenge.recurrencePeriod || 'WEEKLY',
      isActive: challenge.isActive,
    })
  }

  const handleUpdate = async () => {
    if (!editingId) return
    const category = formData.category as ChallengeCategory
    const recurrencePeriod = formData.isRecurring
      ? (formData.recurrencePeriod as RecurrencePeriod)
      : undefined

    await updateChallenge.mutateAsync({
      params: { id: editingId },
      body: {
        name: formData.name,
        description: formData.description,
        category,
        points: formData.points,
        icon: formData.icon || undefined,
        isRecurring: formData.isRecurring,
        recurrencePeriod,
        isActive: formData.isActive,
      },
    })
    queryClient.invalidateQueries({ queryKey: ['challenges'] })
    setEditingId(null)
    setFormData(defaultFormData)
  }

  const handleDelete = async () => {
    if (!deletingId) return
    await deleteChallenge.mutateAsync({ params: { id: deletingId } })
    queryClient.invalidateQueries({ queryKey: ['challenges'] })
    setDeletingId(null)
  }

  const challengesList = challenges?.data || []

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Desafios
          </CardTitle>
          <CardDescription>Gerencie os desafios disponíveis para os alunos</CardDescription>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Desafio
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Desafio</DialogTitle>
              <DialogDescription>Crie um novo desafio para os alunos</DialogDescription>
            </DialogHeader>
            <ChallengeForm formData={formData} onChange={handleChange} />
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreate} disabled={createChallenge.isPending}>
                {createChallenge.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Criar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {challengesList.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground">
            <Flag className="mx-auto h-12 w-12 opacity-50" />
            <p className="mt-2">Nenhum desafio cadastrado</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-center">Pontos</TableHead>
                <TableHead className="text-center">Recorrente</TableHead>
                <TableHead className="text-center">Período</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {challengesList.map((challenge: ChallengeItem) => (
                <TableRow key={challenge.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {challenge.icon ? (
                        <img src={challenge.icon} alt="" className="h-8 w-8 rounded object-cover" />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10">
                          <Target className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{challenge.name}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {challenge.description}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getCategoryBadge(challenge.category)}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">{challenge.points} pts</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {challenge.isRecurring ? (
                      <Badge variant="outline" className="gap-1">
                        <Repeat className="h-3 w-3" />
                        Sim
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">Não</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {challenge.isRecurring && challenge.recurrencePeriod ? (
                      <span className="text-sm">
                        {RECURRENCE_PERIODS.find((r) => r.value === challenge.recurrencePeriod)
                          ?.label || challenge.recurrencePeriod}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={challenge.isActive ? 'default' : 'secondary'}>
                      {challenge.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Dialog
                        open={editingId === challenge.id}
                        onOpenChange={(open) => {
                          if (!open) {
                            setEditingId(null)
                            setFormData(defaultFormData)
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(challenge)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Editar Desafio</DialogTitle>
                          </DialogHeader>
                          <ChallengeForm formData={formData} onChange={handleChange} />
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setEditingId(null)
                                setFormData(defaultFormData)
                              }}
                            >
                              Cancelar
                            </Button>
                            <Button onClick={handleUpdate} disabled={updateChallenge.isPending}>
                              {updateChallenge.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              )}
                              Salvar
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingId(challenge.id)}
                        disabled={deleteChallenge.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir desafio</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este desafio? Esta acao nao pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteChallenge.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteChallenge.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteChallenge.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

function ChallengeForm({
  formData,
  onChange,
}: {
  formData: ChallengeFormData
  onChange: (field: keyof ChallengeFormData, value: string | number | boolean) => void
}) {
  return (
    <div className="grid gap-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => onChange('name', e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => onChange('description', e.target.value)}
          required
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="category">Categoria</Label>
          <Select
            value={formData.category}
            onValueChange={(value: string | null) => {
              if (!value) return
              onChange('category', value)
            }}
          >
            <SelectTrigger id="category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CHALLENGE_CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="points">Pontos</Label>
          <Input
            id="points"
            type="number"
            min={0}
            value={formData.points}
            onChange={(e) => onChange('points', parseInt(e.target.value))}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="icon">URL do Ícone</Label>
        <Input
          id="icon"
          type="url"
          value={formData.icon}
          onChange={(e) => onChange('icon', e.target.value)}
          placeholder="https://..."
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Switch
            id="isRecurring"
            checked={formData.isRecurring}
            onCheckedChange={(checked) => onChange('isRecurring', checked)}
          />
          <Label htmlFor="isRecurring">Recorrente</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="isActive"
            checked={formData.isActive}
            onCheckedChange={(checked) => onChange('isActive', checked)}
          />
          <Label htmlFor="isActive">Ativo</Label>
        </div>
      </div>
      {formData.isRecurring && (
        <div className="space-y-2">
          <Label htmlFor="recurrencePeriod">Período de Recorrência</Label>
          <Select
            value={formData.recurrencePeriod}
            onValueChange={(value: string | null) => {
              if (!value) return
              onChange('recurrencePeriod', value)
            }}
          >
            <SelectTrigger id="recurrencePeriod">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RECURRENCE_PERIODS.map((period) => (
                <SelectItem key={period.value} value={period.value}>
                  {period.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}
