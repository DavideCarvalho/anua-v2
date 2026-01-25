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
import { usePrintRequestQueryOptions } from '../../hooks/queries/use_print_request'
import { useApprovePrintRequestMutation } from '../../hooks/mutations/use_approve_print_request'

export function CheckPrintRequestModal({
  printRequestId,
  open,
  onClose,
  onReject,
}: {
  printRequestId: string
  open: boolean
  onClose: () => void
  onReject: () => void
}) {
  const approve = useApprovePrintRequestMutation()

  const { data } = useSuspenseQuery(usePrintRequestQueryOptions({ id: printRequestId }))

  async function handleApprove() {
    const promise = approve.mutateAsync({ id: printRequestId } as any).then(() => {
      toast.success('Solicitação aprovada com sucesso!')
      onClose()
    })

    toast.promise(promise, {
      loading: 'Aprovando solicitação...',
      error: 'Erro ao aprovar solicitação',
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Solicitação de impressão</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4 text-sm">
          <div>
            <p className="text-muted-foreground">Nome do arquivo</p>
            <p className="font-medium">{data?.name}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Link do arquivo</p>
            <a
              href={data?.path}
              target="_blank"
              rel="noreferrer"
              className="text-primary underline"
            >
              {data?.path}
            </a>
          </div>
          <div>
            <p className="text-muted-foreground">Para quando?</p>
            <p>{data?.dueDate ? String(data.dueDate).slice(0, 10) : '-'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Quantidade</p>
            <p>{data?.quantity}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Imprimir</p>
            <p>{data?.frontAndBack ? 'Frente e verso' : 'Apenas frente'}</p>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Fechar
          </Button>
          <Button type="button" variant="destructive" onClick={onReject}>
            Rejeitar
          </Button>
          <Button type="button" onClick={handleApprove} disabled={approve.isPending}>
            Aprovar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
