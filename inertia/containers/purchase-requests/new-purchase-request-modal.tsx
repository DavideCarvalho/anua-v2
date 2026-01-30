import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { addDays } from 'date-fns'

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
import { Textarea } from '../../components/ui/textarea'
import { Label } from '../../components/ui/label'
import { DatePicker } from '../../components/ui/date-picker'

import { useCreatePurchaseRequestMutation } from '../../hooks/mutations/use_create_purchase_request'
import { brazilianRealFormatter } from '../../lib/formatters'

const schema = z.object({
  productName: z.string().min(1, 'Qual nome do produto?'),
  quantity: z.coerce.number().min(1, 'Qual a quantidade?'),
  unitValue: z.coerce.number().min(0, 'Quanto custa cada um?'),
  dueDate: z.date(),
  productUrl: z.string().optional(),
  description: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface NewPurchaseRequestModalProps {
  schoolId: string
  open: boolean
  onCancel: () => void
  onSubmit: () => void
}

export function NewPurchaseRequestModal({
  schoolId,
  open,
  onCancel,
  onSubmit,
}: NewPurchaseRequestModalProps) {
  const createMutation = useCreatePurchaseRequestMutation()

  const form = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      productName: '',
      quantity: 1,
      unitValue: 0,
      dueDate: addDays(new Date(), 2),
      productUrl: '',
      description: '',
    },
  })

  const watchUnitValue = form.watch('unitValue', 0)
  const watchQuantity = form.watch('quantity', 1)
  const totalValue = watchUnitValue * watchQuantity

  async function handleSubmit(data: FormData) {
    toast.promise(
      createMutation.mutateAsync({
        productName: data.productName,
        quantity: data.quantity,
        unitValue: data.unitValue,
        value: data.unitValue * data.quantity,
        dueDate: data.dueDate,
        productUrl: data.productUrl || undefined,
        description: data.description || undefined,
        schoolId,
      } as any),
      {
        loading: 'Criando solicitação...',
        success: () => {
          form.reset()
          onSubmit()
          return 'Solicitação criada com sucesso!'
        },
        error: 'Erro ao criar solicitação',
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[600px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <DialogHeader>
              <DialogTitle>Nova solicitação de compra</DialogTitle>
            </DialogHeader>

            <div className="grid gap-6 py-4">
              <FormField
                control={form.control}
                name="productName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Qual o produto?*</FormLabel>
                    <FormControl>
                      <Input placeholder="Giz de cera" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade*</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} placeholder="2" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unitValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quanto custa cada um?*</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} step={0.01} placeholder="10.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <Label>Quanto custa no total?</Label>
                <p className="text-lg font-medium">{brazilianRealFormatter(totalValue)}</p>
              </div>

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Para quando?*</FormLabel>
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

              <FormField
                control={form.control}
                name="productUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link do produto</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alguma observação?</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Observações" rows={4} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                Criar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
