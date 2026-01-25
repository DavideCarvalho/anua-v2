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
import { useDeleteStudent } from '~/hooks/mutations/use_student_mutations'

interface DeleteStudentModalProps {
  studentId: string
  studentName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function DeleteStudentModal({
  studentId,
  studentName,
  open,
  onOpenChange,
  onSuccess,
}: DeleteStudentModalProps) {
  const { mutateAsync: deleteStudent, isPending } = useDeleteStudent()

  async function handleDelete() {
    try {
      await deleteStudent(studentId)
      toast.success('Aluno excluído com sucesso!')
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao excluir aluno'
      toast.error(errorMessage)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir aluno</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir o aluno <strong>{studentName}</strong>? Esta ação não
            pode ser desfeita.
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
