import { EscolaLayout } from '../../../../../../components/layouts/escola-layout'

interface Props {
  academicPeriodSlug: string
  courseSlug: string
}

export default function CursoVisaoGeralPage({ academicPeriodSlug, courseSlug }: Props) {
  return (
    <EscolaLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Visão Geral do Curso</h1>
          <p className="text-muted-foreground">
            Período: {academicPeriodSlug} | Curso: {courseSlug}
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <p className="text-muted-foreground">
            Conteúdo da visão geral do curso será implementado aqui.
          </p>
        </div>
      </div>
    </EscolaLayout>
  )
}
