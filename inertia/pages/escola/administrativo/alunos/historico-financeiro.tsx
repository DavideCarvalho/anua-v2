import { Head } from '@inertiajs/react'
import { EscolaLayout } from '~/components/layouts'
import { StudentAuditHistoryContainer } from '~/containers/student-audit-history-container'

export default function HistoricoFinanceiroPage({ studentId }: { studentId: string }) {
  return (
    <EscolaLayout>
      <Head title="Historico Financeiro" />
      <StudentAuditHistoryContainer studentId={studentId} />
    </EscolaLayout>
  )
}
