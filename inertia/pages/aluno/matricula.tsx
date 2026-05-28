import { Head } from '@inertiajs/react'
import { AlunoLayout } from '../../components/layouts/aluno-layout'
import { MatriculaAxesContainer } from '../../containers/responsavel/matricula-axes-container'

interface AlunoMatriculaPageProps {
  matriculaId: string | null
}

export default function AlunoMatriculaPage({ matriculaId }: AlunoMatriculaPageProps) {
  return (
    <AlunoLayout>
      <Head title="Minha Matrícula" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Minha Matrícula</h1>
          <p className="text-muted-foreground">Acompanhe seus eixos e situação de matrícula</p>
        </div>
        {matriculaId ? (
          <MatriculaAxesContainer matriculaId={matriculaId} />
        ) : (
          <p className="text-muted-foreground">Nenhuma matrícula ativa encontrada.</p>
        )}
      </div>
    </AlunoLayout>
  )
}
