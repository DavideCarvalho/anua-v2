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
  hourlyRate: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface TeacherData {
  id: string
  hourlyRate?: number
  user?: {
    name: string
  }
}

interface EditTeacherRateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  teacher: TeacherData | null
}

export function EditTeacherRateModal({
  open,
  onOpenChange,
  teacher,
}: EditTeacherRateModalProps) {
  const queryClient = useQueryClient()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    values: {
      hourlyRate: teacher?.hourlyRate?.toString() ?? '',
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: FormValues) => {
      if (!teacher) throw new Error('Professor não encontrado')
      return tuyau.api.v1.teachers({ id: teacher.id })
        .$put({ hourlyRate: data.hourlyRate ? Number(data.hourlyRate) : undefined })
        .unwrap()
    },
    onSuccess: () => {
      toast.success('Valor hora/aula atualizado com sucesso')
      queryClient.invalidateQueries({ queryKey: ['teachers'] })
      onOpenChange(false)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao atualizar valor')
    },
  })

  const onSubmit = form.handleSubmit((data) => {
    updateMutation.mutate(data)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Editar Valor Hora/Aula</DialogTitle>
          {teacher?.user?.name && (
            <p className="text-sm text-muted-foreground">{teacher.user.name}</p>
          )}
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="hourlyRate">Valor hora/aula (R$)</Label>
            <Input
              id="hourlyRate"
              type="number"
              step="0.01"
              min="0"
              {...form.register('hourlyRate')}
              placeholder="0,00"
              className="mt-1"
            />
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
