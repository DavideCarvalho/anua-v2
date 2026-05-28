import { Head } from '@inertiajs/react'
import { AlunoLayout } from '../../components/layouts/aluno-layout'
import { ComunicadosContent } from '../../containers/responsavel/comunicados-content'

export default function AlunoComunicadosPage() {
  return (
    <AlunoLayout>
      <Head title="Comunicados" />
      <ComunicadosContent />
    </AlunoLayout>
  )
}
