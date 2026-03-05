import { useState } from 'react'
import { Trophy, Star, Plus, Pencil, Trash2, Award, Loader2 } from 'lucide-react'

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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Route } from '@tuyau/core/types'
import { api } from '~/lib/api'
import { useAuthUser } from '../../stores/auth_store'

type AchievementCategory = Route.Body<'api.v1.achievements.store'>['category']
type Achievement = Route.Response<'api.v1.achievements.index'>['data'][number]

const ACHIEVEMENT_TYPES = [
  { value: 'ACADEMIC', label: 'Desempenho Acadêmico', color: 'bg-blue-500' },
  { value: 'ATTENDANCE', label: 'Frequência', color: 'bg-green-500' },
  { value: 'BEHAVIOR', label: 'Comportamento', color: 'bg-purple-500' },
  { value: 'SOCIAL', label: 'Social', color: 'bg-pink-500' },
  { value: 'SPECIAL', label: 'Especial', color: 'bg-indigo-500' },
] as const satisfies ReadonlyArray<{
  value: AchievementCategory
  label: string
  color: string
}>

function getTypeBadge(type: string) {
  const typeInfo = ACHIEVEMENT_TYPES.find((t) => t.value === type)
  return (
    <Badge variant="secondary" className="gap-1">
      <span className={`h-2 w-2 rounded-full ${typeInfo?.color || 'bg-gray-500'}`} />
      {typeInfo?.label || type}
    </Badge>
  )
}

interface AchievementFormData {
  name: string
  description: string
  type: AchievementCategory
  pointsReward: number
  iconUrl: string
  badgeColor: string
  isActive: boolean
  isRepeatable: boolean
}

const defaultFormData: AchievementFormData = {
  name: '',
  description: '',
  type: 'ACADEMIC',
  pointsReward: 100,
  iconUrl: '',
  badgeColor: '#3B82F6',
  isActive: true,
  isRepeatable: false,
}

export function AchievementsTable() {
  const user = useAuthUser()
  const schoolId = user?.schoolId

  const queryClient = useQueryClient()
  const { data: achievements, isLoading } = useQuery(
    api.api.v1.achievements.index.queryOptions({ query: { schoolId: schoolId || undefined } })
  )
  const createAchievement = useMutation(api.api.v1.achievements.store.mutationOptions())
  const updateAchievement = useMutation(api.api.v1.achievements.update.mutationOptions())
  const deleteAchievement = useMutation(api.api.v1.achievements.destroy.mutationOptions())

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<AchievementFormData>(defaultFormData)

  const handleChange = (field: keyof AchievementFormData, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCreate = async () => {
    await createAchievement.mutateAsync({
      body: {
        name: formData.name,
        description: formData.description,
        category: formData.type,
        points: formData.pointsReward,
        schoolId: schoolId || undefined,
        icon: formData.iconUrl || undefined,
        isActive: formData.isActive,
        criteria: {},
      },
    })
    queryClient.invalidateQueries({ queryKey: ['achievements'] })
    setIsCreateOpen(false)
    setFormData(defaultFormData)
  }

  const handleEdit = (achievement: Achievement) => {
    setEditingId(achievement.id)
    setFormData({
      name: achievement.name,
      description: achievement.description,
      type: achievement.category,
      pointsReward: achievement.points,
      iconUrl: achievement.icon || '',
      badgeColor: '#3B82F6',
      isActive: achievement.isActive,
      isRepeatable: achievement.recurrencePeriod !== 'ONCE',
    })
  }

  const handleUpdate = async () => {
    if (!editingId) return
    await updateAchievement.mutateAsync({
      params: { id: editingId },
      body: {
        name: formData.name,
        description: formData.description,
        category: formData.type,
        points: formData.pointsReward,
        icon: formData.iconUrl || undefined,
        isActive: formData.isActive,
      },
    })
    queryClient.invalidateQueries({ queryKey: ['achievements'] })
    setEditingId(null)
    setFormData(defaultFormData)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta conquista?')) return
    await deleteAchievement.mutateAsync({ params: { id } })
    queryClient.invalidateQueries({ queryKey: ['achievements'] })
  }

  const achievementsList = achievements?.data ?? []

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Conquistas
          </CardTitle>
          <CardDescription>Gerencie as conquistas disponíveis para os alunos</CardDescription>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Conquista
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Conquista</DialogTitle>
              <DialogDescription>Crie uma nova conquista para os alunos</DialogDescription>
            </DialogHeader>
            <AchievementForm formData={formData} onChange={handleChange} />
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreate} disabled={createAchievement.isPending}>
                {createAchievement.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Criar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-10 text-center text-muted-foreground">
            <Loader2 className="mx-auto h-8 w-8 animate-spin" />
            <p className="mt-2">Carregando conquistas...</p>
          </div>
        ) : achievementsList.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground">
            <Award className="mx-auto h-12 w-12 opacity-50" />
            <p className="mt-2">Nenhuma conquista cadastrada</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-center">Pontos</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Repetível</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {achievementsList.map((achievement) => (
                <TableRow key={achievement.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {achievement.icon ? (
                        <img
                          src={achievement.icon}
                          alt=""
                          className="h-8 w-8 rounded object-cover"
                        />
                      ) : (
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded"
                          style={{ backgroundColor: '#3B82F6' }}
                        >
                          <Star className="h-4 w-4 text-white" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{achievement.name}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {achievement.description}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getTypeBadge(achievement.category)}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">{achievement.points} pts</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={achievement.isActive ? 'default' : 'secondary'}>
                      {achievement.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {achievement.recurrencePeriod !== 'ONCE' ? (
                      <Badge variant="outline">Sim</Badge>
                    ) : (
                      <span className="text-muted-foreground">Não</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Dialog
                        open={editingId === achievement.id}
                        onOpenChange={(open) => {
                          if (!open) {
                            setEditingId(null)
                            setFormData(defaultFormData)
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(achievement)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Editar Conquista</DialogTitle>
                          </DialogHeader>
                          <AchievementForm formData={formData} onChange={handleChange} />
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
                            <Button onClick={handleUpdate} disabled={updateAchievement.isPending}>
                              {updateAchievement.isPending && (
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
                        onClick={() => handleDelete(achievement.id)}
                        disabled={deleteAchievement.isPending}
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
    </Card>
  )
}

function AchievementForm({
  formData,
  onChange,
}: {
  formData: AchievementFormData
  onChange: (field: keyof AchievementFormData, value: string | number | boolean) => void
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
          <Label htmlFor="type">Tipo</Label>
          <Select value={formData.type} onValueChange={(value) => onChange('type', value)}>
            <SelectTrigger id="type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ACHIEVEMENT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="pointsReward">Pontos</Label>
          <Input
            id="pointsReward"
            type="number"
            min={0}
            value={formData.pointsReward}
            onChange={(e) => onChange('pointsReward', parseInt(e.target.value))}
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="iconUrl">URL do Ícone</Label>
          <Input
            id="iconUrl"
            type="url"
            value={formData.iconUrl}
            onChange={(e) => onChange('iconUrl', e.target.value)}
            placeholder="https://..."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="badgeColor">Cor do Badge</Label>
          <Input
            id="badgeColor"
            type="color"
            value={formData.badgeColor}
            onChange={(e) => onChange('badgeColor', e.target.value)}
            className="h-10"
          />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Switch
            id="isActive"
            checked={formData.isActive}
            onCheckedChange={(checked) => onChange('isActive', checked)}
          />
          <Label htmlFor="isActive">Ativo</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="isRepeatable"
            checked={formData.isRepeatable}
            onCheckedChange={(checked) => onChange('isRepeatable', checked)}
          />
          <Label htmlFor="isRepeatable">Repetível</Label>
        </div>
      </div>
    </div>
  )
}
