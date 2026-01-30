import { useSuspenseQuery } from '@tanstack/react-query'
import { toast } from 'sonner'

import { Button } from '../../components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog'
import { Label } from '../../components/ui/label'

import { usePurchaseRequestQueryOptions } from '../../hooks/queries/use_purchase_request'
import { useApprovePurchaseRequestMutation } from '../../hooks/mutations/use_approve_purchase_request'
import { brazilianRealFormatter, brazilianDateFormatter } from '../../lib/formatters'

interface ApprovePurchaseRequestModalProps {
  purchaseRequestId: string
  open: boolean
  onClose: () => void
}

export function ApprovePurchaseRequestModal({
  purchaseRequestId,
  open,
  onClose,
}: ApprovePurchaseRequestModalProps) {
  const { data: purchaseRequest } = useSuspenseQuery(
    usePurchaseRequestQueryOptions({ id: purchaseRequestId })
  )

  const approveMutation = useApprovePurchaseRequestMutation()

  async function handleApprove() {
    toast.promise(approveMutation.mutateAsync(purchaseRequestId), {
      loading: 'Aprovando solicitação...',
      success: () => {
        onClose()
        return 'Solicitação aprovada com sucesso!'
      },
      error: 'Erro ao aprovar solicitação',
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Aprovar solicitação de compra</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-1">
            <Label>Qual é o produto?</Label>
            <p>{purchaseRequest?.productName}</p>
          </div>

          <div className="space-y-1">
            <Label>Quantidade</Label>
            <p>{purchaseRequest?.quantity}</p>
          </div>

          <div className="space-y-1">
            <Label>Valor unitário</Label>
            <p>{brazilianRealFormatter(purchaseRequest?.unitValue ?? 0)}</p>
          </div>

          <div className="space-y-1">
            <Label>Valor total</Label>
            <p>{brazilianRealFormatter(purchaseRequest?.value ?? 0)}</p>
          </div>

          <div className="space-y-1">
            <Label>Para quando?</Label>
            <p>{purchaseRequest?.dueDate ? brazilianDateFormatter(String(purchaseRequest.dueDate)) : '-'}</p>
          </div>

          {purchaseRequest?.productUrl && (
            <div className="space-y-1">
              <Label>Link do produto</Label>
              <p className="truncate">
                <a
                  href={purchaseRequest.productUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {purchaseRequest.productUrl}
                </a>
              </p>
            </div>
          )}

          {purchaseRequest?.description && (
            <div className="space-y-1">
              <Label>Observação</Label>
              <p>{purchaseRequest.description}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleApprove} disabled={approveMutation.isPending}>
            Aprovar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
