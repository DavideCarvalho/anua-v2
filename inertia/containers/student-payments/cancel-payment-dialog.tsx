import { useState } from 'react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog'
import { Button } from '~/components/ui/button'
import { Textarea } from '~/components/ui/textarea'
import { Label } from '~/components/ui/label'
import { useCancelStudentPayment } from '~/hooks/mutations/use_student_payment_mutations'

interface CancelPaymentDialogProps {
  payment: {
    id: string
    amount: number
    student?: { user?: { name?: string }; name?: string }
    month: number
    year: number
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CancelPaymentDialog({ payment, open, onOpenChange }: CancelPaymentDialogProps) {
  const [reason, setReason] = useState('')
  const cancelPayment = useCancelStudentPayment()

  const studentName =
    payment.student?.user?.name || payment.student?.name || 'Aluno'

  async function handleCancel() {
    try {
      await cancelPayment.mutateAsync({ id: payment.id, reason })
      toast.success('Pagamento cancelado')
      setReason('')
      onOpenChange(false)
    } catch {
      toast.error('Erro ao cancelar pagamento')
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancelar Pagamento</AlertDialogTitle>
          <AlertDialogDescription>
            Essa ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="text-sm space-y-1">
          <p>Aluno: <span className="font-medium">{studentName}</span></p>
          <p>Referência: <span className="font-medium">{payment.month}/{payment.year}</span></p>
          <p>Valor: <span className="font-medium">R$ {Number(payment.amount).toFixed(2)}</span></p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cancel-reason">Motivo do cancelamento *</Label>
          <Textarea
            id="cancel-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Informe o motivo do cancelamento (mínimo 10 caracteres)"
            rows={3}
          />
          {reason.length > 0 && reason.length < 10 && (
            <p className="text-sm text-destructive">Mínimo 10 caracteres</p>
          )}
        </div>

        <AlertDialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Voltar
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={reason.length < 10 || cancelPayment.isPending}
          >
            {cancelPayment.isPending ? 'Cancelando...' : 'Cancelar Pagamento'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
