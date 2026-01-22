import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { tuyau } from '~/lib/api'

const formSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
})

type FormValues = z.infer<typeof formSchema>

interface TeacherData {
  id: string
  user?: {
    id: string
    name: string
    email: string
  }
}

interface EditTeacherDataModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  teacher: TeacherData | null
}

export function EditTeacherDataModal({
  open,
  onOpenChange,
  teacher,
}: EditTeacherDataModalProps) {
  const queryClient = useQueryClient()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    values: {
      name: teacher?.user?.name ?? '',
      email: teacher?.user?.email ?? '',
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: FormValues) => {
      if (!teacher) throw new Error('Professor não encontrado')
      return tuyau.api.v1.teachers({ id: teacher.id })
        .$put({ name: data.name, email: data.email })
        .unwrap()
    },
    onSuccess: () => {
      toast.success('Dados atualizados com sucesso')
      queryClient.invalidateQueries({ queryKey: ['teachers'] })
      onOpenChange(false)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao atualizar dados')
    },
  })

  const onSubmit = form.handleSubmit((data) => {
    updateMutation.mutate(data)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Dados do Professor</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              {...form.register('name')}
              placeholder="Nome do professor"
              className="mt-1"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              {...form.register('email')}
              placeholder="email@exemplo.com"
              className="mt-1"
            />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
