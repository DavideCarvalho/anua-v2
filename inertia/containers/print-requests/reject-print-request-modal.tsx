import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import { Button } from '../../components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog'
import { Textarea } from '../../components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../components/ui/form'

import { useRejectPrintRequestMutation } from '../../hooks/mutations/use-reject-print-request'

const schema = z.object({
  reason: z.string().min(1, 'Motivo é obrigatório'),
})

type FormValues = z.infer<typeof schema>

export function RejectPrintRequestModal({
  printRequestId,
  open,
  onClose,
}: {
  printRequestId: string
  open: boolean
  onClose: () => void
}) {
  const reject = useRejectPrintRequestMutation()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: { reason: '' },
  })

  async function handleSubmit(values: FormValues) {
    const promise = reject
      .mutateAsync({
        params: { id: printRequestId },
        body: { reason: values.reason },
      } as any)
      .then(() => {
        toast.success('Solicitação rejeitada com sucesso!')
        form.reset()
        onClose()
      })

    toast.promise(promise, {
      loading: 'Rejeitando solicitação...',
      error: 'Erro ao rejeitar solicitação',
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <DialogHeader>
              <DialogTitle>Rejeitar solicitação</DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Motivo da rejeição</FormLabel>
                    <FormControl>
                      <Textarea rows={4} placeholder="Motivo" {...field} />
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
              <Button type="submit" disabled={reject.isPending}>
                Rejeitar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
