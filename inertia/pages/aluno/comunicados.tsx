import { Head } from '@inertiajs/react'
import { AlunoLayout } from '../../components/layouts/aluno-layout'
import { ComunicadosContent } from '../../containers/responsavel/comunicados-content'

export default function AlunoComunicadosPage() {
  return (
    <AlunoLayout>
      <Head title="Comunicados" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Comunicados</h1>
          <p className="text-muted-foreground">Suas notificações e avisos da escola</p>
        </div>
        <ComunicadosContent />
      </div>
    </AlunoLayout>
  )
}
