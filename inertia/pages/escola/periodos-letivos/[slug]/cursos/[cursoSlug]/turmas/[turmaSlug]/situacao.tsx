import { EscolaLayout } from '../../../../../../../../components/layouts/escola-layout'
import { TurmaLayout } from '../../../../../../../../components/layouts/turma-layout'

interface Props {
  academicPeriodSlug: string
  courseSlug: string
  classSlug: string
}

export default function TurmaSituacaoPage({
  academicPeriodSlug,
  courseSlug,
  classSlug,
}: Props) {
  // TODO: Fetch turma and course names from API
  const turmaName = classSlug
  const courseName = courseSlug

  return (
    <EscolaLayout>
      <TurmaLayout
        turmaName={turmaName}
        courseName={courseName}
        academicPeriodSlug={academicPeriodSlug}
        courseSlug={courseSlug}
        classSlug={classSlug}
      >
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">Situação</h2>
          <p className="text-muted-foreground">
            Situação geral dos alunos da turma será exibida aqui.
          </p>
        </div>
      </TurmaLayout>
    </EscolaLayout>
  )
}
