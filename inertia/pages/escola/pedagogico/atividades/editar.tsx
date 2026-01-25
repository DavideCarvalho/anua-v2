import { Head } from '@inertiajs/react'
import { useQuery } from '@tanstack/react-query'

import { EscolaLayout } from '../../../../components/layouts'
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

export default function EditarAtividadePage({ assignmentId }: Props) {
  const { data, isLoading } = useQuery(useAssignmentQueryOptions({ id: assignmentId }))

  const assignment = data as AssignmentData | undefined

  type AssignmentDetails = AssignmentData & {
    title?: string
    name?: string
  }
  const assignmentDetails = assignment as AssignmentDetails | undefined

  const title = assignmentDetails?.title ?? assignmentDetails?.name

  return (
    <EscolaLayout>
      <Head title="Editar Atividade" />

      <Card>
        <CardHeader>
          <CardTitle>Editar Atividade</CardTitle>
          <CardDescription>Atualize as informacoes da atividade</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && <p className="text-sm text-muted-foreground">Carregando atividade...</p>}
          {!isLoading && !assignment && (
            <p className="text-sm text-muted-foreground">Nao foi possivel carregar a atividade.</p>
          )}
          {!isLoading && assignment && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Titulo</p>
                <p className="text-base font-semibold">{title || '-'}</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Formulario de edicao sera implementado aqui.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </EscolaLayout>
  )
}
