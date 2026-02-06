import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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
import { Checkbox } from '~/components/ui/checkbox'
import { Label } from '~/components/ui/label'
import { tuyau } from '~/lib/api'
import { useSubjectsQueryOptions } from '~/hooks/queries/use_subjects'

interface TeacherData {
  id: string
  subjects?: Array<{ id: string; name: string }>
  user?: {
    name: string
  }
}

interface EditTeacherSubjectsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  teacher: TeacherData | null
  schoolId: string
}

export function EditTeacherSubjectsModal({
  open,
  onOpenChange,
  teacher,
  schoolId,
}: EditTeacherSubjectsModalProps) {
  const queryClient = useQueryClient()
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([])

  const { data: subjectsData } = useQuery(
    useSubjectsQueryOptions({ page: 1, limit: 100, schoolId })
  )

  const subjects = subjectsData?.data ?? []

  // Initialize selected subjects when teacher changes
  useEffect(() => {
    if (teacher?.subjects) {
      setSelectedSubjectIds(teacher.subjects.map((s) => s.id))
    } else {
      setSelectedSubjectIds([])
    }
  }, [teacher])

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!teacher) throw new Error('Professor não encontrado')
      return tuyau.api.v1.teachers({ id: teacher.id }).subjects
        .$put({ subjectIds: selectedSubjectIds })
        .unwrap()
    },
    onSuccess: () => {
      toast.success('Disciplinas atualizadas com sucesso')
      queryClient.invalidateQueries({ queryKey: ['teachers'] })
      onOpenChange(false)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao atualizar disciplinas')
    },
  })

  const handleToggleSubject = (subjectId: string, checked: boolean) => {
    if (checked) {
      setSelectedSubjectIds((prev) => [...prev, subjectId])
    } else {
      setSelectedSubjectIds((prev) => prev.filter((id) => id !== subjectId))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateMutation.mutate()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Disciplinas</DialogTitle>
          {teacher?.user?.name && (
            <p className="text-sm text-muted-foreground">{teacher.user.name}</p>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {subjects.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma disciplina cadastrada na escola.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto border rounded-lg p-3">
              {subjects.map((subject: { id: string; name: string }) => (
                <div key={subject.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`subject-${subject.id}`}
                    checked={selectedSubjectIds.includes(subject.id)}
                    onCheckedChange={(checked) =>
                      handleToggleSubject(subject.id, checked === true)
                    }
                  />
                  <Label
                    htmlFor={`subject-${subject.id}`}
                    className="font-normal cursor-pointer"
                  >
                    {subject.name}
                  </Label>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            {selectedSubjectIds.length} disciplina(s) selecionada(s)
          </p>

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
