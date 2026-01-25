import { Head } from '@inertiajs/react'
import { useState } from 'react'

import { EscolaLayout } from '../../../components/layouts'
import { Button } from '../../../components/ui/button'

import { PrintRequestTable } from '../../../containers/print-requests/print-request-table'
import { NewPrintRequestModal } from '../../../containers/print-requests/new-print-request-modal'
import { CheckPrintRequestModal } from '../../../containers/print-requests/check-print-request-modal'
import { RejectPrintRequestModal } from '../../../containers/print-requests/reject-print-request-modal'
import { ReviewPrintRequestModal } from '../../../containers/print-requests/review-print-request-modal'
import { useMarkPrintRequestPrintedMutation } from '../../../hooks/mutations/use_mark_print_request_printed'
import { toast } from 'sonner'

export default function ImpressaoPage() {
  const [newModalOpen, setNewModalOpen] = useState(false)
  const [checkModalId, setCheckModalId] = useState<string | null>(null)
  const [reviewModalId, setReviewModalId] = useState<string | null>(null)
  const [rejectModalId, setRejectModalId] = useState<string | null>(null)

  const markPrinted = useMarkPrintRequestPrintedMutation()

  return (
    <EscolaLayout>
      <Head title="Impressão" />

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Impressão</h1>
          <Button onClick={() => setNewModalOpen(true)}>Nova solicitação</Button>
        </div>

        <PrintRequestTable
          onView={(id) => setCheckModalId(id)}
          onReview={(id) => setReviewModalId(id)}
          onMarkPrinted={(id) => {
            toast.promise(markPrinted.mutateAsync({ id } as any), {
              loading: 'Atualizando status...',
              error: 'Erro ao marcar como impresso',
              success: 'Solicitação marcada como impressa!',
            })
          }}
        />

        <NewPrintRequestModal
          open={newModalOpen}
          onCancel={() => setNewModalOpen(false)}
          onSubmit={() => setNewModalOpen(false)}
        />

        {checkModalId && (
          <CheckPrintRequestModal
            printRequestId={checkModalId}
            open={true}
            onClose={() => setCheckModalId(null)}
            onReject={() => {
              setRejectModalId(checkModalId)
              setCheckModalId(null)
            }}
          />
        )}

        {rejectModalId && (
          <RejectPrintRequestModal
            printRequestId={rejectModalId}
            open={true}
            onClose={() => setRejectModalId(null)}
          />
        )}

        {reviewModalId && (
          <ReviewPrintRequestModal
            printRequestId={reviewModalId}
            open={true}
            onClose={() => setReviewModalId(null)}
          />
        )}
      </div>
    </EscolaLayout>
  )
}
