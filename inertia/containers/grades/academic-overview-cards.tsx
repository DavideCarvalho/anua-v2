import { useSuspenseQuery } from '@tanstack/react-query'
import {
  Users,
  FileText,
  CheckCircle,
  TrendingUp,
  AlertTriangle,
  BookOpen,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'

import { useAcademicOverviewQueryOptions } from '../../hooks/queries/use_academic_overview'

interface AcademicOverviewCardsProps {
  schoolId?: string
}

export function AcademicOverviewCards({ schoolId }: AcademicOverviewCardsProps) {
  const { data } = useSuspenseQuery(useAcademicOverviewQueryOptions({ schoolId }))

  const cards = [
    {
      title: 'Total de Alunos',
      value: data.totalStudents,
      icon: Users,
      description: 'Alunos matriculados',
      color: 'text-blue-600',
    },
    {
      title: 'Atividades',
      value: data.totalAssignments,
      icon: FileText,
      description: `${data.gradedAssignments} avaliadas`,
      color: 'text-green-600',
    },
    {
      title: 'Taxa de Conclusao',
      value: `${data.completionRate}%`,
      icon: CheckCircle,
      description: `${data.totalSubmissions} entregas`,
      color: 'text-purple-600',
    },
    {
      title: 'Media Geral',
      value: data.averageGrade.toFixed(1),
      icon: TrendingUp,
      description: 'Media das notas',
      color: 'text-emerald-600',
    },
    {
      title: 'Alunos em Risco',
      value: data.atRiskStudents,
      icon: AlertTriangle,
      description: `${data.atRiskPercentage}% do total`,
      color: 'text-red-600',
    },
    {
      title: 'Materias',
      value: data.totalSubjects,
      icon: BookOpen,
      description: 'Materias cadastradas',
      color: 'text-orange-600',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function AcademicOverviewCardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="h-4 w-4 animate-pulse rounded bg-muted" />
          </CardHeader>
          <CardContent>
            <div className="h-8 w-16 animate-pulse rounded bg-muted" />
            <div className="mt-1 h-3 w-20 animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
