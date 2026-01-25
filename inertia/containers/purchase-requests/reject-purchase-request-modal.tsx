import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

import { Button } from '../../components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../components/ui/form'
import { Textarea } from '../../components/ui/textarea'

import { useRejectPurchaseRequestMutation } from '../../hooks/mutations/use_reject_purchase_request'

const schema = z.object({
  reason: z.string().min(1, 'Informe o motivo da rejeição'),
})

type FormData = z.infer<typeof schema>

interface RejectPurchaseRequestModalProps {
  purchaseRequestId: string
  open: boolean
  onClose: () => void
}

export function RejectPurchaseRequestModal({
  purchaseRequestId,
  open,
  onClose,
}: RejectPurchaseRequestModalProps) {
  const rejectMutation = useRejectPurchaseRequestMutation()

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      reason: '',
    },
  })

  async function handleSubmit(data: FormData) {
    toast.promise(
      rejectMutation.mutateAsync({
        params: { id: purchaseRequestId },
        reason: data.reason,
      } as any),
      {
        loading: 'Rejeitando solicitação...',
        success: () => {
          form.reset()
          onClose()
          return 'Solicitação rejeitada com sucesso!'
        },
        error: 'Erro ao rejeitar solicitação',
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <DialogHeader>
              <DialogTitle>Rejeitar solicitação de compra</DialogTitle>
            </DialogHeader>

            <div className="py-4">
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motivo da rejeição*</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Informe o motivo pelo qual a solicitação está sendo rejeitada"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" variant="destructive" disabled={rejectMutation.isPending}>
                Rejeitar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
