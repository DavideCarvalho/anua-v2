import { Head } from '@inertiajs/react'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, Plus, Search, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { EscolaLayout } from '~/components/layouts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { Badge } from '~/components/ui/badge'
import { Skeleton } from '~/components/ui/skeleton'
import {
  useOccurrencesQueryOptions,
  useOccurrenceTeacherClassesQueryOptions,
} from '~/hooks/queries/use_occurrences'
import { useStudentsQueryOptions } from '~/hooks/queries/use_students'
import { useCreateOccurrence } from '~/hooks/mutations/use_occurrence_mutations'
import { brazilianDateFormatter } from '~/lib/formatters'

const TYPE_OPTIONS = [
  { value: 'BEHAVIOR', label: 'Comportamento' },
  { value: 'PERFORMANCE', label: 'Desempenho' },
  { value: 'ABSENCE', label: 'Falta' },
  { value: 'LATE', label: 'Atraso' },
  { value: 'OTHER', label: 'Outro' },
] as const

const schema = z.object({
  studentId: z.string().min(1, 'Selecione um aluno'),
  teacherHasClassId: z.string().min(1, 'Selecione turma e materia'),
  type: z.enum(['BEHAVIOR', 'PERFORMANCE', 'ABSENCE', 'LATE', 'OTHER']),
  date: z.string().min(1, 'Informe a data'),
  text: z.string().min(3, 'Descreva a ocorrencia').max(2000, 'Texto muito longo'),
})

type FormValues = z.infer<typeof schema>

function NewOccurrenceModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const createMutation = useCreateOccurrence()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      studentId: '',
      teacherHasClassId: '',
      type: 'BEHAVIOR',
      date: new Date().toISOString().split('T')[0],
      text: '',
    },
  })

  const { data: studentsData } = useQuery(useStudentsQueryOptions({ page: 1, limit: 200 }))
  const { data: teacherClassesData } = useQuery(useOccurrenceTeacherClassesQueryOptions())

  const students = studentsData?.data ?? []
  const teacherClasses = teacherClassesData?.data ?? []

  const selectedTeacherClass = teacherClasses.find(
    (item) => item.id === form.watch('teacherHasClassId')
  )
  const filteredStudents = useMemo(() => {
    if (!selectedTeacherClass?.class.id) return students
    return students.filter((student: any) => student.classId === selectedTeacherClass.class.id)
  }, [students, selectedTeacherClass?.class.id])

  const onSubmit = (values: FormValues) => {
    createMutation.mutate(values, {
      onSuccess: () => {
        toast.success('Ocorrencia registrada com sucesso')
        form.reset({
          studentId: '',
          teacherHasClassId: '',
          type: 'BEHAVIOR',
          date: new Date().toISOString().split('T')[0],
          text: '',
        })
        onOpenChange(false)
      },
      onError: (error: any) => {
        toast.error(error?.message || 'Erro ao registrar ocorrencia')
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nova ocorrencia</DialogTitle>
          <DialogDescription>Registre uma ocorrencia e notifique os responsaveis</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Turma e materia</Label>
            <Select
              value={form.watch('teacherHasClassId')}
              onValueChange={(value) => {
                form.setValue('teacherHasClassId', value)
                form.setValue('studentId', '')
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {teacherClasses.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.class.name} - {item.subject.name} ({item.teacher.name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.teacherHasClassId && (
              <p className="text-sm text-destructive">
                {form.formState.errors.teacherHasClassId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Aluno</Label>
            <Select
              value={form.watch('studentId')}
              onValueChange={(value) => form.setValue('studentId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {filteredStudents.map((student: any) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.user?.name || student.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.studentId && (
              <p className="text-sm text-destructive">{form.formState.errors.studentId.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={form.watch('type')}
                onValueChange={(value) => form.setValue('type', value as FormValues['type'])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Data</Label>
              <Input type="date" {...form.register('date')} />
              {form.formState.errors.date && (
                <p className="text-sm text-destructive">{form.formState.errors.date.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Descricao</Label>
            <Textarea rows={5} placeholder="Descreva o ocorrido..." {...form.register('text')} />
            {form.formState.errors.text && (
              <p className="text-sm text-destructive">{form.formState.errors.text.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Registrar ocorrencia
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function typeLabel(type: string) {
  return TYPE_OPTIONS.find((option) => option.value === type)?.label || type
}

export default function OcorrenciasPage() {
  const [search, setSearch] = useState('')
  const [type, setType] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [newModalOpen, setNewModalOpen] = useState(false)

  const { data, isLoading } = useQuery(
    useOccurrencesQueryOptions({
      page,
      limit: 20,
      search: search || undefined,
      type: type === 'all' ? undefined : (type as any),
    })
  )

  const rows = data?.data ?? []
  const meta = data?.meta

  return (
    <EscolaLayout>
      <Head title="Ocorrencias" />

      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <AlertTriangle className="h-6 w-6" />
              Ocorrencias
            </h1>
            <p className="text-muted-foreground">Registre e acompanhe ocorrencias pedagogicas</p>
          </div>
          <Button onClick={() => setNewModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova ocorrencia
          </Button>
        </div>

        <Card>
          <CardContent className="py-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative max-w-sm w-full">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value)
                    setPage(1)
                  }}
                  placeholder="Buscar por aluno ou descricao"
                  className="pl-9"
                />
              </div>

              <Select
                value={type}
                onValueChange={(value) => {
                  setType(value)
                  setPage(1)
                }}
              >
                <SelectTrigger className="w-[220px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  {TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lista de ocorrencias</CardTitle>
            <CardDescription>
              {meta ? `${meta.total} registro${meta.total > 1 ? 's' : ''}` : 'Carregando...'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="h-12 w-full" />
                ))}
              </div>
            ) : rows.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                Nenhuma ocorrencia encontrada.
              </div>
            ) : (
              <>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Aluno</TableHead>
                        <TableHead>Turma</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Descricao</TableHead>
                        <TableHead className="text-center">Ciencia</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.map((occurrence) => (
                        <TableRow key={occurrence.id}>
                          <TableCell>{brazilianDateFormatter(occurrence.date)}</TableCell>
                          <TableCell className="font-medium">{occurrence.student.name}</TableCell>
                          <TableCell>{occurrence.class.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{typeLabel(occurrence.type)}</Badge>
                          </TableCell>
                          <TableCell>
                            <p className="max-w-[420px] truncate" title={occurrence.text}>
                              {occurrence.text}
                            </p>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant={occurrence.acknowledgedCount > 0 ? 'default' : 'secondary'}
                            >
                              {occurrence.acknowledgedCount}/{occurrence.totalResponsibles}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {meta && meta.lastPage > 1 && (
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Pagina {meta.currentPage} de {meta.lastPage}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={meta.currentPage <= 1}
                        onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                      >
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={meta.currentPage >= meta.lastPage}
                        onClick={() => setPage((prev) => prev + 1)}
                      >
                        Proxima
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <NewOccurrenceModal open={newModalOpen} onOpenChange={setNewModalOpen} />
    </EscolaLayout>
  )
}
