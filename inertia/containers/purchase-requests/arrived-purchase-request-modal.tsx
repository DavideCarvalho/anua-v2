import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useSuspenseQuery } from '@tanstack/react-query'

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
import { Label } from '../../components/ui/label'
import { DatePicker } from '../../components/ui/date-picker'

import { usePurchaseRequestQueryOptions } from '../../hooks/queries/use_purchase_request'
import { useMarkArrivedPurchaseRequestMutation } from '../../hooks/mutations/use_mark_arrived_purchase_request'
import { brazilianRealFormatter, brazilianDateFormatter } from '../../lib/formatters'

const schema = z.object({
  arrivalDate: z.date(),
})

type FormData = z.infer<typeof schema>

interface ArrivedPurchaseRequestModalProps {
  purchaseRequestId: string
  open: boolean
  onClose: () => void
}

export function ArrivedPurchaseRequestModal({
  purchaseRequestId,
  open,
  onClose,
}: ArrivedPurchaseRequestModalProps) {
  const { data: purchaseRequest } = useSuspenseQuery(
    usePurchaseRequestQueryOptions({ id: purchaseRequestId })
  )

  const markArrivedMutation = useMarkArrivedPurchaseRequestMutation()

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      arrivalDate: new Date(),
    },
  })

  async function handleSubmit(data: FormData) {
    toast.promise(
      markArrivedMutation.mutateAsync({
        params: { id: purchaseRequestId },
        arrivalDate: data.arrivalDate,
      } as any),
      {
        loading: 'Marcando como chegou...',
        success: () => {
          form.reset()
          onClose()
          return 'Solicitação marcada como chegou!'
        },
        error: 'Erro ao marcar como chegou',
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <DialogHeader>
              <DialogTitle>Marcar solicitação como chegou</DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-1">
                <Label>Produto</Label>
                <p className="font-medium">{purchaseRequest?.productName}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Quantidade comprada</Label>
                  <p>{purchaseRequest?.finalQuantity ?? purchaseRequest?.quantity}</p>
                </div>
                <div className="space-y-1">
                  <Label>Valor total</Label>
                  <p>{brazilianRealFormatter(purchaseRequest?.finalValue ?? purchaseRequest?.value ?? 0)}</p>
                </div>
              </div>

              {purchaseRequest?.estimatedArrivalDate && (
                <div className="space-y-1">
                  <Label>Previsão de chegada</Label>
                  <p>{brazilianDateFormatter(purchaseRequest.estimatedArrivalDate)}</p>
                </div>
              )}

              <FormField
                control={form.control}
                name="arrivalDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de chegada*</FormLabel>
                    <FormControl>
                      <DatePicker date={field.value} onChange={field.onChange} />
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
              <Button type="submit" disabled={markArrivedMutation.isPending}>
                Confirmar chegada
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
