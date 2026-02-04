import { Head } from '@inertiajs/react'
import { EscolaLayout } from '~/components/layouts'
import { EnrollmentPage } from '~/containers/enrollment/enrollment-page'

export default function NovaMatriculaPage() {
  return (
    <EscolaLayout>
      <Head title="Nova Matrícula" />
      <EnrollmentPage />
    </EscolaLayout>
  )
}
