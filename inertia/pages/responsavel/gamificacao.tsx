import { Head } from '@inertiajs/react'
import { Suspense } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Trophy, Star, Medal, Target } from 'lucide-react'

import { ResponsavelLayout } from '../../components/layouts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'

import { useResponsavelStatsQueryOptions } from '../../hooks/queries/use_responsavel_stats'

function GamificacaoContent() {
  const { data } = useSuspenseQuery(useResponsavelStatsQueryOptions())

  if (data.students.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Trophy className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Nenhum aluno vinculado</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Voce nao possui alunos vinculados a sua conta.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Students Points */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.students.map((student) => (
          <Card key={student.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Medal className="h-5 w-5 text-yellow-500" />
                {student.name}
              </CardTitle>
              <CardDescription>{student.className} - {student.courseName}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <Star className="h-8 w-8 text-yellow-500 fill-yellow-500" />
                  <span className="text-4xl font-bold">{student.points}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">pontos acumulados</p>
              </div>
              <div className="mt-4 pt-4 border-t">
                <a
                  href={`/responsavel/gamificacao/${student.id}`}
                  className="text-sm text-primary hover:underline flex items-center justify-center gap-1"
                >
                  <Target className="h-4 w-4" />
                  Ver conquistas e detalhes
                </a>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Sobre a Gamificacao
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            O sistema de gamificacao incentiva os alunos a terem um bom desempenho
            academico e comportamental. Os pontos sao acumulados atraves de:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Entrega de atividades no prazo</li>
            <li>Boas notas em avaliacoes</li>
            <li>Frequencia regular</li>
            <li>Participacao em eventos da escola</li>
            <li>Bom comportamento em sala de aula</li>
          </ul>
          <p className="text-muted-foreground">
            Os pontos podem ser trocados por recompensas na loja da escola.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function GamificacaoSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 w-32 bg-muted animate-pulse rounded" />
              <div className="h-4 w-48 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-16 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default function GamificacaoPage() {
  return (
    <ResponsavelLayout>
      <Head title="Gamificacao" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Trophy className="h-6 w-6" />
            Gamificacao
          </h1>
          <p className="text-muted-foreground">
            Acompanhe os pontos e conquistas dos seus filhos
          </p>
        </div>

        <Suspense fallback={<GamificacaoSkeleton />}>
          <GamificacaoContent />
        </Suspense>
      </div>
    </ResponsavelLayout>
  )
}
