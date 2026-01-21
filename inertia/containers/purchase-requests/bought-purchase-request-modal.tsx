import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { addDays } from 'date-fns'
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
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { DatePicker } from '../../components/ui/date-picker'

import { usePurchaseRequestQueryOptions } from '../../hooks/queries/use-purchase-request'
import { useMarkBoughtPurchaseRequestMutation } from '../../hooks/mutations/use-mark-bought-purchase-request'
import { brazilianRealFormatter } from '../../lib/formatters'

const schema = z.object({
  finalQuantity: z.coerce.number().min(1, 'Informe a quantidade comprada'),
  finalUnitValue: z.coerce.number().min(0, 'Informe o valor unitário'),
  estimatedArrivalDate: z.date(),
})

type FormData = z.infer<typeof schema>

interface BoughtPurchaseRequestModalProps {
  purchaseRequestId: string
  open: boolean
  onClose: () => void
}

export function BoughtPurchaseRequestModal({
  purchaseRequestId,
  open,
  onClose,
}: BoughtPurchaseRequestModalProps) {
  const { data: purchaseRequest } = useSuspenseQuery(
    usePurchaseRequestQueryOptions({ id: purchaseRequestId })
  )

  const markBoughtMutation = useMarkBoughtPurchaseRequestMutation()

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      finalQuantity: purchaseRequest?.quantity ?? 1,
      finalUnitValue: purchaseRequest?.unitValue ?? 0,
      estimatedArrivalDate: addDays(new Date(), 7),
    },
  })

  const watchFinalQuantity = form.watch('finalQuantity', 1)
  const watchFinalUnitValue = form.watch('finalUnitValue', 0)
  const finalValue = watchFinalQuantity * watchFinalUnitValue

  async function handleSubmit(data: FormData) {
    toast.promise(
      markBoughtMutation.mutateAsync({
        params: { id: purchaseRequestId },
        finalQuantity: data.finalQuantity,
        finalUnitValue: data.finalUnitValue,
        finalValue: data.finalQuantity * data.finalUnitValue,
        estimatedArrivalDate: data.estimatedArrivalDate,
      } as any),
      {
        loading: 'Marcando como comprado...',
        success: () => {
          form.reset()
          onClose()
          return 'Solicitação marcada como comprada!'
        },
        error: 'Erro ao marcar como comprado',
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <DialogHeader>
              <DialogTitle>Marcar solicitação como comprada</DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-1">
                <Label>Produto</Label>
                <p className="font-medium">{purchaseRequest?.productName}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Quantidade pedida</Label>
                  <p>{purchaseRequest?.quantity}</p>
                </div>
                <div className="space-y-1">
                  <Label>Valor unitário pedido</Label>
                  <p>{brazilianRealFormatter(purchaseRequest?.unitValue ?? 0)}</p>
                </div>
              </div>

              <FormField
                control={form.control}
                name="finalQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade comprada*</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="finalUnitValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor unitário comprado*</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} step={0.01} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-1">
                <Label>Valor total</Label>
                <p className="text-lg font-medium">{brazilianRealFormatter(finalValue)}</p>
              </div>

              <FormField
                control={form.control}
                name="estimatedArrivalDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Previsão de chegada*</FormLabel>
                    <FormControl>
                      <DatePicker
                        date={field.value}
                        onChange={field.onChange}
                        fromDate={new Date()}
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
              <Button type="submit" disabled={markBoughtMutation.isPending}>
                Confirmar compra
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
