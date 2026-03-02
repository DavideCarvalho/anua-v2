import { Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '~/lib/api'

interface DeleteAchievementModalProps {
  achievementId: string
  achievementName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteAchievementModal({
  achievementId,
  achievementName,
  open,
  onOpenChange,
}: DeleteAchievementModalProps) {
  const queryClient = useQueryClient()
  const { mutateAsync: deleteAchievement, isPending } = useMutation(
    api.api.v1.achievements.destroy.mutationOptions()
  )

  async function handleDelete() {
    try {
      await deleteAchievement({ params: { id: achievementId } })
      queryClient.invalidateQueries({ queryKey: ['achievements'] })
      toast.success('Conquista excluída com sucesso!')
      onOpenChange(false)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao excluir conquista'
      toast.error(errorMessage)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir conquista</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir a conquista <strong>{achievementName}</strong>? Esta ação
            não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Excluindo...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
