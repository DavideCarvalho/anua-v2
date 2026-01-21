import { useQuery } from '@tanstack/react-query'
import { Trophy, Star, Award, ShoppingBag, Users } from 'lucide-react'
import { useSearchParams } from '../../../hooks/use-search-params'
import { useGamificationOverviewQueryOptions } from '../../../hooks/queries/use-gamification-overview'
import { StatCard } from '../shared/stat-card'
import { OverviewCardsSkeleton } from '../shared/overview-cards-skeleton'
import { ChartContainer } from '../shared/chart-container'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table'
import { Badge } from '../../../components/ui/badge'

export function GamificationOverviewCards() {
  const { params } = useSearchParams()
  const { data, isLoading, error } = useQuery(
    useGamificationOverviewQueryOptions({
      schoolId: params.schoolId,
      schoolChainId: params.schoolChainId,
    })
  )

  if (isLoading) {
    return <OverviewCardsSkeleton count={5} />
  }

  if (error || !data) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-sm text-destructive">
        Erro ao carregar dados de gamificação
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <StatCard
        title="Total de Pontos"
        value={data.totalPoints.toLocaleString('pt-BR')}
        icon={Star}
      />
      <StatCard
        title="Média por Aluno"
        value={data.avgPoints.toLocaleString('pt-BR')}
        icon={Trophy}
      />
      <StatCard
        title="Conquistas Desbloqueadas"
        value={data.achievementsEarned.toLocaleString('pt-BR')}
        description={`de ${data.totalAchievements} possíveis`}
        icon={Award}
      />
      <StatCard
        title="Pedidos na Loja"
        value={data.totalOrders.toLocaleString('pt-BR')}
        description={`${data.pointsSpent} pontos gastos`}
        icon={ShoppingBag}
      />
      <StatCard
        title="Alunos Participando"
        value={data.studentsWithPoints.toLocaleString('pt-BR')}
        icon={Users}
      />
    </div>
  )
}

export function TopStudentsTable() {
  const { params } = useSearchParams()
  const { data, isLoading, error } = useQuery(
    useGamificationOverviewQueryOptions({
      schoolId: params.schoolId,
      schoolChainId: params.schoolChainId,
    })
  )

  return (
    <ChartContainer
      title="Top 10 Alunos"
      description="Ranking por pontuação"
      isLoading={isLoading}
      error={error}
    >
      {data && data.topStudents && data.topStudents.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Aluno</TableHead>
              <TableHead>Escola</TableHead>
              <TableHead className="text-right">Nível</TableHead>
              <TableHead className="text-right">Pontos</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.topStudents.map((student: any, index: number) => (
              <TableRow key={student.id}>
                <TableCell className="font-bold">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                </TableCell>
                <TableCell className="font-medium">{student.name}</TableCell>
                <TableCell>{student.schoolName}</TableCell>
                <TableCell className="text-right">
                  <Badge variant="secondary">Nível {student.level}</Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {student.points.toLocaleString('pt-BR')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
          Nenhum dado de ranking disponível
        </div>
      )}
    </ChartContainer>
  )
}
