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
import type { AssignmentData } from '../../../../hooks/queries/use_assignment'
import { useAssignmentQueryOptions } from '../../../../hooks/queries/use_assignment'

interface Props {
  assignmentId: string
}

export default function AtividadeDetalhesPage({ assignmentId }: Props) {
  const { data, isLoading } = useQuery(useAssignmentQueryOptions({ id: assignmentId }))

  const assignment = data as AssignmentData | undefined

  type AssignmentDetails = AssignmentData & {
    title?: string
    name?: string
    maxScore?: number
    grade?: number
    dueDate?: string
    status?: string
    description?: string | null
    class?: { name?: string }
    subject?: { name?: string }
    teacherHasClass?: {
      class?: { name?: string }
      subject?: { name?: string }
    }
  }

  const assignmentDetails = assignment as AssignmentDetails | undefined

  const status = assignmentDetails?.status
  const getStatusBadge = (value?: string) => {
    switch (value) {
      case 'PUBLISHED':
        return <Badge variant="default">Publicada</Badge>
      case 'DRAFT':
        return (
          <Badge variant="outline" className="bg-muted/60 text-muted-foreground">
            Rascunho
          </Badge>
        )
      case 'ARCHIVED':
        return (
          <Badge variant="outline" className="bg-muted/60 text-muted-foreground">
            Arquivada
          </Badge>
        )
      default:
        return <Badge variant="outline">Indefinido</Badge>
    }
  }

  const dueDate = assignmentDetails?.dueDate
  const formattedDate = dueDate ? format(new Date(dueDate), 'dd/MM/yyyy', { locale: ptBR }) : '-'
  const title = assignmentDetails?.title ?? assignmentDetails?.name
  const maxScore = assignmentDetails?.maxScore ?? assignmentDetails?.grade
  const className =
    assignmentDetails?.class?.name ?? assignmentDetails?.teacherHasClass?.class?.name
  const subjectName =
    assignmentDetails?.subject?.name ?? assignmentDetails?.teacherHasClass?.subject?.name

  return (
    <EscolaLayout>
      <Head title="Detalhes da Atividade" />

      <Card>
        <CardHeader>
          <CardTitle>Detalhes da Atividade</CardTitle>
          <CardDescription>Visualize as informações da atividade</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && <p className="text-sm text-muted-foreground">Carregando atividade...</p>}
          {!isLoading && !assignment && (
            <p className="text-sm text-muted-foreground">Não foi possível carregar a atividade.</p>
          )}
          {!isLoading && assignment && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Titulo</p>
                <p className="text-base font-semibold">{title || '-'}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Turma</p>
                  <p className="text-sm">{className || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Materia</p>
                  <p className="text-sm">{subjectName || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Prazo</p>
                  <p className="text-sm">{formattedDate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pontuacao maxima</p>
                  <p className="text-sm">{maxScore ?? '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="mt-1">{getStatusBadge(status)}</div>
                </div>
              </div>
              {assignmentDetails?.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Descricao</p>
                  <p className="text-sm">{assignmentDetails.description}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </EscolaLayout>
  )
}
