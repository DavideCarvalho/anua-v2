import { EscolaLayout } from '../../../../../../../../components/layouts/escola-layout'
import { TurmaLayout } from '../../../../../../../../components/layouts/turma-layout'

interface Props {
  academicPeriodSlug: string
  courseSlug: string
  classSlug: string
}

export default function TurmaAtividadesPage({
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
          <h2 className="text-lg font-semibold mb-4">Atividades</h2>
          <p className="text-muted-foreground">
            Lista de atividades da turma será implementada aqui.
          </p>
        </div>
      </TurmaLayout>
    </EscolaLayout>
  )
}
