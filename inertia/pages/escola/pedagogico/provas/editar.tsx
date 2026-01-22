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
import type { ExamData } from '../../../../hooks/queries/use-exam'
import { useExamQueryOptions } from '../../../../hooks/queries/use-exam'

interface Props {
  examId: string
}

export default function EditarProvaPage({ examId }: Props) {
  const { data, isLoading } = useQuery(useExamQueryOptions({ id: examId }))

  const exam = data as ExamData | undefined

  type ExamDetails = ExamData & {
    title?: string
  }
  const examDetails = exam as ExamDetails | undefined

  return (
    <EscolaLayout>
      <Head title="Editar Prova" />

      <Card>
        <CardHeader>
          <CardTitle>Editar Prova</CardTitle>
          <CardDescription>Atualize as informacoes da prova</CardDescription>
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
