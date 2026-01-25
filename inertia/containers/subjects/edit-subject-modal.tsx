import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../components/ui/form'

import { useSubjectQueryOptions } from '../../hooks/queries/use_subject'
import { useUpdateSubjectMutation } from '../../hooks/mutations/use_update_subject'

const schema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
})

type FormValues = z.infer<typeof schema>

export function EditSubjectModal({
  subjectId,
  open,
  onCancel,
}: {
  subjectId: string
  open: boolean
  onCancel: () => void
}) {
  const updateSubject = useUpdateSubjectMutation()

  const { data: subject, isLoading } = useQuery({
    ...useSubjectQueryOptions({ id: subjectId }),
    enabled: !!subjectId,
  })

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: { name: '' },
  })

  useEffect(() => {
    if (!subject) return
    form.reset({ name: subject.name })
  }, [subject, form])

  async function handleSubmit(values: FormValues) {
    if (!subject) return

    const promise = updateSubject
      .mutateAsync({
        params: { id: subjectId },
        body: { name: values.name } as any,
      })
      .then(() => {
        toast.success('Matéria alterada com sucesso!')
        onCancel()
      })

    toast.promise(promise, {
      loading: 'Alterando matéria...',
      error: 'Erro ao alterar matéria',
    })

    return promise
  }

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isLoading ? 'Carregando...' : subject ? 'Alterando matéria' : 'Matéria não encontrada'}
          </DialogTitle>
        </DialogHeader>

        {!subject ? null : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-6 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da matéria</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Digite o nome da matéria"
                        {...field}
                        readOnly={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={updateSubject.isPending}>
                  Salvar
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
