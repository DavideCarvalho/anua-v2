import { Head } from '@inertiajs/react'

import { AdminLayout } from '../../../components/layouts'
import { SchoolDetails } from '../../../containers/schools/school-details'

interface Props {
  schoolId: string
}

export default function SchoolDetailsPage({ schoolId }: Props) {
  return (
    <AdminLayout>
      <Head title="Detalhes da Escola - Admin" />
      <SchoolDetails schoolId={schoolId} />
    </AdminLayout>
  )
}
