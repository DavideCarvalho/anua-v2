import { Head, usePage } from '@inertiajs/react'
import { Suspense, useState } from 'react'

import { EscolaLayout } from '../../../components/layouts'
import { Button } from '../../../components/ui/button'

import { PurchaseRequestsTable } from '../../../containers/purchase-requests/purchase-requests-table'
import { NewPurchaseRequestModal } from '../../../containers/purchase-requests/new-purchase-request-modal'
import { ApprovePurchaseRequestModal } from '../../../containers/purchase-requests/approve-purchase-request-modal'
import { RejectPurchaseRequestModal } from '../../../containers/purchase-requests/reject-purchase-request-modal'
import { BoughtPurchaseRequestModal } from '../../../containers/purchase-requests/bought-purchase-request-modal'
import { ArrivedPurchaseRequestModal } from '../../../containers/purchase-requests/arrived-purchase-request-modal'

interface PageProps {
  schoolId: string
  [key: string]: any
}

export default function SolicitacoesDeCompraPage() {
  const { schoolId } = usePage<PageProps>().props

  const [newModalOpen, setNewModalOpen] = useState(false)
  const [editModalId, setEditModalId] = useState<string | null>(null)
  const [approveModalId, setApproveModalId] = useState<string | null>(null)
  const [rejectModalId, setRejectModalId] = useState<string | null>(null)
  const [boughtModalId, setBoughtModalId] = useState<string | null>(null)
  const [arrivedModalId, setArrivedModalId] = useState<string | null>(null)

  return (
    <EscolaLayout>
      <Head title="Solicitações de Compra" />

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Solicitações de Compra</h1>
          <Button onClick={() => setNewModalOpen(true)}>Nova solicitação</Button>
        </div>

        <Suspense fallback={<div>Carregando...</div>}>
          <PurchaseRequestsTable
            schoolId={schoolId}
            onEdit={(id) => setEditModalId(id)}
            onApprove={(id) => setApproveModalId(id)}
            onReject={(id) => setRejectModalId(id)}
            onMarkBought={(id) => setBoughtModalId(id)}
            onMarkArrived={(id) => setArrivedModalId(id)}
          />
        </Suspense>

        <NewPurchaseRequestModal
          schoolId={schoolId}
          open={newModalOpen}
          onCancel={() => setNewModalOpen(false)}
          onSubmit={() => setNewModalOpen(false)}
        />

        {/* TODO: Implementar modal de edição similar ao new */}

        {approveModalId && (
          <Suspense fallback={null}>
            <ApprovePurchaseRequestModal
              purchaseRequestId={approveModalId}
              open={true}
              onClose={() => setApproveModalId(null)}
            />
          </Suspense>
        )}

        {rejectModalId && (
          <RejectPurchaseRequestModal
            purchaseRequestId={rejectModalId}
            open={true}
            onClose={() => setRejectModalId(null)}
          />
        )}

        {boughtModalId && (
          <Suspense fallback={null}>
            <BoughtPurchaseRequestModal
              purchaseRequestId={boughtModalId}
              open={true}
              onClose={() => setBoughtModalId(null)}
            />
          </Suspense>
        )}

        {arrivedModalId && (
          <Suspense fallback={null}>
            <ArrivedPurchaseRequestModal
              purchaseRequestId={arrivedModalId}
              open={true}
              onClose={() => setArrivedModalId(null)}
            />
          </Suspense>
        )}
      </div>
    </EscolaLayout>
  )
}
