import { Head } from '@inertiajs/react'

import { AdminLayout } from '../../../components/layouts'
import { SchoolEditForm } from '../../../containers/schools/school-edit-form'

interface Props {
  schoolId: string
}

export default function EditSchoolPage({ schoolId }: Props) {
  return (
    <AdminLayout>
      <Head title="Editar Escola - Admin" />
      <SchoolEditForm schoolId={schoolId} />
    </AdminLayout>
  )
}
