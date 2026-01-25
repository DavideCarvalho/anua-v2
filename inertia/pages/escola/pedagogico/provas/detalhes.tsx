import { Head } from '@inertiajs/react'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { EscolaLayout } from '../../../../components/layouts'
import { Badge } from '../../../../components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../../components/ui/card'
import type { ExamData } from '../../../../hooks/queries/use_exam'
import { useExamQueryOptions } from '../../../../hooks/queries/use_exam'

interface Props {
  examId: string
}

export default function ProvaDetalhesPage({ examId }: Props) {
  const { data, isLoading } = useQuery(useExamQueryOptions({ id: examId }))

  const exam = data as ExamData | undefined

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'SCHEDULED':
        return (
          <Badge variant="outline" className="bg-muted/60 text-muted-foreground">
            Agendada
          </Badge>
        )
      case 'IN_PROGRESS':
        return <Badge variant="default">Em andamento</Badge>
      case 'COMPLETED':
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
            Concluida
          </Badge>
        )
      case 'CANCELLED':
        return (
          <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200">
            Cancelada
          </Badge>
        )
      default:
        return <Badge variant="outline">Indefinido</Badge>
    }
  }

  type ExamDetails = ExamData & {
    examDate?: string
    scheduledDate?: string
    title?: string
    description?: string | null
    maxScore?: number
    status?: string
    class?: { name?: string }
    subject?: { name?: string }
  }

  const examDetails = exam as ExamDetails | undefined
  const examDate = examDetails?.examDate || examDetails?.scheduledDate
  const formattedDate = examDate ? format(new Date(examDate), 'dd/MM/yyyy', { locale: ptBR }) : '-'

  return (
    <EscolaLayout>
      <Head title="Detalhes da Prova" />

      <Card>
        <CardHeader>
          <CardTitle>Detalhes da Prova</CardTitle>
          <CardDescription>Visualize as informacoes da prova selecionada</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && <p className="text-sm text-muted-foreground">Carregando prova...</p>}
          {!isLoading && !exam && (
            <p className="text-sm text-muted-foreground">Nao foi possivel carregar a prova.</p>
          )}
          {!isLoading && exam && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Titulo</p>
                <p className="text-base font-semibold">{examDetails?.title || '-'}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Turma</p>
                  <p className="text-sm">{examDetails?.class?.name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Materia</p>
                  <p className="text-sm">{examDetails?.subject?.name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data</p>
                  <p className="text-sm">{formattedDate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pontuacao maxima</p>
                  <p className="text-sm">{examDetails?.maxScore ?? '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="mt-1">{getStatusBadge(examDetails?.status)}</div>
                </div>
              </div>
              {examDetails?.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Descricao</p>
                  <p className="text-sm">{examDetails.description}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </EscolaLayout>
  )
}
