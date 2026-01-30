import { useState } from 'react'
import { usePage } from '@inertiajs/react'
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
import { useAchievements } from '../../hooks/queries/use_achievements'
import {
  useCreateAchievement,
  useUpdateAchievement,
  useDeleteAchievement,
} from '../../hooks/mutations/use_achievement_mutations'
import type { SharedProps } from '../../lib/types'

const ACHIEVEMENT_TYPES = [
  { value: 'ACADEMIC_PERFORMANCE', label: 'Desempenho Acadêmico', color: 'bg-blue-500' },
  { value: 'ATTENDANCE', label: 'Frequência', color: 'bg-green-500' },
  { value: 'BEHAVIOR', label: 'Comportamento', color: 'bg-purple-500' },
  { value: 'PARTICIPATION', label: 'Participação', color: 'bg-yellow-500' },
  { value: 'STREAK', label: 'Sequência', color: 'bg-orange-500' },
  { value: 'SOCIAL', label: 'Social', color: 'bg-pink-500' },
  { value: 'SPECIAL', label: 'Especial', color: 'bg-indigo-500' },
]

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
  type: string
  pointsReward: number
  iconUrl: string
  badgeColor: string
  isActive: boolean
  isRepeatable: boolean
}

const defaultFormData: AchievementFormData = {
  name: '',
  description: '',
  type: 'ACADEMIC_PERFORMANCE',
  pointsReward: 100,
  iconUrl: '',
  badgeColor: '#3B82F6',
  isActive: true,
  isRepeatable: false,
}

export function AchievementsTable() {
  const { props } = usePage<SharedProps>()
  const schoolId = props.user?.schoolId

  const { data: achievements } = useAchievements({ schoolId: schoolId || undefined })
  const createAchievement = useCreateAchievement()
  const updateAchievement = useUpdateAchievement()
  const deleteAchievement = useDeleteAchievement()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<AchievementFormData>(defaultFormData)

  const handleChange = (field: keyof AchievementFormData, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCreate = async () => {
    await createAchievement.mutateAsync({
      name: formData.name,
      description: formData.description,
      category: formData.type as any,
      points: formData.pointsReward,
      schoolId: schoolId || undefined,
      icon: formData.iconUrl || undefined,
      isActive: formData.isActive,
      criteria: {},
    })
    setIsCreateOpen(false)
    setFormData(defaultFormData)
  }

  const handleEdit = (achievement: any) => {
    setEditingId(achievement.id)
    setFormData({
      name: achievement.name,
      description: achievement.description,
      type: achievement.type,
      pointsReward: achievement.pointsReward,
      iconUrl: achievement.iconUrl || '',
      badgeColor: achievement.badgeColor || '#3B82F6',
      isActive: achievement.isActive,
      isRepeatable: achievement.isRepeatable,
    })
  }

  const handleUpdate = async () => {
    if (!editingId) return
    await updateAchievement.mutateAsync({
      id: editingId,
      name: formData.name,
      description: formData.description,
      category: formData.type as any,
      points: formData.pointsReward,
      icon: formData.iconUrl || undefined,
      isActive: formData.isActive,
    })
    setEditingId(null)
    setFormData(defaultFormData)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta conquista?')) return
    await deleteAchievement.mutateAsync(id)
  }

  const achievementsList = achievements?.data || []

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
        {achievementsList.length === 0 ? (
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
              {achievementsList.map((achievement: any) => (
                <TableRow key={achievement.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {achievement.iconUrl ? (
                        <img
                          src={achievement.iconUrl}
                          alt=""
                          className="h-8 w-8 rounded object-cover"
                        />
                      ) : (
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded"
                          style={{ backgroundColor: achievement.badgeColor || '#3B82F6' }}
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
                  <TableCell>{getTypeBadge(achievement.type)}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">{achievement.pointsReward} pts</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={achievement.isActive ? 'default' : 'secondary'}>
                      {achievement.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {achievement.isRepeatable ? (
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
