import { useSuspenseQuery } from '@tanstack/react-query'
import { Trophy, Plus, MoreHorizontal, Users, Target, Calendar } from 'lucide-react'

import { useLeaderboardsQueryOptions } from '../../hooks/queries/use_leaderboards'
import { useDeleteLeaderboard } from '../../hooks/mutations/use_leaderboard_mutations'

import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Switch } from '../../components/ui/switch'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu'

interface LeaderboardsManagementProps {
  schoolId: string
  onCreateLeaderboard?: () => void
  onViewEntries?: (leaderboardId: string) => void
}

const metricTypeLabels: Record<string, string> = {
  POINTS: 'Pontos',
  AVERAGE_GRADE: 'Média de Notas',
  ATTENDANCE_PERCENTAGE: 'Frequência',
  ASSIGNMENTS_COMPLETED: 'Atividades',
  EXAMS_AVERAGE: 'Média de Provas',
  STREAK_DAYS: 'Dias Seguidos',
  BEHAVIOR_SCORE: 'Comportamento',
}

const periodTypeLabels: Record<string, string> = {
  DAILY: 'Diário',
  WEEKLY: 'Semanal',
  MONTHLY: 'Mensal',
  ACADEMIC_PERIOD: 'Período Letivo',
  ALL_TIME: 'Geral',
}

export function LeaderboardsManagement({
  schoolId,
  onCreateLeaderboard,
  onViewEntries,
}: LeaderboardsManagementProps) {
  const { data } = useSuspenseQuery(useLeaderboardsQueryOptions({ schoolId }))
  const deleteMutation = useDeleteLeaderboard()

  const leaderboards = Array.isArray(data) ? data : (data as any)?.data || []

  if (leaderboards.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Trophy className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Nenhum ranking cadastrado</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Crie rankings para motivar os alunos e acompanhar desempenho
          </p>
          {onCreateLeaderboard && (
            <Button className="mt-4" onClick={onCreateLeaderboard}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Ranking
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Rankings</CardTitle>
          <CardDescription>{leaderboards.length} ranking(s) cadastrado(s)</CardDescription>
        </div>
        {onCreateLeaderboard && (
          <Button onClick={onCreateLeaderboard}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Ranking
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {leaderboards.map((lb: any) => (
            <Card key={lb.id} className="relative">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                      <Trophy className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{lb.name}</CardTitle>
                      {lb.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {lb.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewEntries?.(lb.id)}>
                        Ver Classificação
                      </DropdownMenuItem>
                      <DropdownMenuItem>Editar</DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => deleteMutation.mutate(lb.id)}
                      >
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="gap-1">
                    <Target className="h-3 w-3" />
                    {metricTypeLabels[lb.metricType] || lb.metricType}
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Calendar className="h-3 w-3" />
                    {periodTypeLabels[lb.periodType] || lb.periodType}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {lb.entries?.length || 0} participantes
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Ativo</span>
                    <Switch checked={lb.isActive} disabled />
                  </div>
                </div>

                {lb.class && (
                  <p className="text-xs text-muted-foreground">
                    Turma: {lb.class.name}
                  </p>
                )}
                {lb.subject && (
                  <p className="text-xs text-muted-foreground">
                    Matéria: {lb.subject.name}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
